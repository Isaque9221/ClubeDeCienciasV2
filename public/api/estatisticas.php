<?php
/**
 * Clube de Ciências CECLOS — API de Estatísticas para Hospedagem Hostinger (PHP)
 *
 * Espelha fielmente a lógica de api/estatisticas.ts para rodar nativamente
 * no ambiente LiteSpeed / Apache com PHP 8.x da Hostinger.
 */

declare(strict_types=1);

date_default_timezone_set('America/Bahia');

const PREFIXO = 'ceclos:est:';
const NOVENTA_DIAS = 60 * 60 * 24 * 90;
const UMA_HORA = 60 * 60;
const QUANTAS_RECENTES = 100;
const QUANTAS_CIDADES = 50;
const DIAS_NO_GRAFICO = 14;
const FUSO = 'America/Bahia';
const TAMANHO_MAXIMO_DO_CORPO = 2000;
const LIMITE_DE_EVENTOS_POR_HORA = 120;
const LIMITE_DE_ERROS_DO_ADMIN = 10;

const DISPOSITIVOS = ['celular', 'tablet', 'computador'];
const ORIGENS = ['direto', 'compartilhado', 'whatsapp', 'instagram', 'facebook', 'google', 'outro-site'];
const MEIOS = ['nativo', 'link'];
const ID_VALIDO = '/^[A-Za-z0-9-]{8,64}$/';
const NAVEGADOR_AUTOMATICO = '/bot|crawl|spider|slurp|headless|lighthouse|facebookexternalhit|whatsapp\/|preview/i';

