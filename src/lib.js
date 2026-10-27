import { useEffect, useRef, useState, useCallback } from 'react';

// ---------- localStorage sincronizado entre componentes ----------
const PREFIX = 'el:';

export function useLocalStorage(key, initial) {
  const read = () => {
    try {
      const raw = localStorage.getItem(PREFIX + key);
      return raw === null ? initial : JSON.parse(raw);
    } catch {
      return initial;
    }
  };
  const [value, setValue] = useState(read);

  useEffect(() => {
    const onSync = (e) => {
      if (e.detail === key) setValue(read());
    };
    window.addEventListener('el-ls', onSync);
    return () => window.removeEventListener('el-ls', onSync);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const set = useCallback(
    (next) => {
      setValue((prev) => {
        const v = typeof next === 'function' ? next(prev) : next;
        try {
          localStorage.setItem(PREFIX + key, JSON.stringify(v));
        } catch {
          /* modo privado / cheio: segue sem persistir */
        }
        queueMicrotask(() => window.dispatchEvent(new CustomEvent('el-ls', { detail: key })));
        return v;
      });
    },
    [key]
  );
  return [value, set];
}

// ---------- efeitos globais (confete, toast, saque, ondas) ----------
export const fx = (type, payload) => window.dispatchEvent(new CustomEvent('el-fx', { detail: { type, payload } }));
export const toast = (msg) => fx('toast', msg);

// ---------- tempo juntos ----------
const addMonths = (d, n) => {
  const r = new Date(d);
  r.setMonth(r.getMonth() + n);
  return r;
};

export function diffParts(start, now) {
  let months = (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  if (addMonths(start, months) > now) months--;
  const anchor = addMonths(start, months);
  let rest = Math.max(0, now - anchor);
  const dias = Math.floor(rest / 864e5);
  rest -= dias * 864e5;
  const horas = Math.floor(rest / 36e5);
  rest -= horas * 36e5;
  const minutos = Math.floor(rest / 6e4);
  const segundos = Math.floor((rest - minutos * 6e4) / 1000);
  return { anos: Math.floor(months / 12), meses: months % 12, dias, horas, minutos, segundos };
}

export function useNow(interval = 1000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), interval);
    return () => clearInterval(t);
  }, [interval]);
  return now;
}

export function nextMilestones(start, now) {
  const totalDias = Math.floor((now - start) / 864e5);
  const alvos = [100, 200, 300, 365, 500, 700, 1000, 1500, 2000, 2500, 3000, 3650];
  const alvo = alvos.find((n) => n > totalDias) ?? Math.ceil((totalDias + 1) / 1000) * 1000;
  const out = [{ label: `${alvo} dias juntos`, date: new Date(start.getTime() + alvo * 864e5) }];

  let m = 1;
  while (addMonths(start, m) <= now) m++;
  const mesversario = addMonths(start, m);
  out.push({ label: m % 12 === 0 ? `${m / 12} ano${m / 12 > 1 ? 's' : ''} de nós` : `${m} meses juntos`, date: mesversario });
  return out.sort((a, b) => a.date - b.date);
}

export function countdown(target, now) {
  const ms = target - now;
  if (ms <= 0) return null;
  return {
    d: Math.floor(ms / 864e5),
    h: Math.floor((ms % 864e5) / 36e5),
    m: Math.floor((ms % 36e5) / 6e4),
    s: Math.floor((ms % 6e4) / 1000)
  };
}

// ---------- senha (SHA-256) ----------
export async function sha256(text) {
  const data = new TextEncoder().encode(text.trim().toLowerCase());
  const buf = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// ---------- visibilidade ----------
export function useInView(options = { threshold: 0.3 }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setSeen(true);
        io.disconnect();
      }
    }, options);
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seen]);
  return [ref, seen];
}

export const waLink = (numero, texto) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;

export const fmtData = (iso) =>
  new Date(iso.length === 10 ? iso + 'T12:00:00' : iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

// ---------- áudio sintetizado (sem arquivos) ----------
let ctx = null;
let ambient = null;
const getCtx = () => (ctx ??= new (window.AudioContext || window.webkitAudioContext)());

export function startAmbient() {
  const c = getCtx();
  c.resume?.();
  if (ambient) return;

  // ruído marrom normalizado (base do "mar")
  const len = c.sampleRate * 6;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let last = 0;
  let peak = 0;
  for (let i = 0; i < len; i++) {
    last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
    d[i] = last;
    peak = Math.max(peak, Math.abs(last));
  }
  for (let i = 0; i < len; i++) d[i] /= peak;

  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;

  // a onda: volume e brilho sobem e descem juntos, devagar
  const filter = c.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 800;
  const gain = c.createGain();
  gain.gain.value = 0.4;
  const lfo = c.createOscillator();
  lfo.frequency.value = 0.11;
  const toGain = c.createGain();
  toGain.gain.value = 0.32;
  const toFreq = c.createGain();
  toFreq.gain.value = 500;
  lfo.connect(toGain).connect(gain.gain);
  lfo.connect(toFreq).connect(filter.frequency);

  src.connect(filter).connect(gain).connect(c.destination);
  src.start();
  lfo.start();
  ambient = { src, lfo, gain };
}

export function stopAmbient() {
  if (!ambient) return;
  ambient.src.stop();
  ambient.lfo.stop();
  ambient = null;
}

export function setAmbientVolume(v) {
  if (ambient) ambient.gain.gain.value = v;
}

export function beep(kind = 'hit') {
  try {
    const c = getCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    const freq = { hit: 520, ace: 880, win: 1040, fail: 180, whistle: 2200 }[kind] ?? 520;
    o.type = kind === 'fail' ? 'sawtooth' : kind === 'whistle' ? 'triangle' : 'sine';
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.12, c.currentTime + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + (kind === 'whistle' ? 0.35 : 0.15));
    o.connect(g).connect(c.destination);
    o.start();
    o.stop(c.currentTime + 0.4);
  } catch {
    /* sem áudio: tudo bem */
  }
}

export const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
