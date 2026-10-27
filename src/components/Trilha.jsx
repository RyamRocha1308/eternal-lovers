import { Section } from './ui.jsx';

// Converte link normal do Spotify em link de embed
export const spotifyEmbed = (url) => url.replace('open.spotify.com/', 'open.spotify.com/embed/');

export default function Trilha({ content }) {
  const { playlist } = content.site;
  return (
    <Section id="trilha" kicker="Rádio de praia" title="Trilha Sonora" className="dark">
      <p className="muted">A playlist da nossa dupla. Dê o play quando quiser.</p>
      <iframe
        className="player"
        title="Playlist da nossa dupla"
        src={spotifyEmbed(playlist)}
        loading="lazy"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      />
    </Section>
  );
}
