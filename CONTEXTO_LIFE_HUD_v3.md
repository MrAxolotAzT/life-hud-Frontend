# CONTEXTO — Life HUD v3 (continuar desarrollo)

## El proyecto
**Life HUD** — App de productividad gamificada con backend FastAPI y frontend React.

- **Backend:** FastAPI en `~/Documents/Proyectos/2026/life-hud-backend` (puerto 8000)
- **Frontend:** React en `~/Documents/Proyectos/2026/life-hud-frontend` (puerto 3000)
- **Todo el frontend está en un solo archivo:** `src/App.js` (~10,432 líneas)
- **api.js** importado como `import { api, useApi, LoadingCard, ErrorCard } from './api'`

**Regla CRÍTICA:** El usuario NO sabe nada de desarrollo. Explicar todo paso a paso. Siempre trabajar sobre la copia más reciente. Cuando haya múltiples textos iguales (ej. `const [toast, setToast] = useState(null)`) usar Python con `rfind()` o contexto único. Nunca romper lo que ya funciona.

---

## Stack técnico

| Capa | Tecnología |
|------|-----------|
| Frontend | React (sin build, archivo único src/App.js) |
| Backend | FastAPI + Python |
| Base de datos | PostgreSQL (via SQLAlchemy) |
| Auth | JWT (token en localStorage como `life_hud_token`) |
| Estilos | CSS-in-JS inline + `getGlobalStyles(light)` — soporta tema claro/oscuro |
| Fuentes | Orbitron (títulos), Rajdhani (UI) |
| IA | Claude claude-opus-4-6 via backend endpoint `/api/v1/ai/roadmap` |
| Persistencia offline | localStorage (ver tabla de claves abajo) |

---

## Módulos completados ✅

| Módulo | Estado | Notas |
|--------|--------|-------|
| **Dashboard** | ✅ | Datos reales de backend + localStorage |
| **Tareas** | ✅ | Lista + Kanban. +1 XP al completar. Recibe `setGame` |
| **Hábitos** | ✅ | Mapa tipo GitHub, hábitos malos/buenos. +1 XP al completar. Recibe `setGame` |
| **Metas/Objetivos** | ✅ | Roadmap IA, hitos, sprint. +1 XP por hito, +100 XP al 100%. Recibe `setGame` |
| **Finanzas** | ✅ | Transacciones, barriles, deudas, presupuestos |
| **Learning — Cursos** | ✅ | Módulos/lecciones en localStorage |
| **Learning — Pomodoro** | ✅ | Duraciones 1m/5m/25m/30m/1h, persiste sesiones |
| **Learning — Mapa Estudio** | ✅ | 30 días desde localStorage |
| **Learning — Flashcards** | ✅ | |
| **Learning — Libros** | ✅ | |
| **Learning — Skills** | ✅ | |
| **Learning — Roadmap Tracks** | ✅ | 6 áreas: Programación, Diseño, Idiomas, Negocios, Música, Fitness. Persiste en `lifehud_roadmap_progreso` |
| **Learning — Notas** | ✅ | Editor libre con título, tag, color. Persiste en `lifehud_notas` |
| **Fitness — Rutinas** | ✅ | Custom en localStorage |
| **Fitness — Skills/Árbol** | ✅ | SKILL_TREE + custom. +100 XP al completar skill |
| **Fitness — Historial** | ✅ | |
| **Fitness — Heatmap muscular** | ✅ | SVG frontal/posterior. Lee `lifehud_historial_muscular` (7 días). Ranking muscular semanal |
| **Fitness — Días entrenados** | ✅ | Array en `lifehud_dias_entrenados`. Plan semanal con ✅/❌ real. Calendario mensual con racha y % consistencia |
| **Nutrición** | ✅ | Hoy, Semana, Comidas, Recetas, Macros/TDEE |
| **Shop** | ✅ | Guilty pleasures, power-ups, rewards |
| **Gamificación** | ✅ | XP balanceado, coins, nivel automático (xpNext × 1.5) |
| **Auth** | ✅ | Login/registro, JWT, sesión persistente |
| **Notificaciones** | ✅ | 5 recordatorios configurables. Smart check hábitos/fitness. Botón 🔔 en header |
| **Tema claro/oscuro** | ✅ | `getGlobalStyles(light)`, estado `temaClaro`, botón ☀️/🌙 en header. Afecta: cards, inputs, modales, sidebar, header, wrapper |

---

## Módulos pendientes ⏳

