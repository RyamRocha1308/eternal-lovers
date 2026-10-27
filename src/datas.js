// Feriados, datas comemorativas e datas nossas, por ano.
// tipo: 'feriado' | 'comemorativo' | 'nosso'
const pad = (n) => String(n).padStart(2, '0');
export const dateKey = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// Domingo de Páscoa (algoritmo de Meeus/Jones/Butcher)
function pascoa(y) {
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(y, month - 1, day);
}

const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

// n-ésimo domingo do mês (month: 1-12)
function nthSunday(y, month, n) {
  const first = new Date(y, month - 1, 1);
  return new Date(y, month - 1, 1 + ((7 - first.getDay()) % 7) + (n - 1) * 7);
}

export function eventosDoAno(year, inicio, extras = []) {
  const map = {};
  const add = (d, tipo, nome) => {
    const k = typeof d === 'string' ? d : dateKey(d);
    (map[k] ??= []).push({ tipo, nome });
  };
  const fixo = (mm, dd, tipo, nome) => add(`${year}-${pad(mm)}-${pad(dd)}`, tipo, nome);
  const p = pascoa(year);

  // feriados
  fixo(1, 1, 'feriado', 'Confraternização Universal');
  add(addDays(p, -48), 'feriado', 'Carnaval (segunda)');
  add(addDays(p, -47), 'feriado', 'Carnaval (terça)');
  add(addDays(p, -2), 'feriado', 'Sexta-feira Santa');
  fixo(3, 19, 'feriado', 'Dia de São José (CE)');
  fixo(3, 25, 'feriado', 'Data Magna do Ceará');
  fixo(4, 21, 'feriado', 'Tiradentes');
  fixo(5, 1, 'feriado', 'Dia do Trabalho');
  add(addDays(p, 60), 'feriado', 'Corpus Christi');
  fixo(8, 15, 'feriado', 'Nossa Senhora da Assunção (Fortaleza)');
  fixo(9, 7, 'feriado', 'Independência do Brasil');
  fixo(10, 12, 'feriado', 'Nossa Senhora Aparecida');
  fixo(11, 2, 'feriado', 'Finados');
  fixo(11, 15, 'feriado', 'Proclamação da República');
  fixo(11, 20, 'feriado', 'Consciência Negra');
  fixo(12, 25, 'feriado', 'Natal');

  // datas comemorativas
  fixo(1, 21, 'comemorativo', 'Dia Mundial do Abraço');
  fixo(3, 8, 'comemorativo', 'Dia Internacional da Mulher');
  add(p, 'comemorativo', 'Páscoa');
  fixo(4, 13, 'comemorativo', 'Dia do Beijo');
  add(nthSunday(year, 5, 2), 'comemorativo', 'Dia das Mães');
  fixo(6, 8, 'comemorativo', 'Dia Mundial dos Oceanos');
  fixo(6, 12, 'comemorativo', 'Dia dos Namorados');
  fixo(7, 20, 'comemorativo', 'Dia do Amigo');
  add(nthSunday(year, 8, 2), 'comemorativo', 'Dia dos Pais');
  fixo(12, 24, 'comemorativo', 'Véspera de Natal');
  fixo(12, 31, 'comemorativo', 'Réveillon');

  // datas nossas: começo, mêsversários e marcos de dias
  if (inicio) {
    const s = new Date(inicio.getFullYear(), inicio.getMonth(), inicio.getDate());
    if (s.getFullYear() === year) add(s, 'nosso', 'Nosso começo 💛');
    for (let m = 1; m <= 600; m++) {
      const d = new Date(s.getFullYear(), s.getMonth() + m, s.getDate());
      if (d.getDate() !== s.getDate()) continue; // mês sem esse dia
      if (d.getFullYear() > year) break;
      if (d.getFullYear() === year) add(d, 'nosso', m % 12 === 0 ? `${m / 12} ano${m > 12 ? 's' : ''} de nós 💛` : `${m} ${m === 1 ? 'mês' : 'meses'} juntos`);
    }
    [100, 200, 300, 500, 700, 1000, 1500, 2000, 3000].forEach((n) => {
      const d = addDays(s, n);
      if (d.getFullYear() === year) add(d, 'nosso', `${n} dias juntos ✨`);
    });
  }

  // datas extras do content.json: "YYYY-MM-DD" (uma vez) ou "MM-DD" (todo ano)
  extras.forEach((x) => {
    if (/^\d{2}-\d{2}$/.test(x.data)) add(`${year}-${x.data}`, 'nosso', x.nome);
    else if (x.data.startsWith(String(year))) add(x.data, 'nosso', x.nome);
  });

  return map;
}
