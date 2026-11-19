# Test Vocacional · Ingeniería en Sistemas (FICCT – UAGRM)

Test vocacional para **bachilleres** (HTML + CSS + JavaScript, sin dependencias). Son **20 preguntas** (unos 5 minutos):

- **14 preguntas de gustos** con escala de caritas (¿te gustaría programar?, ¿tener tu propio negocio?, ¿ser hacker ético?…).
- **6 mini retos fáciles** de números, lógica, figuras y palabras.

Al final muestra el **% de compatibilidad** con Ingeniería en Sistemas y la **rama ideal**: Desarrollo de software, Datos e IA, Redes y ciberseguridad, o Gestión y emprendimiento.

## Estructura
```
index.html        página principal
css/styles.css    estilos y animaciones
js/questions.js   banco de preguntas y ramas (edítalo para cambiar preguntas)
js/app.js         lógica del test y resultados
img/              ilustraciones PNG (unDraw, licencia libre) y logo
vercel.json       configuración de Vercel
```

## Probar en tu PC
Abre `index.html` con doble clic, o usa la extensión *Live Server* de VS Code.

## Subir a GitHub
1. Crea un repositorio nuevo en GitHub (por ejemplo `test-psicotecnico`).
2. Descomprime el ZIP y, dentro de la carpeta, ejecuta:
   ```bash
   git init
   git add .
   git commit -m "Test psicotécnico"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/test-psicotecnico.git
   git push -u origin main
   ```
   (O arrastra los archivos en GitHub → *Add file* → *Upload files*.)

## Desplegar en Vercel
1. Entra a https://vercel.com e inicia sesión con GitHub.
2. *Add New… → Project* → elige el repositorio → **Import**.
3. Framework Preset: **Other**. No necesita comando de build ni carpeta de salida.
4. **Deploy**. En segundos tendrás tu enlace `https://test-psicotecnico.vercel.app`.

Cada `git push` vuelve a desplegar la página automáticamente.

## Personalizar
- Preguntas: `js/questions.js` (`INTERESTS` para gustos y `RETOS` para los retos; `a` es el índice de la respuesta correcta, empezando en 0).
- Colores: variables al inicio de `css/styles.css`.

> Test orientativo con fines educativos. No reemplaza una evaluación profesional ni la PSA oficial.
