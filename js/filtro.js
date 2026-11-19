/* Filtro de nombres: bloquea groserías y nombres de chiste con doble sentido.
   validarNombre(texto) → { ok: true, nombre } | { ok: false, msg } */
(function (global) {
  'use strict';

  // Normaliza: minúsculas, sin tildes, "leet" a letras, sin símbolos y sin letras repetidas.
  function normalizar(t) {
    return String(t).toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/ñ/g, 'n')
      .replace(/[0@4]/g, m => ({ 0: 'o', '@': 'a', 4: 'a' }[m]))
      .replace(/[1!|]/g, 'i').replace(/3/g, 'e').replace(/[5$]/g, 's').replace(/7/g, 't')
      .replace(/[^a-z\s]/g, ' ')
      .replace(/(.)\1+/g, '$1')        // "puuuto" → "puto"
      .replace(/\s+/g, ' ').trim();
  }

  // Palabras que se bloquean SOLO si aparecen como palabra completa (para no bloquear nombres reales).
  const PALABRAS = [
    'pene', 'pito', 'pija', 'pinga', 'polla', 'verga', 'vrg', 'pichula', 'pichi', 'chota', 'choto',
    'culo', 'culito', 'ano', 'ojete', 'teta', 'tetas', 'tetona', 'tetita', 'sapo', 'sapito', 'chucha', 'cono',
    'vagina', 'vulva', 'clitoris', 'nalga', 'nalgas', 'trasero', 'pezon', 'huevo', 'huevos', 'bolas', 'pelotas',
    'sexo', 'sexy', 'porno', 'xxx', 'puta', 'puto', 'putita', 'zorra', 'perra', 'prostituta', 'ramera',
    'caca', 'pedo', 'pis', 'mierda', 'cagar', 'cagon', 'meon', 'mear',
    'coger', 'cogida', 'follar', 'mamar', 'mamada', 'chupala', 'chupamela', 'violar', 'violador', 'orgia',
    'marica', 'maricon', 'joto', 'gay', 'travesti',
    'pendejo', 'pendeja', 'cojudo', 'cojuda', 'huevon', 'weon', 'webon', 'cabron', 'culero', 'carajo',
    'imbecil', 'idiota', 'estupido', 'estupida', 'tarado', 'retrasado', 'mongol', 'baboso',
    'malparido', 'hijueputa', 'hdp', 'ctm', 'ptm', 'csm', 'conchatumare', 'conchesumare', 'kbron',
    'nazi', 'hitler', 'satanas', 'diablo', 'fuck', 'shit', 'bitch', 'dick', 'cock', 'pussy', 'ass', 'sex', 'gay',
  ];

  // Trozos tan claros que se bloquean aunque estén pegados a otras letras.
  const TROZOS = [
    'mierda', 'pendej', 'hijueput', 'hijodeput', 'conchatu', 'conchesu', 'malparid', 'culero',
    'porno', 'follar', 'mamada', 'poronga', 'cabron', 'maricon', 'chupamela', 'chupala',
    'pichula', 'vagina', 'tetona', 'fuck', 'pussy', 'violador',
  ];

  // Nombres de chiste (se comparan juntando todo, sin espacios).
  const CHISTES = [
    'elvergalarg', 'elvergalar', 'rosamelano', 'rosamelan', 'almamersalgoso', 'almamersagoso', 'almamersalgos',
    'almamarcelagozo', 'almamarcelagoso', 'deboramelo', 'devoramelo', 'benitocamelo', 'pacogerte', 'pacojerte',
    'doloresdelano', 'elbagina', 'rosamelapinga', 'melapelas', 'chupamelo', 'tecojo', 'meculo', 'tuculo',
    'tomasturbado', 'tomasturba', 'masturba', 'pajero', 'pajera', 'cachondo', 'cachonda', 'calenton', 'caliente',
    'elpenecito', 'eltetas', 'lateta', 'elculo', 'elpito', 'elpene',
  ];

  function validarNombre(texto) {
    const crudo = String(texto || '').trim().replace(/\s+/g, ' ');
    if (crudo.length < 2) return { ok: false, msg: 'Escribe tu nombre (mínimo 2 letras).' };
    if (crudo.length > 40) return { ok: false, msg: 'El nombre es demasiado largo.' };
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]+$/.test(crudo)) return { ok: false, msg: 'Usa solo letras (sin números ni símbolos).' };
    if ((crudo.match(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g) || []).length < 2) return { ok: false, msg: 'Escribe tu nombre real.' };

    const norm = normalizar(crudo);
    const palabras = norm.split(' ');
    const junto = norm.replace(/ /g, '');
    const prohibido =
      palabras.some(p => PALABRAS.includes(p)) ||
      TROZOS.some(t => junto.includes(t)) ||
      CHISTES.some(c => junto.includes(c));

    if (prohibido) return { ok: false, msg: '🚫 Ese nombre no está permitido. Escribe tu nombre real, por favor.' };

    // Formato bonito: "jOSE maria" → "Jose Maria"
    const nombre = crudo.toLowerCase().replace(/(^|[\s'-])([a-záéíóúüñ])/g, (m, a, b) => a + b.toUpperCase());
    return { ok: true, nombre };
  }

  global.validarNombre = validarNombre;
  if (typeof module !== 'undefined') module.exports = { validarNombre };
})(typeof window !== 'undefined' ? window : globalThis);
