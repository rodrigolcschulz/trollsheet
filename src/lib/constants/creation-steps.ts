export const CREATION_STEPS = [
  {
    id: "race",
    title: "Raça",
    description: "Escolha a raça do personagem",
  },
  {
    id: "class",
    title: "Classe",
    description: "Escolha a classe",
  },
  {
    id: "abilities",
    title: "Atributos",
    description: "Distribua seus pontos de atributo",
  },
  {
    id: "skills",
    title: "Perícias",
    description: "Escolha as perícias da classe",
  },
  {
    id: "background",
    title: "Background",
    description: "Escolha o antecedente",
  },
  {
    id: "equipment",
    title: "Equipamento",
    description: "Selecione o equipamento inicial",
  },
  {
    id: "magic",
    title: "Magia",
    description: "Escolha magias conhecidas e veja seus slots",
  },
  {
    id: "review",
    title: "Revisão",
    description: "Confira tudo antes de concluir",
  },
] as const;

export type CreationStepId = (typeof CREATION_STEPS)[number]["id"];
