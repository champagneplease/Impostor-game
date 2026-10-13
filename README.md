# El Impostor — Juego Web de Deducción Social y Palabras Secretas

Aplicación web completa, moderna y responsiva para jugar al **Impostor** con amigos. Incluye dos modalidades independientes de juego: **Dispositivo compartido (Pass & Play, 100% offline)** y **Multijugador online en tiempo real** sincronizado con WebSockets (Socket.IO).

Diseñado con una estética oscura minimalista, acentos verde lima de alto contraste, animaciones fluidas, biblioteca de más de 720 palabras en 24 categorías, pistas opcionales, votaciones secretas, última oportunidad de adivinanza y panel de administración local con exportación/importación JSON.

---

## 📋 Tabla de Contenidos

1. [Características Principales](#-características-principales)
2. [Stack Tecnológico](#-stack-tecnológico)
3. [Estructura del Proyecto (Monorepo)](#-estructura-del-proyecto-monorepo)
4. [Requisitos Previos](#-requisitos-previos)
5. [Instalación y Configuración](#-instalación-y-configuración)
6. [Ejecución en Desarrollo Local](#-ejecución-en-desarrollo-local)
7. [Scripts Disponibles](#-scripts-disponibles)
8. [Variables de Entorno](#-variables-de-entorno)
9. [Reglas y Mecánicas del Juego](#-reglas-y-mecánicas-del-juego)
   - [Modo 1: Dispositivo Compartido](#modo-1-dispositivo-compartido)
   - [Modo 2: Multijugador Online](#modo-2-multijugador-online)
   - [Pistas del Impostor](#pistas-del-impostor)
   - [Votación, Empates y Última Oportunidad](#votación-empates-y-última-oportunidad)
10. [Biblioteca de Palabras y Categorías](#-biblioteca-de-palabras-y-categorías)
11. [Guía de Despliegue](#-guía-de-despliegue)
    - [Frontend en Vercel](#frontend-en-vercel)
    - [Backend en Render](#backend-en-render)
12. [Limitaciones Conocidas](#-limitaciones-conocidas)
13. [Solución de Problemas (Troubleshooting)](#-solución-de-problemas-troubleshooting)
14. [Batería de Pruebas Automatizadas](#-batería-de-pruebas-automatizadas)

---

## ✨ Características Principales

- **Dos Modalidades Reales**:
  - **Dispositivo Compartido (Pass & Play)**: 100% offline, funciona en un único dispositivo pasando la pantalla por turnos con cortinas visuales privadas. No requiere conexión al backend ni internet tras cargar la web.
  - **Multijugador Online en Tiempo Real**: Cada jugador desde su propio teléfono, con salas privadas, código de 6 caracteres, enlace compartible y código QR generado localmente en formato vectorial SVG.
- **Privacidad Estricta de Roles**:
  - En multijugador, el servidor **nunca** transmite la palabra secreta a los impostores ni difunde el mapa de roles a todos los clientes. Los roles se transmiten exclusivamente por socket privado.
- **24 Categorías Iniciales (+720 Palabras)**:
  - Fútbol, Otros deportes, Música, Artistas musicales, Películas, Series, Videojuegos, Comida, Bebidas, Animales, Países, Ciudades, Famosos, Marcas, Tecnología, Objetos cotidianos, Cultura general, Redes sociales, Profesiones, Personajes ficticios, Anime, Dibujos animados, Autos, Ropa y accesorios.
- **Pistas Opcionales del Impostor**:
  - Modo con pista (para orientar al impostor sin develar la palabra) y modo sin pista (dificultad extrema).
- **Mecánica de Votación y Resolución de Empates**:
  - Votación secreta de un solo voto por participante, barra de progreso en vivo ("3 de 5 votos recibidos"), desempate automático entre los más votados y regla de victoria para los impostores si el segundo desempate persiste.
- **Última Oportunidad**:
  - Si el impostor es descubierto en la votación, cuenta con un último intento para adivinar la palabra exacta y robar la victoria.
- **Gestor Completo de Categorías**:
  - Crear categorías personalizadas, agregar/eliminar palabras, modificar dificultades y pistas, exportar a JSON y restaurar valores de fábrica.
- **Estadísticas Locales**:
  - Tabla de líderes por jugador, porcentaje de victorias, historial de las últimas 50 partidas y rachas consecutivas guardadas en `localStorage`.
- **Efectos de Sonido con Web Audio API**:
  - Efectos sutiles sintetizados procedimentalmente (clics, fanfarrias, alertas y cuenta regresiva), 100% offline y silenciables con un clic.
- **Conexión Diferida y Tolerancia a Reactivación de Render**:
  - El frontend no conecta con WebSockets hasta que el usuario entra explícitamente al modo online. Notifica si Render está en reposo (plan gratuito) y soporta tokens de reconexión tras refrescar la página.

---

## 🛠 Stack Tecnológico

### Frontend (`apps/web`)
- **React 18** con **TypeScript** en modo estricto.
- **Vite** para compilación ultrarrápida.
- **Tailwind CSS** con paleta moderna oscura y acentos verde lima (`lime-500` / `#84cc16`).
- **Zustand** para la gestión reactiva del estado global.
- **Socket.IO Client** para comunicación bidireccional en tiempo real.
- **Lucide React** para iconografía consistente y accesible.
- **Vitest** y **React Testing Library** con **Happy DOM** para pruebas de componentes.

### Backend (`apps/server`)
- **Node.js** con **TypeScript** en modo estricto.
- **Express** para endpoints HTTP y health check (`/health`).
- **Socket.IO** para orquestación de salas en tiempo real y privacidad de eventos.
- **Zod** para validación exhaustiva de payloads entrantes.
- **Vitest** para pruebas unitarias y de integración simulando múltiples clientes.

### Paquete Compartido (`packages/shared`)
- Tipos TypeScript compartidos (`Player`, `GameSettings`, `WordItem`, `RoomState`, etc.).
- Esquemas de validación Zod.
- Constantes y límites del juego.
- Motor puro de reglas: asignación de roles, balance de impostores no consecutivos, exclusión de palabras recientes, algoritmo de votación y normalización estricta de palabras.
- Banco de datos de 24 categorías y 720+ palabras.

---

## 📂 Estructura del Proyecto (Monorepo)

```text
Impostor/
├── apps/
│   ├── web/                         # Aplicación Frontend React + Vite
│   │   ├── src/
│   │   │   ├── components/common/   # Button, Card, Header, Modal, QrCodeModal
│   │   │   ├── features/
│   │   │   │   ├── home/            # Pantalla de bienvenida y selección de modo
│   │   │   │   ├── shared-mode/     # Setup, Reparto privado, Debate, Votación, Resultados
│   │   │   │   ├── online-mode/     # Entrada online, Lobby de espera, Partida sincronizada
│   │   │   │   ├── categories/      # Editor de categorías, exportación e importación JSON
│   │   │   │   ├── stats/           # Métricas, ranking de jugadores e historial
│   │   │   │   ├── settings/        # Preferencias de sonido y accesibilidad
│   │   │   │   └── rules/           # Manual interactivo de reglas
│   │   │   ├── services/            # storageService, audioService, socketService
│   │   │   ├── stores/              # useGameStore (Zustand)
│   │   │   ├── styles/              # index.css y tokens de Tailwind
│   │   │   ├── App.tsx
│   │   │   └── main.tsx
│   │   ├── test/                    # Pruebas de integración del frontend
│   │   ├── package.json
│   │   ├── tailwind.config.js
│   │   ├── vite.config.ts
│   │   └── vercel.json              # Configuración SPA para Vercel
│   └── server/                      # Servidor Backend Express + Socket.IO
│       ├── src/
│       │   ├── config/              # Carga de variables de entorno (PORT, CLIENT_ORIGINS)
│       │   ├── http/                # Rutas HTTP (/health)
│       │   ├── rooms/               # RoomManager (salas en memoria, tokens de reconexión)
│       │   ├── sockets/             # Manejadores de eventos Socket.IO validados con Zod
│       │   └── index.ts             # Punto de entrada HTTP y graceful shutdown
│       ├── test/                    # Pruebas del servidor y simulación de 4 clientes
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   └── shared/                      # Paquete compartido (npm workspaces)
│       ├── src/
│       │   ├── constants/           # Límites, códigos de error y configuraciones por defecto
│       │   ├── data/                # 24 categorías iniciales y 720+ palabras detalladas
│       │   ├── game-rules/          # Motor de reglas y condiciones de victoria
│       │   ├── schemas/             # Esquemas de validación Zod
│       │   ├── types/               # Tipos TypeScript compartidos
│       │   └── index.ts
│       ├── test/                    # Pruebas unitarias del motor de juego
│       └── package.json
├── .env.example                     # Documentación de variables de entorno
├── .gitignore
├── package.json                     # Raíz del monorepo con npm workspaces
├── render.yaml                      # Blueprint de infraestructura para Render
├── tsconfig.base.json               # Configuración base estricta de TypeScript
├── vercel.json                      # Configuración de despliegue en Vercel
└── README.md
```

---

## 💻 Requisitos Previos

- **Node.js**: Versión 18.x, 20.x o 22.x instalada (`node -v`).
- **npm**: Versión 9.x o superior (`npm -v`).
- Conexión a internet únicamente para la instalación inicial de dependencias y para el modo multijugador online.

---

## 🚀 Instalación y Configuración

1. Clona o descarga el repositorio:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd Impostor
   ```

2. Instala todas las dependencias del monorepo:
   ```bash
   npm install
   ```

3. Crea tu archivo de variables de entorno basándote en la plantilla:
   ```bash
   cp .env.example .env
   ```

---

## 🏃 Ejecución en Desarrollo Local

Puedes ejecutar el frontend y el backend de forma simultánea o individual:

### Iniciar Frontend (Vite)
```bash
npm run dev:web
```
> Abrirá la aplicación web en [http://localhost:5173](http://localhost:5173).

### Iniciar Backend (Express + Socket.IO)
```bash
npm run dev:server
```
> Iniciará el servidor en [http://localhost:3001](http://localhost:3001) con recarga automática (`tsx watch`).

### Comprobar el Servidor
En tu navegador o terminal, puedes consultar el estado del backend:
```bash
curl http://localhost:3001/health
```
Respuesta esperada:
```json
{
  "status": "ok",
  "service": "impostor-server",
  "uptimeSeconds": 15,
  "activeRooms": 0,
  "connectedSockets": 0,
  "timestamp": 1791865505077
}
```

---

## 📜 Scripts Disponibles

Todos los scripts se ejecutan desde la raíz del monorepo:

| Comando | Descripción |
| :--- | :--- |
| `npm run dev:web` | Inicia el servidor de desarrollo de Vite para la aplicación web. |
| `npm run dev:server` | Inicia el servidor backend en modo desarrollo con recarga en caliente. |
| `npm run build` | Compila TypeScript y genera los bundles de producción de todos los paquetes. |
| `npm run build:shared` | Compila el paquete `@impostor/shared` hacia `./packages/shared/dist`. |
| `npm run build:web` | Compila la aplicación web estática hacia `./apps/web/dist`. |
| `npm run build:server` | Compila el backend hacia `./apps/server/dist`. |
| `npm run test` | Ejecuta la suite completa de pruebas unitarias y de integración (26 tests). |
| `npm run test:shared` | Ejecuta las pruebas del motor de reglas del juego. |
| `npm run test:server` | Ejecuta las pruebas del servidor y la simulación multijugador de 4 clientes. |
| `npm run test:web` | Ejecuta las pruebas de componentes y navegación de la interfaz web. |
| `npm run start:server` | Inicia el servidor backend compilado en modo producción. |

---

## 🔐 Variables de Entorno

Consulta el archivo `.env.example` para los detalles de cada variable:

### Para el Backend (Render / Local)
- `PORT`: Puerto TCP donde escucha el servidor HTTP (por defecto `3001`, en Render se asigna automáticamente).
- `CLIENT_ORIGINS`: Lista de URLs autorizadas separadas por comas para CORS (ejemplo: `http://localhost:5173,https://mi-impostor.vercel.app`).
- `LOG_LEVEL`: Nivel de detalle de registros en consola (`info`, `debug`, `warn`).

### Para el Frontend (Vercel / Local)
- `VITE_API_URL`: URL pública del servicio de Render (ejemplo: `https://impostor-server.onrender.com` o en local `http://localhost:3001`).

> **Nota de seguridad**: Las variables con prefijo `VITE_*` son públicas en el código compilado del navegador. Nunca almacenes claves secretas o tokens privados en ellas.

---

## 🎮 Reglas y Mecánicas del Juego

### Modo 1: Dispositivo Compartido
1. El anfitrión ingresa los nombres de los participantes (mínimo 3, recomendado 4+) y ajusta los impostores y categorías.
2. Comienza el reparto: el dispositivo muestra una **pantalla de privacidad**: «Pasa el dispositivo a [Jugador]».
3. Cada jugador pulsa **«Ver mi rol»**, memoriza su palabra secreta o lee su rol de impostor, y pulsa **«Ocultar y continuar»**.
4. Inicia la **ronda de debate**: por turnos, cada jugador dice una palabra o frase relacionada. Se puede activar un temporizador con avisos sonoros.
5. Inicia la **votación privada**: cada participante recibe el dispositivo en secreto, vota por su sospechoso y oculta su voto antes de pasarlo al siguiente.
6. Se revelan los resultados con celebración visual, revelación de la palabra secreta y registro automático en las estadísticas locales.

### Modo 2: Multijugador Online
1. Un jugador selecciona «Multijugador online», ingresa su nombre y pulsa **«Crear Sala»**.
2. El servidor genera un código único de 6 caracteres (ej. `K7X9PQ`).
3. El anfitrión comparte el código, el enlace directo o el código QR.
4. Los demás participantes abren el enlace desde su celular e ingresan su nombre.
5. Cuando están listos (mínimo 3 jugadores), el anfitrión pulsa **«Iniciar Partida»**.
6. Cada pantalla recibe en tiempo real únicamente su información privada.
7. La fase de debate y votación ocurre sincronizada en todos los teléfonos simultáneamente.

### Pistas del Impostor
- **Con pista**: El impostor recibe una ayuda temática (ej. Categoría: Películas, Palabra: *Titanic*, Pista: *«Drama romántico en un barco naufragado»*).
- **Sin pista**: El impostor sólo conoce su rol y la categoría, debiendo camuflarse con astucia pura.

### Votación, Empates y Última Oportunidad
- **Empates**: Si dos o más jugadores reciben la misma cantidad máxima de votos, se realiza una segunda votación de desempate exclusiva entre ellos. Si el segundo desempate persiste, nadie es expulsado y **los impostores ganan la partida**.
- **Última oportunidad**: Cuando el impostor es identificado por la mayoría, se le concede un único intento para escribir la palabra exacta. Si acierta, **roba la victoria para el equipo impostor**.

---

## 📚 Biblioteca de Palabras y Categorías

El juego incluye más de 720 palabras preconfiguradas distribuidas en 24 categorías:
1. **Fútbol** (Messi, Champions League, VAR, etc.)
2. **Otros deportes** (Básquetbol, Fórmula 1, Surf, etc.)
3. **Música** (Guitarra eléctrica, Batería, Vinilo, etc.)
4. **Artistas musicales** (Queen, Rosalía, Bad Bunny, etc.)
5. **Películas** (Titanic, Matrix, Inception, etc.)
6. **Series** (Breaking Bad, The Office, Dark, etc.)
7. **Videojuegos** (Minecraft, GTA V, Zelda, etc.)
8. **Comida** (Pizza napolitana, Asado, Sushi, etc.)
9. **Bebidas** (Café expreso, Fernet con cola, Mate, etc.)
10. **Animales** (León africano, Delfín, Pingüino, etc.)
11. **Países** (Argentina, Japón, España, etc.)
12. **Ciudades** (París, Tokio, Buenos Aires, etc.)
13. **Famosos** (Leonardo DiCaprio, Messi, Elon Musk, etc.)
14. **Marcas** (Apple, Nike, Ferrari, etc.)
15. **Tecnología** (Inteligencia Artificial, Dron, Realidad Virtual, etc.)
16. **Objetos cotidianos** (Paraguas, Llavero, Termo, etc.)
17. **Cultura general** (Torre Eiffel, Coliseo Romano, Mona Lisa, etc.)
18. **Redes sociales** (Instagram, TikTok, Twitch, etc.)
19. **Profesiones** (Médico cirujano, Astronauta, Chef, etc.)
20. **Personajes ficticios** (Batman, Harry Potter, Darth Vader, etc.)
21. **Anime** (Dragon Ball Z, Naruto, One Piece, etc.)
22. **Dibujos animados** (Los Simpson, Bob Esponja, Tom y Jerry, etc.)
23. **Autos** (Ferrari, Porsche 911, Tesla Model S, etc.)
24. **Ropa y accesorios** (Zapatillas urbanas, Campera de cuero, etc.)

---

## 🌐 Guía de Despliegue

### Frontend en Vercel

1. Inicia sesión en [Vercel](https://vercel.com) e importa tu repositorio de GitHub.
2. En la configuración del proyecto:
   - **Framework Preset**: Vite
   - **Root Directory**: Deja la raíz del repositorio (`.`) o selecciona `apps/web`.
   - **Build Command**: `npm run build:shared && npm run build:web`
   - **Output Directory**: `apps/web/dist`
3. Agrega la variable de entorno:
   - `VITE_API_URL`: La URL pública de tu servicio en Render (ejemplo: `https://tu-impostor.onrender.com`).
4. Pulsa **Deploy**. El archivo `vercel.json` ya incluye la regla de reescritura para rutas SPA (`/index.html`).

### Backend en Render

1. Inicia sesión en [Render](https://render.com) y crea un nuevo **Web Service**.
2. Conecta tu repositorio de GitHub.
3. En la configuración del servicio:
   - **Environment**: Node
   - **Plan**: Free (o el de tu preferencia)
   - **Build Command**: `npm install && npm run build:shared && npm run build:server`
   - **Start Command**: `npm run start:server`
   - **Health Check Path**: `/health`
4. En **Environment Variables**:
   - `PORT`: (Render lo asigna dinámicamente, no es necesario cambiarlo).
   - `CLIENT_ORIGINS`: La URL de tu frontend en Vercel (ejemplo: `https://tu-impostor.vercel.app`).
   - `LOG_LEVEL`: `info`
5. Pulsa **Create Web Service**.

> **Nota sobre el Plan Gratuito de Render**: Si el servicio pasa 15 minutos sin recibir solicitudes, Render suspende temporalmente la máquina. Cuando el primer usuario entra a una sala multijugador, la conexión puede demorar entre 15 y 30 segundos mientras el contenedor se despierta. La interfaz de la aplicación detecta esto automáticamente y muestra un mensaje informativo amigable.

---

## ⚠️ Limitaciones Conocidas

1. **Modo Multijugador Requiere Internet**: La modalidad online no es una red local aislada; depende de conectividad con el servidor de Render. Si los jugadores están en la misma red Wi-Fi sin acceso a internet, deben utilizar el modo de dispositivo compartido.
2. **Persistencia del Servidor en Memoria**: En esta versión, las salas activas residen en la memoria RAM del proceso Node.js. Si Render reinicia el servicio por mantenimiento, las partidas activas en ese instante se cerrarán y los jugadores deberán crear una nueva sala.
3. **Privacidad en Dispositivo Compartido**: El modo compartido provee privacidad visual entre turnos (las pantallas se ocultan antes de pasar el equipo), pero no impide que un participante inspeccione las herramientas de desarrollo del navegador si tiene acceso técnico al equipo.

---

## 🛠 Solución de Problemas (Troubleshooting)

- **El modo multijugador dice «El servidor se está reactivando en Render...»**:
  Es el comportamiento habitual de las instancias inactivas en Render. Espera unos segundos y la conexión se establecerá sola, o pulsa el botón «Reintentar».
- **No se escuchan los sonidos**:
  Verifica que el icono de volumen en la barra superior esté encendido y que el navegador tenga permisos de audio activados. Algunos navegadores requieren una primera interacción (clic) antes de permitir la reproducción de sonido.
- **La partida online no inicia**:
  El botón de inicio solo está habilitado para el anfitrión (indicado con una corona dorada) y requiere un mínimo reglamentario de 3 jugadores conectados en la sala.

---

## 🧪 Batería de Pruebas Automatizadas

El proyecto cuenta con 26 pruebas automáticas pasando con 100% de éxito:

```bash
npm run test
```

Resultados obtenidos:
- **`packages/shared` (14 pruebas unitarias)**:
  - Generación de códigos alfanuméricos no ambiguos.
  - Selección aleatoria con filtro de dificultad y exclusión de palabras recientes.
  - Asignación estricta de cantidad de impostores y balance de rondas consecutivas.
  - **Prueba crítica de secreto**: Comprobación de que el payload del impostor **nunca** contiene la palabra secreta.
  - Procesamiento de votos, detección de empates y reglas de victoria.
  - Normalización exacta de acentos, mayúsculas y espacios en la última oportunidad.
  - Verificación de más de 30 palabras válidas en las 24 categorías obligatorias.
- **`apps/server` (5 pruebas de integración)**:
  - Endpoint `/health` con uptime y contadores.
  - Creación de salas y generación de tokens de reconexión.
  - Rechazo de nombres duplicados en la misma sala.
  - Reconexión exitosa tras pérdida de socket manteniendo identidad.
  - **Simulación completa con 4 clientes conectados**: Asignación de roles privados, transición de debate, votación sincronizada y resolución de la partida.
- **`apps/web` (7 pruebas de interfaz y componentes)**:
  - Renderizado de la pantalla de bienvenida y navegación.
  - Despliegue interactivo de modalidades de juego.
  - Navegación al modo compartido, catálogo de categorías, estadísticas y reglas.
  - Persistencia de preferencias en `localStorage`.

---

¡Disfruta jugando al **Impostor** con tus amigos! 🕵️‍♂️✨