function responderJson($dados, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function semConteudo(): void {
    http_response_code(204);
    header('Cache-Control: no-store');
    exit;
}

function lerVariavelAmbiente(string $nome): string {
    $valor = getenv($nome);
    if ($valor !== false && $valor !== '') return (string)$valor;
    if (!empty($_ENV[$nome])) return (string)$_ENV[$nome];
    if (!empty($_SERVER[$nome])) return (string)$_SERVER[$nome];

    // Tenta carregar do arquivo .env se ainda não estiver definido no ambiente
    static $envCarregado = null;
    if ($envCarregado === null) {
        $envCarregado = [];
        $caminhos = [
            __DIR__ . '/.env',
            dirname(__DIR__) . '/.env',
            dirname(__DIR__, 2) . '/.env',
        ];
        foreach ($caminhos as $caminho) {
            if (is_file($caminho) && is_readable($caminho)) {
                $linhas = file($caminho, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
                foreach ($linhas as $linha) {
                    $linha = trim($linha);
                    if ($linha === '' || str_starts_with($linha, '#')) continue;
                    if (str_contains($linha, '=')) {
                        [$k, $v] = explode('=', $linha, 2);
                        $k = trim($k);
                        $v = trim($v, " \t\n\r\0\x0B\"'");
                        $envCarregado[$k] = $v;
                    }
                }
                break;
            }
        }
    }
    return $envCarregado[$nome] ?? '';
}

function obterBanco(): ?array {
    $url = lerVariavelAmbiente('KV_REST_API_URL');
    if ($url === '') $url = lerVariavelAmbiente('UPSTASH_REDIS_REST_URL');

    $token = lerVariavelAmbiente('KV_REST_API_TOKEN');
    if ($token === '') $token = lerVariavelAmbiente('UPSTASH_REDIS_REST_TOKEN');

    if ($url === '' || $token === '') return null;
    return ['url' => rtrim($url, '/'), 'token' => $token];
}

function executarRedis(array $banco, array $comandos): array {
    $ch = curl_init($banco['url'] . '/pipeline');
    $payload = json_encode(array_map(function ($cmd) {
        return array_map('strval', $cmd);
    }, $comandos));

    curl_setopt_array($ch, [
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => $payload,
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $banco['token'],
            'Content-Type: application/json',
        ],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
    ]);

    $resposta = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $erro = curl_error($ch);
    curl_close($ch);

    if ($resposta === false || $status < 200 || $status >= 300) {
        throw new RuntimeException("Erro ao consultar o banco: HTTP {$status} {$erro}");
    }

    $itens = json_decode((string)$resposta, true);
    if (!is_array($itens)) {
        throw new RuntimeException("Resposta inválida do banco");
    }

    $resultados = [];
    foreach ($itens as $item) {
        if (!empty($item['error'])) {
            throw new RuntimeException($item['error']);
        }
        $resultados[] = $item['result'] ?? null;
    }
    return $resultados;
}

function chave(string $nome): string {
    return PREFIXO . $nome;
}

function obterIpCliente(): string {
    $candidatos = [
        $_SERVER['HTTP_CF_CONNECTING_IP'] ?? '',
        $_SERVER['HTTP_X_REAL_IP'] ?? '',
        $_SERVER['HTTP_X_FORWARDED_FOR'] ?? '',
        $_SERVER['REMOTE_ADDR'] ?? 'sem-ip',
    ];
    foreach ($candidatos as $candidato) {
        $ip = trim(explode(',', $candidato)[0]);
        if ($ip !== '' && filter_var($ip, FILTER_VALIDATE_IP)) {
            return $ip;
        }
    }
    return 'sem-ip';
}

function chaveDoLimite(array $banco, string $tipo): string {
    $ip = obterIpCliente();
    $hora = (int)floor(time() / UMA_HORA);
    $resumo = substr(hash('sha256', "{$banco['token']}:{$ip}:{$hora}"), 0, 24);
    return chave("limite:{$tipo}:{$resumo}");
}

function sanitizarTexto(string $texto, int $tamanhoMaximo): string {
    $limpo = preg_replace('/[\x00-\x1f\x7f<>"]/', '', $texto) ?? '';
    return mb_substr(trim($limpo), 0, $tamanhoMaximo, 'UTF-8');
}

function obterLugar(): array {
    $pais = sanitizarTexto($_SERVER['HTTP_CF_IPCOUNTRY'] ?? $_SERVER['HTTP_X_VERCEL_IP_COUNTRY'] ?? $_SERVER['GEOIP_COUNTRY_CODE'] ?? '', 2);
    $regiao = sanitizarTexto($_SERVER['HTTP_CF_REGION'] ?? $_SERVER['HTTP_X_VERCEL_IP_COUNTRY_REGION'] ?? $_SERVER['GEOIP_REGION'] ?? '', 3);
    $cidade = sanitizarTexto($_SERVER['HTTP_CF_IPCITY'] ?? $_SERVER['HTTP_X_VERCEL_IP_CITY'] ?? $_SERVER['GEOIP_CITY'] ?? '', 80);

    return [
        'pais' => strtoupper($pais),
        'regiao' => strtoupper($regiao),
        'cidade' => $cidade,
    ];
}

function chaveDoEstado(string $pais, string $regiao): string {
    return $pais !== '' ? "{$pais}-" . ($regiao !== '' ? $regiao : '?') : '?';
}

function diaAtual(): string {
    return (new DateTime('now', new DateTimeZone(FUSO)))->format('Y-m-d');
}

function ultimosDias(int $quantos): array {
    $dias = [];
    $agora = new DateTime('now', new DateTimeZone(FUSO));
    for ($i = $quantos - 1; $i >= 0; $i--) {
        $d = clone $agora;
        if ($i > 0) $d->modify("-{$i} days");
        $dias[] = $d->format('Y-m-d');
    }
    return array_values(array_unique($dias));
}

function dispositivoPeloUserAgent(string $ua): string {
    if (preg_match('/iPad|Tablet/i', $ua) || (preg_match('/Android/i', $ua) && !preg_match('/Mobile/i', $ua))) {
        return 'tablet';
    }
    if (preg_match('/Mobi|iPhone|iPod|Android/i', $ua)) {
        return 'celular';
    }
    return 'computador';
}

function tokenConfere(string $token, string $guardado): bool {
    $limpo = trim($token);
    if ($guardado === '' || !preg_match('/^[a-zA-Z0-9]{10}$/', $limpo)) {
        return false;
    }
    if (confereInterno($limpo, $guardado)) return true;
    $maiusculo = strtoupper($limpo);
    return ($maiusculo !== $limpo) && confereInterno($maiusculo, $guardado);
}

function confereInterno(string $token, string $guardado): bool {
    if (preg_match('/^pbkdf2[$:]/', $guardado)) {
        $partes = preg_split('/[$:]/', $guardado);
        if (count($partes) !== 4) return false;
        [, $iteracoesStr, $salHex, $esperado] = $partes;
        $iteracoes = (int)$iteracoesStr;
        if ($iteracoes < 1000 || $iteracoes > 5000000) return false;
        if (!ctype_xdigit($salHex) || strlen($esperado) !== 64) return false;
        $salBin = hex2bin($salHex);
        if ($salBin === false) return false;
        $derivado = hash_pbkdf2('sha256', $token, $salBin, $iteracoes, 32, true);
        return hash_equals(hex2bin($esperado) ?: '', $derivado);
    }

    if (!preg_match('/^[0-9a-f]{64}$/i', $guardado)) return false;
    $sal = lerVariavelAmbiente('VITE_SECURITY_SALT');
    if ($sal === '') $sal = 'ceclos_default_salt_change_me';
    $obtido = hash('sha256', "{$token}:{$sal}", true);
    return hash_equals(hex2bin($guardado) ?: '', $obtido);
}

function comoContagem($resultado): array {
    $contagem = [];
    if (!is_array($resultado)) return $contagem;
    $tam = count($resultado);
    for ($i = 0; $i + 1 < $tam; $i += 2) {
        $contagem[(string)$resultado[$i]] = (int)($resultado[$i + 1] ?? 0);
    }
    return $contagem;
}

function separarEstado(string $chaveGuardada): array {
    if ($chaveGuardada === '?') return ['pais' => '', 'regiao' => ''];
    $partes = explode('-', $chaveGuardada, 2);
    $pais = $partes[0] ?? '';
    $regiao = $partes[1] ?? '';
    return [
        'pais' => $pais,
        'regiao' => $regiao === '?' ? '' : $regiao,
    ];
}

// -----------------------------------------------------------------------------
// TRATAMENTO DA REQUISIÇÃO
// -----------------------------------------------------------------------------
$metodo = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($metodo === 'OPTIONS') {
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Authorization, Content-Type');
    exit;
}

if ($metodo === 'POST') {
    $banco = obterBanco();
    if ($banco === null) semConteudo();

    $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
    if (preg_match(NAVEGADOR_AUTOMATICO, $ua)) semConteudo();

    $corpo = file_get_contents('php://input');
    if ($corpo === false || strlen($corpo) > TAMANHO_MAXIMO_DO_CORPO) {
        responderJson(['erro' => 'grande-demais'], 413);
    }

    $dados = json_decode($corpo, true);
    if (!is_array($dados)) responderJson(['erro' => 'invalido'], 400);

    $tipo = $dados['tipo'] ?? '';
    $visita = (string)($dados['visita'] ?? '');
    $visitante = (string)($dados['visitante'] ?? '');

    if (!preg_match(ID_VALIDO, $visita) || !preg_match(ID_VALIDO, $visitante)) {
        responderJson(['erro' => 'invalido'], 400);
    }

    try {
        $limite = chaveDoLimite($banco, 'eventos');
        $resLimite = executarRedis($banco, [
            ['INCR', $limite],
            ['EXPIRE', $limite, UMA_HORA],
        ]);
        if (((int)($resLimite[0] ?? 0)) > LIMITE_DE_EVENTOS_POR_HORA) {
            responderJson(['erro' => 'muitos'], 429);
        }

        if ($tipo === 'visita') {
            $dispositivo = in_array($dados['dispositivo'] ?? '', DISPOSITIVOS, true)
                ? $dados['dispositivo']
                : dispositivoPeloUserAgent($ua);
            $origem = in_array($dados['origem'] ?? '', ORIGENS, true)
                ? $dados['origem']
                : 'direto';

            $lugar = obterLugar();
            $guardada = [
                'quando' => (int)round(microtime(true) * 1000),
                'pais' => $lugar['pais'],
                'regiao' => $lugar['regiao'],
                'cidade' => $lugar['cidade'],
                'dispositivo' => $dispositivo,
                'origem' => $origem,
            ];

            $novo = executarRedis($banco, [
                ['SET', chave("visita:{$visita}"), json_encode($guardada), 'NX', 'EX', NOVENTA_DIAS],
            ]);

            if (($novo[0] ?? '') === 'OK') {
                $estado = chaveDoEstado($lugar['pais'], $lugar['regiao']);
                $cidadeCampo = $estado . '|' . ($lugar['cidade'] !== '' ? $lugar['cidade'] : '?');
                executarRedis($banco, [
                    ['INCR', chave('acessos')],
                    ['PFADD', chave('visitantes'), $visitante],
                    ['HINCRBY', chave('dias'), diaAtual(), 1],
                    ['HINCRBY', chave('estados'), $estado, 1],
                    ['HINCRBY', chave('cidades'), $cidadeCampo, 1],
                    ['HINCRBY', chave('dispositivos'), $dispositivo, 1],
                    ['HINCRBY', chave('origens'), $origem, 1],
                    ['LPUSH', chave('recentes'), $visita],
                    ['LTRIM', chave('recentes'), 0, QUANTAS_RECENTES - 1],
                ]);
            }
            semConteudo();
        } elseif ($tipo === 'compartilhamento') {
            $meio = in_array($dados['meio'] ?? '', MEIOS, true) ? $dados['meio'] : null;
            if (!$meio) responderJson(['erro' => 'invalido'], 400);

            executarRedis($banco, [
                ['HINCRBY', chave('compartilhamentos'), $meio, 1],
                ['PFADD', chave('quem-compartilhou'), $visitante],
                ['SET', chave("compartilhou:{$visita}"), '1', 'EX', NOVENTA_DIAS],
            ]);
            semConteudo();
        } else {
            responderJson(['erro' => 'invalido'], 400);
        }
    } catch (Throwable $e) {
        responderJson(['erro' => 'banco'], 502);
    }
}

if ($metodo === 'GET') {
    $banco = obterBanco();
    if ($banco === null) responderJson(['erro' => 'nao-configurado'], 503);

    $guardado = lerVariavelAmbiente('VITE_MASTER_TOKEN_HASH');
    if ($guardado === '') $guardado = lerVariavelAmbiente('ESTATISTICAS_TOKEN_HASH');
    if ($guardado === '') responderJson(['erro' => 'sem-token'], 503);

    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (str_starts_with($auth, 'Bearer ')) {
        $token = substr($auth, 7);
    } else {
        $token = '';
    }

    try {
        $limite = chaveDoLimite($banco, 'admin');
        $resLimite = executarRedis($banco, [['GET', $limite]]);
        if (((int)($resLimite[0] ?? 0)) >= LIMITE_DE_ERROS_DO_ADMIN) {
            responderJson(['erro' => 'muitos'], 429);
        }

        if (!tokenConfere($token, $guardado)) {
            executarRedis($banco, [
                ['INCR', $limite],
                ['EXPIRE', $limite, UMA_HORA],
            ]);
            responderJson(['erro' => 'nao-autorizado'], 401);
        }

        $res = executarRedis($banco, [
            ['GET', chave('acessos')],
            ['PFCOUNT', chave('visitantes')],
            ['HGETALL', chave('dias')],
            ['HGETALL', chave('estados')],
            ['HGETALL', chave('cidades')],
            ['HGETALL', chave('dispositivos')],
            ['HGETALL', chave('origens')],
            ['HGETALL', chave('compartilhamentos')],
            ['PFCOUNT', chave('quem-compartilhou')],
            ['LRANGE', chave('recentes'), 0, QUANTAS_RECENTES - 1],
        ]);

        [$acessos, $visitantes, $dias, $estados, $cidades, $dispositivos, $origens, $compartilhamentos, $quemCompartilhou, $recentes] = $res;

        $ids = is_array($recentes) ? array_map('strval', $recentes) : [];
        $visitas = [];
        $marcas = [];
        if (!empty($ids)) {
            $cmdVisitas = array_merge(['MGET'], array_map(fn($id) => chave("visita:{$id}"), $ids));
            $cmdMarcas = array_merge(['MGET'], array_map(fn($id) => chave("compartilhou:{$id}"), $ids));
            $resVisitas = executarRedis($banco, [$cmdVisitas, $cmdMarcas]);
            $visitas = is_array($resVisitas[0] ?? null) ? $resVisitas[0] : [];
            $marcas = is_array($resVisitas[1] ?? null) ? $resVisitas[1] : [];
        }

        $porDia = comoContagem($dias);
        $janela = ultimosDias(DIAS_NO_GRAFICO);
        $hoje = end($janela);
        $vezesCompartilhado = comoContagem($compartilhamentos);
        $porDispositivo = comoContagem($dispositivos);
        $porOrigem = comoContagem($origens);
        $porEstado = comoContagem($estados);
        $porCidade = comoContagem($cidades);

        arsort($porEstado);
        arsort($porCidade);
        arsort($porOrigem);

        $listaEstados = [];
        foreach ($porEstado as $estado => $total) {
            $listaEstados[] = array_merge(separarEstado((string)$estado), ['acessos' => (int)$total]);
        }

        $listaCidades = [];
        $cidadesLimitadas = array_slice($porCidade, 0, QUANTAS_CIDADES, true);
        foreach ($cidadesLimitadas as $lugar => $total) {
            $partes = explode('|', (string)$lugar, 2);
            $est = $partes[0] ?? '?';
            $cid = $partes[1] ?? '';
            $listaCidades[] = array_merge(separarEstado($est), [
                'cidade' => $cid === '?' ? '' : $cid,
                'acessos' => (int)$total,
            ]);
        }

        $listaRecentes = [];
        foreach ($visitas as $i => $bruta) {
            if (!is_string($bruta)) continue;
            $decodificada = json_decode($bruta, true);
            if (!is_array($decodificada)) continue;
            $decodificada['compartilhou'] = (($marcas[$i] ?? '') === '1');
            $listaRecentes[] = $decodificada;
        }

        $resposta = [
            'atualizadoEm' => gmdate('Y-m-d\TH:i:s\Z'),
            'resumo' => [
                'acessos' => (int)($acessos ?? 0),
                'visitantes' => (int)($visitantes ?? 0),
                'hoje' => $porDia[$hoje] ?? 0,
                'ultimos7Dias' => array_sum(array_map(fn($d) => $porDia[$d] ?? 0, array_slice($janela, -7))),
                'compartilhamentos' => array_sum($vezesCompartilhado),
                'pessoasQueCompartilharam' => (int)($quemCompartilhou ?? 0),
            ],
            'dias' => array_map(fn($dia) => ['dia' => $dia, 'acessos' => $porDia[$dia] ?? 0], $janela),
            'estados' => $listaEstados,
            'cidades' => $listaCidades,
            'dispositivos' => array_map(fn($tipo) => ['tipo' => $tipo, 'acessos' => $porDispositivo[$tipo] ?? 0], DISPOSITIVOS),
            'origens' => array_map(fn($tipo, $total) => ['tipo' => (string)$tipo, 'acessos' => (int)$total], array_keys($porOrigem), $porOrigem),
            'compartilhamentos' => array_map(fn($meio) => ['meio' => $meio, 'vezes' => $vezesCompartilhado[$meio] ?? 0], MEIOS),
            'recentes' => $listaRecentes,
        ];

        responderJson($resposta);
    } catch (Throwable $e) {
        responderJson(['erro' => 'banco'], 502);
    }
}

responderJson(['erro' => 'metodo-nao-permitido'], 405);
