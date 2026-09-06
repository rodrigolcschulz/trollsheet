@README.md @trollsheet-haaland.json

Preciso expandir o suporte a classes conjuradoras no Trollsheet, especificamente adicionando o sistema de **Subclasses/Patronos**, **Invocações Místicas** e **Pact Magic** para Bruxo (Warlock).

Crie a especificação abaixo e implemente as alterações necessárias no modelo de dados (JSONs em `data/srd/`), nas tipagens TypeScript e na ficha do Haaland (`trollsheet-haaland.json`).

---

# Especificação do Recurso: Subclasses, Patronos & Invocações Místicas (Warlock)

## 1. Mapeamento de Regras do Bruxo (D&D 5e SRD)

### Pact Magic (Magia do Pacto)
Diferente das outras classes, os espaços de magia do Bruxo são todos do **mesmo nível** e escalam com o nível de classe:
- Nível 1-2: 1 a 2 slots de 1º Nível
- Nível 3-4: 2 slots de 2º Nível
- Nível 5-6: 2 slots de 3º Nível
- Nível 7-8: 2 slots de 4º Nível
- Nível 9-10: 2 slots de 5º Nível
- Nível 11-16: 3 slots de 5º Nível
- Nível 17-20: 4 slots de 5º Nível

### Patrono (Otherworldly Patron - Subclasse)
- Nível de escolha: **1º Nível**
- **O Grande Antigo (The Great Old One):**
  - **Lvl 1 - Mente Despertada (Awakened Mind):** Telepatia até 30 pés (9m).
  - **Lvl 6 - Escudo Entrópico (Entropic Ward):** Reação para impor desvantagem em ataque contra você; se errar, ganha vantagem no próximo ataque contra o alvo (1/descanso curto ou longo).

### Pact Boon (Dádiva do Pacto)
- Nível de escolha: **3º Nível**
- Opções SRD: `pactOfTheChain`, `pactOfTheBlade`, `pactOfTheTome`.

### Invocações Místicas (Eldritch Invocations)
- Desbloqueadas no Nível 2 (2 invocações) e escalam até o nível 18. No nível 8, o Bruxo possui **4 invocações**.

---

## 2. Mudanças Estruturais / Modelo de Dados

### A. Adicionar arquivo `data/srd/subclasses.json` (ou expandir em `classes.json`)
Crie/atualize a definição do patrono *The Great Old One*:
```json
{
  "id": "theGreatOldOne",
  "classId": "warlock",
  "name": "O Grande Antigo",
  "description": "Sua entidade pode ser uma força de além do tempo e espaço.",
  "features": [
    {
      "level": 1,
      "id": "awakenedMind",
      "name": "Mente Despertada",
      "description": "Comunicação telepática a até 30 pés."
    },
    {
      "level": 6,
      "id": "entropicWard",
      "name": "Escudo Entrópico",
      "description": "Imponha desvantagem em um ataque contra você usando reação."
    }
  ]
}