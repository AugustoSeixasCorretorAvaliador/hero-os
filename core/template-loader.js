export async function loadTemplate(path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`Falha ao carregar template: ${path}`);
  return response.json();
}
