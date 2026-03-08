# HERO OS — Core + Trainer Module

Arquitetura mínima, local-first, pronta para GitHub Pages.

## Estrutura

- `core/engine.js` → regras de estado
- `core/storage.js` → persistência em localStorage
- `core/template-loader.js` → carrega template JSON
- `core/insight.js` → sugestões simples de próxima carga/data
- `modules/trainer/trainer-template.json` → template do módulo Trainer
- `modules/trainer/trainer-ui.js` → renderização da interface do Trainer
- `index.html` / `style.css` / `app.js` → shell do PWA
- `manifest.json` / `service-worker.js` → instalação e offline

## Rodar localmente

Use um servidor estático simples.

Exemplo com Python:

```bash
python -m http.server 8000
```

Depois abra:

```text
http://localhost:8000
```

## Publicar no GitHub Pages

1. Suba a pasta inteira em um repositório.
2. Ative **Settings → Pages**.
3. Escolha branch principal e pasta raiz.
4. Abra a URL publicada.

## Próximo passo

Extrair novos módulos usando o mesmo core:
- `sales`
- `habits`
- `tasks`
