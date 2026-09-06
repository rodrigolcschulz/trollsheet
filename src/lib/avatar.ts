const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_DIMENSION = 512;

export async function prepareAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.match(/^image\/(jpeg|png)$/)) {
    throw new Error("Escolha uma imagem JPEG ou PNG.");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("A imagem deve ter no maximo 5 MB.");
  }

  const sourceUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Nao foi possivel ler a imagem."));
    reader.readAsDataURL(file);
  });

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    element.onload = () => resolve(element);
    element.onerror = () => reject(new Error("Nao foi possivel carregar a imagem."));
    element.src = sourceUrl;
  });

  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Nao foi possivel preparar a imagem.");
  }

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}
