@trollsheet-haaland.json @README.md

Preciso ajustar a ficha do personagem Haaland (trollsheet-haaland.json) para refletir corretamente a classe Bruxo (Warlock) de Nível 8 no D&D 5e SRD.

Atualmente, o JSON possui slots genéricos de nível 1 e 2 (como se fosse Mago), o equipamento inclui besta leve e a CA está desatualizada.

Por favor, faça as seguintes alterações no projeto e no arquivo `trollsheet-haaland.json`:

1. **Ajuste de Slots de Magia (Pact Magic - Warlock 8):**
   - Remova os slots de nível 1 e 2 (`spellSlotsLevel1`, `spellSlotsLevel2`, `currentSpellSlotsLevel1`, `currentSpellSlotsLevel2`).
   - Adicione suporte para 2 slots de Nível 4:
     `"spellSlotsLevel4": 2`
     `"currentSpellSlotsLevel4": 2`

2. **Equipamento e Defesa:**
   - Substitua `"weapon-light-crossbow"` em `equipmentIds` por `"weapon-quarterstaff"` (Cajado / Foco Arcano).
   - Atualize a Classe de Armadura (`ac`) para 14 (Armadura de Couro [11] + MOD DES [+3]).

3. **Subclasse, Pacto e Invocações:**
   - Adicione os campos de Patrono e Pacto no JSON:
     `"subclassId": "theGreatOldOne"`
     `"pactBoon": "pactOfTheTome"`
   - Adicione o array de invocações místicas conhecidas:
     `"invocations": ["bookOfAncientSecrets", "armorOfShadows", "mireTheMind", "sculptorOfFlesh"]`
   - Adicione as habilidades passivas do Grande Antigo:
     `"classFeatures": ["awakenedMind", "entropicWard", "pactOfTheTome"]`

4. **Verificação de Regras/Engine:**
   - Verifique se os arquivos de tipos (Typescript) ou funções da engine de regras em `src/lib/rules/` precisam de ajustes para aceitar `spellSlotsLevel4` ou os novos campos de Bruxo sem gerar erro de compilação ou validação.
   - Execute `npm test` para garantir que as alterações não quebraram os testes existentes.

Apenas altere os arquivos necessários e confirme quando o JSON e a validação estiverem concluídos.