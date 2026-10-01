# A página inicial

Este diretório monta a página inicial do site: **React + Tailwind**, a mesma
versão para computador, tablet e celular (ela se ajusta à largura da tela).

---

## O mapa da pasta

```
windows/
├── PaginaInicialWindows.tsx   a montagem da página inicial
├── componentes/
│   └── TargetCursor.tsx       o cursor dourado que substitui o do sistema
└── estilos/windows.css        cursor, toque, telas pequenas e barra de rolagem
```

O nome `windows` ficou da época em que o site tinha também uma versão separada
para celular (removida em 01/10/2026).

---

## Onde está o resto

As seções **não** moram aqui. Elas ficam em `src/secoes/<seção>/`, junto dos
seus textos:

```
src/secoes/pilares/
├── conteudo.ts          os textos
├── PilaresSection.tsx   o visual
└── index.ts
```

| Eu quero...                 | Abra                              |
| --------------------------- | --------------------------------- |
| mudar o visual de uma seção | `src/secoes/<seção>/*.tsx`        |
| mudar o texto de uma seção  | `src/secoes/<seção>/conteudo.ts`  |
| mudar a ordem das seções    | Painel Admin → aba "Mapa do Site" |
| mexer no cursor dourado     | `componentes/TargetCursor.tsx`    |

---

## `PaginaInicialWindows.tsx` é um dicionário

A ordem das seções **não** está escrita neste arquivo. Ela vem do Painel
Admin, da aba "Mapa do Site" (`siteConfig.layoutSections`).

O que está aqui é a tradução:

```
   id da seção no Mapa   →   qual componente desenhar
```

Um id sem entrada no dicionário simplesmente não aparece, e nada quebra.

---

## O cursor

O `TargetCursor` desenha um cursor dourado e só liga quando há mouse (não liga
em telas de toque). Enquanto está ligado, ele marca o `<html>` com a classe
`cursor-alvo`, e só então o `windows.css` esconde o cursor do sistema. Assim
ninguém fica sem cursor: se o dourado não liga, o normal continua visível.

---

## Para saber mais

- **`../../secoes/LEIA-ME.md`** — o guia de edição dos textos.
