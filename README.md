# Trollsheet

Construtor de personagens para RPG de mesa, começando com **D&D 5e (SRD)** e evoluindo para uma plataforma multi-sistema.

---

## Visão

Um app web onde o jogador cria, edita e exporta fichas de personagem completas — habilidades, perícias, magias, equipamento, combate e anotações de campanha — com **regras modeladas como dados**, não hardcoded.

A ficha digital replica (e melhora) a experiência da ficha física: campos calculados automaticamente, validações de regras e histórico de level-up.

---

## Status atual (implementado)

- Fluxo de criação mobile-first funcional com persistência local de rascunho
- Lista de personagens salvos no dispositivo
- Tela de detalhe do personagem salvo em rota dinâmica (`/character/[id]`)
- Conteúdo expandido de SRD-like para:
  - mais classes (incluindo conjuradoras)
  - mais raças
  - mais backgrounds
  - equipamento inicial por classe
- Etapa de magia no criador (versão simplificada):
  - slots de magia por classe no nível 1
  - seleção de magias conhecidas para classes conjuradoras
  - resumo de magia na revisão e na tela de detalhe

---

## Decisões do MVP (acordado)

| Decisão | Escolha |
|---------|---------|
| **Autenticação** | Sem login no MVP — persiste em `localStorage` + export/import JSON |
| **Foco principal** | Criação do personagem (nível 1, SRD) |
| **UX / layout** | **Mobile-first** — criação passo a passo; ficha completa só na Fase 2 |
| **Banco de dados** | Adiado — PostgreSQL + Prisma entram quando houver login/contas |
| **Pós-MVP imediato** | Ficha interativa, level-up, login |

---

## UX — mobile-first, criação passo a passo

O app é pensado como **experiência de celular** (web responsiva, evoluindo para PWA). A ficha física de D&D tem dezenas de campos — numa tela pequena, tudo numa página vira scroll infinito e aumenta erro.

### Dois modos, dois momentos

| Momento | Interface | Motivo |
|---------|-----------|--------|
| **Criar** personagem | Assistente passo a passo (1 decisão por tela) | Ordem natural das regras; menos carga cognitiva; padrão mobile |
| **Ver / jogar** (Fase 2) | Ficha com seções colapsáveis ou tabs | Edição rápida na mesa (HP, recursos, anotações) |

Criação e ficha **não competem** — o assistente monta o personagem; a ficha serve depois de criado.

### Fluxo de criação (8 passos)

Cada passo ocupa **uma tela**, com barra de progresso e navegação voltar/avançar (rascunho salvo em `localStorage`):

```
● ○ ○ ○ ○ ○ ○ ○
Raça → Classe → Atributos → Perícias → Background → Equipamento → Magia → Revisão
```

A ordem segue as dependências das regras: raça altera atributos e speed; classe define pool de perícias e kit inicial; background adiciona proficiências; equipamento e magia dependem da classe.

### Padrões de interface (mobile)

- **Cards grandes** para escolhas (raça, classe, background) — alvo de toque confortável
- **Resumo colapsável** no topo durante a criação (ex.: `Elfo · Ladino · lv1`)
- **Validação por passo** — só avança quando a escolha atual é válida
- **Tela de revisão** — mini-resumo antes de concluir; não é a ficha completa
- **Layout responsivo** — mobile primeiro; desktop reutiliza o mesmo fluxo (colunas mais largas, não ficha única na criação)

### Wireframe de referência

```
┌─────────────────────┐
│  ● ○ ○ ○ ○ ○ ○ ○    │  progresso
│  Elfo · Ladino      │  resumo (colapsável)
│                     │
│   Escolha sua raça  │
│                     │
│  [ Humano      ]    │
│  [ Elfo     ✓  ]    │
│  [ Anão        ]    │
│                     │
│  [← Voltar] [Próximo →]
└─────────────────────┘
```


## Stack proposta

| Camada | Tecnologia | Motivo |
|--------|------------|--------|
| Frontend | Next.js + TypeScript + React | SSR/SSG, App Router, ecossistema maduro |
| UI | Tailwind CSS + shadcn/ui | Mobile-first; componentes touch-friendly |
| Persistência (MVP) | `localStorage` + export/import JSON | Zero infra; validar criação antes de auth |
| Regras | JSON estático versionado | SRD como seed; regras desacopladas do código |
| Banco (futuro) | PostgreSQL + Prisma | Quando login e multi-dispositivo fizerem sentido |

---

## Princípios de arquitetura

1. **Regras como dados** — Raças, classes, magias, perícias, backgrounds vivem em JSON versionado (`/data/srd/`). O código só interpreta e calcula.
2. **Engine de regras separada** — Funções puras recebem `CharacterState` + `RuleData` e retornam valores derivados (AC, modificadores, slots de magia, etc.).
3. **SRD first** — MVP usa apenas conteúdo Open Game License (SRD 5.1/5.2). Conteúdo proprietário (Xanathar, Tasha, etc.) entra depois como packs opcionais.
4. **Multi-sistema depois** — Schema e engine preparados com `systemId` (ex: `dnd5e`, `pathfinder2e`) sem reescrever tudo.

