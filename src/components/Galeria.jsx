import { useRef, useState } from 'react';
import { Section, Photo } from './ui.jsx';
import { useLocalStorage } from '../lib.js';

export default function Galeria({ content }) {
  const [tag, setTag] = useState('todas');
  const [favs, setFavs] = useLocalStorage('favs', []);
  const [idx, setIdx] = useState(null);
  const [zoom, setZoom] = useState(false);
  const touch = useRef(null);

  const tags = ['todas', ...content.tags, 'favoritas'];
  const list = content.galeria.filter((f) => (tag === 'todas' ? true : tag === 'favoritas' ? favs.includes(f.src) : f.tag === tag));
  const cur = idx !== null ? list[idx] : null;

  const go = (d) => {
    setZoom(false);
    setIdx((i) => (i + d + list.length) % list.length);
  };
  const toggleFav = (src) => setFavs((f) => (f.includes(src) ? f.filter((x) => x !== src) : [...f, src]));

  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touch.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  return (
    <Section id="album" kicker="Praia" title="Álbum de Areia">
      <div className="chips" role="tablist" aria-label="Filtrar fotos">
        {tags.map((t) => (
          <button key={t} role="tab" aria-selected={tag === t} className={'chip' + (tag === t ? ' on' : '')} onClick={() => setTag(t)}>
            {t === 'favoritas' ? '❤ favoritas' : t}
          </button>
        ))}
      </div>

      {list.length === 0 && <p className="muted">Nada por aqui ainda. Toque no ❤ de uma foto para favoritar.</p>}
      <div className="masonry">
        {list.map((f, i) => (
          <figure key={f.src} className="tile">
            <button onClick={() => setIdx(i)} aria-label={`Abrir foto: ${f.legenda}`}>
              <Photo src={f.src} alt={f.legenda} className={'tile-img h' + (i % 3)} />
            </button>
            <figcaption>{f.legenda}</figcaption>
            <button data-tip={favs.includes(f.src) ? 'Tirar das favoritas' : 'Favoritar'} className={'fav tip-left' + (favs.includes(f.src) ? ' on' : '')} aria-pressed={favs.includes(f.src)} aria-label="Favoritar" onClick={() => toggleFav(f.src)}>
              ❤
            </button>
          </figure>
        ))}
      </div>

      {cur && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
          onTouchEnd={onTouchEnd}
        >
          <button className="lb-close tip-left" data-tip="Fechar" onClick={() => setIdx(null)} aria-label="Fechar">
            ✕
          </button>
          <button className="lb-nav l tip-right" data-tip="Foto anterior" onClick={() => go(-1)} aria-label="Anterior">
            ‹
          </button>
          <div className={'lb-stage' + (zoom ? ' zoom' : '')} onClick={() => setZoom((z) => !z)}>
            <Photo src={cur.src} alt={cur.legenda} className="lb-img" />
          </div>
          <button className="lb-nav r tip-left" data-tip="Próxima foto" onClick={() => go(1)} aria-label="Próxima">
            ›
          </button>
          <p className="lb-cap">
            {cur.legenda}{' '}
            <button data-tip={favs.includes(cur.src) ? 'Tirar das favoritas' : 'Favoritar'} className={'fav inline' + (favs.includes(cur.src) ? ' on' : '')} onClick={() => toggleFav(cur.src)} aria-label="Favoritar">
              ❤
            </button>
          </p>
        </div>
      )}
    </Section>
  );
}
