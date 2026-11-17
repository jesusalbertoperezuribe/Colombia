# Mini Portal de Colombia con API

## Descripción
Este proyecto es un mini portal web informativo sobre Colombia desarrollado en JavaScript Vanilla puro. Consume datos en tiempo real desde la API pública de Colombia ([api-colombia.com](https://api-colombia.com/)) y los muestra de forma dinámica en el DOM a través de dos páginas independientes conectadas mediante hipervínculos tradicionales.

El proyecto implementa las siguientes 2 opciones de la actividad:
1. **Explorador de Departamentos (`index.html`):** Consume el endpoint `/api/v1/Department` y muestra tarjetas con el nombre, región, población, superficie, descripción y fotografía de cada departamento.
   - **Extra:** Calcula y muestra en pantalla el conteo de departamentos agrupados por región natural.
2. **Sabores de Colombia (`platos.html`):** Consume el endpoint `/api/v1/TypicalDish` y muestra tarjetas con el nombre, descripción, departamento de origen y fotografía de cada plato típico.
   - **Extra:** Muestra en pantalla el contador total de platos registrados.

Ambas vistas incluyen filtros de búsqueda interactivos y un sistema para mantener la posición de desplazamiento (scroll) al navegar entre páginas.

## Tecnologías Usadas
- **HTML5:** Estructura semántica multipágina.
- **CSS3:** Maquetación responsiva con CSS Grid, Flexbox y degradado sutil con los colores de la bandera de Colombia.
- **JavaScript ES6+ Vanilla:** Consumo asíncrono con `fetch`, `async/await`, desestructuración de objetos, operadores estrictos y manipulación del DOM (sin librerías externas).
- **API Externa:** [API Colombia](https://api-colombia.com/).

## Instrucciones de Uso
1. Clonar o descargar este repositorio en su equipo local:
   ```bash
   git clone https://github.com/[tu-usuario]/[tu-nombre-apellido]-api-colombia.git
   ```
2. Abrir la carpeta del proyecto en **Visual Studio Code**.
3. Abrir el archivo `index.html`.
4. Hacer clic derecho sobre el editor y seleccionar **"Open with Live Server"** (o presionar `Alt + L, Alt + O`).
5. La aplicación se abrirá en su navegador web listo para interactuar con los datos y los filtros.

## Nombre del Estudiante
- **Autor:** `[Tu Nombre y Apellido]`
- **Programa:** Ingeniería de Software
- **Asignatura:** Programación Web & JavaScript
