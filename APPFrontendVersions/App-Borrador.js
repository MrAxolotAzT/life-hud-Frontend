import { useState, useEffect, useRef } from "react";

// ============================================================
// MOCK DATA
// ============================================================
const INITIAL_GAME = { xp: 2450, xpNext: 3000, coins: 380, disciplina: 78, streak: 7, level: 12 };

const mockData = {
  user: { name: "azt-cryp" },
  tasks: [
    { id: 1, title: "Completar módulo de Python", priority: "high", done: false },
    { id: 2, title: "Registrar gastos del día", priority: "medium", done: false },
    { id: 3, title: "Revisar portfolio en GitHub", priority: "low", done: true },
    { id: 4, title: "Aplicar a proyecto freelance", priority: "high", done: false },
  ],
  habits: [
    { id: 1, name: "Estudiar Python 2h", done: true, streak: 7 },
    { id: 2, name: "Registrar ingresos/gastos", done: false, streak: 3 },
    { id: 3, name: "Aplicar a 1 freelance/día", done: false, streak: 5 },
    { id: 4, name: "Ejercicio 30 min", done: true, streak: 12 },
  ],
  goal: { name: "Mi Primer Auto 🚗", current: 135000, target: 300000 },
  weekProgress: [65, 80, 45, 90, 70, 55, 88],
  nutrition: {
    calories: { consumed: 1840, goal: 2200 },
    water: { consumed: 1.8, goal: 3.0 },
    macros: { protein: { consumed: 120, goal: 150 }, carbs: { consumed: 210, goal: 250 }, fat: { consumed: 65, goal: 80 } },
    meals: [
      { id: 1, name: "Desayuno", time: "08:30", calories: 450, foods: ["Avena con fruta", "Huevos revueltos"] },
      { id: 2, name: "Almuerzo", time: "13:00", calories: 720, foods: ["Arroz integral", "Pollo a la plancha", "Ensalada"] },
      { id: 3, name: "Cena", time: "19:30", calories: 670, foods: ["Pasta con atún", "Yogurt"] },
    ],
    recipes: [
      { id: 1, name: "Bowl de proteína", calories: 520, time: "15 min", emoji: "🥗" },
      { id: 2, name: "Smoothie verde", calories: 280, time: "5 min", emoji: "🥤" },
      { id: 3, name: "Pollo al limón", calories: 420, time: "25 min", emoji: "🍗" },
    ],
    quickFoods: [
      { id: 1, name: "Pollo 100g", cal: 165, p: 31, c: 0, f: 3.6, emoji: "🍗" },
      { id: 2, name: "Arroz 100g", cal: 130, p: 2.7, c: 28, f: 0.3, emoji: "🍚" },
      { id: 3, name: "Huevo", cal: 70, p: 6, c: 0.5, f: 5, emoji: "🥚" },
      { id: 4, name: "Plátano", cal: 89, p: 1.1, c: 23, f: 0.3, emoji: "🍌" },
      { id: 5, name: "Aguacate 50g", cal: 80, p: 1, c: 4, f: 7, emoji: "🥑" },
      { id: 6, name: "Leche 250ml", cal: 150, p: 8, c: 12, f: 8, emoji: "🥛" },
      { id: 7, name: "Atún 100g", cal: 116, p: 26, c: 0, f: 1, emoji: "🐟" },
      { id: 8, name: "Avena 40g", cal: 148, p: 5, c: 26, f: 2.5, emoji: "🌾" },
      { id: 9, name: "Tortilla", cal: 52, p: 1.4, c: 11, f: 0.7, emoji: "🫓" },
      { id: 10, name: "Proteína", cal: 120, p: 24, c: 3, f: 1.5, emoji: "💪" },
      { id: 11, name: "Papa 100g", cal: 87, p: 1.9, c: 20, f: 0.1, emoji: "🥔" },
      { id: 12, name: "Manzana", cal: 52, p: 0.3, c: 14, f: 0.2, emoji: "🍎" },
    ],
  },
  fitness: {
    streak: 15,
    weekWorkouts: [true, true, false, true, true, false, true],
    todayRoutine: {
      name: "Push Day — Pecho y Hombros",
      exercises: [
        { name: "Press de Banca", sets: 4, reps: "8-10", weight: "80kg", done: true },
        { name: "Press Inclinado", sets: 3, reps: "10-12", weight: "60kg", done: true },
        { name: "Press Militar", sets: 4, reps: "8-10", weight: "50kg", done: false },
        { name: "Elevaciones Laterales", sets: 3, reps: "12-15", weight: "12kg", done: false },
        { name: "Fondos en paralelas", sets: 3, reps: "12", weight: "Corporal", done: false },
      ],
    },
    muscleHeatmap: {
      front: { chest: 85, frontDelts: 70, biceps: 60, forearms: 45, abs: 55, obliques: 30, quads: 30, calves: 25 },
      back: { traps: 65, lats: 40, triceps: 60, lowerBack: 35, glutes: 25, hamstrings: 30, calvesBack: 25 },
    },
    records: [
      { exercise: "Press de Banca", record: "100kg", reps: "1RM", date: "15 Feb", trend: "up" },
      { exercise: "Sentadilla", record: "120kg", reps: "1RM", date: "10 Feb", trend: "up" },
      { exercise: "Peso Muerto", record: "140kg", reps: "1RM", date: "05 Feb", trend: "same" },
      { exercise: "Dominadas", record: "15 reps", reps: "max", date: "12 Feb", trend: "up" },
      { exercise: "Press Militar", record: "75kg", reps: "1RM", date: "08 Feb", trend: "down" },
      { exercise: "Fondos lastrados", record: "+40kg", reps: "5 reps", date: "20 Feb", trend: "up" },
    ],
    calisteniaSkills: [
      { name: "Dominadas", current: 12, goal: 20, unit: "reps", level: "Intermedio", icon: "🏋️", xp: 600 },
      { name: "Fondos", current: 20, goal: 30, unit: "reps", level: "Intermedio", icon: "💪", xp: 500 },
      { name: "Pistol Squat", current: 5, goal: 10, unit: "reps", level: "Avanzado", icon: "🦵", xp: 700 },
      { name: "Muscle Up", current: 2, goal: 5, unit: "reps", level: "Élite", icon: "⚡", xp: 900 },
      { name: "Handstand", current: 15, goal: 60, unit: "seg", level: "Avanzado", icon: "🤸", xp: 800 },
      { name: "L-Sit", current: 10, goal: 30, unit: "seg", level: "Intermedio", icon: "🧘", xp: 650 },
    ],
    calisteniaRoutines: [
      { name: "Upper Body", day: "Lun / Jue", duration: "45 min", emoji: "💪", exercises: ["Dominadas 4×8", "Fondos 3×12", "Pike Push-ups 3×10", "Remo Australiano 3×12", "Archer Push-ups 3×6"] },
      { name: "Core & Skills", day: "Mié / Sáb", duration: "30 min", emoji: "🧘", exercises: ["L-Sit 5×10s", "Hollow Body 3×30s", "Dragon Flag 3×5", "Ab Wheel 3×10", "Handstand Hold 5×15s"] },
      { name: "Piernas", day: "Mar / Vie", duration: "40 min", emoji: "🦵", exercises: ["Pistol Squat 4×5", "Jump Squats 3×15", "Nordic Curls 3×8", "Calf Raises 4×20", "Bulgarian Split 3×10"] },
    ],
    gymRoutines: [
      { name: "Push Day", day: "Lun / Jue", duration: "60 min", emoji: "🏋️", color: "#EF4444", exercises: ["Press Banca 4×8", "Press Inclinado 3×10", "Press Militar 4×8", "Elevaciones Lat. 3×15", "Fondos lastrados 3×10"] },
      { name: "Pull Day", day: "Mar / Vie", duration: "60 min", emoji: "🔱", color: "#06B6D4", exercises: ["Peso Muerto 4×5", "Dominadas lastradas 4×8", "Remo c/Barra 3×10", "Curl Bíceps 3×12", "Face Pulls 3×15"] },
      { name: "Leg Day", day: "Miércoles", duration: "65 min", emoji: "🦵", color: "#10B981", exercises: ["Sentadilla 5×5", "Leg Press 4×12", "Romanian Deadlift 3×10", "Leg Curl 3×12", "Pantorrillas 4×20"] },
    ],
  },
  learning: {
    todayMinutes: 90, todayGoal: 120,
    weekStudy: [60, 120, 45, 110, 90, 0, 90],
    skills: [
      { id: 1, name: "Python", icon: "🐍", level: "Intermedio", xp: 2200, xpNext: 3000, hours: 45, color: "#F59E0B" },
      { id: 2, name: "FastAPI", icon: "⚡", level: "Principiante", xp: 800, xpNext: 1500, hours: 12, color: "#7C3AED" },
      { id: 3, name: "SQL", icon: "🗄️", level: "Principiante", xp: 400, xpNext: 1500, hours: 8, color: "#06B6D4" },
    ],
    courses: [
      { id: 1, name: "FastAPI de 0 a Experto", platform: "Udemy", icon: "🎓", progress: 42, lessons: 45, done: 19, color: "#7C3AED" },
      { id: 2, name: "Python Avanzado", platform: "Platzi", icon: "🐍", progress: 78, lessons: 30, done: 23, color: "#10B981" },
      { id: 3, name: "SQL para Data", platform: "Coursera", icon: "📊", progress: 15, lessons: 40, done: 6, color: "#06B6D4" },
    ],
    books: [
      { id: 1, title: "Clean Code", author: "R. Martin", pages: 431, read: 130, status: "reading", emoji: "📗" },
      { id: 2, title: "The Pragmatic Programmer", author: "Hunt & Thomas", pages: 352, read: 352, status: "completed", emoji: "📘" },
      { id: 3, title: "Python Tricks", author: "Dan Bader", pages: 302, read: 0, status: "pending", emoji: "📙" },
    ],
    flashcards: [
      { id: 1, front: "¿Qué es una función async en Python?", back: "Una función que puede pausar con await, permitiendo que otras corrutinas corran mientras espera.", deck: "Python", due: true },
      { id: 2, front: "¿Qué hace el decorador @router.get()?", back: "Registra una función como handler de una ruta GET en FastAPI.", deck: "FastAPI", due: true },
      { id: 3, front: "¿Diferencia entre list y tuple?", back: "List es mutable, tuple es inmutable y más rápido.", deck: "Python", due: false },
      { id: 4, front: "¿Qué es un índice en SQL?", back: "Estructura que acelera búsquedas en una tabla, como el índice de un libro.", deck: "SQL", due: true },
    ],
    sessions: [
      { date: "Hoy", minutes: 90, topic: "FastAPI Routers", quality: 8 },
      { date: "Ayer", minutes: 120, topic: "Python Async/Await", quality: 9 },
      { date: "Hace 2 días", minutes: 45, topic: "SQL Joins", quality: 7 },
    ],
  },
  finance: {
    balance: 15420,
    monthIncome: 12000,
    monthExpense: 8340,
    savingsRate: 31,
    monthlyHistory: [
      { month: "Sep", income: 9500, expense: 7200, savings: 2300 },
      { month: "Oct", income: 10200, expense: 7800, savings: 2400 },
      { month: "Nov", income: 8800, expense: 8100, savings: 700 },
      { month: "Dic", income: 14500, expense: 10200, savings: 4300 },
      { month: "Ene", income: 11000, expense: 8500, savings: 2500 },
      { month: "Feb", income: 12000, expense: 8340, savings: 3660 },
    ],
    barrels: [
      { id: 1, name: "Auto 🚗", current: 135000, goal: 300000, color: "#7C3AED", monthly: 3000, emoji: "🚗" },
      { id: 2, name: "Emergencias 🛡️", current: 8500, goal: 30000, color: "#06B6D4", monthly: 500, emoji: "🛡️" },
      { id: 3, name: "Vacaciones ✈️", current: 3200, goal: 15000, color: "#F59E0B", monthly: 800, emoji: "✈️" },
    ],
    transactions: [
      { id: 1, desc: "Freelance Python — Cliente A", amount: 3500, type: "income", category: "freelance", date: "Hoy", emoji: "💻" },
      { id: 2, desc: "Supermercado Walmart", amount: -850, type: "expense", category: "alimentacion", date: "Hoy", emoji: "🛒" },
      { id: 3, desc: "Gasolina", amount: -600, type: "expense", category: "transporte", date: "Ayer", emoji: "⛽" },
      { id: 4, desc: "Curso Udemy", amount: -299, type: "expense", category: "educacion", date: "Ayer", emoji: "📚" },
      { id: 5, desc: "Freelance FastAPI — Cliente B", amount: 2800, type: "income", category: "freelance", date: "Lun", emoji: "💻" },
      { id: 6, desc: "Renta mensual", amount: -4500, type: "expense", category: "vivienda", date: "01 Feb", emoji: "🏠" },
      { id: 7, desc: "Netflix", amount: -199, type: "expense", category: "entretenimiento", date: "01 Feb", emoji: "📺" },
      { id: 8, desc: "Gym mensualidad", amount: -450, type: "expense", category: "salud", date: "01 Feb", emoji: "💪" },
    ],
    expenseByCategory: [
      { name: "Vivienda 🏠", amount: 4500, pct: 54, color: "#7C3AED" },
      { name: "Alimentación 🛒", amount: 850, pct: 10, color: "#10B981" },
      { name: "Transporte ⛽", amount: 600, pct: 7, color: "#F59E0B" },
      { name: "Educación 📚", amount: 299, pct: 4, color: "#06B6D4" },
      { name: "Entretenimiento 📺", amount: 199, pct: 2, color: "#EF4444" },
      { name: "Salud 💪", amount: 450, pct: 5, color: "#A78BFA" },
      { name: "Otros", amount: 1442, pct: 17, color: "#4A5568" },
    ],
    incomeByType: [
      { name: "Freelance 💻", amount: 9500, pct: 79, color: "#7C3AED" },
      { name: "Pasivos 📈", amount: 1500, pct: 13, color: "#10B981" },
      { name: "Otros", amount: 1000, pct: 8, color: "#F59E0B" },
    ],
  },
  shop: {
    items: [
      { id: 1, name: "Videojuegos 1h", category: "guilty_pleasure", icon: "🎮", coins: 100, money: 50, discCost: 5, xpCost: 50, cooldown: null },
      { id: 2, name: "Cheat Meal", category: "guilty_pleasure", icon: "🍔", coins: 150, money: 100, discCost: 8, xpCost: 80, cooldown: "5 días" },
      { id: 3, name: "Netflix 3h", category: "guilty_pleasure", icon: "📺", coins: 200, money: 150, discCost: 6, xpCost: 60, cooldown: null },
      { id: 4, name: "Día libre", category: "guilty_pleasure", icon: "😴", coins: 500, money: 300, discCost: 20, xpCost: 150, cooldown: "30 días" },
      { id: 5, name: "Fumar 🚬", category: "guilty_pleasure", icon: "🚬", coins: 0, money: 0, discCost: 30, xpCost: 200, cooldown: null, danger: true },
      { id: 6, name: "XP x2 — 24h", category: "power_up", icon: "⚡", coins: 300, money: 0, discCost: 0, xpCost: 0, cooldown: null },
      { id: 7, name: "Coins x1.5 — 24h", category: "power_up", icon: "🪙", coins: 250, money: 0, discCost: 0, xpCost: 0, cooldown: "2 días" },
      { id: 8, name: "Streak Freeze", category: "power_up", icon: "🧊", coins: 400, money: 0, discCost: 0, xpCost: 0, cooldown: null },
      { id: 9, name: "Skip tarea difícil", category: "power_up", icon: "⏭️", coins: 200, money: 0, discCost: 0, xpCost: 0, cooldown: null },
      { id: 10, name: "Badge: Leyenda", category: "reward", icon: "🏆", coins: 1000, money: 0, discCost: 0, xpCost: 0, cooldown: null },
      { id: 11, name: "Título: El Imparable", category: "reward", icon: "👑", coins: 600, money: 0, discCost: 0, xpCost: 0, cooldown: null },
      { id: 12, name: "Marco Dorado", category: "reward", icon: "✨", coins: 750, money: 0, discCost: 0, xpCost: 0, cooldown: null },
    ],
  },
};

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];
const MONTHS = ["Sep", "Oct", "Nov", "Dic", "Ene", "Feb"];
const priorityConfig = {
  high: { color: "#EF4444", bg: "rgba(239,68,68,0.15)", label: "Alta" },
  medium: { color: "#F59E0B", bg: "rgba(245,158,11,0.15)", label: "Media" },
  low: { color: "#10B981", bg: "rgba(16,185,129,0.15)", label: "Baja" },
};
const CATEGORY_COLORS = {
  freelance: "#7C3AED", alimentacion: "#10B981", transporte: "#F59E0B",
  educacion: "#06B6D4", entretenimiento: "#EF4444", salud: "#A78BFA", vivienda: "#F97316",
};
const NAV_ITEMS = [
  { icon: "⊞", label: "Dashboard" },
  { icon: "✓", label: "Tareas" },
  { icon: "🔄", label: "Hábitos" },
  { icon: "🎯", label: "Metas" },
  { icon: "💰", label: "Finanzas" },
  { icon: "📚", label: "Learning" },
  { icon: "💪", label: "Fitness" },
  { icon: "🥗", label: "Nutrición" },
  { icon: "🛒", label: "Shop" },
];

