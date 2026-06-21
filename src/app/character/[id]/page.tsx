import { CharacterDetailPage } from "@/components/character/CharacterDetailPage";

type CharacterPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CharacterPage({ params }: CharacterPageProps) {
  const { id } = await params;

  return <CharacterDetailPage characterId={id} />;
}