---

## Escopo do MVP (D&D 5e SRD)

> **Prioridade #1:** fluxo de criação passo a passo (mobile-first), personagem nível 1 SRD completo.

### Fase 1 — Criação de personagem (MVP core)

- [x] Assistente mobile-first — **uma tela por passo**, barra de progresso, voltar/avançar
  1. Raça (+ sub-raça/trait)
  2. Classe
  3. Atributos (point buy simplificado)
  4. Perícias e proficiências
  5. Background
  6. Equipamento inicial
  7. Magia (classes conjuradoras)
  8. Revisão e conclusão → personagem salvo
- [x] Cálculos automáticos derivados das regras (mod, prof, AC, HP, skills)
- [x] Persistência local (`localStorage`) — salvar rascunho durante a criação
- [ ] Export / import JSON do personagem criado
- [x] Lista simples de personagens salvos localmente (criar, abrir, excluir)
- [x] Tela de visualização de personagem salvo (atributos, perícias, equipamento, magia e combate)

**Fora do MVP (Fase 1):** login, PostgreSQL, campanhas, compartilhamento.

### Fase 2 — Ficha e progressão

- [~] Ficha interativa pós-criação (há tela de detalhe inicial; pode evoluir para edição completa)
- [ ] Level-up guiado (HP, ASI/Feat, novas features, spell slots)
- [~] Magias (versão simplificada implementada para criação nível 1)
- [~] Inventário e equipamento (kit inicial por classe implementado)
- [ ] Short rest / Long rest (recuperação de recursos)
- [ ] Export PDF / impressão

### Fase 3 — Contas e campanha

- [ ] Autenticação (email/senha ou OAuth) + PostgreSQL + Prisma
- [ ] Campanhas (DM convida jogadores)
- [ ] Compartilhamento read-only da ficha
- [ ] Notas de sessão vinculadas ao personagem
- [ ] Homebrew pack (DM adiciona conteúdo custom)

---

## Modelo da ficha de personagem

Baseado na ficha clássica, organizada em seções:

### Identidade do jogador / personagem

| Campo | Tipo | Notas |
|-------|------|-------|
| Player | string | Nome do jogador (meta) |
| Name | string | Nome do personagem |
| Class | ref → Class | Pode ser multiclasse (array) |
| Level | number | Por classe |
| Experience | number | XP total |
| Race | ref → Race | + sub-race |
| Background | ref → Background | |
| Alignment | enum | LG, NG, CG, LN, N, CN, LE, NE, CE |
| Age | number | |
| Gender | string | Livre |
| Height / Weight | string | Unidades configuráveis |
| Size | enum | Tiny → Gargantuan |
| Hair / Eyes / Skin | string | Aparência |
| Faith | string | Deidade ou crença |

### Atributos e proficiência

```
STR  DEX  CON  INT  WIS  CHA
 │    │    │    │    │    │
 └────┴────┴────┴────┴────┘
         modifier = floor((score - 10) / 2)

Proficiency Bonus = f(level)  →  +2 (lv1-4), +3 (5-8), +4 (9-12)...
```

- **Saving throws** — marcados por proficiência de classe/raça
- **Skills** — 18 perícias SRD, cada uma ligada a um atributo
- **Passive scores** — Perception, Investigation, Insight

### Combate

| Campo | Cálculo / origem |
|-------|------------------|
| AC | 10 + DEX mod + armor + shield + bonuses |
| Initiative | DEX mod + bonuses |
| Speed | Raça + modificadores |
| Speed (encumbered) | Speed − penalidade de carga |
| HP (current / max) | Hit die por classe + CON mod × level |
| Hit Dice | `1dX` restantes / total (recupera metade no long rest) |
| Death saves | Tracking manual (sucessos / falhas) |

**Armaduras (regras automáticas):**

- *Medium armor* — DEX mod capped (max +2)
- *Heavy armor* — DEX mod = 0

### Ataques e armas

| Coluna | Descrição |
|--------|-----------|
| Weapon | Nome / descrição |
| To Hit | d20 + prof (se proficiente) + mod relevante |
| Damage | dice + mod |
| Damage Type | slashing, piercing, bludgeoning, fire… |
| Range | normal / long (ranged) |

### Defesas e resistências

- **Resistances** — dano reduzido pela metade
- **Immunities / Vulnerabilities** — tracking
- **Condition immunities** — tracking

### Features com usos limitados

| Feature | Max usages | Recovery | Used |
|---------|------------|----------|------|
| Second Wind | 1 | Short rest | 0 |
| Channel Divinity | 1-3 | Short/Long rest | 0 |
| Rage | 2-6 | Long rest | 0 |

> Recovery types: `short-rest`, `long-rest`, `dawn`, `none`

### Magias

