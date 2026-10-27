import { useEffect, useState } from 'react';
import { startAmbient, stopAmbient, toast } from '../lib.js';
import MusicModal from './MusicModal.jsx';

const TIDES = [['auto', '🕐'], ['dia', '☀️'], ['por-do-sol', '🌅'], ['noite', '🌙']];

export default function Dock({ tideMode, setTideMode, site, musicas }) {
  const [sound, setSound] = useState(false);
  const [music, setMusic] = useState(false);
  const [progress, setProgress] = useState(0);
  const [top, setTop] = useState(false);

  // o som só liga quando ela toca no botão (política dos navegadores)
  useEffect(() => {
    if (!sound) stopAmbient();
  }, [sound]);

  useEffect(() => {
    const on = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      setProgress(max > 0 ? (scrollY / max) * 100 : 0);
      setTop(scrollY > 600);
    };
    on();
    addEventListener('scroll', on, { passive: true });
    return () => removeEventListener('scroll', on);
  }, []);

  const nextTide = () => {
    const i = TIDES.findIndex(([k]) => k === tideMode);
    setTideMode(TIDES[(i + 1) % TIDES.length][0]);
  };

  return (
    <>
      <div className="footprints" aria-hidden="true">
        <div style={{ width: progress + '%' }} />
        <span style={{ left: progress + '%' }}>👣</span>
      </div>
      <nav className="dock" aria-label="Controles">
        <button className="tip-left" data-tip={`Clima: ${{ auto: 'automático', dia: 'dia', 'por-do-sol': 'pôr do sol', noite: 'noite' }[tideMode]} (toque para trocar)`} onClick={nextTide} aria-label={`Modo maré: ${tideMode}`}>
          {TIDES.find(([k]) => k === tideMode)[1]}
        </button>
        <button
          className="tip-left"
          data-tip={sound ? 'Desligar som das ondas' : 'Ligar som das ondas'}
          onClick={() => {
            if (!sound) {
              startAmbient();
              toast('🌊 Som das ondas ligado');
            }
            setSound(!sound);
          }}
          aria-pressed={sound} aria-label="Som das ondas">
          {sound ? '🔊' : '🔇'}
        </button>
        <button className="tip-left" data-tip="Escolher uma música" onClick={() => setMusic(!music)} aria-pressed={music} aria-label="Tocar nossa música">
          🎵
        </button>
        {top && (
          <button className="tip-left" data-tip="Voltar ao topo" onClick={() => scrollTo({ top: 0, behavior: 'smooth' })} aria-label="Voltar ao topo">
            ☀️
          </button>
        )}
      </nav>
      {music && <MusicModal site={site} musicas={musicas} onClose={() => setMusic(false)} />}
    </>
  );
}
