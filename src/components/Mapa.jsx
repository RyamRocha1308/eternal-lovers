import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Section } from './ui.jsx';

export default function Mapa({ content }) {
  const el = useRef(null);
  const map = useRef(null);
  const layer = useRef(null);
  const [filtro, setFiltro] = useState('todos');

  useEffect(() => {
    map.current = L.map(el.current, { scrollWheelZoom: false }).setView([-10, -45], 4);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
      maxZoom: 18
    }).addTo(map.current);
    layer.current = L.layerGroup().addTo(map.current);
    return () => map.current.remove();
  }, []);

  useEffect(() => {
    layer.current.clearLayers();
    const pts = content.mapa.filter((p) => filtro === 'todos' || p.status === filtro);
    pts.forEach((p) => {
      const icon = L.divIcon({
        className: 'pin-wrap',
        html: `<span class="pin ${p.status}">${p.status === 'visitado' ? '🌊' : '✨'}</span>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18]
      });
      const box = document.createElement('div');
      box.innerHTML = '<strong></strong><br><span></span>';
      box.querySelector('strong').textContent = p.nome;
      box.querySelector('span').textContent = p.memoria;
      L.marker([p.lat, p.lng], { icon }).bindPopup(box).addTo(layer.current);
    });
    if (pts.length) map.current.fitBounds(L.latLngBounds(pts.map((p) => [p.lat, p.lng])).pad(0.4), { maxZoom: 7 });
  }, [filtro, content.mapa]);

  return (
    <Section id="mapa" kicker="Mapa" title="Nossas Praias">
      <div className="chips">
        {[['todos', 'todos'], ['visitado', 'já fomos'], ['sonho', 'vamos ir']].filter(([v]) => v !== 'visitado' || content.mapa.some((p) => p.status === 'visitado')).map(([v, l]) => (
          <button key={v} className={'chip' + (filtro === v ? ' on' : '')} onClick={() => setFiltro(v)}>
            {l}
          </button>
        ))}
      </div>
      <div ref={el} className="map" role="region" aria-label="Mapa das nossas praias" />
    </Section>
  );
}
