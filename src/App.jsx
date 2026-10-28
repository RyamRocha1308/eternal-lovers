import { useEffect, useState } from 'react';
import content from './content/content.json';
import { useLocalStorage, fx } from './lib.js';
import Portal from './components/Portal.jsx';
import Home from './components/Home.jsx';
import Timeline from './components/Timeline.jsx';
import Placar from './components/Placar.jsx';
import Galeria from './components/Galeria.jsx';
import Cartas from './components/Cartas.jsx';
import Trilha from './components/Trilha.jsx';
import Cupons from './components/Cupons.jsx';
import BucketList from './components/BucketList.jsx';
import MatchPoint from './components/MatchPoint.jsx';
import Effects from './components/Effects.jsx';
import Dock from './components/Dock.jsx';

function tideAuto() {
  const h = new Date().getHours();
  if (h >= 6 && h < 16) return 'dia';
  if (h >= 16 && h < 19) return 'por-do-sol';
  return 'noite';
}

export default function App() {
  const [unlocked, setUnlocked] = useLocalStorage('unlocked', false);
  const [tideMode, setTideMode] = useLocalStorage('tide', 'auto');
  const [serving, setServing] = useState(false);
  const tide = tideMode === 'auto' ? tideAuto() : tideMode;

  useEffect(() => {
    document.documentElement.dataset.tide = tide;
  }, [tide]);

  // easter eggs de teclado: AMO, MAR, Konami
  useEffect(() => {
    let buf = '';
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let kpos = 0;
    const onKey = (e) => {
      buf = (buf + e.key.toUpperCase()).slice(-3);
      if (buf === 'AMO') fx('rain', '💛');
      if (buf === 'MAR') fx('wave');
      kpos = e.key === konami[kpos] ? kpos + 1 : e.key === konami[0] ? 1 : 0;
      if (kpos === konami.length) {
        kpos = 0;
        fx('rain', '🌅');
        fx('toast', '🌅 Pôr do sol dourado ativado!');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const enter = () => {
    setServing(true);
    setTimeout(() => {
      setUnlocked(true);
      setServing(false);
    }, 1400);
  };

  return (
    <>
      <Effects />
      {!unlocked ? (
        <Portal site={content.site} onUnlock={enter} serving={serving} />
      ) : (
        <>
          <main>
            <Home content={content} />
            <Timeline content={content} />
            <Placar content={content} />
            <Galeria content={content} />
            <Cartas content={content} />
            <Trilha content={content} />
            <Cupons content={content} />
            <BucketList content={content} />
            <MatchPoint content={content} />
          </main>
          <Dock tideMode={tideMode} setTideMode={setTideMode} site={content.site} musicas={content.musicas ?? []} />
        </>
      )}
    </>
  );
}
