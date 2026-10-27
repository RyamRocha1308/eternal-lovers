# Eternal Lovers 🌊🏐

Site-presente em React (Vite). Sem backend: tudo que ela marca (cupons, favoritas, bucket list, recordes) fica no `localStorage` do aparelho dela.

## Rodar

```
npm install
npm run dev      # http://localhost:5173 (também na rede, para testar no celular)
npm run build    # gera dist/
```

## Personalizar (tudo em `src/content/content.json`)

- `site`: nomes, data de início, WhatsApp (`55DDDNÚMERO`), playlist/música do Spotify, próximo encontro.
- **Senha**: padrão `210426`. Para trocar: `npm run hash -- 150324` e cole o resultado em `site.senhaHash`. (É só uma portinha de brincadeira — o hash fica no código.)
- Fotos: coloque em `public/fotos/` (`.webp`) e ajuste os caminhos. Sem foto, aparece um placeholder.
- `datasImportantes` (opcional): datas suas que aparecem no calendário do próximo encontro, ex. `{ "data": "10-05", "nome": "Aniversário da Sofya" }` (MM-DD = todo ano; AAAA-MM-DD = uma vez).
- Cartas com `liberaEm` (data ISO) só abrem a partir dessa data; `audio` aceita um mp3 em `public/audio/`.
- Textos "Escreva aqui…" e opções do quiz são placeholders.
- `public/og-image.jpg` (1200×630) = prévia do link no WhatsApp. `public/icons/icon-192.png` e `icon-512.png` = ícones do PWA (ainda não incluídos).

## Easter eggs
Tocar na bola do topo 7× · digitar `AMO` · digitar `MAR` · Konami code.

## Deploy
Netlify/Vercel/Cloudflare Pages: build `npm run build`, pasta `dist`. Para proteção real, use a senha da hospedagem.
