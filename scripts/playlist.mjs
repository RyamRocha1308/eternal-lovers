// Uso: npm run playlist   → lê a playlist de site.playlist e grava a lista de músicas em content.json (musicas)
import { readFileSync, writeFileSync } from 'node:fs';

const path = new URL('../src/content/content.json', import.meta.url);
const content = JSON.parse(readFileSync(path, 'utf8'));
const id = content.site.playlist.match(/playlist\/([A-Za-z0-9]+)/)?.[1];
if (!id) throw new Error('site.playlist não é um link de playlist do Spotify');

const html = await (await fetch(`https://open.spotify.com/embed/playlist/${id}`, { headers: { 'user-agent': 'Mozilla/5.0' } })).text();
const json = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/)?.[1];
if (!json) throw new Error('Não consegui ler a playlist (a playlist precisa ser pública).');

const lista = JSON.parse(json).props.pageProps.state.data.entity.trackList;
content.musicas = lista
  .filter((t) => t.uri?.startsWith('spotify:track:'))
  .map((t) => ({ id: t.uri.split(':')[2], titulo: t.title, artista: t.subtitle }));
writeFileSync(path, JSON.stringify(content, null, 2));
console.log(`${content.musicas.length} músicas salvas.`);
