import { useState } from 'react';
import DatePicker from './DatePicker.jsx';
import { diffParts, nextMilestones, countdown, useNow, fx, useLocalStorage } from '../lib.js';

const pad = (n) => String(n).padStart(2, '0');

function Encontro({ now, titulo, inicio, extras }) {
  const [data, setData] = useLocalStorage('proximo-encontro', ''); // "YYYY-MM-DDTHH:mm" (horário do aparelho)
  const [editing, setEditing] = useState(false);
  const alvo = data ? new Date(data) : null;
  const c = alvo ? countdown(alvo, now) : null;
  const pickerOpen = !alvo;

  return (
    <div className="card hot encontro">
      <h3>{titulo}</h3>
      {pickerOpen ? (
        <button className="date-btn" onClick={() => setEditing(true)}>
          📅 Escolher a data
        </button>
      ) : c ? (
        <p>
          {c.d}d {pad(c.h)}h {pad(c.m)}m {pad(c.s)}s
        </p>
      ) : (
        <p className="arrived">Chegou o dia! 💛</p>
      )}
      {alvo && !pickerOpen && (
        <div className="encontro-actions">
          <small>
            {alvo.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })} às{' '}
            {alvo.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </small>
          <button className="link-btn" onClick={() => setEditing(true)}>
            Trocar data
          </button>
        </div>
      )}
      {editing && (
        <DatePicker
          value={data}
          inicio={inicio}
          extras={extras}
          onClose={() => setEditing(false)}
          onConfirm={(v) => {
            setData(v);
            setEditing(false);
          }}
        />
      )}
    </div>
  );
}

export default function Home({ content }) {
  const { site } = content;
  const now = useNow();
  const start = new Date(site.inicioRelacionamento);
  const t = diffParts(start, now);
  const marcos = nextMilestones(start, now);
  const [taps, setTaps] = useState(0);

  const dayPct = ((now.getHours() * 60 + now.getMinutes()) / 1440) * 100;

  const tapBall = () => {
    const n = taps + 1;
    setTaps(n);
    if (n >= 7) {
      setTaps(0);
      fx("rain", "✨");
    }
  };

  const units = [
    ['anos', t.anos],
    ['meses', t.meses],
    ['dias', t.dias],
    ['horas', t.horas],
    ['min', t.minutos],
    ['seg', t.segundos]
  ];

  return (
    <header id="home" className="hero">
      <button className="hero-ball" onClick={tapBall} aria-label="Sol">
        ☀️
      </button>
      <p className="kicker">Maré alta</p>
      <h1 className="brand big">Eternal Lovers</h1>
      <p className="hero-sub">
        Feito só para <strong>{site.nomeDela}</strong>
      </p>

      <div className="counter" role="timer" aria-label="Tempo juntos">
        {units.map(([label, v]) => (
          <div key={label} className="unit">
            <span className="num">{pad(v)}</span>
            <span className="lbl">{label}</span>
          </div>
        ))}
      </div>

      <div className="tide" title="Quanto do dia já passou" aria-label={`Dia transcorrido: ${Math.round(dayPct)}%`}>
        <div className="tide-fill" style={{ width: dayPct + '%' }} />
        <span>maré do dia</span>
      </div>

      <div className="cards">
        {marcos.map((m) => {
          const c = countdown(m.date, now);
          return (
            <div className="card" key={m.label}>
              <h3>{m.label}</h3>
              <p>
                {c.d}d {pad(c.h)}h {pad(c.m)}m
              </p>
            </div>
          );
        })}
        <Encontro now={now} titulo={site.proximoEncontroTitulo} inicio={site.inicioRelacionamento} extras={content.datasImportantes ?? []} />
      </div>

      <a href="#temporada" className="scroll-cue">
        Role para ver nossa história ↓
      </a>
    </header>
  );
}
