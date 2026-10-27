import { useEffect, useRef, useState } from 'react';
import { Section } from './ui.jsx';
import { useLocalStorage, beep, fx, toast } from '../lib.js';

const H = 340;

function Rally({ metas }) {
  const canvas = useRef(null);
  const [best, setBest] = useLocalStorage('rally-best', 0);
  const [score, setScore] = useState(0);
  const [state, setState] = useState('idle'); // idle | play | over
  const game = useRef(null);

  useEffect(() => {
    const c = canvas.current;
    const dpr = window.devicePixelRatio || 1;
    const W = c.parentElement.clientWidth;
    c.width = W * dpr;
    c.height = H * dpr;
    c.style.width = W + 'px';
    c.style.height = H + 'px';
    const ctx = c.getContext('2d');
    ctx.scale(dpr, dpr);

    const g = (game.current = { x: W / 2, y: 80, vx: 2, vy: 0, score: 0, run: false, W });
    let raf;

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, '#8fe0ec');
      sky.addColorStop(1, '#E8F6F8');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#F4E3C1';
      ctx.fillRect(0, H - 40, W, 40);
      // rede
      ctx.strokeStyle = '#0B3C5D';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(W / 2, H - 40);
      ctx.lineTo(W / 2, H - 150);
      ctx.stroke();
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(W / 2, H - 150);
      ctx.lineTo(W / 2, H - 110);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.font = '34px serif';
      ctx.textAlign = 'center';
      ctx.fillText('🧑', W * 0.14, H - 42);
      ctx.fillText('🧑', W * 0.86, H - 42);
      ctx.font = '30px serif';
      ctx.fillText('🏐', g.x, g.y);
      ctx.fillStyle = '#0B3C5D';
      ctx.font = '48px "Bebas Neue", sans-serif';
      ctx.fillText(g.score, W / 2, 56);
    };

    const step = () => {
      if (g.run) {
        g.vy += 0.28 + Math.min(g.score * 0.006, 0.25);
        g.x += g.vx;
        g.y += g.vy;
        if (g.x < 16 || g.x > W - 16) {
          g.vx *= -1;
          g.x = Math.max(16, Math.min(W - 16, g.x));
        }
        if (g.y > H - 50) {
          g.run = false;
          beep('fail');
          setState('over');
          setBest((b) => Math.max(b, g.score));
        }
      }
      draw();
      raf = requestAnimationFrame(step);
    };
    step();
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hit = (e) => {
    e.preventDefault();
    const g = game.current;
    if (!g.run) {
      Object.assign(g, { x: g.W / 2, y: 80, vx: 2.4, vy: 0, score: 0, run: true });
      setScore(0);
      setState('play');
      return;
    }
    if (g.y < H * 0.35) return; // cedo demais
    g.vy = -(9 + Math.min(g.score * 0.06, 3));
    g.vx = (g.x < g.W / 2 ? 1 : -1) * (2.2 + Math.random() * 1.6);
    g.score++;
    setScore(g.score);
    beep('hit');
    if (metas.some((m) => m.pontos === g.score)) {
      beep('win');
      fx('confetti');
      toast(`🏆 Meta de ${g.score} pontos! Veja sua recompensa abaixo`);
    }
  };

  return (
    <div className="game">
      <h3>Joga comigo? 🏐</h3>
      <p className="muted">Eu estou aqui do seu lado, na areia. Toque para manter a bola no ar (só vale quando ela já desceu um pouco). Recorde: {best}</p>
      <div className="canvas-wrap">
        <canvas ref={canvas} onPointerDown={hit} aria-label="Jogo da bola no ar" />
        {state !== 'play' && (
          <button className="btn overlay-btn" onClick={hit}>
            {state === 'over' ? `Fim! ${score} pts — jogar de novo` : 'Tocar para começar'}
          </button>
        )}
      </div>
      <ul className="goals">
        {metas.map((m) => (
          <li key={m.pontos} className={best >= m.pontos ? 'done' : ''}>
            <strong>{m.pontos} pts</strong> — {best >= m.pontos ? `${m.titulo}: ${m.texto}` : `🔒 ${m.titulo}`}
          </li>
        ))}
      </ul>
    </div>
  );
}

