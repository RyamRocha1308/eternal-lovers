import { Section } from './ui.jsx';
import { useLocalStorage, fx, waLink, beep } from '../lib.js';

export default function Cupons({ content }) {
  const [used, setUsed] = useLocalStorage('cupons', []);

  const redeem = (c) => {
    if (used.includes(c.id)) return;
    setUsed((u) => [...u, c.id]);
    beep('win');
    fx('confetti');
    // abre o WhatsApp numa nova aba para avisar
    window.open(waLink(content.site.whatsapp, `Resgatei o vale "${c.titulo}"!`), '_blank', 'noopener');
  };

  return (
    <Section id="cupons" kicker="Cupons" title="Vale-Presente">
      <div className="tickets">
        {content.cupons.map((c) => {
          const done = used.includes(c.id);
          return (
            <article key={c.id} className={'ticket' + (done ? ' used' : '')}>
              <div>
                <h3>{c.titulo}</h3>
                <p>{c.descricao}</p>
              </div>
              <button className="btn" disabled={done} onClick={() => redeem(c)}>
                {done ? 'Resgatado ✓' : 'Resgatar'}
              </button>
            </article>
          );
        })}
      </div>
    </Section>
  );
}
