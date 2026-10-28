import { useState } from 'react';
import { Section } from './ui.jsx';
import { useLocalStorage, waLink, fx } from '../lib.js';

export default function BucketList({ content }) {
  const [done, setDone] = useLocalStorage('bucket-done', []);
  const [extras, setExtras] = useLocalStorage('bucket-extras', []);
  const [edits, setEdits] = useLocalStorage('bucket-edits', {}); // { id: texto novo } para itens do content.json
  const [removed, setRemoved] = useLocalStorage('bucket-removed', []);
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(null); // { id, texto }
  const [confirmId, setConfirmId] = useState(null);
  const [showSug, setShowSug] = useState(false);

  const items = [...content.bucketList, ...extras]
    .filter((i) => !removed.includes(i.id))
    .map((i) => ({ ...i, texto: edits[i.id] ?? i.texto }));
  const pct = items.length ? Math.round((items.filter((i) => done.includes(i.id)).length / items.length) * 100) : 0;

  const toggle = (id) =>
    setDone((d) => {
      const on = !d.includes(id);
      if (on) fx('rain', '🌊');
      return on ? [...d, id] : d.filter((x) => x !== id);
    });

  const taken = items.map((i) => i.texto.toLowerCase());
  const sugestoes = (content.sugestoesSonhos ?? [])
    .filter((s) => !taken.includes(s.toLowerCase()) && s.toLowerCase().includes(text.trim().toLowerCase()))
    .slice(0, 8);

  const add = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setExtras((x) => [...x, { id: 'x' + Date.now(), texto: text.trim(), dela: true }]);
    setText('');
  };

  const saveEdit = (e) => {
    e.preventDefault();
    const texto = editing.texto.trim();
    if (!texto) return;
    if (extras.some((x) => x.id === editing.id)) setExtras((l) => l.map((x) => (x.id === editing.id ? { ...x, texto } : x)));
    else setEdits((m) => ({ ...m, [editing.id]: texto }));
    setEditing(null);
  };

  const remove = (id) => {
    if (extras.some((x) => x.id === id)) setExtras((l) => l.filter((x) => x.id !== id));
    else setRemoved((r) => [...r, id]);
    setDone((d) => d.filter((x) => x !== id));
    setConfirmId(null);
  };

  const send = () => {
    const linhas = items.map((i) => `${done.includes(i.id) ? '[x]' : '[ ]'} ${i.texto}`).join('\n');
    window.open(waLink(content.site.whatsapp, `Nossas próximas aventuras 🌅\n\n${linhas}`), '_blank', 'noopener');
  };

  return (
    <Section id="saques" kicker="Sonhos" title="Próximas Aventuras" className="dark">
      <div className="water" data-tip="Quanto da lista já vivemos" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso da lista">
        <div className="water-fill" style={{ height: pct + '%' }} />
        <span>{pct}%</span>
      </div>

      {items.length === 0 && <p className="muted">A lista está vazia. Que tal sonhar uma nova aventura?</p>}
      <ul className="bucket">
        {items.map((i) => (
          <li key={i.id}>
            {editing?.id === i.id ? (
              <form className="bucket-row edit" onSubmit={saveEdit}>
                <input autoFocus value={editing.texto} onChange={(e) => setEditing({ id: i.id, texto: e.target.value })} aria-label="Editar aventura" />
                <button className="icon-btn ok" data-tip="Salvar" type="submit" aria-label="Salvar">
                  ✓
                </button>
                <button className="icon-btn" data-tip="Cancelar" type="button" onClick={() => setEditing(null)} aria-label="Cancelar">
                  ✕
                </button>
              </form>
            ) : (
              <div className="bucket-row">
                <label>
                  <input type="checkbox" checked={done.includes(i.id)} onChange={() => toggle(i.id)} />
                  <span>{i.texto}</span>
                </label>
                {confirmId === i.id ? (
                  <>
                    <button className="icon-btn danger" data-tip="Toque para confirmar" onClick={() => remove(i.id)}>
                      Excluir?
                    </button>
                    <button className="icon-btn" data-tip="Cancelar" onClick={() => setConfirmId(null)} aria-label="Cancelar">
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <button className="icon-btn" data-tip="Editar" onClick={() => setEditing({ id: i.id, texto: i.texto })} aria-label={`Editar: ${i.texto}`}>
                      ✏️
                    </button>
                    <button className="icon-btn" data-tip="Excluir" onClick={() => setConfirmId(i.id)} aria-label={`Excluir: ${i.texto}`}>
                      🗑️
                    </button>
                  </>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>

      <form className="add" onSubmit={add}>
        <div className="sug-wrap">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setShowSug(true)}
            onBlur={() => setShowSug(false)}
            placeholder="Sugira um novo sonho…"
            aria-label="Novo sonho"
            aria-expanded={showSug && sugestoes.length > 0}
            aria-controls="sug-list"
            autoComplete="off"
          />
          {showSug && sugestoes.length > 0 && (
            <ul id="sug-list" className="sug-list" role="listbox" aria-label="Sugestões de sonhos">
              <li className="sug-head" aria-hidden="true">
                ✨ Ideias para vocês
              </li>
              {sugestoes.map((s) => (
                <li key={s} role="option">
                  <button type="button" onPointerDown={(e) => e.preventDefault()} onClick={() => setText(s)}>
                    {s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <button className="btn" type="submit">
          Adicionar
        </button>
      </form>
      <button className="btn ghost gold" onClick={send}>
        Enviar pro meu amor 💬
      </button>
    </Section>
  );
}
