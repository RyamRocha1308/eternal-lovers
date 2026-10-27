import { useState } from 'react';
import { Section, Photo } from './ui.jsx';
import { fmtData } from '../lib.js';

export default function Timeline({ content }) {
  const [open, setOpen] = useState(null);
  const sets = content.timeline.reduce((acc, m) => {
    (acc[m.set] ??= []).push(m);
    return acc;
  }, {});

  return (
    <Section id="temporada" kicker="Capítulos" title="Nossa História">
      {Object.entries(sets).map(([set, marcos]) => (
        <div key={set} className="set">
          <h3 className="set-title">{content.sets[set - 1] ?? `Capítulo ${set}`}</h3>
          <ol className="timeline">
            {marcos.map((m) => (
              <li key={m.data + m.titulo} className={m.ace ? 'ace' : ''}>
                <button onClick={() => setOpen(m)} className="tl-card">
                  <span className="tl-ico">{m.icone}</span>
                  <span className="tl-date">{fmtData(m.data)}</span>
                  <strong>{m.titulo}</strong>
                  <span>{m.texto}</span>
                  {m.ace && <em className="ace-tag">✨ especial</em>}
                </button>
              </li>
            ))}
          </ol>
        </div>
      ))}

      {open && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={open.titulo} onClick={() => setOpen(null)}>
          <article className="modal-card" onClick={(e) => e.stopPropagation()}>
            <Photo src={open.foto} alt={open.titulo} emoji={open.icone} className="modal-photo" />
            <p className="tl-date">{fmtData(open.data)}</p>
            <h3>{open.titulo}</h3>
            <p>{open.detalhe}</p>
            <button className="btn" onClick={() => setOpen(null)}>
              Fechar
            </button>
          </article>
        </div>
      )}
    </Section>
  );
}