function Quiz({ perguntas }) {
  const [i, setI] = useState(0);
  const [pick, setPick] = useState(null);
  const [pts, setPts] = useState(0);
  const [bestQuiz, setBestQuiz] = useLocalStorage('quiz-best', 0);
  const done = i >= perguntas.length;

  const answer = (k) => {
    if (pick !== null) return;
    setPick(k);
    const ok = k === perguntas[i].correta;
    if (ok) {
      setPts((p) => p + 1);
      beep('ace');
    } else beep('fail');
  };
  const next = () => {
    setPick(null);
    setI((n) => n + 1);
  };
  useEffect(() => {
    if (done) {
      setBestQuiz((b) => Math.max(b, pts));
      if (pts >= perguntas.length * 0.6) fx('confetti');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  if (done) {
    const r = pts / perguntas.length;
    const medalha = r === 1 ? '🥇' : r >= 0.6 ? '🥈' : '🥉';
    return (
      <div className="game">
        <h3>Quanto você me conhece?</h3>
        <p className="medal">{medalha}</p>
        <p>
          {pts}/{perguntas.length} — {r === 1 ? 'Perfeito! Você me conhece melhor que eu mesmo.' : r >= 0.6 ? 'Muito bem! Quase uma expert em mim.' : 'Errou, mas eu te amo igual.'}
        </p>
        <button
          className="btn"
          onClick={() => {
            setI(0);
            setPts(0);
            setPick(null);
          }}
        >
          Jogar de novo
        </button>
      </div>
    );
  }
  const q = perguntas[i];
  return (
    <div className="game">
      <h3>Quanto você me conhece?</h3>
      <p className="muted">
        Pergunta {i + 1}/{perguntas.length} · melhor: {bestQuiz}
      </p>
      <p className="q">{q.pergunta}</p>
      <div className="opts">
        {q.opcoes.map((o, k) => (
          <button
            key={k}
            className={'opt' + (pick !== null ? (k === q.correta ? ' right' : k === pick ? ' wrong' : '') : '')}
            onClick={() => answer(k)}
          >
            {o}
          </button>
        ))}
      </div>
      {pick !== null && (
        <>
          <p className="feedback">{pick === q.correta ? 'Acertou! 💛' : 'Errou, mas eu te amo igual 💛'}</p>
          <button className="btn" onClick={next}>
            Próxima
          </button>
        </>
      )}
    </div>
  );
}

function Memoria({ emojis }) {
  const make = () =>
    [...emojis, ...emojis]
      .map((e, k) => ({ id: k, e, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort);
  const [cards, setCards] = useState(make);
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [t0, setT0] = useState(null);
  const [best, setBest] = useLocalStorage('mem-best', null);
  const [elapsed, setElapsed] = useState(0);
  const won = matched.length === cards.length;

  useEffect(() => {
    if (!t0 || won) return;
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - t0) / 1000)), 500);
    return () => clearInterval(t);
  }, [t0, won]);

  useEffect(() => {
    if (won) {
      const secs = Math.floor((Date.now() - t0) / 1000);
      setElapsed(secs);
      setBest((b) => (b === null || secs < b ? secs : b));
      fx('confetti');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [won]);

  const flip = (c) => {
    if (flipped.length === 2 || flipped.includes(c.id) || matched.includes(c.id)) return;
    if (!t0) setT0(Date.now());
    const f = [...flipped, c.id];
    setFlipped(f);
    beep('hit');
    if (f.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = f.map((id) => cards.find((x) => x.id === id));
      if (a.e === b.e) {
        setMatched((m) => [...m, a.id, b.id]);
        setFlipped([]);
      } else setTimeout(() => setFlipped([]), 800);
    }
  };
  const reset = () => {
    setCards(make());
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setT0(null);
    setElapsed(0);
  };

  return (
    <div className="game">
      <h3>Jogo da Memória</h3>
      <p className="muted">
        {moves} tentativas · {elapsed}s{best !== null && ` · melhor: ${best}s`}
      </p>
      <div className="memory">
        {cards.map((c) => {
          const up = flipped.includes(c.id) || matched.includes(c.id);
          return (
            <button key={c.id} className={'mem-card' + (up ? ' up' : '')} onClick={() => flip(c)} aria-label={up ? c.e : 'carta virada'}>
              <span>{up ? c.e : '🌊'}</span>
            </button>
          );
        })}
      </div>
      {won && <p className="feedback">Você ganhou em {elapsed}s! 🏆</p>}
      <button className="btn ghost" onClick={reset}>
        Embaralhar
      </button>
    </div>
  );
}

export default function Quadra({ content }) {
  const [tab, setTab] = useState('rally');
  const [vw, setVw] = useState(window.innerWidth);
  useEffect(() => {
    const on = () => setVw((w) => (Math.abs(w - window.innerWidth) > 40 ? window.innerWidth : w));
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  const tabs = [['rally', '🏐 Joga comigo'], ['quiz', '💙 Quiz'], ['memoria', '🃏 Memória']];
  return (
    <Section id="quadra" kicker="Brincadeiras" title="Cantinho dos Jogos">
      <div className="chips">
        {tabs.map(([k, l]) => (
          <button key={k} className={'chip' + (tab === k ? ' on' : '')} onClick={() => setTab(k)}>
            {l}
          </button>
        ))}
      </div>
      {tab === 'rally' && <Rally key={vw} metas={content.rally.metas} />}
      {tab === 'quiz' && <Quiz perguntas={content.quiz} />}
      {tab === 'memoria' && <Memoria emojis={content.memoria} />}
    </Section>
  );
}