| Módulo | Estado | Detalle |
|--------|--------|---------|
| **RutinaPage** | 🔨 EN CONSTRUCCIÓN | Módulo nuevo. Ver sección completa abajo |
| **Learning — Roadmap con IA** | ⚠️ Hardcodeado | Tracks fijos. Acordado rehacerlo con IA generando el roadmap igual que ObjetivosPage |
| **Score semanal de vida** | ⏳ Pendiente | Resumen cruzado de todos los módulos, score 1-100 |
| **Ingresos extra / Side hustles** | ⏳ Pendiente | Tracker freelance y negocios secundarios |
| **Journaling / Mentalidad** | ⏳ Pendiente | Diario de reflexión diaria, gratitud, afirmaciones |
| **Fitness — Heatmap SVG** | 🔧 Mejorable | Silueta básica. Acordado mejorar anatomía después |
| **Streak global offline** | ⚠️ Bug conocido | `game.streak` del backend, no incrementa offline |

---

## RutinaPage — Especificación completa

### Concepto
Módulo para estructurar el día en **bloques de actividad** con duración definida, limitados por las horas disponibles del día.

### Funcionalidad
- El usuario configura **hora de inicio y fin** del día (ej. 06:00–23:00 = 17h disponibles)
- Crea bloques con: **nombre**, **categoría**, **duración** (horas + minutos), **notas opcionales**
- La app **impide** agregar bloques que excedan el tiempo disponible
- Los bloques se muestran en **orden cronológico** con hora de inicio/fin calculada automáticamente
- Se puede **reordenar** (↑↓), **editar** y **eliminar** cada bloque
- **Marcar como completado** da +1 XP +1 coin
- **Barra visual** del día segmentada por colores de cada bloque
- Cada día tiene su propia rutina guardada en `lifehud_rutina_YYYY-MM-DD`
- Config de horas del día persiste en `lifehud_rutina_config`

### Categorías de bloques
```js
const BLOQUE_CATEGORIAS = [
  { key: "trabajo",   label: "Trabajo",   emoji: "💼", color: "#7C3AED" },
  { key: "estudio",   label: "Estudio",   emoji: "📚", color: "#06B6D4" },
  { key: "ejercicio", label: "Ejercicio", emoji: "💪", color: "#EF4444" },
  { key: "descanso",  label: "Descanso",  emoji: "😴", color: "#64748B" },
  { key: "nutricion", label: "Nutrición", emoji: "🥗", color: "#10B981" },
  { key: "personal",  label: "Personal",  emoji: "🧘", color: "#F59E0B" },
  { key: "social",    label: "Social",    emoji: "👥", color: "#EC4899" },
  { key: "ocio",      label: "Ocio",      emoji: "🎮", color: "#8B5CF6" },
];
```

### Para agregar a la navegación
```js
// En NAV_ITEMS agregar al final:
{ icon: "⏰", label: "Rutina" }

// En renderPage agregar:
case 9: return <RutinaPage setGame={setGame} />;
```

### localStorage
- `lifehud_rutina_YYYY-MM-DD` → array de bloques del día
- `lifehud_rutina_config` → `{ horaInicio: 6, horaFin: 23 }`

---

## Tabla de XP balanceado

| Acción | XP | Coins |
|--------|-----|-------|
| Completar tarea | +1 | +1 |
| Completar hábito | +1 | +1 |
| Sesión de ejercicio | +5 | +2 |
| Hito de objetivo | +1 | — |
| Objetivo al 100% | +100 | +50 |
| Skill Fitness completada | +100 | — |
| Bloque rutina completado | +1 | +1 |
| XP para nivel 1→2 | 50 XP | — |
| Escala por nivel | ×1.5 | — |

---

## Navegación actual (NAV_ITEMS)

```
case 0 → DashboardPage   (tasks, setTasks, habits, setHabits, game, onLogMeal, onNavigate)
case 1 → TareasPage      (setGame)
case 2 → HabitosPage     (setGame, onHabitUpdate)
case 3 → ObjetivosPage   (setGame)
case 4 → FinanzasPage    ()
case 5 → LearningPage    ()
case 6 → FitnessPage     (game, setGame)
case 7 → NutricionPage   ()
case 8 → ShopPage        (game, setGame)
case 9 → [LIBRE — RutinaPage]
```

---

## Estado global en LifeHUD (componente raíz ~línea 10014)

```js
const [authUser, setAuthUser]
const [authToken, setAuthToken]
const [checkingAuth, setCheckingAuth]
const [activeNav, setActiveNav]
const [tasks,  setTasks]
const [habits, setHabits]
const [game,   setGame]       // {xp, xpNext, coins, level, disciplina, streak}
const [time,   setTime]
const [showMealModal, setShowMealModal]
const [toast,  setToast]
const [temaClaro, setTemaClaro]   // ✅ implementado
const [notifConfig, setNotifConfig]
const [showNotifPanel, setShowNotifPanel]
const [notifPermiso, setNotifPermiso]
```

---

## Claves de localStorage

