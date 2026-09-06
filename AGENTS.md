# Trollsheet — Instruções para agentes de código

Construtor de fichas de personagem para RPG de mesa (D&D 5e SRD, evoluindo para
multi-sistema). Ver `README.md` na raiz para visão completa do produto e roadmap.

## Stack e comandos

- Next.js + TypeScript + React (App Router), Tailwind CSS + shadcn/ui
- Persistência no MVP: `localStorage` + export/import JSON — **sem banco de dados ainda**
- Dev server roda na porta **3666**, não na 3000 padrão

```bash
npm install
npm run dev      # http://localhost:3666
npm test         # testes unitários — rode antes de considerar qualquer tarefa concluída
npm run lint
npm run build
```

Sempre rode `npm test` depois de qualquer mudança em `src/lib/rules/` ou em
`data/srd/`. Essa é a área mais sensível do projeto: um JSON de regra mal
formado ou uma função de cálculo alterada sem teste quebra fichas existentes
em silêncio.

## Princípio inegociável: regras como dados

Raças, classes, backgrounds, magias, perícias e equipamentos vivem em JSON
versionado dentro de `data/srd/`. **O código nunca deve hardcodar valores de
regra do D&D** (ex.: não escrever `if (classe === "warlock") slots = 2`
direto num componente React). Se uma tarefa pede uma nova regra ou classe,
o fluxo correto é:

1. Adicionar/editar o JSON em `data/srd/`
2. Se a regra exigir cálculo novo (ex.: um campo derivado que ainda não
   existe), adicionar uma função pura em `src/lib/rules/`
3. Nunca embutir a lógica direto no componente de UI

## Engine de regras — funções puras

Tudo em `src/lib/rules/` segue o contrato `(CharacterState, RuleData) →
valor derivado`, sem side-effects, sem chamadas de I/O, sem estado global.
Funções de referência já existentes (ver README para assinaturas completas):
`calculateModifier`, `calculateProficiencyBonus`, `calculateAC`,
`calculateSkillBonus`, `calculateSpellSaveDC`, `applyLevelUp`,
`applyShortRest`, `applyLongRest`, `validateCharacter`.

Qualquer função nova nessa pasta precisa ter teste correspondente em
`tests/rules/` — essa é a única camada do projeto com cobertura de teste
obrigatória.

## Estrutura de pastas

```
data/srd/            # Regras SRD em JSON (races, classes, backgrounds, spells, items, skills)
src/app/              # Next.js App Router
src/components/
  character-sheet/    # Ficha (Fase 2 — em construção)
  creation-flow/       # Assistente de criação passo a passo (foco atual do MVP)
  ui/                  # shadcn
src/lib/
  rules/               # Engine de cálculo — funções puras (ver acima)
  storage/             # localStorage + export/import JSON
  types/               # Types TypeScript
tests/rules/           # Testes da engine
```

## Compatibilidade retroativa — atenção especial

Personagens e rascunhos antigos já existem em `localStorage` de usuários
reais. Ao alterar o schema de `Character` ou de qualquer entidade em
`data/srd/`:

- **Nunca remova um campo só porque não é mais usado em personagens novos.**
  Exemplo real: o campo `pointBuy` foi descontinuado (novos personagens usam
  só rolagem 4d6), mas o campo permanece no schema exclusivamente para que
  personagens salvos antigos continuem sendo lidos sem quebrar.
- Ao adicionar um campo novo em `Character`, trate-o como opcional e forneça
  um fallback sensato para registros que não o têm.
- Se não tiver certeza se uma mudança quebra compatibilidade, pergunte antes
  de aplicar, em vez de assumir que está seguro.

## Escopo atual (não expandir sem confirmar)

- MVP é **SRD apenas** — sem conteúdo proprietário (Xanathar, Tasha etc.)
- **Sem autenticação e sem banco de dados** no momento — isso é Fase 3
  (PostgreSQL + Prisma). Não introduza dependências de banco de dados a
  menos que a tarefa peça isso explicitamente.
- Fluxo de criação é **mobile-first, uma decisão por tela** — não proponha
  um formulário único de página longa como alternativa

> **Nota:** o `README.md` pode ficar desatualizado em relação ao estado real
> do código (ex.: checkboxes de "Fase 2" já implementadas na prática, como
> level-up). Antes de assumir que uma feature não existe, procure por ela em
> `src/lib/rules/` e `src/components/` — não confie cegamente no checklist
> do README.

## Formato de tool call (ambiente local)

Este projeto costuma ser trabalhado com modelos locais via Ollama
(Qwen2.5-Coder). Se você é um agente rodando com um desses modelos:
respeite estritamente o formato de tool call configurado pelo cliente que
está te executando (Cline, Continue, Aider etc.) — não misture formatos
JSON e XML na mesma resposta, e não invente nomes de tag que não estejam
documentados pelo cliente.

---

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->