import { useRef, useState } from 'react';
import { Section, Photo } from './ui.jsx';

export default function Galeria({ content }) {
  const [idx, setIdx] = useState(null);
  const [zoom, setZoom] = useState(false);
  const touch = useRef(null);

  const list = content.galeria;
  const cur = idx !== null ? list[idx] : null;

  const go = (d) => {
    setZoom(false);
    setIdx((i) => (i + d + list.length) % list.length);
  };

  const onTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touch.current;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  return (
    <Section id="album" title="Um pouco de nós">
      <div className="masonry">
        {list.map((f, i) => (
          <figure key={f.src} className="tile">
            <button onClick={() => setIdx(i)} aria-label={`Abrir foto: ${f.legenda}`}>
              <Photo src={f.src} alt={f.legenda} className={'tile-img h' + (i % 3)} />
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
        </div>
      )}
    </Section>
  );
}
