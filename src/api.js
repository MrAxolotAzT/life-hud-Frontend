import React from 'react';
// ============================================================
// api.js — Puente entre Life HUD frontend y backend
// ============================================================
// INSTALACIÓN:
// 1. Crea el archivo: src/api.js
// 2. Pega todo este contenido
// 3. En App.js agrega al inicio:
//    import { api } from './api';
// ============================================================

const API_BASE = "https://life-hud-backend-production.up.railway.app/api/v1";

// ── Token helper ─────────────────────────────────────────────
const getToken = () => localStorage.getItem("life_hud_token");

// ── Fetch base con auth automático ──────────────────────────
const req = async (method, path, body = null) => {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    // Token expirado — limpiar sesión y recargar
    localStorage.removeItem("life_hud_token");
    localStorage.removeItem("life_hud_user");
    window.location.reload();
    return;
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status}`);
  }

  // 204 No Content no tiene body
  if (res.status === 204) return null;
  return res.json();
};

const get    = (path)        => req("GET",    path);
const post   = (path, body)  => req("POST",   path, body);
const put    = (path, body)  => req("PUT",    path, body);
const patch  = (path, body)  => req("PATCH",  path, body);
const del    = (path)        => req("DELETE", path);

// ============================================================
// API por módulo
// ============================================================

export const api = {

  // ── AUTH ──────────────────────────────────────────────────
  auth: {
    login:    (username_or_email, password) =>
      fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username_or_email, password }),
      }).then(async res => {
        if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.detail || "Error al iniciar sesión"); }
        return res.json();
      }),

    register: (username, email, password) =>
      fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      }).then(async res => {
        if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.detail || "Error al registrarse"); }
        return res.json();
      }),

    me: () => get("/auth/me"),
  },

  // ── TAREAS ────────────────────────────────────────────────
  tareas: {
    listar:   (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/tasks${q ? "?" + q : ""}`);
    },
    crear:    (data)    => post("/tasks", data),
    obtener:  (id)      => get(`/tasks/${id}`),
    editar:   (id, data)=> patch(`/tasks/${id}`, data),
    eliminar: (id)      => del(`/tasks/${id}`),
    toggleDone: (id, done) => patch(`/tasks/${id}`, { status: done ? "completed" : "pending" }),
    // Subtareas
    agregarSubtarea: (taskId, data) => post(`/tasks/${taskId}/subtasks`, data),
    toggleSubtarea:  (taskId, subId, done) => patch(`/tasks/${taskId}/subtasks/${subId}`, { completed: done }),
  },

  // ── HÁBITOS ───────────────────────────────────────────────
  habitos: {
    listar:   ()        => get("/habits?active_only=true"),
    crear:    (data)    => post("/habits", data),
    editar:   (id, data)=> put(`/habits/${id}`, data),
    eliminar: (id)      => del(`/habits/${id}`),
    completar: (id)     => post(`/habits/${id}/complete`, {}),
    // Historial del hábito
    historial: (id)     => get(`/habits/${id}/history`),
    // Resumen semanal
    resumenSemanal: ()  => get("/habits/weekly-summary"),
  },

  // ── OBJETIVOS ─────────────────────────────────────────────
  objetivos: {
    listar:   ()        => get("/goals"),
    crear:    (data)    => post("/goals", data),
    obtener:  (id)      => get(`/goals/${id}`),
    editar:   (id, data)=> put(`/goals/${id}`, data),
    eliminar: (id)      => del(`/goals/${id}`),
    // IA: generar mapa de ruta
    generarMapa: (id)   => post(`/goals/${id}/generate-map`, {}),
    // Hitos
    agregarHito:   (goalId, data) => post(`/goals/${goalId}/milestones`, data),
    completarHito: (goalId, hitoId) => patch(`/goals/${goalId}/milestones/${hitoId}`, { completed: true }),
    eliminarHito:  (goalId, hitoId) => del(`/goals/${goalId}/milestones/${hitoId}`),
    // Actualizar progreso
    actualizarProgreso: (id, progreso) => patch(`/goals/${id}`, { progress_percentage: progreso }),
  },

  // ── FINANZAS ──────────────────────────────────────────────
  finanzas: {
    // Resumen general
    resumen:      ()        => get("/finance/summary"),
    // Transacciones
    transacciones: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/finance/transactions${q ? "?" + q : ""}`);
    },
    crearTransaccion: (data)    => post("/finance/transactions", data),
    eliminarTransaccion: (id)   => del(`/finance/transactions/${id}`),
    // Barriles de ahorro
    barriles:     ()            => get("/finance/barrels"),
    crearBarril:  (data)        => post("/finance/barrels", data),
    abonarBarril: (id, monto)   => post(`/finance/barrels/${id}/deposit`, { amount: monto }),
    // Presupuestos
    presupuestos: ()            => get("/finance/budgets"),
    crearPresupuesto: (data)    => post("/finance/budgets", data),
    // Analytics
    analytics:    ()            => get("/finance/analytics"),
    historialMensual: ()        => get("/finance/monthly-history"),
  },

  // ── FITNESS ───────────────────────────────────────────────
  fitness: {
    // Dashboard
    resumen:      ()            => get("/fitness/stats/summary"),
    // Rutinas
    rutinas:      ()            => get("/fitness/routines"),
    crearRutina:  (data)        => post("/fitness/routines", data),
    // Workouts (sesiones)
    workouts:     (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return get(`/fitness/workouts${q ? "?" + q : ""}`);
    },
    iniciarWorkout:  (data) => post("/fitness/workouts", data),
    completarWorkout:(id, data) => patch(`/fitness/workouts/${id}/complete`, data),
    // Ejercicios
    registrarSerie: (workoutId, data) => post(`/fitness/workouts/${workoutId}/sets`, data),
    // Records
    records:      ()            => get("/fitness/stats/records"),
    // Skills calistenia
    skills:       ()            => get("/fitness/skills"),
    actualizarSkill: (id, data) => patch(`/fitness/skills/${id}`, data),
    // Mapa de calor
    mapaCalor:    ()            => get("/fitness/heatmap"),
  },

  // ── NUTRICIÓN ─────────────────────────────────────────────
  nutricion: {
    // Resumen del día
    resumenHoy:      ()            => get("/nutrition/stats/today"),
    // Comidas
    comidas:         (fecha = null)=> get(fecha ? `/nutrition/meals/date/${fecha}` : "/nutrition/meals/today"),
    registrarComida: (data)        => post("/nutrition/meals", data),
    eliminarComida:  (id)          => del(`/nutrition/meals/${id}`),
    // Agua
    registrarAgua:   (ml)          => post("/nutrition/meals/water", { amount_ml: ml, source: "glass" }),
    aguaHoy:         ()            => get("/nutrition/meals/water/today"),
    // Alimentos (buscar)
    buscarAlimento:  (q)           => get(`/nutrition/foods/search?q=${encodeURIComponent(q)}`),
    // Recetas
    recetas:         ()            => get("/nutrition/recipes"),
    // Perfil nutricional
    perfil:          ()            => get("/nutrition/profile"),
    crearPerfil:     (data)        => post("/nutrition/profile/setup", data),
    // Estadísticas semanales
    estadisticasSemana: ()         => get("/nutrition/stats/weekly"),
  },

  // ── LEARNING ──────────────────────────────────────────────
  learning: {
    // Resumen
    resumen:      ()            => get("/learning/summary"),
    // Skills
    skills:       ()            => get("/learning/skills"),
    crearSkill:   (data)        => post("/learning/skills", data),
    actualizarSkill: (id, data) => patch(`/learning/skills/${id}`, data),
    // Cursos
    cursos:       ()            => get("/learning/courses"),
    crearCurso:   (data)        => post("/learning/courses", data),
    completarLeccion: (cursoId, leccionId) => patch(`/learning/courses/${cursoId}/lessons/${leccionId}`, { completed: true }),
    // Sesiones de estudio (Pomodoro)
    sesiones:     ()            => get("/learning/sessions"),
    iniciarSesion:(data)        => post("/learning/sessions", data),
    completarSesion: (id, data) => patch(`/learning/sessions/${id}/complete`, data),
    // Flashcards
    flashcards:   ()            => get("/learning/flashcards"),
    crearFlashcard: (data)      => post("/learning/flashcards", data),
    revisarFlashcard: (id, dificultad) => patch(`/learning/flashcards/${id}/review`, { difficulty: dificultad }),
    // Libros
    libros:       ()            => get("/learning/books"),
    crearLibro:   (data)        => post("/learning/books", data),
    actualizarPaginas: (id, paginas) => patch(`/learning/books/${id}`, { pages_read: paginas }),
    // Mapa de estudio
    mapaEstudio:  ()            => get("/learning/study-map"),
  },

  // ── GAMIFICACIÓN ──────────────────────────────────────────
  game: {
    // Estado del jugador (XP, coins, nivel, racha)
    perfil:       ()            => get("/gamification/profile"),
    // Logros
    logros:       ()            => get("/gamification/achievements"),
    logrosDesbloqueados: ()     => get("/gamification/achievements/unlocked"),
    // Dashboard de stats
    stats:        ()            => get("/gamification/stats"),
    // Resumen semanal
    resumenSemanal: ()          => get("/gamification/weekly-summary"),
  },

  // ── SHOP ──────────────────────────────────────────────────
  shop: {
    items:        ()                    => get("/shop/items"),
    comprar:      (itemId, userCoins)   => post("/shop/buy", { item_id: itemId, user_coins: userCoins }),
    historial:    ()                    => get("/shop/purchases/history"),
    powerUpsActivos: ()                 => get("/shop/power-ups/active"),
  },

  // ── DASHBOARD ─────────────────────────────────────────────
  dashboard: {
    // Resumen completo del día para el dashboard
    resumenDia:   ()            => get("/dashboard/today"),
    // Insights de IA
    insights:     ()            => get("/dashboard/insights"),
    // Progreso semanal
    progreso:     ()            => get("/dashboard/weekly-progress"),
  },
};

// ============================================================
// HOOKS — Para usar en componentes React
// ============================================================
// Uso:
//   const { data, loading, error } = useApi(() => api.tareas.listar());
//
// Recarga cuando cambian dependencias:
//   const { data } = useApi(() => api.tareas.listar(), [filtro]);

export const useApi = (fn, deps = []) => {
  const [data,    setData]    = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error,   setError]   = React.useState(null);

  React.useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fn()
      .then(res  => { if (!cancelled) { setData(res); setLoading(false); } })
      .catch(err => { if (!cancelled) { setError(err.message); setLoading(false); } });
    return () => { cancelled = true; };
  }, deps);

  const reload = () => {
    setLoading(true);
    fn()
      .then(res  => { setData(res); setLoading(false); })
      .catch(err => { setError(err.message); setLoading(false); });
  };

  return { data, loading, error, reload };
};

// ============================================================
// LOADING SPINNER — componente reutilizable
// ============================================================
export const LoadingCard = ({ mensaje = "Cargando..." }) => (
  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 20px", gap: 14 }}>
    <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #1E1E30", borderTop: "3px solid #7C3AED", animation: "spin 0.8s linear infinite" }} />
    <div style={{ fontSize: 12, color: "#4A5568", letterSpacing: 2 }}>{mensaje.toUpperCase()}</div>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ============================================================
// ERROR CARD — componente reutilizable
// ============================================================
export const ErrorCard = ({ mensaje, onRetry }) => (
  <div style={{ padding: "20px", borderRadius: 12, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", textAlign: "center" }}>
    <div style={{ fontSize: 28, marginBottom: 8 }}>⚠️</div>
    <div style={{ fontSize: 13, color: "#FCA5A5", marginBottom: 12 }}>{mensaje}</div>
    {onRetry && (
      <button onClick={onRetry} style={{ padding: "7px 18px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.1)", color: "#EF4444", cursor: "pointer", fontSize: 12, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700 }}>
        🔄 Reintentar
      </button>
    )}
  </div>
);