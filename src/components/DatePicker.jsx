import { useEffect, useMemo, useState } from 'react';
import { dateKey as key, eventosDoAno } from '../datas.js';

const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const pad = (n) => String(n).padStart(2, '0');
const TIPOS = { feriado: 'Feriado', comemorativo: 'Data comemorativa', nosso: 'Data nossa' };

// value: "YYYY-MM-DDTHH:mm" (horário local) ou ""
export default function DatePicker({ value, inicio, extras, onConfirm, onClose }) {
  const initial = value ? new Date(value) : new Date();
  const today = new Date();
  const [view, setView] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const [day, setDay] = useState(value ? key(initial) : null);
  const [hour, setHour] = useState(value ? initial.getHours() : 18);
  const [minute, setMinute] = useState(value ? initial.getMinutes() : 0);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const eventos = useMemo(() => eventosDoAno(view.getFullYear(), inicio ? new Date(inicio) : null, extras), [view, inicio, extras]);
  const first = view.getDay();
  const total = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: total }, (_, i) => new Date(view.getFullYear(), view.getMonth(), i + 1))];
  const todayKey = key(today);
  const canGoBack = view > new Date(today.getFullYear(), today.getMonth(), 1);

  const doMes = Object.entries(eventos)
    .filter(([k]) => k.startsWith(`${view.getFullYear()}-${pad(view.getMonth() + 1)}-`))
    .sort(([a], [b]) => a.localeCompare(b));
  const doDia = day ? eventos[day] : null;
  const move = (n) => setView(new Date(view.getFullYear(), view.getMonth() + n, 1));
  const step = (setter, v, delta, max) => setter((v + delta + max) % max);

  return (
    <div className="modal dp-modal" role="dialog" aria-modal="true" aria-labelledby="dp-title" onClick={onClose}>
      <div className="dp" onClick={(e) => e.stopPropagation()}>
        <header className="dp-head">
          <div className="dp-sun" aria-hidden="true">
            ☀️
          </div>
          <h3 id="dp-title">Quando vai ser?</h3>
          <button type="button" className="dp-x" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </header>

        <div className="dp-body">
          <section className="dp-cal" aria-label="Calendário">
            <div className="dp-nav">
              <button type="button" disabled={!canGoBack} onClick={() => move(-1)} aria-label="Mês anterior">
                ‹
              </button>
              <strong>
                {MESES[view.getMonth()]} {view.getFullYear()}
              </strong>
              <button type="button" onClick={() => move(1)} aria-label="Próximo mês">
                ›
              </button>
            </div>

            <div className="dp-grid" role="grid">
              {DIAS.map((d) => (
                <span key={d} className="dp-wd">
                  {d}
                </span>
              ))}
              {cells.map((d, i) => {
                if (!d) return <span key={i} />;
                const k = key(d);
                const ev = eventos[k] ?? [];
                return (
                  <button
                    key={i}
                    type="button"
                    className={'dp-day' + (k === day ? ' on' : '') + (k === todayKey ? ' today' : '')}
                    disabled={k < todayKey}
                    aria-pressed={k === day}
                    aria-label={`${d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}${ev.length ? ': ' + ev.map((e) => e.nome).join(', ') : ''}`}
                    onClick={() => setDay(k)}
                  >
                    <span className="dp-n">{d.getDate()}</span>
                    {ev.length > 0 && (
                      <span className="dp-marks" aria-hidden="true">
                        {ev.slice(0, 3).map((e, j) => (
                          <i key={j} className={'dot ' + e.tipo} />
                        ))}
                      </span>
                    )}
                    {ev[0] && (
                      <span className="dp-label" aria-hidden="true">
                        {ev[0].nome}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <p className="dp-legend" aria-hidden="true">
              <span>
                <i className="dot feriado" /> Feriado
              </span>
              <span>
                <i className="dot comemorativo" /> Comemorativa
              </span>
              <span>
                <i className="dot nosso" /> Nossa 💛
              </span>
            </p>
          </section>

          <aside className="dp-side">
            <h4>Neste mês</h4>
            {doMes.length === 0 ? (
              <p className="dp-empty">Nenhuma data especial.</p>
            ) : (
              <ul className="dp-events">
                {doMes.map(([k, list]) =>
                  list.map((e, j) => (
                    <li key={k + j} className={e.tipo}>
                      <i className={'dot ' + e.tipo} />
                      <b>{Number(k.slice(8))}</b>
                      <span>
                        {e.nome}
                        <small>{TIPOS[e.tipo]}</small>
                      </span>
                    </li>
                  ))
                )}
              </ul>
            )}

            <div className="dp-picked">
              {day ? (
                <>
                  <strong>
                    {new Date(day + 'T12:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </strong>
                  {doDia && <small>{doDia.map((e) => e.nome).join(' · ')}</small>}
                </>
              ) : (
                <small>Toque em um dia do calendário.</small>
              )}
            </div>

            <div className="dp-time" aria-label="Horário">
              <span aria-hidden="true">🕐</span>
              <div className="dp-spin">
                <button type="button" onClick={() => step(setHour, hour, 1, 24)} aria-label="Hora a mais">
                  ▲
                </button>
                <output>{pad(hour)}</output>
                <button type="button" onClick={() => step(setHour, hour, -1, 24)} aria-label="Hora a menos">
                  ▼
                </button>
              </div>
              <b>:</b>
              <div className="dp-spin">
                <button type="button" onClick={() => step(setMinute, minute, 5, 60)} aria-label="Minutos a mais">
                  ▲
                </button>
                <output>{pad(minute)}</output>
                <button type="button" onClick={() => step(setMinute, minute, -5, 60)} aria-label="Minutos a menos">
                  ▼
                </button>
              </div>
            </div>

            <div className="dp-actions">
              <button type="button" className="btn ghost" onClick={onClose}>
                Cancelar
              </button>
              <button type="button" className="btn" disabled={!day} onClick={() => onConfirm(`${day}T${pad(hour)}:${pad(minute)}`)}>
                Confirmar ☀️
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