| Clave | Contenido | Módulo |
|-------|-----------|--------|
| `life_hud_token` | JWT | Auth |
| `life_hud_user` | Objeto usuario | Auth |
| `lifehud_game` | `{xp,xpNext,coins,level,disciplina,streak}` | Global |
| `lifehud_tema` | `"claro"` o `"oscuro"` | Global |
| `lifehud_notif_config` | Config notificaciones | Global |
| `lifehud_notif_fired_YYYY-MM-DD` | Notificaciones disparadas hoy | Global |
| `lifehud_goals` | Array objetivos con roadmap IA | Metas |
| `lifehud_meals_YYYY-MM-DD` | Array comidas del día | Nutrición |
| `lifehud_recetas` | Array recetas | Nutrición |
| `lifehud_cal_meta` | Meta calórica diaria | Nutrición |
| `lifehud_macros_meta` | `{proteina,carbs,grasa}` | Nutrición |
| `lifehud_modo_macro` | `"mantenimiento"/"bulking"/"cutting"` | Nutrición |
| `lifehud_tdee_form` | `{peso,altura,edad,sexo,actividad}` | Nutrición |
| `lifehud_agua_YYYY-MM-DD` | Vasos de agua | Nutrición/Dashboard |
| `lifehud_dias_entrenados` | Array `["YYYY-MM-DD",...]` | Fitness |
| `lifehud_fitness_hoy` | Última fecha entrenada (compat.) | Fitness |
| `lifehud_historial_muscular` | Últimos 30 entrenos con ejercicios | Fitness |
| `lifehud_records` | Récords personales | Fitness |
| `lifehud_rutinas` | Rutinas custom de Fitness | Fitness |
| `lifehud_skills_fitness` | Skills custom de Fitness | Fitness |
| `lifehud_skills_progress` | `{id: valor}` progreso skills | Fitness |
| `lifehud_habit_cal_{id}` | `{YYYY-MM-DD: true}` por hábito | Hábitos |
| `lifehud_malos` | Hábitos malos | Hábitos |
| `lifehud_study_YYYY-MM-DD` | Minutos estudiados | Learning |
| `lifehud_pom_FECHA_sesiones` | Sesiones pomodoro | Learning |
| `lifehud_pom_FECHA_count` | Contador pomodoros | Learning |
| `lifehud_skill_hours_{id}` | Horas por skill de Learning | Learning |
| `lifehud_modulos_{id}` | Módulos de cada curso | Learning |
| `lifehud_roadmap_progreso` | `{track_nodoId: bool}` | Learning |
| `lifehud_notas` | Array notas `{id,titulo,contenido,tag,color,fecha}` | Learning |
| `lifehud_barriles` | Barriles de ahorro | Finanzas |
| `lifehud_deudas` | Deudas/compromisos | Finanzas |
| `lifehud_activos` | Activos financieros | Finanzas |
| `lifehud_negocios` | Negocios/ingresos extra | Finanzas |
| `lifehud_rutina_YYYY-MM-DD` | Bloques del día *(pendiente)* | Rutina |
| `lifehud_rutina_config` | `{horaInicio,horaFin}` *(pendiente)* | Rutina |

---

## Componentes principales

| Componente | Línea aprox | Descripción |
|-----------|-------------|-------------|
| `ProgressBar` | ~461 | Barra de progreso reutilizable |
| `Toast` | ~467 | Notificación flotante 2.8s |
| `MealLogModal` | ~475 | Modal registro comidas con gramos |
| `BodyHeatMap` | ~708 | SVG heatmap muscular |
| `DashboardPage` | ~890 | Dashboard principal |
| `ObjetivosPage` | ~1557 | Metas con roadmap IA. Recibe `setGame` |
| `FinanzasPage` | ~3108 | Transacciones, barriles, deudas |
| `TareasPage` | ~4257 | Lista + Kanban. Recibe `setGame` |
| `HabitosPage` | ~4893 | Hábitos. Recibe `setGame, onHabitUpdate` |
| `HabitCalendar` | ~4825 | Calendario GitHub 12 semanas |
| `NutricionPage` | ~5543 | Hoy, Semana, Recetas, Macros/TDEE |
| `FlashcardViewer` | ~6511 | Visor flashcards |
| `PomodoroMejorado` | ~6744 | Timer con vínculo a cursos/skills |
| `LearningPage` | ~6964 | Cursos, Pomodoro, Mapa, Flashcards, Libros, Skills, Roadmap, Notas |
| `RestTimer` | ~8392 | Timer descanso entre series |
| `WorkoutLog` | ~8452 | Log series/reps durante entreno |
| `EJERCICIO_MUSCULO` | ~8150 | Diccionario ejercicio → músculos |
| `FitnessPage` | ~8608 | Hoy, Rutinas, Skills, Heatmap, Historial, Récords |
| `ShopPage` | ~9792 | Guilty pleasures, power-ups, rewards |
| `LoginPage` | ~9910 | Login/registro JWT |
| `LifeHUD` | ~10014 | Raíz — estado global, nav, header |