- Spellcasting ability (por classe)
- Spell save DC = 8 + prof + ability mod
- Spell attack = prof + ability mod
- Cantrips + spells known/prepared
- Spell slots por nível (1–9)
- Ritual, concentration tracking

### Senses

- Darkvision (range)
- Blindsight, Tremorsense, Truesight
- Passive Perception (calculado)

### Descanso

| Tipo | Efeitos automáticos |
|------|---------------------|
| Short rest | Gasta hit dice para recuperar HP; restaura features `short-rest` |
| Long rest | Recupera HP total; restaura slots; **recupera metade dos hit dice (mín. 1)**; restaura features `long-rest` |
| AC during rest | Campo opcional para AC sem armadura (descanso) |

---

## Modelo de dados (alto nível)

```
System
  └── RulePack (srd-5.1, homebrew-xyz)
        ├── races[]
        ├── classes[]
        ├── backgrounds[]
        ├── spells[]
        ├── items[]
        └── features[]

Character (MVP — localStorage / JSON export)
        ├── id, name, createdAt, updatedAt
        ├── identity (name, race, class, level, ...)
        ├── abilities { str, dex, con, int, wis, cha }
        ├── proficiencies { saves[], skills[], tools[], weapons[], armor[] }
        ├── combat { hp, ac, speed, hitDice[] }
        ├── equipment[]
        ├── spells { cantrips[], known[], prepared[], slots{} }  # se classe conjuradora
        ├── features[] { id, used, maxUses }
        └── attacks[]

User + Character (futuro — com login)
        └── mesma estrutura, persistida no PostgreSQL
```

**Regras em JSON (exemplo simplificado):**

```json
{
  "id": "fighter",
  "name": "Fighter",
  "hitDie": "d10",
  "savingThrows": ["str", "con"],
  "skillChoices": { "count": 2, "from": ["acrobatics", "athletics", "..."] },
  "features": [
    { "level": 1, "id": "fighting-style", "name": "Fighting Style" },
    { "level": 1, "id": "second-wind", "name": "Second Wind", "uses": 1, "recovery": "short-rest" }
  ]
}
```

---

## Engine de regras (funções puras)

```
calculateModifier(score) → number
calculateProficiencyBonus(level) → number
calculateAC(character, equipment) → number
calculateSkillBonus(character, skill) → number
calculateSpellSaveDC(character) → number
applyLevelUp(character, choices) → Character
applyShortRest(character) → Character
applyLongRest(character) → Character
validateCharacter(character) → ValidationResult[]
```

Toda lógica de regras fica testável unitariamente, sem banco ou UI.

---

## Estrutura de pastas (proposta)

```
rpg_character_build/
├── README.md
├── data/
│   └── srd/
│       ├── races.json
│       ├── classes.json
│       ├── backgrounds.json
│       ├── spells.json
│       ├── items.json
│       └── skills.json
├── src/
│   ├── app/                    # Next.js App Router
│   ├── components/
│   │   ├── character-sheet/    # Ficha (Fase 2)
│   │   ├── creation-flow/      # Passos do assistente de criação ← MVP
│   │   └── ui/                 # shadcn
│   ├── lib/
│   │   ├── rules/              # Engine de cálculo
│   │   ├── storage/            # localStorage + export/import JSON
│   │   └── types/              # TypeScript types
│   └── hooks/
└── tests/
    └── rules/                  # Testes da engine
```

---

## Roadmap pós-MVP

| Milestone | Descrição |
|-----------|-----------|
| Multiclasse | Regras de level split, spellcasting híbrido |
| Feats | Alternativa a ASI |
| Custom content packs | Import JSON homebrew |
| Outros sistemas | Pathfinder 2e, OSR, etc. via `systemId` |
| API pública | Integração com VTT (Foundry, Roll20) |
| Mobile PWA | Ficha offline na mesa |

---

## Limitações conhecidas (MVP)

- Apenas conteúdo **SRD** (sem subclasses premium, sem races extras)
- Apenas **nível 1** na criação (level-up fica para Fase 2)
- Sem login — dados só no navegador (export JSON como backup)
- Criação só em **modo passo a passo** — ficha completa na Fase 2
- Sem mapa/battle grid
- Sem dice roller integrado
- Sem suporte a variant rules (flanking, encumbrance detalhada)

---

## Próximos passos

1. ~~Validar escopo e prioridades~~ ✓
2. ~~Definir UX mobile-first (passo a passo na criação)~~ ✓
3. Scaffold do projeto (Next.js + shadcn, sem banco)
4. Seed dos dados SRD em JSON
5. Engine de regras + testes
6. **Assistente de criação** (7 telas, mobile-first — foco principal)
7. Persistência local + export JSON
8. Ficha interativa com tabs/seções (Fase 2)
9. Login + PostgreSQL (Fase 3)

---

## Referências

- [D&D 5e SRD](https://dnd.wizards.com/resources/systems-reference-document)
- [SRD 5.2 (CC BY 4.0)](https://www.dndbeyond.com/srd)
- [Open5e API](https://open5e.com/) — possível fonte para seed inicial dos JSONs
