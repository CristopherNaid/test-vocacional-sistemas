/* Test vocacional para bachilleres · Ingeniería en Sistemas FICCT – UAGRM
   Parte 1: 14 preguntas de gustos (escala de 1 a 5), cada una suma a una rama.
   Parte 2: 6 mini retos fáciles con una sola respuesta correcta (índice "a"). */

const svgWrap = (inner, size = 60) =>
  `<svg viewBox="0 0 64 64" width="${size}" height="${size}" aria-hidden="true">${inner}</svg>`;

const arrow = (deg) => svgWrap(
  `<g transform="rotate(${deg} 32 32)"><line x1="32" y1="50" x2="32" y2="16" stroke="currentColor" stroke-width="6" stroke-linecap="round"/>
   <polyline points="18,28 32,14 46,28" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></g>`);

const polygon = (n) => {
  const pts = Array.from({ length: n }, (_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return `${(32 + 24 * Math.cos(a)).toFixed(1)},${(33 + 24 * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return svgWrap(`<polygon points="${pts}" fill="none" stroke="currentColor" stroke-width="5" stroke-linejoin="round"/>`);
};

const INTERESTS = [
  { r: 'dev', img: 'img/desarrollo-software.png?v=2', q: '¿Te gustaría aprender a programar y crear tus propias aplicaciones?' },
  { r: 'datos', img: 'img/inteligencia-artificial.png?v=2', q: '¿Te llama la atención la inteligencia artificial, como ChatGPT o los robots?' },
  { r: 'gestion', img: 'img/emprendimiento.png?v=2', q: '¿Te gustaría tener tu propio negocio o emprendimiento digital?' },
  { r: 'infra', img: 'img/ciberseguridad.png?v=2', q: '¿Te gustaría ser un “hacker ético” y proteger sistemas de ataques?' },
  { r: 'dev', img: 'img/ingeniero-sistemas.png?v=2', q: '¿Te imaginas creando un videojuego o una página web?' },
  { r: 'gestion', img: 'img/gestion-proyectos.png?v=2', q: '¿Te gustaría ganar buen dinero trabajando en tecnología, incluso desde tu casa?' },
  { r: 'datos', img: 'img/datos-bi.png?v=2', q: '¿Te gustan las matemáticas y trabajar con números?' },
  { r: 'infra', img: 'img/redes-nube.png?v=2', q: '¿Te da curiosidad saber cómo funcionan el internet y el WiFi?' },
  { r: 'dev', img: 'img/analisis-sistemas.png?v=2', q: '¿Disfrutas resolver acertijos o problemas de lógica?' },
  { r: 'infra', img: 'img/antes-de-entrar.png?v=2', q: '¿Te gusta armar, configurar o arreglar computadoras y celulares?' },
  { r: 'datos', img: 'img/datos-bi.png?v=2', q: '¿Te gustaría analizar datos para descubrir cosas, como qué productos se venden más?' },
  { r: 'gestion', img: 'img/gestion-proyectos.png?v=2', q: '¿Te gusta organizar y liderar a tu grupo en los trabajos del colegio?' },
  { r: 'dev', img: 'img/ingreso.png?v=2', q: '¿Usas tu computadora o celular para aprender cosas nuevas por tu cuenta?' },
  { r: 'gestion', img: 'img/graduacion.png?v=2', q: '¿Te gustaría trabajar algún día para empresas de otros países?' },
];

const RETOS = [
  { cat: 'Números', icon: '🔢', q: '¿Qué número sigue?', serie: ['2', '4', '6', '8', '?'],
    o: ['9', '10', '12', '16'], a: 1, why: 'Va sumando de 2 en 2: 8 + 2 = 10.' },
  { cat: 'Números', icon: '🔢', q: '¿Qué número sigue?', serie: ['1', '2', '4', '8', '?'],
    o: ['10', '12', '16', '14'], a: 2, why: 'Cada número es el doble del anterior: 8 × 2 = 16.' },
  { cat: 'Lógica', icon: '🧩', q: 'Todos los gatos son animales. Michi es un gato. Entonces…',
    o: ['Michi es un perro', 'Michi es un animal', 'Todos los animales son gatos', 'No se puede saber'], a: 1,
    why: 'Si todos los gatos son animales y Michi es un gato, Michi es un animal.' },
  { cat: 'Figuras', icon: '🔷', q: '¿Qué flecha continúa la secuencia?', fig: [arrow(0), arrow(90), arrow(180), '?'],
    of: [arrow(0), arrow(45), arrow(270), arrow(90)], a: 2, why: 'La flecha gira un cuarto de vuelta cada vez: arriba, derecha, abajo… izquierda.' },
  { cat: 'Figuras', icon: '🔷', q: '¿Qué figura sigue?', fig: [polygon(3), polygon(4), polygon(5), '?'],
    of: [polygon(4), polygon(6), polygon(8), polygon(3)], a: 1, why: 'Cada figura tiene un lado más: 3, 4, 5… 6 lados.' },
  { cat: 'Palabras', icon: '💬', q: 'Pincel es a pintar como teclado es a…',
    o: ['Pantalla', 'Escribir', 'Computadora', 'Mouse'], a: 1, why: 'Con el pincel se pinta y con el teclado se escribe.' },
];

const RAMAS = {
  dev: { name: 'Desarrollo de software', img: 'img/desarrollo-software.png?v=2', color: '#5DB82E', emoji: '💻',
    desc: 'Te gusta crear cosas que la gente usa. Aprenderás a programar aplicaciones web, móviles y videojuegos.',
    materias: ['Introducción a la Programación', 'Programación Web', 'Programación Móvil', 'Ingeniería de Software'],
    puestos: ['Desarrollador de apps', 'Desarrollador web', 'Programador de videojuegos', 'Full-stack'] },
  datos: { name: 'Datos e inteligencia artificial', img: 'img/inteligencia-artificial.png?v=2', color: '#2F80ED', emoji: '🤖',
    desc: 'Te atraen los números y la IA. Aprenderás a usar datos para tomar decisiones y a entrenar modelos inteligentes.',
    materias: ['Base de Datos', 'Probabilidad y Estadística', 'Inteligencia Artificial', 'Machine Learning'],
    puestos: ['Analista de datos', 'Científico de datos', 'Ingeniero de IA', 'Especialista en BI'] },
  infra: { name: 'Redes y ciberseguridad', img: 'img/ciberseguridad.png?v=2', color: '#F2994A', emoji: '🔐',
    desc: 'Te interesa cómo funciona todo por dentro. Aprenderás de redes, servidores, la nube y cómo proteger sistemas.',
    materias: ['Redes', 'Sistemas Operativos', 'Computación en la Nube', 'Seguridad de la Información'],
    puestos: ['Administrador de redes', 'Hacker ético', 'Ingeniero cloud', 'Auditor de sistemas'] },
  gestion: { name: 'Gestión y emprendimiento', img: 'img/emprendimiento.png?v=2', color: '#9B51E0', emoji: '🚀',
    desc: 'Tienes perfil de líder. Combinarás la tecnología con negocios, proyectos y emprendimiento.',
    materias: ['Fundamentos Económicos', 'Marketing Digital', 'Evaluación de Proyectos', 'Plan de Negocios'],
    puestos: ['Jefe de proyectos TI', 'Fundador de startup', 'Consultor tecnológico', 'Freelancer'] },
};
