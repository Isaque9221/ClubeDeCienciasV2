# Como editar os textos do site

Cada pedaço visível do site tem **uma pasta só dele**, e dentro dela um arquivo
chamado **`conteudo.ts`**. É lá que ficam todos os textos daquele pedaço.

Você **não precisa entender o código** para editar. Só precisa achar a pasta certa.

---

## 1. Ache a seção que você quer mudar

| O que aparece no site                              | Arquivo Pasta            | para editar   |
| -------------------------------------------------- | ------------------------ | ------------- |
| Primeira tela: vídeo, título gigante, os 4 botões  | `secoes/hero/`           | `conteudo.ts` |
| Faixas douradas com texto rolando                  | `secoes/ticker/`         | `conteudo.ts` |
| "O que é o Clube de Ciências?" + as 4 abas         | `secoes/sobre/`          | `conteudo.ts` |
| A faixa com os 4 números (35+, 16+...)             | `secoes/estatisticas/`   | `conteudo.ts` |
| **"Oportunidades para além da escola e do clube"** | `secoes/pilares/`        | `conteudo.ts` |
| "Quem faz a ciência acontecer" (os 2 líderes)      | `secoes/equipe/`         | `conteudo.ts` |
| "Nossos Mentores" (os 3 professores)               | `secoes/pesquisadores/`  | `conteudo.ts` |
| "Pontes que Construímos" (os parceiros)            | `secoes/pontes/`         | `conteudo.ts` |
| A lista do botão "Explorar" (no topo)              | `secoes/hero/`           | `conteudo.ts` |
| A frase grande em destaque                         | `secoes/manifesto/`      | `conteudo.ts` |
| "Tire suas dúvidas"                                | `secoes/faq/`            | `conteudo.ts` |
| O convite final "Pronto para explorar...?"         | `secoes/cta/`            | `conteudo.ts` |
| O rodapé (parceiros, contatos, relógio)            | `secoes/rodape/`         | `conteudo.ts` |
| A tela de abertura (barra + escolha de rota)       | `recursos/carregamento/` | `conteudo.ts` |

As páginas separadas ficam fora de `secoes/`, mas seguem a mesma ideia:

| Página                                | Arquivo para editar               |
| ------------------------------------- | --------------------------------- |
| Página de Membros                     | `paginas/membros/MembersPage.tsx` |
| Cartões e ficha de cada membro        | `paginas/membros/componentes/`    |
| Página de Projetos                    | `paginas/projetos/conteudo.ts`    |
| Página da Trajetória (linha do tempo) | `paginas/trajetoria/conteudo.ts`  |
| Player de áudio                       | `recursos/audio/conteudo.ts`      |
| Rótulos do Painel Admin               | `paginas/painel/conteudo.ts`      |

**A ordem das seções na página inicial** vem do Painel Admin (aba "Mapa do Site");
o dicionário "id → componente" fica em `plataformas/windows/PaginaInicialWindows.tsx`.

> **Os textos não são duplicados.** Eles ficam só no `conteudo.ts` de cada
> seção e valem para as duas versões. Veja `plataformas/LEIA-ME.md`.

---

## 2. Edite o texto

Dentro do `conteudo.ts`, troque **apenas o que está entre aspas**:

```ts
export const PILARES = {
  etiqueta: "Frentes de Pesquisa",        // ← pode trocar
  titulo: "Nossos 4 Pilares",             // ← pode trocar
  ...
```

### As três regras

1. **Só mexa no texto entre aspas.** Nunca apague as aspas.
2. **Não apague vírgulas, chaves `{ }` nem colchetes `[ ]`.** Eles são o que
   segura a estrutura.
3. **Se o texto tiver aspas dentro dele**, escreva assim: `'Ele disse "oi"'`
   (aspas simples por fora).

Acentos, `ç` e emojis podem ser escritos normalmente.

### Para acrescentar um item numa lista

Copie um bloco inteiro de `{` até `},`, cole logo abaixo e troque os textos.
Funciona para pilares, perguntas do FAQ, marcos da trajetória, etc.

### Para trocar um ícone

Os ícones vêm do site [lucide.dev](https://lucide.dev). Escolha um, copie o nome
dele e faça duas coisas:

1. acrescente o nome na linha `import { ... } from "lucide-react";` do topo;
2. use o nome no campo `icone:`.

---

## 3. Atenção: o Painel Admin passa na frente

O site tem um Painel Admin (`Ctrl + Shift + A`) onde vários desses textos também
podem ser editados pelo navegador. A regra é:

```
  Você editou o campo no Painel Admin?
        │
        ├─ SIM  →  aparece o texto do Painel
        └─ NÃO  →  aparece o texto do conteudo.ts
```

Então, se você mudar algo no `conteudo.ts` e o site continuar mostrando o texto
antigo, é porque aquele campo está preenchido no Painel Admin. Duas saídas:

- edite pelo Painel mesmo; **ou**
- no Painel, em _Editor do Site & CMS_, use **"Restaurar padrões"** — ele volta a
  usar os textos do `conteudo.ts`.

Os campos que o Painel controla estão listados em `secoes/padroes-do-painel.ts`.
Esse arquivo **não guarda texto nenhum** — ele só copia o que está nos
`conteudo.ts`, para que nada precise ser escrito duas vezes.

---

## 4. Depois de editar

Salve o arquivo. Se o site estiver rodando com `npm run dev`, a mudança aparece
sozinha. Para publicar, rode `npm run build`.

Se algo quebrar, rode `npm run build` e leia a mensagem: ela diz o arquivo e a
linha do problema — quase sempre é uma vírgula ou uma aspa que faltou.