---

## Constantes importantes

| Constante | Línea | Descripción |
|-----------|-------|-------------|
| `INITIAL_GAME` | ~7 | `{xp:0, xpNext:50, coins:0, disciplina:0, streak:0, level:1}` |
| `DEFAULT_NOTIF_CONFIG` | ~9 | 5 recordatorios con hora y smart-check |
| `NAV_ITEMS` | ~371 | 9 items (Dashboard→Shop). Case 9 libre para Rutina |
| `getGlobalStyles(light)` | ~386 | Estilos globales con soporte tema claro/oscuro |
| `ROADMAP_TRACKS` | ~6652 | 6 tracks de aprendizaje con nodos por nivel |
| `LEARNING_ROADMAP` | ~6742 | Alias de `ROADMAP_TRACKS.programacion.nodos` |
| `EJERCICIO_MUSCULO` | ~8150 | Mapa ejercicio → músculos para heatmap |
| `GYM_RUTINAS` | ~8220 | Push/Pull/Legs predefinidas |
| `CALI_RUTINAS` | ~8257 | Rutinas calistenia predefinidas |
| `SKILL_TREE` | ~8300 | Árbol skills fitness con niveles |

---

## Colores y estilos del sistema

```
Colores principales:
  #7C3AED  morado       #06B6D4  cyan
  #10B981  verde        #EF4444  rojo
  #F59E0B  amarillo     #EC4899  rosa
  #8B5CF6  violeta claro

Texto:
  #F1F5F9  claro        #94A3B8  medio
  #64748B  apagado      #4A5568  muy apagado
  #2D2D45  bordes sec.  #1E1E30  bordes princ.

Fondos modo oscuro:
  #080810  app          #0F0F18  cards/rows
  #0A0A12  inputs       #0D0D1A  internos

Fondos modo claro:
  #F0F4F8  app          #FFFFFF  cards
  #F8FAFC  secundario   #1E293B  texto

Clases CSS disponibles:
  card, btn-primary, btn-secondary, btn-success, btn-danger,
  tag, nav-item, section-title, modal-bg, modal, page,
  food-chip-sm, exercise-row, txn-row, routine-card,
  barrel-card, goal-card, phase-card, action-item,
  daily-action, recipe-card-sm, ai-thinking, toast, scanline, fab
```

---

## Arquitectura del backend

```
app/api/v1/
  auth.py, gamification.py, tasks.py, habits.py,
  finance.py, goals.py, dashboard.py, fitness_profile.py,
  exercises.py, workouts.py, skills.py, fitness_stats.py,
  nutrition_*.py, learning.py, shop.py,
  ai.py  ← POST /api/v1/ai/roadmap → Claude claude-opus-4-6

app/core/
  dependencies.py  ← get_current_user (NO en security.py)
  database.py, redis_client.py

config.py  ← settings con pydantic, lee .env
main.py
```

**Endpoint IA:** `POST /api/v1/ai/roadmap`
- `settings.ANTHROPIC_API_KEY`
- Modelo: `claude-opus-4-6`, `max_tokens=4096`
- Devuelve `{"result": "<JSON string>"}`

---

## Notas críticas de desarrollo

1. **Múltiples `const [toast, setToast]`** — hay una por cada página. El del root LifeHUD está en la **última** (~línea 10060). Siempre usar `rfind()` en Python o buscar contexto único.

2. **Al hacer reemplazos con Python** — siempre usar `assert old in content` antes de reemplazar para detectar errores rápido.

3. **Backend falla silenciosamente** — localStorage es la fuente de verdad para datos locales.

4. **`setGame` debe pasarse explícitamente** a cada página que dé XP — no es global automáticamente.

5. **Tema claro** — solo afecta los elementos modificados en `getGlobalStyles`. Los `style={{background:"#080810"}}` inline en componentes individuales NO cambian con el tema.

---

## Cómo arrancar el proyecto

```bash
# Backend
cd ~/Documents/Proyectos/2026/life-hud-backend
source venv/bin/activate
uvicorn app.main:app --reload  # → http://127.0.0.1:8000

# Frontend
cd ~/Documents/Proyectos/2026/life-hud-frontend
npm start  # → http://localhost:3000
```

`.env` del backend:
```
DATABASE_URL=...
SECRET_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
```

---

## Próximos pasos (en orden)

1. **RutinaPage** 🔨 — EN PROGRESO
2. **Learning Roadmap con IA** — tracks dinámicos generados por Claude
3. **Score semanal de vida** — resumen cruzado, score 1-100
4. **Ingresos extra / Side hustles** — tracker freelance y negocios
5. **Journaling / Mentalidad** — diario de reflexión diaria
