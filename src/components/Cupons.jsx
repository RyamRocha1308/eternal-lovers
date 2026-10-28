import { Section } from './ui.jsx';
import { useLocalStorage, fx, waLink, beep } from '../lib.js';

export default function Cupons({ content }) {
  // quantos usos restam de cada vale: começa com 2; ao restaurar, volta com 1
  const [left, setLeft] = useLocalStorage('cuponsQtd', {});
  const qty = (id) => left[id] ?? 2;
  const allUsed = content.cupons.every((c) => qty(c.id) === 0);

  const redeem = (c) => {
    if (qty(c.id) === 0) return;
    setLeft((l) => ({ ...l, [c.id]: (l[c.id] ?? 2) - 1 }));
    beep('win');
    fx('confetti');
    // abre o WhatsApp numa nova aba para avisar
    window.open(waLink(content.site.whatsapp, `Resgatei o vale "${c.titulo}"!`), '_blank', 'noopener');
  };

  return (
    <Section id="cupons" kicker="Cupons" title="Vale-Presente">
      <p className="rules">
        <strong>Regras:</strong> você começa com 2 de cada vale. Só pode restaurar se tiver usado todos, e aí cada vale volta com 1.
      </p>
      <div className="tickets">
        {content.cupons.map((c) => {
          const n = qty(c.id);
          const done = n === 0;
          return (
            <article key={c.id} className={'ticket' + (done ? ' used' : '')}>
              <div>
                <h3>
                  {c.titulo} <span className="qty">{n}x</span>
                </h3>
                <p>{c.descricao}</p>
              </div>
              <button className="btn" disabled={done} onClick={() => redeem(c)}>
                {done ? 'Resgatado ✓' : 'Resgatar'}
              </button>
            </article>
          );
        })}
      </div>
      <div className="restore">
        <button className="btn ghost" disabled={!allUsed} onClick={() => setLeft(Object.fromEntries(content.cupons.map((c) => [c.id, 1])))}>
          Restaurar cupons
        </button>
      </div>
    </Section>
  );
}
