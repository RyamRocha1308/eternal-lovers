import { useState } from 'react';
import { sha256, useLocalStorage, beep } from '../lib.js';
import { Wave } from './ui.jsx';

export default function Portal({ site, onUnlock, serving }) {
  const [value, setValue] = useState('');
  const [tries, setTries] = useLocalStorage('tries', 0);
  const [msg, setMsg] = useState('');
  const [started, setStarted] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (await sha256(value.replace(/\D/g, '') || value).then((h) => h === site.senhaHash)) {
      beep('whistle');
      onUnlock();
      return;
    }
    // aceita também a senha digitada como texto (ex.: nome de lugar)
    if ((await sha256(value)) === site.senhaHash) {
      beep('whistle');
      onUnlock();
      return;
    }
    beep('fail');
    const n = tries + 1;
    setTries(n);
    const dica = site.dicas[Math.min(n - 1, site.dicas.length - 1)];
    setMsg(n >= 3 ? `Ainda não! ${dica}` : `Quase! ${dica}`);
    setValue('');
  };

  return (
    <div className={'portal' + (serving ? ' serving' : '')}>
      <div className="portal-sun" aria-hidden="true" />
      <h1 className="brand">Eternal Lovers</h1>
      <p className="tagline">Você, o mar e eu.</p>

      {!started ? (
        <button className="ball-btn" onClick={() => setStarted(true)} aria-label="Toque para entrar">
          <span className="ball">🐚</span>
          <span>Toque para entrar</span>
        </button>
      ) : (
        <form className="portal-form" onSubmit={submit}>
          <label htmlFor="senha">{site.perguntaSenha}</label>
          <input
            id="senha"
            autoFocus
            inputMode="text"
            autoComplete="off"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="••••••"
          />
          <button className="btn" type="submit" disabled={!value}>
            Entrar
          </button>
          {msg && <p className="portal-msg">{msg}</p>}
        </form>
      )}
      {serving && <span className="serve-ball" aria-hidden="true">🐚</span>}
      <div className="portal-waves" aria-hidden="true">
        <Wave />
        <Wave flip />
      </div>
    </div>
  );
}