// ============================================================
// ESTILOS
// ============================================================
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;700;900&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: #0F0F1A; }
  ::-webkit-scrollbar-thumb { background: #7C3AED; border-radius: 2px; }
  @keyframes pulse-glow { 0%,100%{box-shadow:0 0 8px rgba(124,58,237,0.4)} 50%{box-shadow:0 0 20px rgba(124,58,237,0.8)} }
  @keyframes fadeSlide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
  @keyframes toastIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
  .page { animation: fadeSlide 0.3s ease both; }
  .nav-item { display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 8px;border-radius:10px;cursor:pointer;transition:all 0.2s;font-size:10px;color:#4A5568;border:1px solid transparent;font-family:'Rajdhani',sans-serif; }
  .nav-item:hover { color:#A78BFA;background:rgba(124,58,237,0.1); }
  .nav-item.active { color:#A78BFA;background:rgba(124,58,237,0.15);border-color:rgba(124,58,237,0.3);animation:pulse-glow 2s infinite; }
  .card { background:linear-gradient(135deg,#12121E 0%,#0F0F1A 100%);border:1px solid #1E1E30;border-radius:12px;transition:border-color 0.2s; }
  .card:hover { border-color:rgba(124,58,237,0.25); }
  .btn-primary { background:linear-gradient(135deg,#7C3AED,#5B21B6);border:none;border-radius:8px;color:white;padding:8px 16px;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:600;transition:all 0.15s; }
  .btn-primary:hover { transform:translateY(-1px);box-shadow:0 4px 12px rgba(124,58,237,0.4); }
  .btn-secondary { background:rgba(124,58,237,0.1);border:1px solid rgba(124,58,237,0.3);border-radius:8px;color:#A78BFA;padding:8px 16px;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:600;transition:all 0.15s; }
  .btn-secondary:hover { background:rgba(124,58,237,0.2); }
  .btn-success { background:linear-gradient(135deg,#059669,#10B981);border:none;border-radius:8px;color:white;padding:8px 16px;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:600;transition:all 0.15s; }
  .btn-success:hover { transform:translateY(-1px);box-shadow:0 4px 12px rgba(16,185,129,0.4); }
  .btn-danger { background:rgba(239,68,68,0.15);border:1px solid rgba(239,68,68,0.4);border-radius:8px;color:#EF4444;padding:8px 16px;cursor:pointer;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:600;transition:all 0.15s; }
  .btn-danger:hover { background:rgba(239,68,68,0.25); }
  .add-btn { width:100%;padding:7px;border-radius:8px;border:1px dashed #2D2D45;background:transparent;color:#4A5568;cursor:pointer;font-size:18px;transition:all 0.15s;margin-top:4px; }
  .add-btn:hover { border-color:#7C3AED;color:#A78BFA;background:rgba(124,58,237,0.05); }
  .section-title { font-family:'Orbitron',monospace;font-size:10px;letter-spacing:2px;color:#4A5568;text-transform:uppercase;margin-bottom:12px;display:flex;align-items:center;gap:8px; }
  .section-title::after { content:'';flex:1;height:1px;background:linear-gradient(90deg,#2D2D45,transparent); }
  .tag { font-size:10px;padding:2px 8px;border-radius:999px;font-weight:700; }
  .panel-tab { padding:4px 10px;border-radius:6px;font-size:11px;font-weight:700;cursor:pointer;border:1px solid transparent;transition:all 0.15s;font-family:'Rajdhani',sans-serif; }
  .panel-tab.active { background:rgba(124,58,237,0.2);border-color:rgba(124,58,237,0.4);color:#A78BFA; }
  .panel-tab:not(.active) { color:#4A5568; }
  .panel-tab:not(.active):hover { color:#A78BFA;background:rgba(124,58,237,0.07); }
  .exercise-row { display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;margin-bottom:6px;border:1px solid #1E1E30;cursor:pointer;transition:all 0.15s;background:#0F0F18; }
  .exercise-row:hover { border-color:rgba(124,58,237,0.3); }
  .food-chip { padding:8px 10px;border-radius:8px;background:#0F0F18;border:1px solid #1E1E30;cursor:pointer;transition:all 0.15s;font-family:'Rajdhani',sans-serif;display:flex;flex-direction:column;align-items:center;gap:2px; }
  .food-chip:hover { border-color:rgba(16,185,129,0.4);background:rgba(16,185,129,0.06);transform:translateY(-1px); }
  .txn-row { display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:8px;margin-bottom:6px;background:#0F0F18;border:1px solid #1E1E30;transition:all 0.15s;cursor:pointer; }
  .txn-row:hover { border-color:rgba(124,58,237,0.3); }
  .muscle-region { cursor:pointer;transition:filter 0.2s; }
  .muscle-region:hover { filter:brightness(1.3); }
  .routine-card { padding:14px;border-radius:10px;background:#0F0F18;border:1px solid #1E1E30;cursor:pointer;transition:all 0.15s; }
  .routine-card:hover { border-color:rgba(124,58,237,0.3);transform:translateY(-1px); }
  .barrel-card { padding:16px;border-radius:12px;background:#0F0F18;border:1px solid #1E1E30;transition:all 0.2s;cursor:pointer; }
  .barrel-card:hover { border-color:rgba(124,58,237,0.35);transform:translateY(-2px); }
  .toast { position:fixed;bottom:24px;right:24px;padding:12px 18px;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;z-index:1000;animation:toastIn 0.3s ease both; }
  .scanline { position:fixed;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(124,58,237,0.3),transparent);animation:scanline 8s linear infinite;pointer-events:none;z-index:999; }
  input, select { font-family:'Rajdhani',sans-serif;font-size:13px;background:#0F0F18;border:1px solid #2D2D45;border-radius:8px;color:#F1F5F9;padding:8px 12px;outline:none;transition:border-color 0.15s;width:100%; }
  input:focus, select:focus { border-color:#7C3AED; }
  input::placeholder { color:#4A5568; }
`;

// ============================================================
// UTILIDADES
// ============================================================
const ProgressBar = ({ value, max, color = "#7C3AED", height = 6 }) => (
  <div style={{ height, background: "#1A1A28", borderRadius: 999, overflow: "hidden" }}>
    <div style={{ width: `${Math.min((value / max) * 100, 100)}%`, height: "100%", borderRadius: 999, background: color, transition: "width 0.8s ease" }} />
  </div>
);

const Toast = ({ msg, color, onDone }) => {
  useEffect(() => { const t = setTimeout(onDone, 2800); return () => clearTimeout(t); }, []);
  return <div className="toast" style={{ background: `${color}22`, border: `1px solid ${color}55`, color }}>{msg}</div>;
};

// ============================================================
// MAPA DE CALOR CORPORAL SVG
// ============================================================
const BodyHeatMap = ({ data }) => {
  const [hovered, setHovered] = useState(null);
  const heatColor = (v) => {
    if (!v || v < 1) return "#1A1A28";
    if (v < 15) return "#1C2A4A"; if (v < 35) return "#312E81";
    if (v < 55) return "#6D28D9"; if (v < 72) return "#F59E0B";
    return "#EF4444";
  };
  const glow = (v) => {
    if (v >= 72) return "drop-shadow(0 0 4px rgba(239,68,68,0.7))";
    if (v >= 55) return "drop-shadow(0 0 4px rgba(245,158,11,0.6))";
    return "none";
  };
  const M = ({ shape, d: val, label, ...props }) => {
    const El = shape || "ellipse";
    return <El {...props} fill={heatColor(val)} stroke="#080810" strokeWidth="0.7"
      className="muscle-region" style={{ filter: glow(val) }}
      onMouseEnter={() => setHovered({ label, v: val })}
      onMouseLeave={() => setHovered(null)} />;
  };
  const { front: F, back: B } = data;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
      <div style={{ display: "flex", gap: 32, alignItems: "flex-start" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#4A5568", letterSpacing: 2, marginBottom: 6, fontFamily: "'Orbitron',monospace" }}>FRONTAL</div>
          <svg viewBox="0 0 100 210" width="105" height="210">
            <ellipse cx="50" cy="48" rx="22" ry="32" fill="#0D0D1A" stroke="#1E1E30" strokeWidth="1" />
            <ellipse cx="50" cy="118" rx="16" ry="24" fill="#0D0D1A" stroke="#1E1E30" strokeWidth="1" />
            <ellipse cx="38" cy="155" rx="12" ry="22" fill="#0D0D1A" stroke="#1E1E30" strokeWidth="1" />
            <ellipse cx="62" cy="155" rx="12" ry="22" fill="#0D0D1A" stroke="#1E1E30" strokeWidth="1" />
            <ellipse cx="50" cy="11" rx="10" ry="11" fill="#1A1A28" stroke="#2D2D45" strokeWidth="0.8" />
            <rect x="45" y="22" width="10" height="7" rx="2" fill="#1A1A28" />
            <M shape="ellipse" cx="50" cy="46" rx="18" ry="13" d={F.chest} label="Pecho" />
            <M shape="ellipse" cx="27" cy="38" rx="10" ry="7" d={F.frontDelts} label="Deltoides Ant." />
            <M shape="ellipse" cx="73" cy="38" rx="10" ry="7" d={F.frontDelts} label="Deltoides Ant." />
            <M shape="ellipse" cx="16" cy="62" rx="6" ry="13" d={F.biceps} label="Bíceps" />
            <M shape="ellipse" cx="84" cy="62" rx="6" ry="13" d={F.biceps} label="Bíceps" />
            <M shape="ellipse" cx="12" cy="87" rx="5" ry="12" d={F.forearms} label="Antebrazo" />
            <M shape="ellipse" cx="88" cy="87" rx="5" ry="12" d={F.forearms} label="Antebrazo" />
            <M shape="rect" x="42" y="59" width="16" height="25" rx="4" d={F.abs} label="Abdomen" />
            <M shape="ellipse" cx="33" cy="70" rx="8" ry="14" d={F.obliques} label="Oblicuos" />
            <M shape="ellipse" cx="67" cy="70" rx="8" ry="14" d={F.obliques} label="Oblicuos" />
            <M shape="ellipse" cx="40" cy="118" rx="13" ry="23" d={F.quads} label="Cuádriceps" />
            <M shape="ellipse" cx="60" cy="118" rx="13" ry="23" d={F.quads} label="Cuádriceps" />
            <M shape="ellipse" cx="38" cy="160" rx="9" ry="16" d={F.calves} label="Gemelos" />
            <M shape="ellipse" cx="62" cy="160" rx="9" ry="16" d={F.calves} label="Gemelos" />
          </svg>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#4A5568", letterSpacing: 2, marginBottom: 6, fontFamily: "'Orbitron',monospace" }}>POSTERIOR</div>
          <svg viewBox="0 0 100 210" width="105" height="210">
            <ellipse cx="50" cy="50" rx="22" ry="34" fill="#0D0D1A" stroke="#1E1E30" strokeWidth="1" />
            <ellipse cx="50" cy="105" rx="17" ry="18" fill="#0D0D1A" stroke="#1E1E30" strokeWidth="1" />
            <ellipse cx="38" cy="150" rx="12" ry="24" fill="#0D0D1A" stroke="#1E1E30" strokeWidth="1" />
            <ellipse cx="62" cy="150" rx="12" ry="24" fill="#0D0D1A" stroke="#1E1E30" strokeWidth="1" />
            <ellipse cx="50" cy="11" rx="10" ry="11" fill="#1A1A28" stroke="#2D2D45" strokeWidth="0.8" />
            <rect x="45" y="22" width="10" height="7" rx="2" fill="#1A1A28" />
            <M shape="ellipse" cx="50" cy="33" rx="20" ry="7" d={B.traps} label="Trapecio" />
            <M shape="ellipse" cx="50" cy="57" rx="21" ry="20" d={B.lats} label="Dorsales" />
            <M shape="ellipse" cx="16" cy="60" rx="6" ry="13" d={B.triceps} label="Tríceps" />
            <M shape="ellipse" cx="84" cy="60" rx="6" ry="13" d={B.triceps} label="Tríceps" />
            <M shape="ellipse" cx="12" cy="85" rx="5" ry="12" d={B.triceps} label="Antebrazo" />
            <M shape="ellipse" cx="88" cy="85" rx="5" ry="12" d={B.triceps} label="Antebrazo" />
            <M shape="rect" x="38" y="75" width="24" height="14" rx="4" d={B.lowerBack} label="Lumbar" />
            <M shape="ellipse" cx="40" cy="98" rx="14" ry="11" d={B.glutes} label="Glúteos" />
            <M shape="ellipse" cx="60" cy="98" rx="14" ry="11" d={B.glutes} label="Glúteos" />
            <M shape="ellipse" cx="39" cy="132" rx="12" ry="22" d={B.hamstrings} label="Isquiotibiales" />
            <M shape="ellipse" cx="61" cy="132" rx="12" ry="22" d={B.hamstrings} label="Isquiotibiales" />
            <M shape="ellipse" cx="38" cy="165" rx="9" ry="16" d={B.calvesBack} label="Gemelos" />
            <M shape="ellipse" cx="62" cy="165" rx="9" ry="16" d={B.calvesBack} label="Gemelos" />
          </svg>
        </div>
      </div>
      <div style={{ height: 28, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {hovered ? (
          <div style={{ padding: "4px 14px", borderRadius: 999, background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", fontSize: 12, color: "#A78BFA", fontWeight: 700 }}>
            {hovered.label} — <span style={{ color: hovered.v >= 72 ? "#EF4444" : hovered.v >= 55 ? "#F59E0B" : "#A78BFA" }}>{hovered.v}% activación</span>
          </div>
        ) : <div style={{ fontSize: 11, color: "#2D2D45" }}>Pasa el cursor sobre un músculo</div>}
      </div>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {[{ l: "Sin trabajo", c: "#1C2A4A" }, { l: "Bajo", c: "#312E81" }, { l: "Medio", c: "#6D28D9" }, { l: "Alto", c: "#F59E0B" }, { l: "Máximo", c: "#EF4444" }].map(x => (
          <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: x.c }} />
            <span style={{ fontSize: 10, color: "#64748B" }}>{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// MINI PANELS DASHBOARD
// ============================================================
const DashPanelFitness = ({ exercises, setExercises }) => {
  const done = exercises.filter(e => e.done).length;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontSize: 13, color: "#CBD5E1", fontWeight: 600 }}>Push Day</span>
        <span style={{ fontSize: 12, color: "#A78BFA" }}>{done}/{exercises.length}</span>
      </div>
      <ProgressBar value={done} max={exercises.length} color="#EF4444" height={4} />
      <div style={{ display: "flex", gap: 5 }}>
        {mockData.fitness.weekWorkouts.map((t, i) => (
          <div key={i} style={{ flex: 1, height: 26, borderRadius: 5, background: t ? "rgba(239,68,68,0.2)" : "#1A1A28", border: `1px solid ${t ? "#EF4444" : "#2D2D45"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11 }}>{t ? "🔥" : ""}</div>
        ))}
      </div>
      {exercises.slice(0, 3).map((ex, i) => (
        <div key={i} onClick={() => setExercises(p => p.map((e, idx) => idx === i ? { ...e, done: !e.done } : e))}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 10px", borderRadius: 7, background: "#0F0F18", border: "1px solid #1E1E30", cursor: "pointer", opacity: ex.done ? 0.5 : 1 }}>
          <div style={{ width: 15, height: 15, borderRadius: 4, border: `2px solid ${ex.done ? "#EF4444" : "#374151"}`, background: ex.done ? "#EF4444" : "transparent", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{ex.done && "✓"}</div>
          <span style={{ flex: 1, fontSize: 12, color: "#E2E8F0" }}>{ex.name}</span>
          <span style={{ fontSize: 10, color: "#64748B" }}>{ex.sets}×{ex.reps}</span>
        </div>
      ))}
    </div>
  );
};

const DashPanelNutricion = () => {
  const n = mockData.nutrition;
  const pct = (n.calories.consumed / n.calories.goal) * 100;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ position: "relative", flexShrink: 0 }}>
          <svg width="68" height="68" viewBox="0 0 68 68">
            <circle cx="34" cy="34" r="27" fill="none" stroke="#1E1E30" strokeWidth="7" />
            <circle cx="34" cy="34" r="27" fill="none" stroke="#10B981" strokeWidth="7"
              strokeDasharray={`${2 * Math.PI * 27 * pct / 100} ${2 * Math.PI * 27}`} strokeLinecap="round" transform="rotate(-90 34 34)" />
          </svg>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
            <div style={{ fontSize: 13, fontWeight: 900, fontFamily: "'Orbitron',monospace", color: "#F1F5F9" }}>{n.calories.consumed}</div>
            <div style={{ fontSize: 8, color: "#64748B" }}>kcal</div>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {Object.entries(n.macros).map(([k, v]) => {
            const c = { protein: "#7C3AED", carbs: "#06B6D4", fat: "#F59E0B" };
            return <div key={k} style={{ marginBottom: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                <span style={{ color: "#94A3B8", textTransform: "capitalize" }}>{k}</span>
                <span style={{ color: c[k] }}>{v.consumed}g</span>
              </div>
              <ProgressBar value={v.consumed} max={v.goal} color={c[k]} height={3} />
            </div>;
          })}
        </div>
      </div>
      <div style={{ padding: "7px 10px", borderRadius: 7, background: "#0F0F18", border: "1px solid #1E1E30", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 12, color: "#94A3B8" }}>💧 Agua</span>
        <div style={{ flex: 1, margin: "0 10px" }}><ProgressBar value={n.water.consumed} max={n.water.goal} color="#06B6D4" height={3} /></div>
        <span style={{ fontSize: 12, color: "#06B6D4", fontWeight: 700 }}>{n.water.consumed}/{n.water.goal}L</span>
      </div>
      {n.meals.slice(0, 2).map(meal => (
        <div key={meal.id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderRadius: 7, background: "#0F0F18", border: "1px solid #1E1E30" }}>
          <div><div style={{ fontSize: 12, color: "#F1F5F9", fontWeight: 600 }}>{meal.name}</div><div style={{ fontSize: 10, color: "#64748B" }}>{meal.foods[0]}</div></div>
          <span style={{ fontSize: 12, color: "#F59E0B", fontWeight: 700 }}>🔥{meal.calories}</span>
        </div>
      ))}
    </div>
  );
};

const DashPanelLearning = () => {
  const l = mockData.learning;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color: "#A78BFA" }}>{l.todayMinutes}m</div>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
            <span style={{ color: "#64748B" }}>Estudio hoy</span>
            <span style={{ color: "#A78BFA" }}>Meta: {l.todayGoal}m</span>
          </div>
          <ProgressBar value={l.todayMinutes} max={l.todayGoal} color="#7C3AED" height={4} />
        </div>
      </div>
      {l.courses.slice(0, 2).map(c => (
        <div key={c.id} style={{ padding: "8px 10px", borderRadius: 7, background: "#0F0F18", border: "1px solid #1E1E30" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: "#F1F5F9", fontWeight: 600 }}>{c.icon} {c.name}</span>
            <span style={{ fontSize: 11, color: c.color, fontWeight: 700 }}>{c.progress}%</span>
          </div>
          <ProgressBar value={c.progress} max={100} color={c.color} height={3} />
        </div>
      ))}
      <div style={{ display: "flex", gap: 5 }}>
        {l.weekStudy.map((m, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <div style={{ width: "100%", height: 36, background: "#1A1A28", borderRadius: 3, display: "flex", alignItems: "flex-end" }}>
              <div style={{ width: "100%", height: `${(m / 120) * 100}%`, borderRadius: 3, background: m > 0 ? "#7C3AED" : "#1A1A28" }} />
            </div>
            <span style={{ fontSize: 8, color: "#4A5568" }}>{DAYS[i]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DashPanelFinanzas = () => {
  const f = mockData.finance;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 7 }}>
        {[
          { label: "Balance", value: `$${(f.balance / 1000).toFixed(1)}k`, color: "#F1F5F9", icon: "💳" },
          { label: "Ingresos", value: `+$${(f.monthIncome / 1000).toFixed(1)}k`, color: "#10B981", icon: "📈" },
          { label: "Gastos", value: `-$${(f.monthExpense / 1000).toFixed(1)}k`, color: "#EF4444", icon: "📉" },
        ].map((s, i) => (
          <div key={i} style={{ padding: "7px 8px", borderRadius: 7, background: "#0F0F18", border: "1px solid #1E1E30", textAlign: "center" }}>
            <div style={{ fontSize: 14 }}>{s.icon}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 9, color: "#64748B" }}>{s.label}</div>
          </div>
        ))}
      </div>
      {f.barrels.slice(0, 2).map(b => (
        <div key={b.name} style={{ padding: "7px 10px", borderRadius: 7, background: "#0F0F18", border: "1px solid #1E1E30" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: 12, color: "#F1F5F9", fontWeight: 600 }}>{b.name}</span>
            <span style={{ fontSize: 10, color: b.color, fontWeight: 700 }}>{Math.round((b.current / b.goal) * 100)}%</span>
          </div>
          <ProgressBar value={b.current} max={b.goal} color={b.color} height={3} />
        </div>
      ))}
      {f.transactions.slice(0, 2).map((t, i) => (
        <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 10px", borderRadius: 7, background: "#0F0F18", border: "1px solid #1E1E30" }}>
          <span style={{ fontSize: 11, color: "#94A3B8" }}>{t.emoji} {t.desc}</span>
          <span style={{ fontSize: 11, fontWeight: 700, color: t.type === "income" ? "#10B981" : "#EF4444" }}>
            {t.type === "income" ? "+" : ""}${Math.abs(t.amount).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
};

// ============================================================
// DASHBOARD
// ============================================================
const PANEL_MODULES = [
  { key: "fitness", label: "💪 Fitness" },
  { key: "nutricion", label: "🥗 Nutrición" },
  { key: "learning", label: "📚 Learning" },
  { key: "finanzas", label: "💰 Finanzas" },
];

const DashboardPage = ({ tasks, setTasks, habits, setHabits, game }) => {
  const [panelModule, setPanelModule] = useState("fitness");
  const [exercises, setExercises] = useState(mockData.fitness.todayRoutine.exercises);
  const doneTasks = tasks.filter(t => t.done).length;
  const doneHabits = habits.filter(h => h.done).length;
  const renderPanel = () => {
    switch (panelModule) {
      case "fitness": return <DashPanelFitness exercises={exercises} setExercises={setExercises} />;
      case "nutricion": return <DashPanelNutricion />;
      case "learning": return <DashPanelLearning />;
      case "finanzas": return <DashPanelFinanzas />;
      default: return null;
    }
  };
  return (
    <div className="page" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gap: 16 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card" style={{ padding: 18 }}>
          <div className="section-title">📊 Progreso Semanal</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80 }}>
            {mockData.weekProgress.map((v, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <div style={{ flex: 1, width: "100%", background: "#1A1A28", borderRadius: 4, display: "flex", alignItems: "flex-end" }}>
                  <div style={{ width: "100%", height: `${v}%`, borderRadius: 4, background: i === 6 ? "linear-gradient(0deg,#7C3AED,#A78BFA)" : "#2D2D45" }} />
                </div>
                <span style={{ fontSize: 10, color: i === 6 ? "#A78BFA" : "#4A5568" }}>{DAYS[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card" style={{ padding: 18, flex: 1 }}>
          <div className="section-title">🎯 Meta Principal</div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: "#F1F5F9" }}>{mockData.goal.name}</div>
          <ProgressBar value={mockData.goal.current} max={mockData.goal.target} color="linear-gradient(90deg,#06B6D4,#7C3AED)" height={10} />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 8 }}>
            <span style={{ color: "#10B981", fontWeight: 700 }}>${mockData.goal.current.toLocaleString()}</span>
            <span style={{ color: "#4A5568" }}>${mockData.goal.target.toLocaleString()} MXN</span>
          </div>
          <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 8, background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", fontSize: 12, color: "#67E8F9" }}>
            🤖 A este ritmo lo logras en <strong>8 meses</strong>. Ahorra $3,000 más/mes para reducirlo a 6.
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[
            { label: "Tareas Hoy", value: `${doneTasks}/${tasks.length}`, icon: "✓", color: "#7C3AED" },
            { label: "Hábitos Hoy", value: `${doneHabits}/${habits.length}`, icon: "🔄", color: "#10B981" },
            { label: "Disciplina", value: `${game.disciplina}%`, icon: "🛡️", color: game.disciplina > 60 ? "#06B6D4" : game.disciplina > 30 ? "#F59E0B" : "#EF4444" },
            { label: "Racha Global", value: `${game.streak}d`, icon: "🔥", color: "#EF4444" },
          ].map((s, i) => (
            <div key={i} className="card" style={{ padding: "14px 16px", borderLeft: `3px solid ${s.color}` }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 11, color: "#64748B" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="card" style={{ padding: 18, flex: 1 }}>
          <div style={{ display: "flex", gap: 5, marginBottom: 14, flexWrap: "wrap" }}>
            {PANEL_MODULES.map(m => (
              <button key={m.key} className={`panel-tab ${panelModule === m.key ? "active" : ""}`} onClick={() => setPanelModule(m.key)}>{m.label}</button>
            ))}
          </div>
          <div key={panelModule} style={{ animation: "fadeSlide 0.25s ease both" }}>{renderPanel()}</div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div className="card" style={{ padding: 16 }}>
          <div className="section-title">✓ Tareas de Hoy</div>
          {tasks.map(task => {
            const p = priorityConfig[task.priority];
            return (
              <div key={task.id} onClick={() => setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: !t.done } : t))}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px", borderRadius: 8, cursor: "pointer", marginBottom: 6, opacity: task.done ? 0.5 : 1 }}>
                <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${task.done ? "#7C3AED" : p.color}`, background: task.done ? "#7C3AED" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0 }}>{task.done && "✓"}</div>
                <span style={{ flex: 1, fontSize: 13, color: "#E2E8F0", textDecoration: task.done ? "line-through" : "none" }}>{task.title}</span>
                <span className="tag" style={{ background: p.bg, color: p.color }}>{p.label}</span>
              </div>
            );
          })}
          <button className="add-btn">+</button>
        </div>
        <div className="card" style={{ padding: 16, flex: 1 }}>
          <div className="section-title">🔄 Hábitos de Hoy</div>
          {habits.map(habit => (
            <div key={habit.id} onClick={() => setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, done: !h.done } : h))}
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px", borderRadius: 8, cursor: "pointer", marginBottom: 6, opacity: habit.done ? 0.6 : 1 }}>
              <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${habit.done ? "#10B981" : "#374151"}`, background: habit.done ? "#10B981" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0 }}>{habit.done && "✓"}</div>
              <span style={{ flex: 1, fontSize: 13, color: "#E2E8F0", textDecoration: habit.done ? "line-through" : "none" }}>{habit.name}</span>
              <span style={{ fontSize: 11, color: "#EF4444", fontWeight: 700 }}>🔥{habit.streak}d</span>
            </div>
          ))}
          <button className="add-btn">+</button>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PÁGINA: FINANZAS
// ============================================================
const FinanzasPage = () => {
  const [tab, setTab] = useState("resumen");
  const [txnType, setTxnType] = useState("all");
  const f = mockData.finance;

  // Form state para nueva transacción
  const [form, setForm] = useState({ desc: "", amount: "", type: "income", category: "freelance" });
  const [txns, setTxns] = useState(f.transactions);
  const [toast, setToast] = useState(null);

  const addTxn = () => {
    if (!form.desc || !form.amount) return;
    const newTxn = { id: Date.now(), desc: form.desc, amount: form.type === "income" ? parseFloat(form.amount) : -parseFloat(form.amount), type: form.type, category: form.category, date: "Ahora", emoji: form.type === "income" ? "💰" : "💸" };
    setTxns(p => [newTxn, ...p]);
    setForm({ desc: "", amount: "", type: "income", category: "freelance" });
    setToast({ msg: `${form.type === "income" ? "💰 Ingreso" : "💸 Gasto"} registrado: $${form.amount}`, color: form.type === "income" ? "#10B981" : "#EF4444" });
  };

  const filteredTxns = txnType === "all" ? txns : txns.filter(t => t.type === txnType);
  const maxBar = Math.max(...f.monthlyHistory.map(m => m.income));

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {toast && <Toast msg={toast.msg} color={toast.color} onDone={() => setToast(null)} />}

      {/* Stats header */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Balance actual", value: `$${f.balance.toLocaleString()}`, icon: "💳", color: "#F1F5F9", sub: "MXN" },
          { label: "Ingresos Feb", value: `$${f.monthIncome.toLocaleString()}`, icon: "📈", color: "#10B981", sub: "+12% vs Ene" },
          { label: "Gastos Feb", value: `$${f.monthExpense.toLocaleString()}`, icon: "📉", color: "#EF4444", sub: "-2% vs Ene" },
          { label: "Tasa de ahorro", value: `${f.savingsRate}%`, icon: "🏦", color: "#06B6D4", sub: `$${(f.monthIncome - f.monthExpense).toLocaleString()} guardados` },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: "16px 18px", borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: s.color, marginTop: 2, opacity: 0.7 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { key: "resumen", label: "📊 Resumen" },
          { key: "barriles", label: "🪣 Barriles" },
          { key: "transacciones", label: "📋 Transacciones" },
          { key: "graficas", label: "📈 Gráficas" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={tab === t.key ? "btn-primary" : "btn-secondary"} style={{ fontSize: 13 }}>{t.label}</button>
        ))}
      </div>

      {/* ── RESUMEN ── */}
      {tab === "resumen" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {/* Historial mensual */}
          <div className="card" style={{ padding: 18 }}>
            <div className="section-title">📅 Historial Mensual</div>
            {f.monthlyHistory.map((m, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                  <span style={{ color: "#CBD5E1", fontWeight: 600 }}>{m.month}</span>
                  <div style={{ display: "flex", gap: 10 }}>
                    <span style={{ color: "#10B981" }}>+${m.income.toLocaleString()}</span>
                    <span style={{ color: "#EF4444" }}>-${m.expense.toLocaleString()}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 4, height: 6, borderRadius: 999, overflow: "hidden", background: "#1A1A28" }}>
                  <div style={{ width: `${(m.income / maxBar) * 100}%`, background: "#10B981", borderRadius: 999 }} />
                </div>
                <div style={{ display: "flex", gap: 4, height: 4, borderRadius: 999, overflow: "hidden", background: "#1A1A28", marginTop: 2 }}>
                  <div style={{ width: `${(m.expense / maxBar) * 100}%`, background: "#EF4444", borderRadius: 999 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Breakdown gastos */}
          <div className="card" style={{ padding: 18 }}>
            <div className="section-title">💸 Gastos por Categoría</div>
            {f.expenseByCategory.map((cat, i) => (
              <div key={i} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                  <span style={{ color: "#CBD5E1" }}>{cat.name}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{ color: cat.color, fontWeight: 700 }}>{cat.pct}%</span>
                    <span style={{ color: "#64748B" }}>${cat.amount.toLocaleString()}</span>
                  </div>
                </div>
                <ProgressBar value={cat.pct} max={100} color={cat.color} height={5} />
              </div>
            ))}
          </div>

          {/* Ingresos + IA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ padding: 18 }}>
              <div className="section-title">💰 Ingresos por Tipo</div>
              {f.incomeByType.map((inc, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "#CBD5E1" }}>{inc.name}</span>
                    <div style={{ display: "flex", gap: 8 }}>
                      <span style={{ color: inc.color, fontWeight: 700 }}>{inc.pct}%</span>
                      <span style={{ color: "#64748B" }}>${inc.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <ProgressBar value={inc.pct} max={100} color={inc.color} height={5} />
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: 18, flex: 1 }}>
              <div className="section-title">🤖 Análisis IA</div>
              {[
                { icon: "🟢", msg: "Ahorraste 31% este mes — por encima de la meta del 20%." },
                { icon: "🟡", msg: "Vivienda consume 54% del gasto. Considera bajar a máx 40%." },
                { icon: "💡", msg: "Con $1,000 extra/mes en freelance llegarías al Auto en 5 meses." },
                { icon: "🔴", msg: "En noviembre el ahorro cayó a $700 — revisa patrones de ese mes." },
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: "1px solid #1A1A28", fontSize: 12 }}>
                  <span style={{ flexShrink: 0 }}>{tip.icon}</span>
                  <span style={{ color: "#94A3B8", lineHeight: 1.5 }}>{tip.msg}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── BARRILES ── */}
      {tab === "barriles" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {f.barrels.map(b => {
            const pct = (b.current / b.goal) * 100;
            const remaining = b.goal - b.current;
            const months = Math.ceil(remaining / b.monthly);
            return (
              <div key={b.id} className="barrel-card" style={{ borderTop: `3px solid ${b.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontSize: 32 }}>{b.emoji}</div>
                    <div style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9", marginTop: 6 }}>{b.name}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 900, color: b.color }}>{Math.round(pct)}%</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{months} meses restantes</div>
                  </div>
                </div>
                <ProgressBar value={b.current} max={b.goal} color={b.color} height={10} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginTop: 8, marginBottom: 16 }}>
                  <span style={{ color: b.color, fontWeight: 700 }}>${b.current.toLocaleString()}</span>
                  <span style={{ color: "#4A5568" }}>meta: ${b.goal.toLocaleString()}</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {[
                    { label: "Aportación mensual", value: `$${b.monthly.toLocaleString()}`, color: b.color },
                    { label: "Faltante", value: `$${remaining.toLocaleString()}`, color: "#64748B" },
                  ].map((s, i) => (
                    <div key={i} style={{ padding: "8px 10px", borderRadius: 8, background: "#080810", border: "1px solid #1A1A28" }}>
                      <div style={{ fontSize: 10, color: "#4A5568", marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>
                <button className="btn-primary" style={{ width: "100%", fontSize: 12 }}>+ Abonar al barril</button>
              </div>
            );
          })}
          <div className="card" style={{ padding: 18, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #2D2D45", background: "transparent", cursor: "pointer" }}>
            <div style={{ textAlign: "center", color: "#4A5568" }}><div style={{ fontSize: 32, marginBottom: 8 }}>+</div><div style={{ fontSize: 13 }}>Nuevo barril de ahorro</div></div>
          </div>
        </div>
      )}

      {/* ── TRANSACCIONES ── */}
      {tab === "transacciones" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
          {/* Lista */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>📋 Movimientos</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[{ k: "all", l: "Todos" }, { k: "income", l: "💰 Ingresos" }, { k: "expense", l: "💸 Gastos" }].map(t => (
                  <button key={t.k} onClick={() => setTxnType(t.k)} className={txnType === t.k ? "btn-primary" : "btn-secondary"} style={{ fontSize: 11, padding: "4px 10px" }}>{t.l}</button>
                ))}
              </div>
            </div>
            {filteredTxns.map((t, i) => (
              <div key={i} className="txn-row">
                <div style={{ width: 36, height: 36, borderRadius: 10, background: `${CATEGORY_COLORS[t.category] || "#4A5568"}20`, border: `1px solid ${CATEGORY_COLORS[t.category] || "#4A5568"}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{t.emoji}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#F1F5F9", fontWeight: 600 }}>{t.desc}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 2 }}>
                    <span className="tag" style={{ background: `${CATEGORY_COLORS[t.category] || "#4A5568"}20`, color: CATEGORY_COLORS[t.category] || "#64748B" }}>{t.category}</span>
                    <span style={{ fontSize: 10, color: "#64748B" }}>{t.date}</span>
                  </div>
                </div>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: t.type === "income" ? "#10B981" : "#EF4444" }}>
                  {t.type === "income" ? "+" : "-"}${Math.abs(t.amount).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          {/* Formulario nuevo ingreso/gasto */}
          <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="section-title">+ Registrar Movimiento</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ k: "income", l: "💰 Ingreso" }, { k: "expense", l: "💸 Gasto" }].map(t => (
                <button key={t.k} onClick={() => setForm(f => ({ ...f, type: t.k }))}
                  style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${form.type === t.k ? (t.k === "income" ? "#10B981" : "#EF4444") : "#2D2D45"}`, background: form.type === t.k ? (t.k === "income" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)") : "#0F0F18", color: form.type === t.k ? (t.k === "income" ? "#10B981" : "#EF4444") : "#64748B", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13 }}>
                  {t.l}
                </button>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>Descripción</div>
              <input placeholder="Ej. Freelance cliente A" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>Monto (MXN)</div>
              <input type="number" placeholder="0.00" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>Categoría</div>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {form.type === "income"
                  ? [["freelance", "💻 Freelance"], ["pasivo", "📈 Ingreso pasivo"], ["salario", "💼 Salario"], ["otro", "🔹 Otro"]]
                  : [["alimentacion", "🛒 Alimentación"], ["vivienda", "🏠 Vivienda"], ["transporte", "⛽ Transporte"], ["educacion", "📚 Educación"], ["entretenimiento", "📺 Entretenimiento"], ["salud", "💪 Salud"], ["otro", "🔹 Otro"]]
                  .map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </div>
            <button onClick={addTxn} className={form.type === "income" ? "btn-success" : "btn-danger"} style={{ width: "100%", marginTop: 4 }}>
              {form.type === "income" ? "💰 Registrar Ingreso" : "💸 Registrar Gasto"}
            </button>
            <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.15)", fontSize: 11, color: "#67E8F9" }}>
              💡 Registrar cada movimiento alimenta el análisis de IA para darte mejores consejos de ahorro.
            </div>
          </div>
        </div>
      )}

      {/* ── GRÁFICAS ── */}
      {tab === "graficas" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Barras ingresos vs gastos */}
          <div className="card" style={{ padding: 18 }}>
            <div className="section-title">📊 Ingresos vs Gastos — 6 meses</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160, padding: "0 4px" }}>
              {f.monthlyHistory.map((m, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", height: 140 }}>
                    <div style={{ flex: 1, background: "#10B981", borderRadius: "4px 4px 0 0", height: `${(m.income / maxBar) * 130}px`, minHeight: 4, boxShadow: "0 0 6px rgba(16,185,129,0.4)" }} />
                    <div style={{ flex: 1, background: "#EF4444", borderRadius: "4px 4px 0 0", height: `${(m.expense / maxBar) * 130}px`, minHeight: 4 }} />
                  </div>
                  <span style={{ fontSize: 10, color: i === 5 ? "#A78BFA" : "#4A5568", fontWeight: i === 5 ? 700 : 400 }}>{m.month}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 14, marginTop: 8 }}>
              {[{ c: "#10B981", l: "Ingresos" }, { c: "#EF4444", l: "Gastos" }].map(x => (
                <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: x.c }} />
                  <span style={{ fontSize: 11, color: "#64748B" }}>{x.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Ahorro mensual */}
          <div className="card" style={{ padding: 18 }}>
            <div className="section-title">🏦 Ahorro Mensual</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160, padding: "0 4px" }}>
              {f.monthlyHistory.map((m, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: "100%", height: 140, display: "flex", alignItems: "flex-end" }}>
                    <div style={{ width: "100%", background: m.savings > 2000 ? "#10B981" : m.savings > 0 ? "#F59E0B" : "#EF4444", borderRadius: "4px 4px 0 0", height: `${Math.max((m.savings / 4500) * 130, 4)}px`, boxShadow: m.savings > 2000 ? "0 0 6px rgba(16,185,129,0.4)" : "none" }} />
                  </div>
                  <span style={{ fontSize: 10, color: i === 5 ? "#A78BFA" : "#4A5568", fontWeight: i === 5 ? 700 : 400 }}>{m.month}</span>
                  <span style={{ fontSize: 9, color: m.savings > 2000 ? "#10B981" : m.savings > 0 ? "#F59E0B" : "#EF4444" }}>${(m.savings / 1000).toFixed(1)}k</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, padding: "8px 12px", borderRadius: 8, background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.15)", fontSize: 11, color: "#6EE7B7" }}>
              💡 Promedio de ahorro: <strong>${Math.round(f.monthlyHistory.reduce((a, m) => a + m.savings, 0) / f.monthlyHistory.length).toLocaleString()}/mes</strong>
            </div>
          </div>

          {/* Proyección barril auto */}
          <div className="card" style={{ padding: 18 }}>
            <div className="section-title">🚗 Proyección — Auto</div>
            {(() => {
              const barrel = f.barrels[0];
              const months = 12;
              const projected = Array.from({ length: months + 1 }, (_, i) => ({
                month: i, value: Math.min(barrel.current + barrel.monthly * i, barrel.goal)
              }));
              const maxVal = barrel.goal;
              return (
                <>
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 110 }}>
                    {projected.filter((_, i) => i % 2 === 0).map((p, i) => (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                        <div style={{ width: "100%", height: 90, display: "flex", alignItems: "flex-end" }}>
                          <div style={{ width: "100%", height: `${(p.value / maxVal) * 86}px`, borderRadius: "3px 3px 0 0", background: p.value >= barrel.goal ? "#10B981" : "linear-gradient(0deg,#7C3AED,#A78BFA)" }} />
                        </div>
                        <span style={{ fontSize: 8, color: "#4A5568" }}>{p.month === 0 ? "Hoy" : `+${p.month}m`}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 12, color: "#A78BFA" }}>
                    Alcanzas la meta en <strong style={{ color: "#10B981" }}>~{Math.ceil((barrel.goal - barrel.current) / barrel.monthly)} meses</strong> aportando ${barrel.monthly.toLocaleString()}/mes
                  </div>
                </>
              );
            })()}
          </div>

          {/* Distribución de gastos — visual */}
          <div className="card" style={{ padding: 18 }}>
            <div className="section-title">🍕 Distribución de Gastos</div>
            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
              <div style={{ position: "relative", flexShrink: 0 }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  {(() => {
                    let offset = 0;
                    const total = f.expenseByCategory.reduce((a, c) => a + c.amount, 0);
                    const r = 44; const circ = 2 * Math.PI * r;
                    return f.expenseByCategory.map((cat, i) => {
                      const pct = cat.amount / total;
                      const dash = circ * pct;
                      const el = (
                        <circle key={i} cx="60" cy="60" r={r} fill="none" stroke={cat.color} strokeWidth="20"
                          strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset}
                          transform="rotate(-90 60 60)" />
                      );
                      offset += dash;
                      return el;
                    });
                  })()}
                  <circle cx="60" cy="60" r="34" fill="#0F0F18" />
                  <text x="60" y="55" textAnchor="middle" fill="#F1F5F9" fontSize="10" fontFamily="Orbitron,monospace" fontWeight="700">GASTOS</text>
                  <text x="60" y="70" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="Rajdhani,sans-serif">${(f.monthExpense / 1000).toFixed(1)}k</text>
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                {f.expenseByCategory.map((cat, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", fontSize: 11 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: cat.color, flexShrink: 0 }} />
                      <span style={{ color: "#94A3B8" }}>{cat.name}</span>
                    </div>
                    <span style={{ color: cat.color, fontWeight: 700 }}>{cat.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// PÁGINA: NUTRICIÓN (tabs reducidos — Hoy + Rápido unidos)
// ============================================================
const NutricionPage = () => {
  const [tab, setTab] = useState("hoy");
  const [water, setWater] = useState(mockData.nutrition.water.consumed);
  const [addedFoods, setAddedFoods] = useState([]);
  const n = mockData.nutrition;
  const calPct = (n.calories.consumed / n.calories.goal) * 100;
  const macroColors = { protein: "#7C3AED", carbs: "#06B6D4", fat: "#F59E0B" };
  const total = addedFoods.reduce((a, f) => ({ cal: a.cal + f.cal, p: a.p + f.p, c: a.c + f.c, fa: a.fa + f.f }), { cal: 0, p: 0, c: 0, fa: 0 });

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "flex", gap: 8 }}>
        {[{ key: "hoy", label: "📊 Resumen + Registro" }, { key: "comidas", label: "🍽️ Comidas" }, { key: "recetas", label: "👨‍🍳 Recetas" }].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} className={tab === t.key ? "btn-primary" : "btn-secondary"} style={{ fontSize: 13 }}>{t.label}</button>
        ))}
      </div>

      {/* ── RESUMEN + REGISTRO RÁPIDO (UNIFICADO) ── */}
      {tab === "hoy" && (
        <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 280px", gap: 16 }}>
          {/* Col 1 — Anillos y agua */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ padding: 16 }}>
              <div className="section-title">🔥 Calorías</div>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, position: "relative" }}>
                <svg width="120" height="120" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#1E1E30" strokeWidth="12" />
                  <circle cx="60" cy="60" r="50" fill="none" stroke="#7C3AED" strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 50 * calPct / 100} ${2 * Math.PI * 50}`}
                    strokeLinecap="round" transform="rotate(-90 60 60)" />
                </svg>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 900, color: "#F1F5F9" }}>{n.calories.consumed}</div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>/ {n.calories.goal}</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {Object.entries(n.macros).map(([k, v]) => (
                  <div key={k}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                      <span style={{ color: "#64748B", textTransform: "capitalize" }}>{k}</span>
                      <span style={{ color: macroColors[k], fontWeight: 700 }}>{v.consumed}g</span>
                    </div>
                    <ProgressBar value={v.consumed} max={v.goal} color={macroColors[k]} height={4} />
                  </div>
                ))}
              </div>
            </div>
            <div className="card" style={{ padding: 16 }}>
              <div className="section-title">💧 Agua</div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 900, color: "#06B6D4", textAlign: "center", marginBottom: 8 }}>{water.toFixed(1)}L</div>
              <ProgressBar value={water} max={n.water.goal} color="#06B6D4" height={8} />
              <div style={{ display: "flex", gap: 5, marginTop: 10 }}>
                {[0.25, 0.5, 1.0].map(a => <button key={a} className="btn-secondary" style={{ flex: 1, fontSize: 11, padding: "5px 4px" }} onClick={() => setWater(w => Math.min(w + a, n.water.goal))}>+{a}L</button>)}
              </div>
            </div>
          </div>

          {/* Col 2 — Registro rápido */}
          <div className="card" style={{ padding: 18 }}>
            <div className="section-title">⚡ Registro Rápido</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
              {n.quickFoods.map(food => (
                <div key={food.id} className="food-chip" onClick={() => setAddedFoods(p => [...p, food])}>
                  <span style={{ fontSize: 22 }}>{food.emoji}</span>
                  <span style={{ fontSize: 11, color: "#F1F5F9", fontWeight: 600, textAlign: "center" }}>{food.name}</span>
                  <span style={{ fontSize: 10, color: "#F59E0B" }}>🔥 {food.cal}</span>
                  <div style={{ display: "flex", gap: 3, fontSize: 9 }}>
                    <span style={{ color: "#7C3AED" }}>P:{food.p}g</span>
                    <span style={{ color: "#06B6D4" }}>C:{food.c}g</span>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-secondary" style={{ marginTop: 12, fontSize: 12 }}>🔍 Buscar alimento</button>
          </div>

          {/* Col 3 — Carrito de lo agregado */}
          <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column" }}>
            <div className="section-title">📋 Seleccionado</div>
            {addedFoods.length === 0
              ? <div style={{ color: "#4A5568", fontSize: 12, textAlign: "center", padding: "20px 0", flex: 1 }}>Toca un alimento ↑ para agregarlo</div>
              : <div style={{ flex: 1, overflowY: "auto" }}>
                {addedFoods.map((f, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid #1A1A28" }}>
                    <div><span style={{ fontSize: 14 }}>{f.emoji}</span> <span style={{ fontSize: 12, color: "#F1F5F9" }}>{f.name}</span></div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 11, color: "#F59E0B" }}>{f.cal} kcal</span>
                      <span onClick={() => setAddedFoods(p => p.filter((_, idx) => idx !== i))} style={{ fontSize: 12, color: "#EF4444", cursor: "pointer", fontWeight: 700, padding: "0 4px" }}>✕</span>
                    </div>
                  </div>
                ))}
              </div>}
            {addedFoods.length > 0 && (
              <div style={{ marginTop: 12, padding: "10px", borderRadius: 8, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, fontSize: 12, marginBottom: 10 }}>
                  <span style={{ color: "#F59E0B" }}>🔥 {total.cal} kcal</span>
                  <span style={{ color: "#7C3AED" }}>P: {total.p.toFixed(1)}g</span>
                  <span style={{ color: "#06B6D4" }}>C: {total.c.toFixed(1)}g</span>
                  <span style={{ color: "#F59E0B" }}>G: {total.fa.toFixed(1)}g</span>
                </div>
                <button className="btn-success" style={{ width: "100%", fontSize: 12 }}>✓ Guardar en comidas</button>
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "comidas" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {n.meals.map(meal => (
            <div key={meal.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <div><span style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9" }}>{meal.name}</span> <span style={{ fontSize: 11, color: "#64748B" }}>🕐 {meal.time}</span></div>
                <span style={{ fontSize: 14, color: "#F59E0B", fontWeight: 700 }}>🔥 {meal.calories} kcal</span>
              </div>
              {meal.foods.map((f, i) => <div key={i} style={{ fontSize: 12, color: "#94A3B8", padding: "4px 0", borderBottom: "1px solid #1A1A28" }}>• {f}</div>)}
              <button className="btn-secondary" style={{ marginTop: 10, fontSize: 11, padding: "5px 12px" }}>+ Agregar alimento</button>
            </div>
          ))}
          <div className="card" style={{ padding: 18, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #2D2D45", background: "transparent", cursor: "pointer" }}>
            <div style={{ textAlign: "center", color: "#4A5568" }}><div style={{ fontSize: 32, marginBottom: 8 }}>+</div><div>Nueva comida</div></div>
          </div>
        </div>
      )}

      {tab === "recetas" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          {n.recipes.map(r => (
            <div key={r.id} className="card" style={{ padding: 18, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>{r.emoji}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 6 }}>{r.name}</div>
              <div style={{ fontSize: 12, color: "#64748B", marginBottom: 12 }}>⏱ {r.time} · 🔥 {r.calories} kcal</div>
              <button className="btn-primary" style={{ width: "100%", fontSize: 12 }}>Ver receta</button>
            </div>
          ))}
          <div className="card" style={{ padding: 18, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #2D2D45", background: "transparent", cursor: "pointer" }}>
            <div style={{ textAlign: "center", color: "#4A5568" }}><div style={{ fontSize: 32, marginBottom: 8 }}>+</div><div>Nueva receta</div></div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// PÁGINAS: LEARNING, FITNESS, SHOP (sin cambios)
// ============================================================
const PomodoroTimer = () => {
  const [mode, setMode] = useState("focus");
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [pomodoros, setPomodoros] = useState(3);
  const timerRef = useRef(null);
  const total = mode === "focus" ? 25 * 60 : 5 * 60;
  const r = 54; const circ = 2 * Math.PI * r;
  const pct = ((total - seconds) / total) * 100;
  useEffect(() => {
    if (running) { timerRef.current = setInterval(() => { setSeconds(s => { if (s <= 1) { clearInterval(timerRef.current); setRunning(false); if (mode === "focus") { setPomodoros(p => p + 1); setMode("break"); setSeconds(5 * 60); } else { setMode("focus"); setSeconds(25 * 60); } return 0; } return s - 1; }); }, 1000); } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [running, mode]);
  const reset = () => { setRunning(false); setSeconds(mode === "focus" ? 25 * 60 : 5 * 60); };
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  return (
    <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div className="section-title" style={{ alignSelf: "flex-start" }}>⏱️ Pomodoro</div>
      <div style={{ display: "flex", gap: 8 }}>
        {["focus", "break"].map(m => <button key={m} onClick={() => { setMode(m); setRunning(false); setSeconds(m === "focus" ? 25 * 60 : 5 * 60); }} className={mode === m ? "btn-primary" : "btn-secondary"} style={{ fontSize: 12, padding: "4px 12px" }}>{m === "focus" ? "🔴 Focus" : "🟢 Descanso"}</button>)}
      </div>
      <div style={{ position: "relative" }}>
        <svg width="130" height="130" viewBox="0 0 130 130">
          <circle cx="65" cy="65" r={r} fill="none" stroke="#1E1E30" strokeWidth="8" />
          <circle cx="65" cy="65" r={r} fill="none" stroke={mode === "focus" ? "#7C3AED" : "#10B981"} strokeWidth="8" strokeDasharray={`${circ * pct / 100} ${circ}`} strokeLinecap="round" transform="rotate(-90 65 65)" style={{ transition: "stroke-dasharray 1s linear" }} />
        </svg>
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 28, fontWeight: 900, color: "#F1F5F9" }}>{mm}:{ss}</div>
          <div style={{ fontSize: 10, color: "#64748B" }}>{mode === "focus" ? "FOCUS" : "BREAK"}</div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button className="btn-primary" style={{ padding: "7px 24px" }} onClick={() => setRunning(r => !r)}>{running ? "⏸ Pausar" : "▶ Iniciar"}</button>
        <button className="btn-secondary" style={{ padding: "7px 14px" }} onClick={reset}>↺</button>
      </div>
      <div style={{ display: "flex", gap: 6 }}>{Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: i < pomodoros % 4 ? "#7C3AED" : "#1E1E30", border: `2px solid ${i < pomodoros % 4 ? "#7C3AED" : "#2D2D45"}` }} />)}</div>
      <div style={{ fontSize: 12, color: "#64748B" }}>🍅 {pomodoros} pomodoros hoy</div>
    </div>
  );
};

const FlashcardViewer = ({ cards }) => {
  const dueCards = cards.filter(c => c.due);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState([]);
  if (!dueCards.length || done.length >= dueCards.length) return <div style={{ padding: "30px", textAlign: "center" }}><div style={{ fontSize: 40, marginBottom: 8 }}>🎉</div><div style={{ color: "#10B981", fontWeight: 700 }}>¡Sin tarjetas pendientes!</div></div>;
  const card = dueCards[idx % dueCards.length];
  const next = () => { setDone(d => [...d, card.id]); setFlipped(false); setTimeout(() => setIdx(i => i + 1), 200); };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <span className="tag" style={{ background: "rgba(124,58,237,0.2)", color: "#A78BFA" }}>📦 {card.deck}</span>
        <span style={{ fontSize: 12, color: "#64748B" }}>{done.length + 1} / {dueCards.length}</span>
      </div>
      <div onClick={() => setFlipped(f => !f)} style={{ minHeight: 160, padding: 20, borderRadius: 12, border: `1px solid ${flipped ? "rgba(16,185,129,0.4)" : "rgba(124,58,237,0.3)"}`, background: flipped ? "linear-gradient(135deg,#0A1A12,#0F1A14)" : "linear-gradient(135deg,#12121E,#1A1230)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 0.3s", textAlign: "center" }}>
        <div style={{ fontSize: 14, color: flipped ? "#A7F3D0" : "#F1F5F9", fontWeight: 600, lineHeight: 1.6 }}>{flipped ? card.back : card.front}</div>
      </div>
      <div style={{ fontSize: 11, color: "#4A5568", textAlign: "center" }}>{flipped ? "¿Cómo te fue?" : "Toca para ver la respuesta"}</div>
      {flipped && <div style={{ display: "flex", gap: 8 }}>{[{ label: "Difícil 😅", color: "#EF4444" }, { label: "Bien 🙂", color: "#F59E0B" }, { label: "Fácil 😎", color: "#10B981" }].map((btn, i) => <button key={i} onClick={next} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${btn.color}40`, background: `${btn.color}15`, color: btn.color, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Rajdhani',sans-serif" }}>{btn.label}</button>)}</div>}
    </div>
  );
};

const LearningPage = () => {
  const [tab, setTab] = useState("cursos");
  const l = mockData.learning;
  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[{ label: "Hoy estudiado", value: `${l.todayMinutes}m`, icon: "⏱️", color: "#7C3AED" }, { label: "Cursos activos", value: l.courses.length, icon: "🎓", color: "#06B6D4" }, { label: "Leyendo", value: l.books.filter(b => b.status === "reading").length, icon: "📖", color: "#10B981" }, { label: "Flashcards", value: `${l.flashcards.filter(f => f.due).length} pendientes`, icon: "🃏", color: "#F59E0B" }].map((s, i) => (
          <div key={i} className="card" style={{ padding: "14px 16px", borderLeft: `3px solid ${s.color}` }}><div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div><div style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div><div style={{ fontSize: 11, color: "#64748B" }}>{s.label}</div></div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[{ key: "cursos", label: "🎓 Cursos" }, { key: "pomodoro", label: "⏱️ Pomodoro" }, { key: "libros", label: "📖 Libros" }, { key: "flashcards", label: "🃏 Flashcards" }, { key: "skills", label: "🧠 Skills" }].map(t => <button key={t.key} onClick={() => setTab(t.key)} className={tab === t.key ? "btn-primary" : "btn-secondary"} style={{ fontSize: 13 }}>{t.label}</button>)}
      </div>
      {tab === "cursos" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>{l.courses.map(c => <div key={c.id} className="card" style={{ padding: 18, borderTop: `3px solid ${c.color}` }}><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}><span style={{ fontSize: 30 }}>{c.icon}</span><div><div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>{c.name}</div><div style={{ fontSize: 12, color: "#64748B" }}>{c.platform}</div></div></div><ProgressBar value={c.progress} max={100} color={c.color} height={8} /><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 8, marginBottom: 12 }}><span style={{ color: c.color, fontWeight: 700 }}>{c.progress}%</span><span style={{ color: "#64748B" }}>{c.done}/{c.lessons}</span></div><div style={{ display: "flex", gap: 8 }}><button className="btn-primary" style={{ flex: 1, fontSize: 12 }}>▶ Continuar</button><button className="btn-secondary" style={{ fontSize: 12, padding: "8px 10px" }}>📝</button></div></div>)}<div className="card" style={{ padding: 18, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #2D2D45", background: "transparent", cursor: "pointer" }}><div style={{ textAlign: "center", color: "#4A5568" }}><div style={{ fontSize: 32, marginBottom: 8 }}>+</div><div>Agregar curso</div></div></div></div>}
      {tab === "pomodoro" && <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 16 }}><PomodoroTimer /><div style={{ display: "flex", flexDirection: "column", gap: 16 }}><div className="card" style={{ padding: 18 }}><div className="section-title">📋 Sesiones Recientes</div>{l.sessions.map((s, i) => <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1A1A28" }}><div><div style={{ fontSize: 13, color: "#F1F5F9", fontWeight: 600 }}>{s.topic}</div><div style={{ fontSize: 11, color: "#64748B" }}>{s.date}</div></div><div style={{ textAlign: "right" }}><div style={{ fontSize: 13, color: "#A78BFA", fontWeight: 700 }}>{s.minutes}min</div><div style={{ fontSize: 11, color: "#64748B" }}>Calidad {s.quality}/10</div></div></div>)}</div></div></div>}
      {tab === "flashcards" && <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16 }}><div className="card" style={{ padding: 18 }}><div className="section-title">🃏 Repaso del Día</div><FlashcardViewer cards={l.flashcards} /></div><div className="card" style={{ padding: 18 }}><div className="section-title">📦 Mis Mazos</div>{["Python","FastAPI","SQL"].map(deck => { const dc = l.flashcards.filter(f => f.deck === deck); const due = dc.filter(f => f.due).length; return <div key={deck} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 8, background: "#0F0F18", border: "1px solid #1E1E30", marginBottom: 8, cursor: "pointer" }}><div><div style={{ fontSize: 13, color: "#F1F5F9", fontWeight: 600 }}>📦 {deck}</div><div style={{ fontSize: 11, color: "#64748B" }}>{dc.length} tarjetas</div></div>{due > 0 ? <span className="tag" style={{ background: "rgba(239,68,68,0.2)", color: "#EF4444" }}>{due} pendientes</span> : <span className="tag" style={{ background: "rgba(16,185,129,0.2)", color: "#10B981" }}>Al día ✓</span>}</div>; })}<button className="btn-primary" style={{ width: "100%", marginTop: 4 }}>+ Nuevo mazo</button></div></div>}
      {tab === "libros" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>{l.books.map(b => { const sc = { reading: "#06B6D4", completed: "#10B981", pending: "#64748B" }; const sl = { reading: "📖 Leyendo", completed: "✅ Completado", pending: "📚 Pendiente" }; return <div key={b.id} className="card" style={{ padding: 18 }}><div style={{ display: "flex", gap: 12, marginBottom: 14 }}><span style={{ fontSize: 38 }}>{b.emoji}</span><div><div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>{b.title}</div><div style={{ fontSize: 12, color: "#64748B" }}>{b.author}</div><span className="tag" style={{ background: `${sc[b.status]}20`, color: sc[b.status], marginTop: 4, display: "inline-block" }}>{sl[b.status]}</span></div></div>{b.status !== "pending" && <><ProgressBar value={b.read} max={b.pages} color={sc[b.status]} height={6} /><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 6 }}><span style={{ color: sc[b.status], fontWeight: 700 }}>Pág. {b.read}</span><span style={{ color: "#64748B" }}>de {b.pages}</span></div></>}<button className={b.status === "pending" ? "btn-secondary" : "btn-primary"} style={{ width: "100%", marginTop: 12, fontSize: 12 }}>{b.status === "reading" ? "📝 Registrar páginas" : b.status === "completed" ? "🔍 Ver notas" : "▶ Empezar"}</button></div>; })}</div>}
      {tab === "skills" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>{l.skills.map(skill => <div key={skill.id} className="card" style={{ padding: 18, borderTop: `3px solid ${skill.color}` }}><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}><span style={{ fontSize: 30 }}>{skill.icon}</span><div><div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9" }}>{skill.name}</div><span className="tag" style={{ background: `${skill.color}20`, color: skill.color }}>{skill.level}</span></div></div><ProgressBar value={skill.xp} max={skill.xpNext} color={skill.color} height={8} /><div style={{ padding: "8px 0", borderTop: "1px solid #1E1E30", display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 8 }}><span style={{ color: "#64748B" }}>Horas totales</span><span style={{ color: "#F1F5F9", fontWeight: 700 }}>{skill.hours}h</span></div><button className="btn-secondary" style={{ width: "100%", marginTop: 10, fontSize: 12 }}>+ Registrar sesión</button></div>)}</div>}
    </div>
  );
};

const FitnessPage = () => {
  const [tab, setTab] = useState("hoy");
  const [exercises, setExercises] = useState(mockData.fitness.todayRoutine.exercises);
  const f = mockData.fitness;
  const done = exercises.filter(e => e.done).length;
  const levelColors = { "Principiante": "#10B981", "Intermedio": "#06B6D4", "Avanzado": "#7C3AED", "Élite": "#EF4444" };
  const mc = (v) => v > 80 ? "#EF4444" : v > 60 ? "#F59E0B" : v > 40 ? "#7C3AED" : "#1E1E30";
  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[{ label: "Racha", value: `${f.streak}d`, icon: "🔥", color: "#EF4444" }, { label: "Ejercicios Hoy", value: `${done}/${exercises.length}`, icon: "✓", color: "#7C3AED" }, { label: "Rutina", value: "Push Day", icon: "📋", color: "#06B6D4" }, { label: "Récords", value: f.records.length, icon: "🏆", color: "#F59E0B" }].map((s, i) => <div key={i} className="card" style={{ padding: "14px 16px", borderLeft: `3px solid ${s.color}` }}><div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div><div style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div><div style={{ fontSize: 11, color: "#64748B" }}>{s.label}</div></div>)}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[{ key: "hoy", label: "🏋️ Hoy" }, { key: "calor", label: "🔥 Mapa Calor" }, { key: "calistenia", label: "⚡ Calistenia" }, { key: "gimnasio", label: "💪 Gimnasio" }, { key: "records", label: "🏆 Récords" }].map(t => <button key={t.key} onClick={() => setTab(t.key)} className={tab === t.key ? "btn-primary" : "btn-secondary"} style={{ fontSize: 13 }}>{t.label}</button>)}
      </div>
      {tab === "hoy" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><div className="card" style={{ padding: 18 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><div className="section-title" style={{ marginBottom: 0 }}>💪 Rutina de Hoy</div><span style={{ fontSize: 12, color: "#A78BFA" }}>{done}/{exercises.length}</span></div><div style={{ fontSize: 13, color: "#CBD5E1", marginBottom: 10, fontWeight: 600 }}>{f.todayRoutine.name}</div><ProgressBar value={done} max={exercises.length} color="#7C3AED" height={6} /><div style={{ marginTop: 14 }}>{exercises.map((ex, i) => <div key={i} className="exercise-row" onClick={() => setExercises(p => p.map((e, idx) => idx === i ? { ...e, done: !e.done } : e))} style={{ opacity: ex.done ? 0.5 : 1 }}><div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${ex.done ? "#7C3AED" : "#374151"}`, background: ex.done ? "#7C3AED" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0 }}>{ex.done && "✓"}</div><div style={{ flex: 1 }}><div style={{ fontSize: 13, color: "#F1F5F9", fontWeight: 600 }}>{ex.name}</div><div style={{ fontSize: 11, color: "#64748B" }}>{ex.sets}s × {ex.reps} · {ex.weight}</div></div></div>)}</div><button className="btn-primary" style={{ width: "100%", marginTop: 12 }}>Finalizar ✓</button></div><div className="card" style={{ padding: 18 }}><div className="section-title">🔥 Racha</div><div style={{ textAlign: "center", marginBottom: 12 }}><div style={{ fontFamily: "'Orbitron',monospace", fontSize: 52, fontWeight: 900, color: "#EF4444", textShadow: "0 0 20px rgba(239,68,68,0.5)" }}>{f.streak}</div><div style={{ color: "#64748B" }}>días consecutivos</div></div><div style={{ display: "flex", gap: 5 }}>{f.weekWorkouts.map((t, i) => <div key={i} style={{ flex: 1, height: 30, borderRadius: 6, background: t ? "rgba(239,68,68,0.2)" : "#1A1A28", border: `2px solid ${t ? "#EF4444" : "#2D2D45"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>{t ? "🔥" : ""}</div>)}</div></div></div>}
      {tab === "calor" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><div className="card" style={{ padding: 20 }}><div className="section-title">🔥 Mapa de Calor Muscular</div><BodyHeatMap data={f.muscleHeatmap} /></div><div style={{ display: "flex", flexDirection: "column", gap: 16 }}><div className="card" style={{ padding: 18 }}><div className="section-title">📊 Activación por Grupo</div>{[{ label: "Pecho", v: f.muscleHeatmap.front.chest, c: "#EF4444" }, { label: "Hombros", v: f.muscleHeatmap.front.frontDelts, c: "#F59E0B" }, { label: "Dorsales", v: f.muscleHeatmap.back.lats, c: "#06B6D4" }, { label: "Bíceps", v: f.muscleHeatmap.front.biceps, c: "#7C3AED" }, { label: "Tríceps", v: f.muscleHeatmap.back.triceps, c: "#A78BFA" }, { label: "Abdomen", v: f.muscleHeatmap.front.abs, c: "#10B981" }].map(m => <div key={m.label} style={{ marginBottom: 8 }}><div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}><span style={{ color: "#CBD5E1" }}>{m.label}</span><span style={{ color: m.c, fontWeight: 700 }}>{m.v}%</span></div><ProgressBar value={m.v} max={100} color={m.c} height={5} /></div>)}</div><div className="card" style={{ padding: 18, flex: 1 }}><div className="section-title">💡 IA Recomienda</div><div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)", fontSize: 12, color: "#67E8F9", lineHeight: 1.6 }}>🤖 Esta semana trabajaste mucho <strong>pecho y hombros</strong>. Te falta equilibrar con más <strong>piernas y dorsales</strong>. Considera un Pull Day mañana.</div></div></div></div>}
      {tab === "calistenia" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}><div className="card" style={{ padding: 18 }}><div className="section-title">⚡ Skills</div>{f.calisteniaSkills.map((s, i) => <div key={i} style={{ padding: "12px 14px", borderRadius: 8, background: "#0F0F18", border: "1px solid #1E1E30", marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 20 }}>{s.icon}</span><div><div style={{ fontSize: 13, color: "#F1F5F9", fontWeight: 700 }}>{s.name}</div><span className="tag" style={{ background: `${levelColors[s.level]}20`, color: levelColors[s.level] }}>{s.level}</span></div></div><div style={{ textAlign: "right" }}><div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 900, color: "#F1F5F9" }}>{s.current}/{s.goal}{s.unit}</div><div style={{ fontSize: 10, color: "#F59E0B" }}>+{s.xp} XP</div></div></div><ProgressBar value={s.current} max={s.goal} color={levelColors[s.level]} height={5} /></div>)}</div><div className="card" style={{ padding: 18 }}><div className="section-title">📋 Rutinas</div>{f.calisteniaRoutines.map((r, i) => <div key={i} className="routine-card" style={{ marginBottom: 10 }}><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 22 }}>{r.emoji}</span><div><div style={{ fontSize: 14, color: "#F1F5F9", fontWeight: 700 }}>{r.name}</div><div style={{ fontSize: 11, color: "#64748B" }}>📅 {r.day} · ⏱ {r.duration}</div></div></div><button className="btn-primary" style={{ fontSize: 11, padding: "5px 12px" }}>▶</button></div><div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>{r.exercises.map((ex, j) => <span key={j} className="tag" style={{ background: "rgba(124,58,237,0.15)", color: "#A78BFA" }}>{ex}</span>)}</div></div>)}<button className="btn-secondary" style={{ width: "100%", marginTop: 4, fontSize: 12 }}>+ Nueva Rutina</button></div></div>}
      {tab === "gimnasio" && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>{f.gymRoutines.map((r, i) => <div key={i} className="card" style={{ padding: 18, borderTop: `3px solid ${r.color}` }}><div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}><span style={{ fontSize: 30 }}>{r.emoji}</span><div><div style={{ fontSize: 16, fontWeight: 700, color: "#F1F5F9" }}>{r.name}</div><div style={{ fontSize: 12, color: "#64748B" }}>📅 {r.day} · ⏱ {r.duration}</div></div></div>{r.exercises.map((ex, j) => <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 0", borderBottom: "1px solid #1A1A28" }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: r.color }} /><span style={{ fontSize: 12, color: "#CBD5E1" }}>{ex}</span></div>)}<button className="btn-primary" style={{ width: "100%", marginTop: 14, fontSize: 12 }}>▶ Iniciar</button></div>)}<div className="card" style={{ padding: 18, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed #2D2D45", background: "transparent", cursor: "pointer" }}><div style={{ textAlign: "center", color: "#4A5568" }}><div style={{ fontSize: 32, marginBottom: 8 }}>+</div><div>Nueva Rutina Gym</div></div></div></div>}
      {tab === "records" && <div className="card" style={{ padding: 18 }}><div className="section-title">🏆 Récords Personales</div><table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Rajdhani',sans-serif" }}><thead><tr>{["Ejercicio","Récord","Tipo","Fecha","Tendencia"].map(h => <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, color: "#4A5568", letterSpacing: 1, fontWeight: 700, borderBottom: "1px solid #1E1E30", textTransform: "uppercase" }}>{h}</th>)}</tr></thead><tbody>{f.records.map((r, i) => <tr key={i} style={{ borderBottom: "1px solid #1A1A28", cursor: "pointer" }} onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.05)"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}><td style={{ padding: "12px 14px", fontSize: 14, color: "#F1F5F9", fontWeight: 600 }}>{r.exercise}</td><td style={{ padding: "12px 14px", fontFamily: "'Orbitron',monospace", fontSize: 15, fontWeight: 900, color: "#F59E0B" }}>{r.record}</td><td style={{ padding: "12px 14px" }}><span className="tag" style={{ background: "rgba(124,58,237,0.15)", color: "#A78BFA" }}>{r.reps}</span></td><td style={{ padding: "12px 14px", fontSize: 12, color: "#64748B" }}>{r.date}</td><td style={{ padding: "12px 14px", fontSize: 16 }}>{r.trend === "up" ? <span style={{ color: "#10B981" }}>▲</span> : r.trend === "down" ? <span style={{ color: "#EF4444" }}>▼</span> : <span style={{ color: "#64748B" }}>—</span>}</td></tr>)}</tbody></table><button className="btn-secondary" style={{ marginTop: 14, fontSize: 12 }}>+ Nuevo Récord</button></div>}
    </div>
  );
};

const ShopPage = ({ game, setGame }) => {
  const [activeTab, setActiveTab] = useState("guilty_pleasure");
  const [toast, setToast] = useState(null);
  const handleBuy = (item) => {
    if (item.cooldown) return;
    if (item.category === "guilty_pleasure") { setGame(g => ({ ...g, disciplina: Math.max(0, g.disciplina - item.discCost), xp: Math.max(0, g.xp - item.xpCost), coins: Math.max(0, g.coins - item.coins) })); setToast({ msg: item.danger ? `🚬 FUMASTE — -${item.discCost} Disciplina, -${item.xpCost} XP` : `😈 ${item.name} — -${item.discCost} Disciplina, -${item.xpCost} XP`, color: item.danger ? "#EF4444" : "#F59E0B" }); }
    else { setGame(g => ({ ...g, coins: Math.max(0, g.coins - item.coins) })); setToast({ msg: `${item.icon} ¡${item.name} activado!`, color: "#10B981" }); }
  };
  const items = mockData.shop.items.filter(i => i.category === activeTab);
  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {toast && <Toast msg={toast.msg} color={toast.color} onDone={() => setToast(null)} />}
      <div className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 22 }}>🛡️</span><div><div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: "#64748B", letterSpacing: 1 }}>DISCIPLINA</div><div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color: game.disciplina > 60 ? "#06B6D4" : game.disciplina > 30 ? "#F59E0B" : "#EF4444" }}>{game.disciplina}/100</div></div></div>
        <div style={{ flex: 1 }}><ProgressBar value={game.disciplina} max={100} color={game.disciplina > 60 ? "#06B6D4" : game.disciplina > 30 ? "#F59E0B" : "#EF4444"} height={10} /></div>
        <div style={{ fontSize: 12, color: "#64748B" }}>{game.disciplina > 75 ? "🟢 Bien enfocado" : game.disciplina > 40 ? "🟡 Cuidado" : "🔴 Recupera el enfoque"}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8 }}>{[{ key: "guilty_pleasure", label: "😈 Malos Hábitos" }, { key: "power_up", label: "⚡ Power-Ups" }, { key: "reward", label: "🏆 Rewards" }].map(tab => <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={activeTab === tab.key ? "btn-primary" : "btn-secondary"} style={{ fontSize: 13 }}>{tab.label}</button>)}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", borderRadius: 999, padding: "6px 14px", fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "#1A1A00" }}>🪙 {game.coins}</div>
          <div style={{ background: "linear-gradient(135deg,#7C3AED,#5B21B6)", borderRadius: 999, padding: "6px 14px", fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "white" }}>⚡ {game.xp.toLocaleString()}</div>
        </div>
      </div>
      {activeTab === "guilty_pleasure" && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 12, color: "#FCA5A5" }}>⚠️ Los malos hábitos te quitan Disciplina y XP. ¡Piénsalo dos veces!</div>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {items.map(item => <div key={item.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${item.danger ? "rgba(239,68,68,0.3)" : item.cooldown ? "#1E1E30" : "rgba(124,58,237,0.2)"}`, background: item.danger ? "rgba(239,68,68,0.05)" : "#0F0F18", opacity: item.cooldown ? 0.55 : 1, display: "flex", flexDirection: "column", gap: 8 }}><div style={{ fontSize: 36, textAlign: "center" }}>{item.icon}</div><div style={{ fontSize: 14, fontWeight: 700, color: item.danger ? "#FCA5A5" : "#F1F5F9", textAlign: "center" }}>{item.name}</div>{item.cooldown && <div style={{ fontSize: 11, color: "#EF4444", textAlign: "center" }}>🕐 {item.cooldown}</div>}<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontSize: 12 }}>{item.coins > 0 && <span style={{ color: "#F59E0B", fontWeight: 700 }}>🪙 {item.coins}</span>}{item.money > 0 && <span style={{ color: "#10B981", fontWeight: 700 }}>+${item.money}</span>}{item.discCost > 0 && <span style={{ color: "#EF4444", fontWeight: 700 }}>🛡️ -{item.discCost}</span>}{item.xpCost > 0 && <span style={{ color: "#A78BFA", fontWeight: 700 }}>⚡ -{item.xpCost} XP</span>}</div><button onClick={() => handleBuy(item)} className={item.cooldown ? "btn-secondary" : item.danger ? "btn-danger" : "btn-primary"} style={{ width: "100%", fontSize: 12 }} disabled={!!item.cooldown}>{item.cooldown ? "No disponible" : item.danger ? "⚠️ Canjear" : "Canjear"}</button></div>)}
      </div>
    </div>
  );
};

const PlaceholderPage = ({ name, icon }) => (
  <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>{icon}</div>
      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 }}>{name}</div>
      <div style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>Próximamente</div>
      <button className="btn-primary">En construcción</button>
    </div>
  </div>
);

// ============================================================
// APP PRINCIPAL
// ============================================================
export default function LifeHUD() {
  const [activeNav, setActiveNav] = useState(0);
  const [tasks, setTasks] = useState(mockData.tasks);
  const [habits, setHabits] = useState(mockData.habits);
  const [game, setGame] = useState(INITIAL_GAME);
  const [time, setTime] = useState(new Date());

  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);

  const renderPage = () => {
    switch (activeNav) {
      case 0: return <DashboardPage tasks={tasks} setTasks={setTasks} habits={habits} setHabits={setHabits} game={game} />;
      case 1: return <PlaceholderPage name="Tareas" icon="✅" />;
      case 2: return <PlaceholderPage name="Hábitos" icon="🔄" />;
      case 3: return <PlaceholderPage name="Metas" icon="🎯" />;
      case 4: return <FinanzasPage />;
      case 5: return <LearningPage />;
      case 6: return <FitnessPage />;
      case 7: return <NutricionPage />;
      case 8: return <ShopPage game={game} setGame={setGame} />;
      default: return null;
    }
  };

  return (
    <div style={{ fontFamily: "'Rajdhani','Orbitron',monospace", background: "#080810", minHeight: "100vh", color: "#E2E8F0", display: "flex", overflow: "hidden" }}>
      <style>{GLOBAL_STYLES}</style>
      <div className="scanline" />
      <div style={{ width: 72, background: "linear-gradient(180deg,#0A0A14,#080810)", borderRight: "1px solid #1A1A28", display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 8px", gap: 4, flexShrink: 0 }}>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 900, color: "#7C3AED", marginBottom: 16, textShadow: "0 0 12px rgba(124,58,237,0.6)" }}>HUD</div>
        {NAV_ITEMS.map((item, i) => <div key={i} className={`nav-item ${activeNav === i ? "active" : ""}`} onClick={() => setActiveNav(i)}><span style={{ fontSize: 18 }}>{item.icon}</span><span>{item.label}</span></div>)}
        <div style={{ flex: 1 }} />
        <div className="nav-item"><span style={{ fontSize: 18 }}>⚙️</span><span>Config</span></div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "10px 24px", borderBottom: "1px solid #1A1A28", background: "linear-gradient(90deg,#0A0A14,#0D0D1A)", display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, boxShadow: "0 0 12px rgba(124,58,237,0.5)", flexShrink: 0 }}>A</div>
            <div>
              <div style={{ fontSize: 12, color: "#94A3B8" }}>{time.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" })}</div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>Hola, {mockData.user.name}</div>
            </div>
          </div>
          <div style={{ width: 220 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748B", marginBottom: 4 }}>
              <span style={{ fontFamily: "'Orbitron',monospace" }}>NIVEL {game.level}</span>
              <span>{game.xp.toLocaleString()} / {game.xpNext.toLocaleString()} XP</span>
            </div>
            <ProgressBar value={game.xp} max={game.xpNext} color="linear-gradient(90deg,#7C3AED,#A78BFA)" height={5} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            {[
              { text: `⚡ ${game.xp.toLocaleString()}`, bg: "linear-gradient(135deg,#7C3AED,#5B21B6)", color: "white" },
              { text: `🪙 ${game.coins}`, bg: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#1A1A00" },
              { text: `🔥 ${game.streak}d`, bg: "linear-gradient(135deg,#EF4444,#B91C1C)", color: "white" },
              { text: `🛡️ ${game.disciplina}`, bg: game.disciplina > 60 ? "linear-gradient(135deg,#0891B2,#06B6D4)" : game.disciplina > 30 ? "linear-gradient(135deg,#D97706,#F59E0B)" : "linear-gradient(135deg,#B91C1C,#EF4444)", color: "white" },
            ].map((b, i) => <span key={i} style={{ background: b.bg, borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: b.color }}>{b.text}</span>)}
          </div>
          <div style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#A78BFA", maxWidth: 200, cursor: "pointer" }}>
            🤖 <em>Llevas {game.streak} días — ¡no pares!</em>
          </div>
        </div>
        <div style={{ padding: "10px 24px 0", display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 20 }}>{NAV_ITEMS[activeNav].icon}</span>
          <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "#A78BFA", letterSpacing: 2 }}>{NAV_ITEMS[activeNav].label.toUpperCase()}</span>
        </div>
        <div style={{ flex: 1, overflow: "auto", padding: "14px 24px 24px" }}>{renderPage()}</div>
      </div>
    </div>
  );
}