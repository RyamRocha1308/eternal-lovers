// Uso: npm run hash -- 010124   → imprime o SHA-256 para colar em content.json (site.senhaHash)
import { createHash } from 'node:crypto';

const senha = (process.argv[2] ?? '').trim().toLowerCase();
if (!senha) {
  console.error('Informe a senha: npm run hash -- <senha>');
  process.exit(1);
}
console.log(createHash('sha256').update(senha).digest('hex'));
