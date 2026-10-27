import { useState } from 'react';

export function Wave({ flip = false }) {
  return (
    <svg className={'wave' + (flip ? ' flip' : '')} viewBox="0 0 1200 80" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 40 Q150 0 300 40 T600 40 T900 40 T1200 40 V80 H0Z" />
    </svg>
  );
}

export function Net() {
  return <svg className="gold-wave" viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true"><path d="M0 20 Q75 0 150 20 T300 20 T450 20 T600 20 T750 20 T900 20 T1050 20 T1200 20 V40 H0Z" /></svg>;
}

export function Section({ id, kicker, title, children, className = '' }) {
  return (
    <>
      <section id={id} className={'section ' + className} aria-labelledby={id + '-t'}>
        <div className="wrap">
          {kicker && <p className="kicker">{kicker}</p>}
          <h2 id={id + '-t'}>{title}</h2>
          {children}
        </div>
      </section>
      <Net />
    </>
  );
}

// Foto com fallback bonito quando o arquivo ainda não existe
export function Photo({ src, alt, emoji = '🐚', className = '', ...rest }) {
  const [failed, setFailed] = useState(!src);
  if (failed)
    return (
      <div className={'photo-fallback ' + className} role="img" aria-label={alt} {...rest}>
        <span>{emoji}</span>
      </div>
    );
  return <img className={className} src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} {...rest} />;
}
