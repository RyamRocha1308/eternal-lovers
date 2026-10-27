import { useEffect, useState } from 'react';

export default function MusicModal({ site, musicas, onClose }) {
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-labelledby="music-title" onClick={onClose}>
      <article className="music-card" onClick={(e) => e.stopPropagation()}>
        <header>
          <h3 id="music-title">🎵 Nossa playlist</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </header>

        {current ? (
          <iframe
            key={current.id}
            className="track-player"
            title={`${current.titulo} — ${current.artista}`}
            src={`https://open.spotify.com/embed/track/${current.id}`}
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          />
        ) : (
          <p className="muted">Escolha uma música para tocar:</p>
        )}

        <ul className="tracks">
          {musicas.map((m, i) => (
            <li key={m.id}>
              <button className={current?.id === m.id ? 'on' : ''} onClick={() => setCurrent(m)}>
                <span className="track-n">{current?.id === m.id ? '▶' : i + 1}</span>
                <span className="track-t">
                  <strong>{m.titulo}</strong>
                  <small>{m.artista}</small>
                </span>
              </button>
            </li>
          ))}
        </ul>

        <a className="btn ghost" href={site.playlist} target="_blank" rel="noopener noreferrer">
          Abrir no Spotify
        </a>
      </article>
    </div>
  );
}
