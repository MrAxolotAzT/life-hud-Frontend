const API_URL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000";
import { useState, useEffect, useRef } from "react";
import { api, useApi, LoadingCard, ErrorCard } from './api';

// ============================================================
// MOCK DATA
// ============================================================
const INITIAL_GAME = { xp: 0, xpNext: 50, coins: 0, disciplina: 0, streak: 0, level: 1 };

const DEFAULT_NOTIF_CONFIG = {
  enabled:  false,
  habitos:  { enabled: true,  hora: "20:00", label: "Hábitos pendientes",    emoji: "🔥", msg: "¡Aún tienes hábitos sin completar hoy!" },
  fitness:  { enabled: true,  hora: "18:00", label: "Hora de entrenar",      emoji: "💪", msg: "¡Hoy toca entrenamiento! No rompas la racha." },
  metas:    { enabled: true,  hora: "09:00", label: "Revisión de metas",     emoji: "🎯", msg: "Revisa tus objetivos y acciones del día." },
  pomodoro: { enabled: false, hora: "10:00", label: "Sesión de estudio",     emoji: "⏱️", msg: "¡Es hora de tu sesión de estudio! Enciende el Pomodoro." },
  manana:   { enabled: false, hora: "07:00", label: "Rutina de mañana",      emoji: "🌅", msg: "Buenos días. Arranca tu rutina matutina en Life HUD." },
};

const mapGameProfile = (data) => ({
  xp:         data.xp_points        ?? data.xp         ?? 0,
  xpNext:     data.xp_next_level    ?? data.xpNext      ?? 1000,
  coins:      data.coins            ?? 0,
  disciplina: data.discipline_score ?? data.disciplina  ?? 0,
  streak:     data.current_streak   ?? data.streak      ?? 0,
  level:      data.level            ?? 1,
});

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
      { id: 1, name: "Desayuno", type: "desayuno", time: "08:30", calories: 450, icon: "🌅", foods: [{ name: "Avena con fruta", cal: 250, p: 8, c: 45, f: 4 }, { name: "Huevos revueltos (2)", cal: 200, p: 14, c: 1, f: 15 }] },
      { id: 2, name: "Almuerzo", type: "almuerzo", time: "13:00", calories: 720, icon: "☀️", foods: [{ name: "Arroz integral", cal: 200, p: 4, c: 42, f: 1 }, { name: "Pollo a la plancha", cal: 300, p: 35, c: 0, f: 8 }, { name: "Ensalada", cal: 80, p: 2, c: 12, f: 2 }] },
      { id: 3, name: "Cena", type: "cena", time: "19:30", calories: 670, icon: "🌙", foods: [{ name: "Pasta con atún", cal: 550, p: 30, c: 65, f: 10 }, { name: "Yogurt natural", cal: 120, p: 8, c: 14, f: 4 }] },
    ],
    recipes: [
      { id: 1, name: "Bowl de proteína", calories: 520, protein: 42, carbs: 45, fat: 12, time: "15 min", emoji: "🥗", ingredients: ["Pollo 150g", "Arroz 100g", "Aguacate 50g", "Espinacas"] },
      { id: 2, name: "Smoothie verde", calories: 280, protein: 18, carbs: 32, fat: 6, time: "5 min", emoji: "🥤", ingredients: ["Proteína 1 scoop", "Leche 250ml", "Plátano", "Espinacas"] },
      { id: 3, name: "Pollo al limón", calories: 420, protein: 45, carbs: 8, fat: 14, time: "25 min", emoji: "🍗", ingredients: ["Pollo 200g", "Limón", "Aceite de oliva", "Especias"] },
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
      { id: 9, name: "Tortilla maíz", cal: 52, p: 1.4, c: 11, f: 0.7, emoji: "🫓" },
      { id: 10, name: "Proteína", cal: 120, p: 24, c: 3, f: 1.5, emoji: "💪" },
      { id: 11, name: "Papa 100g", cal: 87, p: 1.9, c: 20, f: 0.1, emoji: "🥔" },
      { id: 12, name: "Manzana", cal: 52, p: 0.3, c: 14, f: 0.2, emoji: "🍎" },
      { id: 13, name: "Lentejas 100g", cal: 116, p: 9, c: 20, f: 0.4, emoji: "🫘" },
      { id: 14, name: "Queso 30g", cal: 110, p: 7, c: 0.5, f: 9, emoji: "🧀" },
      { id: 15, name: "Pan integral", cal: 80, p: 3, c: 15, f: 1, emoji: "🍞" },
      { id: 16, name: "Naranja", cal: 62, p: 1.2, c: 15, f: 0.2, emoji: "🍊" },
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
      { name: "Core & Skills", day: "Mié / Sáb", duration: "30 min", emoji: "🧘", exercises: ["L-Sit 5×10s", "Hollow Body 3×30s", "Dragon Flag 3×5", "Ab Wheel 3×10", "Handstand 5×15s"] },
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
      { id: 1, front: "¿Qué es una función async en Python?", back: "Una función que puede pausar con await, permitiendo corrutinas concurrentes.", deck: "Python", due: true },
      { id: 2, front: "¿Qué hace el decorador @router.get()?", back: "Registra una función como handler de una ruta GET en FastAPI.", deck: "FastAPI", due: true },
      { id: 3, front: "¿Diferencia entre list y tuple?", back: "List es mutable, tuple es inmutable y más rápido.", deck: "Python", due: false },
      { id: 4, front: "¿Qué es un índice en SQL?", back: "Estructura que acelera búsquedas en una tabla.", deck: "SQL", due: true },
    ],
    sessions: [
      { date: "Hoy", minutes: 90, topic: "FastAPI Routers", quality: 8 },
      { date: "Ayer", minutes: 120, topic: "Python Async/Await", quality: 9 },
      { date: "Hace 2 días", minutes: 45, topic: "SQL Joins", quality: 7 },
    ],
  },
  finance: {
    balance: 15420, monthIncome: 12000, monthExpense: 8340, savingsRate: 31,
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

// ============================================================
// OBJETIVOS — ROADMAP IA + PLAN DIARIO
// ============================================================
const buildAIRoadmap = (goalKey, profile) => {
  const { finance, learning, fitness } = profile;
  const topSkill = learning.skills.reduce((a, b) => a.xp > b.xp ? a : b);
  const savingsMonthly = finance.monthIncome - finance.monthExpense;
  const barrel = finance.barrels[0];
  const monthsLeft = Math.ceil((barrel.goal - barrel.current) / barrel.monthly);
  const skillNames = learning.skills.map(s => s.name).join(", ");

  const maps = {
    auto: {
      emoji: "🚗", category: "Financiero", color: "#7C3AED",
      profileAnalysis: [
        { icon: "✅", label: "Skills", value: skillNames, status: "good" },
        { icon: "✅", label: "Ahorro/mes", value: `$${savingsMonthly.toLocaleString()}`, status: "good" },
        { icon: "✅", label: "Racha", value: `${fitness.streak} días`, status: "good" },
        { icon: "⚠️", label: "Dependencia freelance", value: "79% ingresos = riesgo", status: "warn" },
        { icon: "❌", label: "Ingreso pasivo", value: "Solo 13%", status: "bad" },
      ],
      dailyPlan: {
        date: new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" }),
        focus: "Blindar ingresos y completar FastAPI",
        blocks: [
          {
            time: "🌅 Mañana (6–12h)", color: "#F59E0B",
            actions: [
              { task: `Estudiar FastAPI 45 min (llevas ${learning.courses[0].progress}% — lección 20)`, effort: "45 min", module: "📚 Learning", done: false, priority: "high" },
              { task: "Revisar 2 ofertas freelance en Workana/Upwork y aplicar a 1", effort: "20 min", module: "💰 Finanzas", done: false, priority: "high" },
              { task: "Registrar desayuno en Nutrición", effort: "2 min", module: "🥗 Nutrición", done: false, priority: "low" },
            ],
          },
          {
            time: "☀️ Tarde (12–18h)", color: "#7C3AED",
            actions: [
              { task: "Hacer ejercicio (Push Day — quedan 3 ejercicios)", effort: "40 min", module: "💪 Fitness", done: false, priority: "high" },
              { task: "Escribir README del proyecto FastAPI en GitHub", effort: "30 min", module: "📚 Learning", done: false, priority: "medium" },
              { task: "Aportar manualmente $250 al barril del Auto", effort: "5 min", module: "💰 Finanzas", done: false, priority: "medium" },
            ],
          },
          {
            time: "🌙 Noche (18–23h)", color: "#06B6D4",
            actions: [
              { task: "Repasar 5 flashcards de Python/FastAPI", effort: "10 min", module: "📚 Learning", done: false, priority: "medium" },
              { task: "Registrar gastos del día en Finanzas", effort: "3 min", module: "💰 Finanzas", done: false, priority: "low" },
              { task: "Preparar lista de tareas para mañana (3 más importantes)", effort: "5 min", module: "✓ Tareas", done: false, priority: "low" },
            ],
          },
        ],
        aiTip: `Hoy es clave avanzar en FastAPI. Cada lección completada aumenta un 8% tu valor como freelance. Con solo 2 clientes fijos de $2,500 MXN/mes cada uno, el Auto llega en ${monthsLeft - 2} meses en vez de ${monthsLeft}.`,
      },
      phases: [
        { name: "Fase 1 — Blindar ingresos", weeks: "Semanas 1–4", color: "#EF4444", icon: "🛡️", status: "active", actions: [{ task: `Terminar FastAPI (llevas ${learning.courses[0].progress}%)`, done: false, priority: "high" }, { task: "Perfil en Upwork + Workana con proyectos Python", done: false, priority: "high" }, { task: "2 proyectos en GitHub con documentación", done: false, priority: "medium" }, { task: "Conseguir cliente fijo $2,000–3,000 MXN/mes", done: false, priority: "high" }], insight: `Con ${topSkill.name} en nivel ${topSkill.level} ya puedes cobrar $350–500 USD/proyecto remoto.` },
        { name: "Fase 2 — Acelerar ahorro", weeks: "Mes 2–4", color: "#F59E0B", icon: "🏦", status: "pending", actions: [{ task: "Aumentar aportación al barril auto a $4,500/mes", done: false, priority: "high" }, { task: "Reducir renta a máx 35% del ingreso (hoy 54%)", done: false, priority: "medium" }, { task: "Automatizar transferencia cada día 1", done: false, priority: "medium" }, { task: "Alcanzar $180,000 en el barril (60% meta)", done: false, priority: "high" }], insight: "Aumentar de $3,660 a $5,000/mes de ahorro reduce el tiempo de 8 a 5 meses." },
        { name: "Fase 3 — Ingreso extra", weeks: "Mes 3–6", color: "#06B6D4", icon: "💻", status: "pending", actions: [{ task: "Lanzar micro-servicio o API como producto", done: false, priority: "medium" }, { task: "Completar SQL y ofrecer análisis de datos", done: false, priority: "high" }, { task: "Aplicar a trabajo remoto part-time", done: false, priority: "high" }, { task: "Crear 1 fuente de ingreso pasivo (curso/template)", done: false, priority: "low" }], insight: "Python + FastAPI + SQL te abren roles de Backend Developer remoto $15k–25k MXN/mes." },
        { name: "Fase 4 — ¡Meta!", weeks: `Mes ${monthsLeft - 1}–${monthsLeft}`, color: "#10B981", icon: "🏁", status: "locked", actions: [{ task: "Investigar modelo, año y precio del auto", done: false, priority: "medium" }, { task: "Comparar financiamiento vs contado", done: false, priority: "medium" }, { task: "Revisar seguro, tenencia y mantenimiento anual", done: false, priority: "low" }, { task: "¡Comprar el auto! 🎉", done: false, priority: "high" }], insight: `A tu ritmo llegas en ${monthsLeft} meses. Optimizando: ${monthsLeft - 3} meses.` },
      ],
      skillsNeeded: [
        { name: "Python", have: true, level: "Intermedio", relevance: "Alta — para proyectos freelance" },
        { name: "FastAPI", have: true, level: "Completar (42%)", relevance: "Alta — APIs y microservicios" },
        { name: "SQL", have: true, level: "Principiante → Básico", relevance: "Media — datos y reportes" },
        { name: "Docker", have: false, level: "Aprender básico", relevance: "Media — desplegar proyectos" },
        { name: "Ventas digitales", have: false, level: "Conceptos básicos", relevance: "Alta — conseguir clientes" },
      ],
      timeline: { months: monthsLeft, optimized: monthsLeft - 3 },
    },
    empleo: {
      emoji: "💼", category: "Carrera", color: "#10B981",
      profileAnalysis: [
        { icon: "✅", label: "Skill principal", value: `${topSkill.name} ${topSkill.level}`, status: "good" },
        { icon: "✅", label: "Estudio diario", value: `${learning.todayMinutes} min/día`, status: "good" },
        { icon: "✅", label: "Disciplina física", value: `Racha ${fitness.streak}d`, status: "good" },
        { icon: "⚠️", label: "Portfolio público", value: "No detectado — crítico", status: "warn" },
        { icon: "⚠️", label: "Experiencia formal", value: "Solo freelance", status: "warn" },
      ],
      dailyPlan: {
        date: new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" }),
        focus: "Construir presencia y preparación técnica",
        blocks: [
          { time: "🌅 Mañana (6–12h)", color: "#F59E0B", actions: [{ task: "Practicar 1 problema LeetCode fácil en Python", effort: "20 min", module: "📚 Learning", done: false, priority: "high" }, { task: "Actualizar/crear perfil LinkedIn con keywords Python Developer", effort: "30 min", module: "📚 Learning", done: false, priority: "high" }, { task: "Registrar desayuno", effort: "2 min", module: "🥗 Nutrición", done: false, priority: "low" }] },
          { time: "☀️ Tarde (12–18h)", color: "#10B981", actions: [{ task: "Estudiar FastAPI 45 min y subir código a GitHub", effort: "60 min", module: "📚 Learning", done: false, priority: "high" }, { task: "Hacer ejercicio (mantiene tu disciplina al 78%)", effort: "40 min", module: "💪 Fitness", done: false, priority: "medium" }, { task: "Aplicar a 3 vacantes en Remotive o WeWorkRemotely", effort: "30 min", module: "✓ Tareas", done: false, priority: "high" }] },
          { time: "🌙 Noche (18–23h)", color: "#06B6D4", actions: [{ task: "Preparar respuesta STAR para 1 pregunta de entrevista", effort: "15 min", module: "📚 Learning", done: false, priority: "medium" }, { task: "Revisar 5 flashcards (Python/FastAPI)", effort: "10 min", module: "📚 Learning", done: false, priority: "low" }, { task: "Registrar gastos del día", effort: "3 min", module: "💰 Finanzas", done: false, priority: "low" }] },
        ],
        aiTip: "Con tu racha de 90 min/día de estudio y disciplina del 78%, tienes ventaja sobre candidatos que estudian esporádicamente. Un perfil de GitHub activo es el filtro #1 que usan los reclutadores técnicos.",
      },
      phases: [
        { name: "Fase 1 — Presencia online", weeks: "Semanas 1–3", color: "#10B981", icon: "🌐", status: "active", actions: [{ task: "GitHub con 3 proyectos Python documentados", done: false, priority: "high" }, { task: "Perfil LinkedIn con keywords", done: false, priority: "high" }, { task: "CV formato ATS-friendly", done: false, priority: "medium" }, { task: "README profesional por proyecto", done: false, priority: "medium" }], insight: `Con ${topSkill.hours}h de práctica en ${topSkill.name} ya calificas para roles Junior/Mid.` },
        { name: "Fase 2 — Prep técnica", weeks: "Semanas 3–6", color: "#06B6D4", icon: "🧠", status: "pending", actions: [{ task: "1 problema LeetCode/día (Python)", done: false, priority: "high" }, { task: `Terminar FastAPI (${learning.courses[0].progress}%)`, done: false, priority: "high" }, { task: "Estudiar JWT, ORM, REST patterns", done: false, priority: "medium" }, { task: "Preparar respuestas STAR para entrevistas", done: false, priority: "low" }], insight: "Python + FastAPI + SQL es el stack exacto que piden el 80% de vacantes backend remotas." },
        { name: "Fase 3 — Aplicar activo", weeks: "Mes 2–3", color: "#7C3AED", icon: "📨", status: "pending", actions: [{ task: "3 vacantes/día en LinkedIn, Remotive, WWR", done: false, priority: "high" }, { task: "Networking en comunidades Python", done: false, priority: "medium" }, { task: "Referencias de clientes freelance actuales", done: false, priority: "medium" }, { task: "2 entrevistas técnicas/semana", done: false, priority: "high" }], insight: "Aplica a al menos 40–60 vacantes. La estadística dice que 1 de cada 8–12 da entrevista." },
        { name: "Fase 4 — Empleo conseguido", weeks: "Mes 3–4", color: "#F59E0B", icon: "🏆", status: "locked", actions: [{ task: "Negociar 20% arriba de tu mínimo", done: false, priority: "high" }, { task: "Revisar beneficios: seguro, home office", done: false, priority: "medium" }, { task: "Mantener freelances como ingreso paralelo", done: false, priority: "medium" }, { task: "¡Celebrar! 🎉", done: false, priority: "low" }], insight: "Backend Python remoto Junior paga $15k–25k MXN/mes. Con freelance paralelo = acelerarías el Auto." },
      ],
      skillsNeeded: [
        { name: "Python", have: true, level: "Intermedio", relevance: "Crítica — skill principal" },
        { name: "FastAPI / Django", have: true, level: "Completar FastAPI", relevance: "Alta — 80% de vacantes" },
        { name: "Git + GitHub", have: false, level: "Portfolio visible", relevance: "Crítica — primer filtro" },
        { name: "Docker básico", have: false, level: "Conceptos básicos", relevance: "Media — diferenciador" },
        { name: "Inglés técnico", have: false, level: "B1+ recomendado", relevance: "Alta — trabajo remoto USD" },
      ],
      timeline: { months: 3, optimized: 2 },
    },
    casa: {
      emoji: "🏠", category: "Financiero", color: "#06B6D4",
      profileAnalysis: [
        { icon: "✅", label: "Balance actual", value: `$${finance.balance.toLocaleString()}`, status: "good" },
        { icon: "✅", label: "Historial ahorro", value: "6 meses positivos", status: "good" },
        { icon: "⚠️", label: "Tasa de ahorro", value: `${finance.savingsRate}% — necesitas 35%+`, status: "warn" },
        { icon: "❌", label: "Enganche", value: "$150k–300k (lejos aún)", status: "bad" },
        { icon: "⚠️", label: "Historial crediticio", value: "No registrado", status: "warn" },
      ],
      dailyPlan: {
        date: new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" }),
        focus: "Construir historial crediticio y aumentar ahorro",
        blocks: [
          { time: "🌅 Mañana (6–12h)", color: "#06B6D4", actions: [{ task: "Buscar y revisar tu Buró de Crédito gratis en burodecredito.com.mx", effort: "20 min", module: "💰 Finanzas", done: false, priority: "high" }, { task: "Estudiar Python para aumentar ingreso freelance", effort: "45 min", module: "📚 Learning", done: false, priority: "high" }] },
          { time: "☀️ Tarde (12–18h)", color: "#7C3AED", actions: [{ task: "Investigar programas hipotecarios en Banorte, BBVA o Santander", effort: "20 min", module: "💰 Finanzas", done: false, priority: "medium" }, { task: "Calcular si puedes aportar $5,000/mes al barril Casa", effort: "10 min", module: "💰 Finanzas", done: false, priority: "high" }] },
          { time: "🌙 Noche (18–23h)", color: "#10B981", actions: [{ task: "Registrar todos los gastos del día", effort: "5 min", module: "💰 Finanzas", done: false, priority: "medium" }, { task: "Registrar cena en Nutrición", effort: "2 min", module: "🥗 Nutrición", done: false, priority: "low" }] },
        ],
        aiTip: "Empezar a construir historial crediticio HOY es lo más impactante. Abre una tarjeta de crédito, úsala para el súper y págala completa cada mes. En 6–12 meses tendrás un score sólido para hipoteca.",
      },
      phases: [
        { name: "Fase 1 — Preparar crédito", weeks: "Meses 1–3", color: "#06B6D4", icon: "📊", status: "active", actions: [{ task: "Revisar Buró de Crédito (gratis 1 vez/año)", done: false, priority: "high" }, { task: "Activar tarjeta de crédito y pagarla completa", done: false, priority: "high" }, { task: "Facturar freelances como persona física en SAT", done: false, priority: "medium" }, { task: "Mantener tasa de ahorro 35%+ por 3 meses", done: false, priority: "high" }], insight: "Los bancos requieren comprobantes formales. Regístrate en el SAT como PF con actividad empresarial." },
        { name: "Fase 2 — Acumular enganche", weeks: "Meses 3–18", color: "#7C3AED", icon: "💰", status: "pending", actions: [{ task: "Crear barril 'Casa 🏠' meta $300,000", done: false, priority: "high" }, { task: "Aportar $5,000/mes al barril casa", done: false, priority: "high" }, { task: "Explorar INFONAVIT si tienes empleo formal", done: false, priority: "medium" }, { task: "Investigar programas de vivienda en tu estado", done: false, priority: "low" }], insight: "Con $5k/mes ahorras $300k en 5 años. Con empleo formal + freelance lo reduces a 3 años." },
        { name: "Fase 3 — Comparar opciones", weeks: "Mes 12–18", color: "#F59E0B", icon: "🔍", status: "locked", actions: [{ task: "Simular hipotecas en 3 bancos distintos", done: false, priority: "medium" }, { task: "Calcular costo real: precio + intereses + notaría", done: false, priority: "high" }, { task: "Decidir: renta vs hipoteca vs preventa", done: false, priority: "medium" }, { task: "Visitar al menos 5 inmuebles", done: false, priority: "low" }], insight: "Hipoteca a 20 años al 11% puede costar el doble del precio. Calcula bien antes de firmar." },
      ],
      skillsNeeded: [
        { name: "Educación financiera", have: false, level: "Hipotecas, SAR, AFORE", relevance: "Crítica" },
        { name: "Ingresos formales SAT", have: false, level: "Registrarte como PF", relevance: "Alta" },
        { name: "Historial crediticio", have: false, level: "Construir score positivo", relevance: "Alta" },
        { name: `${topSkill.name}`, have: true, level: topSkill.level, relevance: "Alta — fuente de ingresos" },
      ],
      timeline: { months: 36, optimized: 24 },
    },
  };
  return maps[goalKey] || maps.auto;
};

const GOAL_CATEGORIES = [
  { key: "auto", emoji: "🚗", label: "Vehículo", desc: "Auto, moto, bici..." },
  { key: "empleo", emoji: "💼", label: "Empleo", desc: "Trabajo remoto, ascenso..." },
  { key: "casa", emoji: "🏠", label: "Vivienda", desc: "Casa, depto, remodelación..." },
  { key: "negocio", emoji: "🏢", label: "Negocio", desc: "Startup, tienda, freelance..." },
  { key: "salud", emoji: "💪", label: "Salud", desc: "Músculo, peso, rendimiento..." },
  { key: "viaje", emoji: "✈️", label: "Viaje", desc: "Vacaciones, erasmus, retiro..." },
];

const MEAL_TYPES = [
  { key: "desayuno", label: "Desayuno", icon: "🌅", color: "#F59E0B" },
  { key: "almuerzo", label: "Almuerzo", icon: "☀️", color: "#10B981" },
  { key: "cena", label: "Cena", icon: "🌙", color: "#7C3AED" },
  { key: "snack", label: "Snack", icon: "🍎", color: "#06B6D4" },
];

const DAYS = ["L", "M", "X", "J", "V", "S", "D"];
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
  { icon: "⏰", label: "Rutina" },
];

// ============================================================
// ESTILOS GLOBALES
// ============================================================
const getGlobalStyles = (light = false) => `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;700;900&display=swap');
  * { box-sizing:border-box;margin:0;padding:0; }
  ::-webkit-scrollbar { width:4px; }
  ::-webkit-scrollbar-track { background:#0F0F1A; }
  ::-webkit-scrollbar-thumb { background:#7C3AED;border-radius:2px; }
  @keyframes pulse-glow { 0%,100%{box-shadow:0 0 8px rgba(124,58,237,0.4)} 50%{box-shadow:0 0 20px rgba(124,58,237,0.8)} }
  @keyframes fadeSlide { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scanline { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }
  @keyframes toastIn { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes phaseIn { from{opacity:0;transform:translateX(-10px)} to{opacity:1;transform:translateX(0)} }
  @keyframes modalIn { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
  .page { animation:fadeSlide 0.3s ease both;-webkit-tap-highlight-color:transparent; }
  .nav-item { display:flex;flex-direction:column;align-items:center;gap:4px;padding:10px 8px;border-radius:10px;cursor:pointer;transition:all 0.2s;font-size:10px;color:${light ? "#64748B" : "#4A5568"};border:1px solid transparent;font-family:'Rajdhani',sans-serif; }
  .nav-item:hover { color:#A78BFA;background:rgba(124,58,237,0.1); }
  .nav-item.active { color:#A78BFA;background:rgba(124,58,237,0.15);border-color:rgba(124,58,237,0.3);animation:pulse-glow 2s infinite; }
  .card { background:${light ? "linear-gradient(135deg,#FFFFFF,#F8FAFC)" : "linear-gradient(135deg,#12121E 0%,#0F0F1A 100%)"};border:1px solid ${light ? "#E2E8F0" : "#1E1E30"};border-radius:12px;transition:border-color 0.2s; }
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
  .exercise-row { display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:8px;margin-bottom:6px;border:1px solid ${light ? "#E2E8F0" : "#1E1E30"};cursor:pointer;transition:all 0.15s;background:${light ? "#F8FAFC" : "#0F0F18"}; }
  .exercise-row:hover { border-color:rgba(124,58,237,0.3); }
  .food-chip { padding:8px 10px;border-radius:8px;background:#0F0F18;border:1px solid #1E1E30;cursor:pointer;transition:all 0.15s;font-family:'Rajdhani',sans-serif;display:flex;flex-direction:column;align-items:center;gap:2px; }
  .food-chip:hover { border-color:rgba(16,185,129,0.4);background:rgba(16,185,129,0.06);transform:translateY(-1px); }
  .food-chip-sm { padding:6px 8px;border-radius:8px;background:#0F0F18;border:1px solid #1E1E30;cursor:pointer;transition:all 0.15s;font-family:'Rajdhani',sans-serif;display:flex;align-items:center;gap:8px; }
  .food-chip-sm:hover { border-color:rgba(16,185,129,0.4);background:rgba(16,185,129,0.06); }
  .txn-row { display:flex;align-items:center;gap:12px;padding:10px 14px;border-radius:8px;margin-bottom:6px;background:#0F0F18;border:1px solid #1E1E30;transition:all 0.15s;cursor:pointer; }
  .txn-row:hover { border-color:rgba(124,58,237,0.3); }
  .muscle-region { cursor:pointer;transition:filter 0.2s; }
  .muscle-region:hover { filter:brightness(1.3); }
  .routine-card { padding:14px;border-radius:10px;background:#0F0F18;border:1px solid #1E1E30;cursor:pointer;transition:all 0.15s; }
  .routine-card:hover { border-color:rgba(124,58,237,0.3);transform:translateY(-1px); }
  .barrel-card { padding:16px;border-radius:12px;background:#0F0F18;border:1px solid #1E1E30;transition:all 0.2s;cursor:pointer; }
  .barrel-card:hover { border-color:rgba(124,58,237,0.35);transform:translateY(-2px); }
  .goal-card { padding:14px;border-radius:12px;background:#0F0F18;border:1px solid #1E1E30;cursor:pointer;transition:all 0.2s; }
  .goal-card:hover { transform:translateY(-2px); }
  .goal-card.selected { border-color:rgba(124,58,237,0.6);box-shadow:0 0 20px rgba(124,58,237,0.15); }
  .phase-card { padding:16px;border-radius:12px;background:#0A0A12;border-left:4px solid;transition:all 0.2s;animation:phaseIn 0.35s ease both; }
  .action-item { display:flex;align-items:flex-start;gap:10px;padding:8px 12px;border-radius:8px;margin-bottom:6px;background:#10101A;border:1px solid #1A1A2A;cursor:pointer;transition:all 0.15s; }
  .action-item:hover { border-color:rgba(124,58,237,0.3); }
  .daily-action { display:flex;align-items:flex-start;gap:10px;padding:9px 12px;border-radius:8px;margin-bottom:6px;background:#0D0D18;border:1px solid #1A1A28;cursor:pointer;transition:all 0.15s; }
  .daily-action:hover { border-color:rgba(124,58,237,0.3); }
  .recipe-card-sm { padding:12px 14px;border-radius:10px;background:#0F0F18;border:1px solid #1E1E30;cursor:pointer;transition:all 0.2s;display:flex;align-items:center;gap:12px; }
  .recipe-card-sm:hover { border-color:rgba(16,185,129,0.4);transform:translateY(-1px); }
  .ai-thinking { background:linear-gradient(90deg,#12121E,#1A1230,#12121E);background-size:200% 100%;animation:shimmer 1.8s infinite;border-radius:8px;padding:14px; }
  .toast { position:fixed;bottom:24px;right:24px;padding:12px 18px;border-radius:10px;font-family:'Rajdhani',sans-serif;font-size:13px;font-weight:700;z-index:1001;animation:toastIn 0.3s ease both; }
  .scanline { position:fixed;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(124,58,237,0.3),transparent);animation:scanline 8s linear infinite;pointer-events:none;z-index:999; }
  .modal-bg { position:fixed;inset:0;background:${light ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.75)"};backdrop-filter:blur(5px);z-index:500;display:flex;align-items:flex-start;justify-content:center;padding:40px 16px;overflow-y:auto; }
  .modal { background:${light ? "linear-gradient(145deg,#FFFFFF,#F8FAFC)" : "linear-gradient(145deg,#13131F,#0F0F1A)"};border:1px solid ${light ? "#E2E8F0" : "#2A2A3A"};border-radius:16px;padding:24px;animation:modalIn 0.25s ease both;max-height:88vh;overflow-y:auto;width:90vw;max-width:520px; }
  input, select, textarea { font-family:'Rajdhani',sans-serif;font-size:13px;background:${light ? "#FFFFFF" : "#0F0F18"};border:1px solid ${light ? "#CBD5E1" : "#2D2D45"};border-radius:8px;color:${light ? "#1E293B" : "#F1F5F9"};padding:8px 12px;outline:none;transition:border-color 0.15s;width:100%; }
  input:focus, select:focus, textarea:focus { border-color:#7C3AED; }
  input::placeholder, textarea::placeholder { color:#4A5568; }
  .fab { position:fixed;bottom:28px;right:28px;width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#10B981,#059669);border:none;cursor:pointer;font-size:22px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 18px rgba(16,185,129,0.5);transition:all 0.2s;z-index:100; }
  .fab:hover { transform:scale(1.1);box-shadow:0 6px 24px rgba(16,185,129,0.7); }
  /* ── RESPONSIVE MÓVIL ── */
  html { -webkit-text-size-adjust:100%; }
  @media (max-width:768px) {
    .page { padding-bottom:80px !important; }
    .modal { width:96vw !important;max-width:96vw !important;padding:16px !important; }
    .modal-bg { padding:16px 8px !important;align-items:flex-end !important; }
    .fab { bottom:80px !important;right:16px !important;width:44px !important;height:44px !important;font-size:20px !important; }
    .section-title { font-size:9px !important; }
    .btn-primary, .btn-secondary, .btn-success, .btn-danger { padding:8px 12px !important;font-size:12px !important; }
  }
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
// MODAL DE REGISTRO DE COMIDAS 🍽️
// ============================================================
const MealLogModal = ({ onClose, onSave, defaultType = "desayuno" }) => {
  const [mealType, setMealType]   = useState(defaultType);
  const [selected, setSelected]   = useState([]);   // { ...food, gramos }
  const [pendingFood, setPendingFood] = useState(null); // food esperando gramos
  const [pendingGramos, setPendingGramos] = useState("100");
  const [customName, setCustomName] = useState("");
  const [customCal,  setCustomCal]  = useState("");
  const [customP,    setCustomP]    = useState("");
  const [customC,    setCustomC]    = useState("");
  const [customF,    setCustomF]    = useState("");
  const [search, setSearch] = useState("");
  const [foods,  setFoods]  = useState(mockData.nutrition.quickFoods);

  useEffect(() => {
    if (search.length >= 2) {
      api.nutricion.buscarAlimento(search)
        .then(data => {
          const lista = data?.foods || data || [];
          if (lista.length > 0) {
            setFoods(lista.map(f => ({
              id: f.id, name: f.name,
              cal: f.calories, p: f.protein_g, c: f.carbs_g, f: f.fat_g, emoji: "🥩",
            })));
          }
        }).catch(() => {});
    } else {
      setFoods(mockData.nutrition.quickFoods);
    }
  }, [search]);

  const filtered = search
    ? foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : foods;

  // Escalar nutrientes por gramos ingresados (base = 100 g)
  const scale = (val, gramos) => Math.round(((val || 0) * gramos) / 100 * 10) / 10;

  const confirmarGramos = () => {
    const g = parseFloat(pendingGramos) || 100;
    const f = pendingFood;
    const item = {
      ...f,
      gramos: g,
      cal: scale(f.cal, g),
      p:   scale(f.p,   g),
      c:   scale(f.c,   g),
      f:   scale(f.f,   g),
    };
    setSelected(prev => [...prev, item]);
    setPendingFood(null);
    setPendingGramos("100");
  };

  const total = selected.reduce((a, f) => ({
    cal: a.cal + (f.cal || 0),
    p:   a.p   + (f.p   || 0),
    c:   a.c   + (f.c   || 0),
    fat: a.fat + (f.f   || 0),
  }), { cal: 0, p: 0, c: 0, fat: 0 });

  const addCustom = () => {
    if (!customName || !customCal) return;
    setSelected(prev => [...prev, {
      id: Date.now(), name: customName, gramos: 100,
      cal: parseFloat(customCal) || 0,
      p:   parseFloat(customP)   || 0,
      c:   parseFloat(customC)   || 0,
      f:   parseFloat(customF)   || 0,
      emoji: "🍽️",
    }]);
    setCustomName(""); setCustomCal(""); setCustomP(""); setCustomC(""); setCustomF("");
  };

  const mealConfig = MEAL_TYPES.find(m => m.key === mealType);

  const handleSave = () => {
    if (selected.length === 0) return;
    onSave({ type: mealType, foods: selected, totalCal: Math.round(total.cal), time: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }) });
    onClose();
  };

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: "min(580px, 96vw)", maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>🍽️ Registrar Comida</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Selecciona un alimento → ingresa gramos → confirma</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 18 }}>✕</button>
        </div>

        {/* Selector tipo de comida */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 16 }}>
          {MEAL_TYPES.map(mt => (
            <div key={mt.key} onClick={() => setMealType(mt.key)}
              style={{ padding: "10px 8px", borderRadius: 10, textAlign: "center", cursor: "pointer", border: `2px solid ${mealType === mt.key ? mt.color : "#2D2D45"}`, background: mealType === mt.key ? `${mt.color}15` : "#0A0A14", transition: "all 0.15s" }}>
              <div style={{ fontSize: 20 }}>{mt.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: mealType === mt.key ? mt.color : "#64748B", marginTop: 3 }}>{mt.label}</div>
            </div>
          ))}
        </div>

        {/* Mini-modal de gramos cuando se selecciona un alimento */}
        {pendingFood && (
          <div style={{ marginBottom: 12, padding: "14px 16px", borderRadius: 12, background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div>
                <span style={{ fontSize: 18, marginRight: 8 }}>{pendingFood.emoji}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>{pendingFood.name}</span>
                <span style={{ fontSize: 11, color: "#64748B", marginLeft: 8 }}>(valores por 100 g)</span>
              </div>
              <button onClick={() => { setPendingFood(null); setPendingGramos("100"); }}
                style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 16 }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4 }}>GRAMOS A CONSUMIR</div>
                <input type="number" value={pendingGramos} min="1" max="2000"
                  onChange={e => setPendingGramos(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && confirmarGramos()}
                  style={{ width: "100%", fontSize: 18, fontFamily: "'Orbitron',monospace", fontWeight: 700, textAlign: "center" }}
                  autoFocus />
              </div>
              <div style={{ textAlign: "center", minWidth: 90 }}>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>RESULTADO</div>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color: "#F59E0B" }}>
                  {scale(pendingFood.cal, parseFloat(pendingGramos) || 0)}
                </div>
                <div style={{ fontSize: 10, color: "#64748B" }}>kcal</div>
                <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 4 }}>
                  P:{scale(pendingFood.p, parseFloat(pendingGramos)||0)}g
                  · C:{scale(pendingFood.c, parseFloat(pendingGramos)||0)}g
                  · G:{scale(pendingFood.f, parseFloat(pendingGramos)||0)}g
                </div>
              </div>
              <button className="btn-success" style={{ padding: "10px 16px", fontSize: 13, flexShrink: 0 }} onClick={confirmarGramos}>
                ✓ Agregar
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 14, flex: 1, overflow: "hidden" }}>
          {/* Lista de alimentos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, overflow: "hidden" }}>
            <input placeholder="🔍 Buscar alimento..." value={search} onChange={e => setSearch(e.target.value)} />
            <div style={{ overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
              {filtered.map(food => {
                const inList = selected.some(s => s.id === food.id);
                const isPending = pendingFood?.id === food.id;
                return (
                  <div key={food.id} className="food-chip-sm"
                    onClick={() => {
                      if (inList) { setSelected(p => p.filter(s => s.id !== food.id)); return; }
                      setPendingFood(food);
                      setPendingGramos("100");
                    }}
                    style={{ borderColor: inList ? "rgba(16,185,129,0.5)" : isPending ? "rgba(245,158,11,0.5)" : "#1E1E30", background: inList ? "rgba(16,185,129,0.07)" : isPending ? "rgba(245,158,11,0.07)" : "#0F0F18" }}>
                    <span style={{ fontSize: 18, flexShrink: 0 }}>{food.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 12, color: "#F1F5F9", fontWeight: 600 }}>{food.name}</div>
                      <div style={{ fontSize: 10, color: "#64748B" }}>por 100g — P:{food.p}g · C:{food.c}g · G:{food.f}g</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: "#F59E0B", fontWeight: 700 }}>{food.cal} kcal</div>
                      <div style={{ fontSize: 14, color: inList ? "#10B981" : isPending ? "#F59E0B" : "#374151" }}>
                        {inList ? "✓" : isPending ? "..." : "+"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Alimento personalizado */}
            <div style={{ padding: "10px", borderRadius: 8, background: "#0A0A14", border: "1px solid #1E1E30" }}>
              <div style={{ fontSize: 10, color: "#4A5568", marginBottom: 6, fontFamily: "'Orbitron',monospace", letterSpacing: 1 }}>+ PERSONALIZADO</div>
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                <input placeholder="Nombre" value={customName} onChange={e => setCustomName(e.target.value)} style={{ flex: "2 1 80px", minWidth: 80 }} />
                <input type="number" placeholder="kcal" value={customCal} onChange={e => setCustomCal(e.target.value)} style={{ flex: "1 1 50px", minWidth: 50 }} />
                <input type="number" placeholder="P(g)" value={customP} onChange={e => setCustomP(e.target.value)} style={{ flex: "1 1 44px", minWidth: 44 }} />
                <input type="number" placeholder="C(g)" value={customC} onChange={e => setCustomC(e.target.value)} style={{ flex: "1 1 44px", minWidth: 44 }} />
                <input type="number" placeholder="G(g)" value={customF} onChange={e => setCustomF(e.target.value)} style={{ flex: "1 1 44px", minWidth: 44 }} />
                <button className="btn-success" style={{ padding: "6px 12px", fontSize: 12, flexShrink: 0 }} onClick={addCustom}>+</button>
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div style={{ padding: "12px", borderRadius: 10, background: `${mealConfig.color}10`, border: `1px solid ${mealConfig.color}30` }}>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>{mealConfig.icon} {mealConfig.label}</div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 26, fontWeight: 900, color: mealConfig.color, textAlign: "center" }}>{Math.round(total.cal)}</div>
              <div style={{ fontSize: 10, color: "#64748B", textAlign: "center", marginBottom: 10 }}>kcal total</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
                <span style={{ color: "#7C3AED" }}>P: {total.p.toFixed(1)}g</span>
                <span style={{ color: "#06B6D4" }}>C: {total.c.toFixed(1)}g</span>
                <span style={{ color: "#F59E0B" }}>G: {total.fat.toFixed(1)}g</span>
              </div>
            </div>
            <div style={{ fontSize: 10, color: "#4A5568", fontFamily: "'Orbitron',monospace", letterSpacing: 1, marginTop: 4 }}>SELECCIONADOS</div>
            <div style={{ flex: 1, overflowY: "auto" }}>
              {selected.length === 0
                ? <div style={{ color: "#2D2D45", fontSize: 12, textAlign: "center", padding: "16px 0" }}>Ninguno aún</div>
                : selected.map((f, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 0", borderBottom: "1px solid #1A1A28", fontSize: 12 }}>
                    <div>
                      <span style={{ color: "#CBD5E1" }}>{f.emoji} {f.name}</span>
                      <div style={{ fontSize: 10, color: "#64748B" }}>{f.gramos}g</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <span style={{ color: "#F59E0B", fontSize: 11 }}>{f.cal} kcal</span>
                      <span onClick={() => setSelected(p => p.filter((_, idx) => idx !== i))} style={{ color: "#EF4444", cursor: "pointer", fontWeight: 700, fontSize: 13 }}>×</span>
                    </div>
                  </div>
                ))
              }
            </div>
            <button className="btn-success" style={{ width: "100%", marginTop: 8 }} onClick={handleSave} disabled={selected.length === 0}>
              ✓ Guardar {mealConfig.label}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// BODY HEATMAP
// ============================================================
const BodyHeatMap = ({ data }) => {
  const [hovered, setHovered] = useState(null);

  const hc = (v) => {
    if (!v || v < 1)  return "#1A1A28";
    if (v < 20)       return "#1C2A4A";
    if (v < 40)       return "#312E81";
    if (v < 65)       return "#6D28D9";
    if (v < 82)       return "#F59E0B";
    return "#EF4444";
  };
  const gw = (v) => {
    if (v >= 82) return "drop-shadow(0 0 6px rgba(239,68,68,0.85))";
    if (v >= 65) return "drop-shadow(0 0 5px rgba(245,158,11,0.75))";
    if (v >= 40) return "drop-shadow(0 0 3px rgba(109,40,217,0.6))";
    return "none";
  };

  // act = valor de activación muscular (0-100), ...props va al elemento SVG
  const M = ({ shape, act, label, exercises = [], ...props }) => {
    const El = shape || "ellipse";
    return (
      <El
        {...props}
        fill={hc(act)}
        stroke="#080810"
        strokeWidth="0.7"
        style={{ filter: gw(act), cursor: "pointer", transition: "fill 0.3s, filter 0.3s" }}
        onMouseEnter={() => setHovered({ label, v: act, exercises })}
        onMouseLeave={() => setHovered(null)}
      />
    );
  };

  const F  = data?.front     || {};
  const B  = data?.back      || {};
  const ex = data?.exercises || {};

  const silueta = (
    <>
      {/* Cabeza */}
      <ellipse cx="50" cy="11" rx="10" ry="11" fill="#1A1A28" stroke="#2D2D45" strokeWidth="0.8" />
      <rect x="45" y="22" width="10" height="8" rx="2" fill="#1A1A28" />
      {/* Torso */}
      <path d="M28,30 Q22,50 22,76 Q22,92 30,100 Q38,108 50,108 Q62,108 70,100 Q78,92 78,76 Q78,50 72,30 Q62,25 50,24 Q38,25 28,30 Z" fill="#0D0D1A" stroke="#1E1E30" strokeWidth="1" />
      {/* Brazo izq */}
      <path d="M22,35 Q10,52 9,76 Q8,91 12,101 L17,99 Q14,86 15,73 Q16,56 25,41 Z" fill="#0D0D1A" stroke="#1E1E30" strokeWidth="0.8" />
      {/* Brazo der */}
      <path d="M78,35 Q90,52 91,76 Q92,91 88,101 L83,99 Q86,86 85,73 Q84,56 75,41 Z" fill="#0D0D1A" stroke="#1E1E30" strokeWidth="0.8" />
      {/* Manos */}
      <ellipse cx="13" cy="104" rx="5" ry="7" fill="#1A1A28" stroke="#2D2D45" strokeWidth="0.5" />
      <ellipse cx="87" cy="104" rx="5" ry="7" fill="#1A1A28" stroke="#2D2D45" strokeWidth="0.5" />
      {/* Cadera */}
      <path d="M30,100 Q30,116 36,126 Q42,136 50,136 Q58,136 64,126 Q70,116 70,100 Q62,106 50,106 Q38,106 30,100 Z" fill="#0D0D1A" stroke="#1E1E30" strokeWidth="1" />
      {/* Pierna izq */}
      <path d="M36,126 Q30,142 30,167 Q30,186 38,196 L44,196 Q37,186 37,166 Q37,143 43,129 Z" fill="#0D0D1A" stroke="#1E1E30" strokeWidth="0.8" />
      {/* Pierna der */}
      <path d="M64,126 Q70,142 70,167 Q70,186 62,196 L56,196 Q63,186 63,166 Q63,143 57,129 Z" fill="#0D0D1A" stroke="#1E1E30" strokeWidth="0.8" />
      {/* Pies */}
      <ellipse cx="39" cy="198" rx="8" ry="4" fill="#1A1A28" stroke="#2D2D45" strokeWidth="0.5" />
      <ellipse cx="61" cy="198" rx="8" ry="4" fill="#1A1A28" stroke="#2D2D45" strokeWidth="0.5" />
    </>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <div style={{ display: "flex", gap: 28 }}>

        {/* ── FRONTAL ── */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#4A5568", letterSpacing: 2, marginBottom: 6, fontFamily: "'Orbitron',monospace" }}>FRONTAL</div>
          <svg viewBox="0 0 100 210" width="115" height="220">
            {silueta}
            {/* Pecho */}
            <M shape="ellipse" act={F.chest||0}      label="Pecho"           exercises={ex.chest}      cx="41" cy="46" rx="13" ry="11" />
            <M shape="ellipse" act={F.chest||0}      label="Pecho"           exercises={ex.chest}      cx="59" cy="46" rx="13" ry="11" />
            {/* Deltoides Anterior */}
            <M shape="ellipse" act={F.frontDelts||0} label="Deltoides Ant."  exercises={ex.frontDelts} cx="24" cy="38" rx="9"  ry="8"  />
            <M shape="ellipse" act={F.frontDelts||0} label="Deltoides Ant."  exercises={ex.frontDelts} cx="76" cy="38" rx="9"  ry="8"  />
            {/* Bíceps */}
            <M shape="ellipse" act={F.biceps||0}     label="Bíceps"          exercises={ex.biceps}     cx="14" cy="63" rx="5"  ry="12" />
            <M shape="ellipse" act={F.biceps||0}     label="Bíceps"          exercises={ex.biceps}     cx="86" cy="63" rx="5"  ry="12" />
            {/* Antebrazo */}
            <M shape="ellipse" act={F.forearms||0}   label="Antebrazo"       exercises={ex.forearms}   cx="12" cy="88" rx="4"  ry="10" />
            <M shape="ellipse" act={F.forearms||0}   label="Antebrazo"       exercises={ex.forearms}   cx="88" cy="88" rx="4"  ry="10" />
            {/* Abdomen */}
            <M shape="rect"    act={F.abs||0}        label="Abdomen"         exercises={ex.abs}        x="44" y="61" width="12" height="22" rx="3" />
            {/* Oblicuos */}
            <M shape="ellipse" act={F.obliques||0}   label="Oblicuos"        exercises={ex.obliques}   cx="34" cy="72" rx="8"  ry="14" />
            <M shape="ellipse" act={F.obliques||0}   label="Oblicuos"        exercises={ex.obliques}   cx="66" cy="72" rx="8"  ry="14" />
            {/* Cuádriceps */}
            <M shape="ellipse" act={F.quads||0}      label="Cuádriceps"      exercises={ex.quads}      cx="39" cy="149" rx="9" ry="21" />
            <M shape="ellipse" act={F.quads||0}      label="Cuádriceps"      exercises={ex.quads}      cx="61" cy="149" rx="9" ry="21" />
            {/* Gemelos */}
            <M shape="ellipse" act={F.calves||0}     label="Gemelos"         exercises={ex.calves}     cx="37" cy="182" rx="7" ry="12" />
            <M shape="ellipse" act={F.calves||0}     label="Gemelos"         exercises={ex.calves}     cx="63" cy="182" rx="7" ry="12" />
          </svg>
        </div>

        {/* ── POSTERIOR ── */}
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "#4A5568", letterSpacing: 2, marginBottom: 6, fontFamily: "'Orbitron',monospace" }}>POSTERIOR</div>
          <svg viewBox="0 0 100 210" width="115" height="220">
            {silueta}
            {/* Trapecio */}
            <M shape="path"    act={B.traps||0}      label="Trapecio"        exercises={ex.traps}      d="M30,28 Q50,22 70,28 Q65,44 50,48 Q35,44 30,28 Z" />
            {/* Deltoides Posterior */}
            <M shape="ellipse" act={B.rearDelts||0}  label="Deltoides Post." exercises={ex.rearDelts}  cx="23" cy="39" rx="9"  ry="8"  />
            <M shape="ellipse" act={B.rearDelts||0}  label="Deltoides Post." exercises={ex.rearDelts}  cx="77" cy="39" rx="9"  ry="8"  />
            {/* Dorsales */}
            <M shape="path"    act={B.lats||0}       label="Dorsales"        exercises={ex.lats}       d="M33,49 Q22,63 22,81 Q22,91 30,98 Q38,104 50,104 Q62,104 70,98 Q78,91 78,81 Q78,63 67,49 Q60,57 50,59 Q40,57 33,49 Z" />
            {/* Tríceps */}
            <M shape="ellipse" act={B.triceps||0}    label="Tríceps"         exercises={ex.triceps}    cx="14" cy="63" rx="5"  ry="12" />
            <M shape="ellipse" act={B.triceps||0}    label="Tríceps"         exercises={ex.triceps}    cx="86" cy="63" rx="5"  ry="12" />
            {/* Antebrazo */}
            <M shape="ellipse" act={B.forearms||0}   label="Antebrazo"       exercises={ex.forearms}   cx="12" cy="88" rx="4"  ry="10" />
            <M shape="ellipse" act={B.forearms||0}   label="Antebrazo"       exercises={ex.forearms}   cx="88" cy="88" rx="4"  ry="10" />
            {/* Lumbar */}
            <M shape="rect"    act={B.lowerBack||0}  label="Lumbar"          exercises={ex.lowerBack}  x="38" y="80" width="24" height="14" rx="4" />
            {/* Glúteos */}
            <M shape="ellipse" act={B.glutes||0}     label="Glúteos"         exercises={ex.glutes}     cx="40" cy="110" rx="14" ry="13" />
            <M shape="ellipse" act={B.glutes||0}     label="Glúteos"         exercises={ex.glutes}     cx="60" cy="110" rx="14" ry="13" />
            {/* Isquiotibiales */}
            <M shape="ellipse" act={B.hamstrings||0} label="Isquiotibiales"  exercises={ex.hamstrings} cx="39" cy="152" rx="9"  ry="21" />
            <M shape="ellipse" act={B.hamstrings||0} label="Isquiotibiales"  exercises={ex.hamstrings} cx="61" cy="152" rx="9"  ry="21" />
            {/* Gemelos */}
            <M shape="ellipse" act={B.calves||0}     label="Gemelos"         exercises={ex.calves}     cx="37" cy="183" rx="7"  ry="12" />
            <M shape="ellipse" act={B.calves||0}     label="Gemelos"         exercises={ex.calves}     cx="63" cy="183" rx="7"  ry="12" />
          </svg>
        </div>
      </div>

      {/* Tooltip al hacer hover */}
      <div style={{ minHeight: 44, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        {hovered ? (
          <div style={{ textAlign: "center" }}>
            <div style={{ padding: "5px 16px", borderRadius: 999, background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.4)", fontSize: 12, color: "#A78BFA", fontWeight: 700, display: "inline-block" }}>
              {hovered.label} —{" "}
              <span style={{ color: hovered.v >= 82 ? "#EF4444" : hovered.v >= 65 ? "#F59E0B" : hovered.v >= 40 ? "#A78BFA" : "#6D28D9" }}>
                {hovered.v}%
              </span>
            </div>
            {hovered.exercises?.length > 0 && (
              <div style={{ fontSize: 10, color: "#4A5568", marginTop: 4 }}>
                {hovered.exercises.slice(0, 3).join(" · ")}
              </div>
            )}
            {hovered.v === 0 && (
              <div style={{ fontSize: 10, color: "#2D2D45", marginTop: 3 }}>No trabajado esta semana</div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: 11, color: "#2D2D45" }}>Pasa el cursor sobre un músculo</div>
        )}
      </div>

      {/* Leyenda */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        {[
          { l: "Sin trabajo", c: "#1A1A28" },
          { l: "Bajo",        c: "#1C2A4A" },
          { l: "Medio",       c: "#312E81" },
          { l: "Alto",        c: "#6D28D9" },
          { l: "Intenso",     c: "#F59E0B" },
          { l: "Máximo",      c: "#EF4444" },
        ].map(x => (
          <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: x.c, border: "1px solid #2D2D45" }} />
            <span style={{ fontSize: 10, color: "#64748B" }}>{x.l}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================
// DASHBOARD — versión completa
// Reemplaza líneas 657–770 de App.js
// (desde "const DashPanelFitness" hasta antes de "// PÁGINA: OBJETIVOS")
// ============================================================

const DashboardPage = ({ tasks, setTasks, habits, setHabits, game, onLogMeal, onNavigate }) => {
  const [panelTab, setPanelTab] = useState("fitness");
  const [exercises, setExercises] = useState([]);
  const aguaKey = `lifehud_agua_${new Date().toISOString().split('T')[0]}`;
  const [agua, setAgua] = useState(() => parseInt(localStorage.getItem(`lifehud_agua_${new Date().toISOString().split('T')[0]}`) || '0'));

  const agregarVaso = () => {
    setAgua(prev => {
      const nuevo = Math.min(prev + 1, 8);
      localStorage.setItem(aguaKey, String(nuevo));
      api.nutricion.registrarAgua(250).catch(() => {});
      return nuevo;
    });
  };
  const [feedItems, setFeedItems] = useState([]);
  const [dashFinanzas, setDashFinanzas] = useState({ balance: 0, monthIncome: 0, monthExpense: 0, savingsRate: 0 });
  const [dashNutricion, setDashNutricion] = useState(() => {
    const calM = parseInt(localStorage.getItem('lifehud_cal_meta') || '2200');
    const mm   = JSON.parse(localStorage.getItem('lifehud_macros_meta') || '{}');
    return { calories: { consumed: 0, goal: calM }, macros: { protein: { consumed: 0, goal: mm.proteina||150 }, carbs: { consumed: 0, goal: mm.carbs||250 }, fat: { consumed: 0, goal: mm.grasa||80 } }, water: { consumed: 0, goal: 2.5 } };
  });
  const [dashFitness, setDashFitness] = useState({ streak: 0 });
  const [dashSkills, setDashSkills] = useState([]);
  const [dashCursos, setDashCursos] = useState([]);
  const [weekProgress, setWeekProgress] = useState([0,0,0,0,0,0,0]);
  const [alertasReales, setAlertasReales] = useState([]);
  const [barrilesReales, setBarrilesReales] = useState([]);
  const [activeGoalDash, setActiveGoalDash] = useState(null);
  // Nutrición: leer meta calórica y minutos de estudio de localStorage
  const calMetaDash  = parseInt(localStorage.getItem('lifehud_cal_meta') || '2200');
  const studyHoy     = (() => {
    const key = `lifehud_study_${new Date().toISOString().split('T')[0]}`;
    return parseInt(localStorage.getItem(key) || '0');
  })();
  const studyMeta    = 60;

  useEffect(() => {
    // Finanzas
    api.finanzas.resumen()
      .then(d => {
        const bal  = parseFloat(d.balance       || 0);
        const inc  = parseFloat(d.total_income  || 0);
        const exp  = parseFloat(d.total_expenses|| 0);
        setDashFinanzas({ balance: bal, monthIncome: inc, monthExpense: exp, savingsRate: d.savings_rate || 0 });
        // Alertas reales de presupuesto desde categorías
        fetch(`${API_URL}/api/v1/finance/categories`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("life_hud_token")}` }
        }).then(r => r.json()).then(cats => {
          const alertas = (cats || [])
            .filter(c => c.spent > 0 && c.budget > 0)
            .map(c => ({ cat: c.name, emoji: c.icon || "📊", pct: Math.round((c.spent / c.budget) * 100), excedido: c.spent > c.budget }))
            .filter(a => a.pct >= 80)
            .slice(0, 3);
          setAlertasReales(alertas);
        }).catch(() => {});
        // Barriles / metas de ahorro
        fetch(`${API_URL}/api/v1/finance/barrels`, {
          headers: { "Authorization": `Bearer ${localStorage.getItem("life_hud_token")}` }
        }).then(r => r.json()).then(data => {
          setBarrilesReales((data || []).slice(0, 2).map(b => ({
            name: b.name, emoji: b.emoji || "🎯",
            current: parseFloat(b.current_amount || b.current || 0),
            goal:    parseFloat(b.goal_amount    || b.goal    || 1),
            color:   b.color || "#7C3AED",
          })));
        }).catch(() => {});
      }).catch(() => {});

    // Nutrición — usar calorías de localStorage (más fiable que backend)
    const todayKey = `lifehud_meals_${new Date().toISOString().split('T')[0]}`;
    const mealsHoy = JSON.parse(localStorage.getItem(todayKey) || '[]');
    const calCons  = mealsHoy.reduce((s, m) => s + (m.calories || 0), 0);
    const macrosMeta = JSON.parse(localStorage.getItem('lifehud_macros_meta') || '{}');
    setDashNutricion({
      calories: { consumed: calCons, goal: calMetaDash },
      macros: {
        protein: { consumed: mealsHoy.reduce((s,m) => s + m.foods?.reduce((a,f)=>a+(f.p||0),0)||0, 0), goal: macrosMeta.proteina || 150 },
        carbs:   { consumed: mealsHoy.reduce((s,m) => s + m.foods?.reduce((a,f)=>a+(f.c||0),0)||0, 0), goal: macrosMeta.carbs    || 250 },
        fat:     { consumed: mealsHoy.reduce((s,m) => s + m.foods?.reduce((a,f)=>a+(f.f||0),0)||0, 0), goal: macrosMeta.grasa    || 80  },
      },
      water: { consumed: 0, goal: 2.5 },
    });
    // También intentar agua del backend
    api.nutricion.resumenHoy()
      .then(d => setAgua(Math.round((d.water_consumed_ml || 0) / 250)))
      .catch(() => {});

    // Fitness
    api.fitness.resumen()
      .then(d => {
        setDashFitness({ streak: d.current_streak || 0 });
        setExercises((d.today_exercises || []).map(e => ({ ...e, done: false })));
      }).catch(() => {});

    // Learning — skills + cursos
    api.learning.skills()
      .then(d => setDashSkills((d || []).slice(0, 3).map(s => ({
        name: s.name, icon: "💡", level: s.current_level,
        xp: s.xp_accumulated || 0, xpNext: 3000,
        hours: s.hours_invested || 0, color: "#06B6D4",
      })))).catch(() => {});
    api.learning.cursos()
      .then(d => setDashCursos((d || []).slice(0, 2).map(c => ({
        id: c.id, name: c.name, icon: "🎓",
        progress: c.progress_percentage || 0,
        color: "#7C3AED",
      })))).catch(() => {});

    // Progreso semanal — calcular desde localStorage de hábitos + tareas
    const dias7 = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      const fecha = d.toISOString().split('T')[0];
      const mealsCal = (() => { try { return JSON.parse(localStorage.getItem(`lifehud_meals_${fecha}`) || '[]').length > 0 ? 25 : 0; } catch { return 0; } })();
      const studied  = parseInt(localStorage.getItem(`lifehud_study_${fecha}`) || '0') > 0 ? 25 : 0;
      const trained  = localStorage.getItem('lifehud_fitness_hoy') === fecha ? 25 : 0;
      return Math.min(mealsCal + studied + trained + (i === 6 ? 0 : 10), 100);
    });
    setWeekProgress(dias7);

    // Objetivo activo del dashboard
    try {
      const goals = JSON.parse(localStorage.getItem('lifehud_goals') || '[]');
      if (goals.length > 0) setActiveGoalDash(goals[0]);
    } catch {}

    // Feed de actividad reciente
    const feed = [];
    const fitnessHoy = localStorage.getItem('lifehud_fitness_hoy');
    const hoyStr = new Date().toISOString().split('T')[0];
    if (fitnessHoy === hoyStr) feed.push({ icon: "💪", texto: "Entrenamiento completado hoy", tiempo: "Hoy", color: "#EF4444" });
    if (mealsHoy.length > 0) feed.push({ icon: "🍽️", texto: `${mealsHoy.length} comida${mealsHoy.length>1?'s':''} registrada${mealsHoy.length>1?'s':''}`, tiempo: "Hoy", color: "#10B981" });
    if (studyHoy > 0) feed.push({ icon: "📚", texto: `${studyHoy} min de estudio registrados`, tiempo: "Hoy", color: "#7C3AED" });
    setFeedItems(feed);
  }, []);

  const f  = dashFinanzas;
  const n  = dashNutricion;
  const fi = dashFitness;
  const l  = { skills: dashSkills, courses: dashCursos, todayMinutes: studyHoy, todayGoal: studyMeta,
    weekStudy: Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return parseInt(localStorage.getItem(`lifehud_study_${d.toISOString().split('T')[0]}`) || '0');
    }),
  };

  const doneTasks  = tasks.filter(t => t.done || t.status === "completed").length;
  const doneHabits = habits.filter(h => h.history?.[h.history.length-1]?.done).length;
  const doneExercises = exercises.filter(e => e.done).length;
  const ahorro = f.monthIncome - f.monthExpense;

  // ── Día Perfecto ────────────────────────────────────────────
  const diaPerfecto = [
    { label: "Tareas",   done: doneTasks,          total: tasks.length,          color: "#7C3AED" },
    { label: "Hábitos",  done: doneHabits,          total: habits.length,         color: "#10B981" },
    { label: "Ejercicio",done: doneExercises,        total: exercises.length,      color: "#EF4444" },
    { label: "Estudio",  done: studyHoy, total: studyMeta, color: "#A78BFA" },
    { label: "Agua",     done: agua,                total: 8,                     color: "#06B6D4" },
  ];
  const puntajeDia = Math.round(
    diaPerfecto.reduce((acc, d) => acc + (d.total > 0 ? (d.done / d.total) : 0), 0) / diaPerfecto.length * 100
  );
  const diaColor = puntajeDia >= 80 ? "#10B981" : puntajeDia >= 50 ? "#F59E0B" : "#EF4444";

  // ── Alertas finanzas — datos reales ────────────────────────
  const alertasPresupuesto = alertasReales.length > 0 ? alertasReales : [];

  // ── Panel lateral rotativo ───────────────────────────────────
  const renderPanel = () => {
    if (panelTab === "fitness") {
      const done = exercises.filter(e => e.done).length;
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, color: "#CBD5E1", fontWeight: 700 }}>🏋️ {fi.todayRoutine?.name || "Sin rutina hoy"}</span>
            <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: "#EF4444" }}>{done}/{exercises.length}</span>
          </div>
          <ProgressBar value={done} max={exercises.length} color="#EF4444" height={5} />
          <div style={{ display: "flex", gap: 4 }}>
            {(fi.weekWorkouts || []).map((t, i) => (
              <div key={i} style={{ flex: 1, height: 24, borderRadius: 5, background: t ? "rgba(239,68,68,0.2)" : "#1A1A28", border: `1px solid ${t ? "#EF4444" : "#2D2D45"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10 }}>
                {t ? "🔥" : ""}
              </div>
            ))}
          </div>
          {exercises.slice(0, 4).map((ex, i) => (
            <div key={i} onClick={() => setExercises(p => p.map((e, idx) => idx === i ? { ...e, done: !e.done } : e))}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 10px", borderRadius: 7, background: "#0F0F18", border: "1px solid #1E1E30", cursor: "pointer", opacity: ex.done ? 0.5 : 1 }}>
              <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${ex.done ? "#EF4444" : "#374151"}`, background: ex.done ? "#EF4444" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, flexShrink: 0, color: "white" }}>{ex.done && "✓"}</div>
              <span style={{ flex: 1, fontSize: 12, color: "#E2E8F0" }}>{ex.name}</span>
              <span style={{ fontSize: 10, color: "#64748B" }}>{ex.sets}×{ex.reps}</span>
            </div>
          ))}
          <div style={{ fontSize: 11, color: "#64748B", textAlign: "center", marginTop: 4 }}>🔥 Racha: <span style={{ color: "#EF4444", fontWeight: 700 }}>{fi.streak || 0} días</span></div>
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <button onClick={() => onNavigate && onNavigate(6)} className="btn-secondary" style={{ flex: 1, fontSize: 11, padding: "6px 4px" }}>💪 Entrenar</button>
            <button onClick={() => onNavigate && onNavigate(6)} className="btn-secondary" style={{ flex: 1, fontSize: 11, padding: "6px 4px" }}>📊 Ver más</button>
          </div>
        </div>
      );
    }

    if (panelTab === "nutricion") {
      const pct = (n.calories.consumed / n.calories.goal) * 100;
      const macroColors = { protein: "#7C3AED", carbs: "#06B6D4", fat: "#F59E0B" };
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative", flexShrink: 0 }}>
              <svg width="68" height="68" viewBox="0 0 68 68">
                <circle cx="34" cy="34" r="27" fill="none" stroke="#1E1E30" strokeWidth="7" />
                <circle cx="34" cy="34" r="27" fill="none" stroke={pct > 100 ? "#EF4444" : "#10B981"} strokeWidth="7"
                  strokeDasharray={`${2 * Math.PI * 27 * Math.min(pct, 100) / 100} ${2 * Math.PI * 27}`}
                  strokeLinecap="round" transform="rotate(-90 34 34)" />
              </svg>
              <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
                <div style={{ fontSize: 12, fontWeight: 900, fontFamily: "'Orbitron',monospace", color: "#F1F5F9" }}>{n.calories.consumed}</div>
                <div style={{ fontSize: 8, color: "#64748B" }}>kcal</div>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              {Object.entries(n.macros).map(([k, v]) => (
                <div key={k} style={{ marginBottom: 6 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                    <span style={{ color: "#94A3B8", textTransform: "capitalize" }}>{k}</span>
                    <span style={{ color: macroColors[k] }}>{v.consumed}g / {v.goal}g</span>
                  </div>
                  <ProgressBar value={v.consumed} max={v.goal} color={macroColors[k]} height={3} />
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} onClick={() => { if (i >= agua) agregarVaso(); else setAgua(i); }}
                style={{ fontSize: 16, cursor: "pointer", opacity: i < agua ? 1 : 0.25, transition: "all 0.15s" }}>💧</div>
            ))}
            <span style={{ fontSize: 10, color: "#06B6D4", marginLeft: 4, alignSelf: "center" }}>{agua}/8 vasos</span>
          </div>
          <button onClick={onLogMeal} className="btn-success" style={{ width: "100%", fontSize: 12, padding: "6px" }}>+ Registrar comida</button>
        </div>
      );
    }

    if (panelTab === "learning") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 12px", borderRadius: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)" }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 900, color: "#A78BFA" }}>{l.todayMinutes || 0}m</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                <span style={{ color: "#64748B" }}>Hoy</span>
                <span style={{ color: "#A78BFA" }}>Meta: {l.todayGoal}m</span>
              </div>
              <ProgressBar value={l.todayMinutes || 0} max={l.todayGoal || 60} color="#7C3AED" height={4} />
            </div>
          </div>
          {(l.courses || []).slice(0, 2).map(c => (
            <div key={c.id} style={{ padding: "8px 10px", borderRadius: 7, background: "#0F0F18", border: "1px solid #1E1E30" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: "#F1F5F9", fontWeight: 600 }}>{c.icon} {c.name}</span>
                <span style={{ fontSize: 11, color: c.color, fontWeight: 700 }}>{c.progress}%</span>
              </div>
              <ProgressBar value={c.progress} max={100} color={c.color} height={3} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 4 }}>
            {(l.weekStudy || []).map((m, i) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                <div style={{ width: "100%", height: 36, background: "#1A1A28", borderRadius: 3, display: "flex", alignItems: "flex-end" }}>
                  <div style={{ width: "100%", height: `${Math.min((m / 120) * 100, 100)}%`, borderRadius: 3, background: m > 0 ? "#7C3AED" : "#1A1A28" }} />
                </div>
                <span style={{ fontSize: 8, color: "#4A5568" }}>{"LMXJVSd"[i]}</span>
              </div>
            ))}
          </div>
          {(l.skills || []).slice(0, 2).map((s, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, padding: "5px 0", borderBottom: "1px solid #1A1A28" }}>
              <span style={{ color: "#94A3B8" }}>{s.icon} {s.name}</span>
              <span className="tag" style={{ background: `${s.color}20`, color: s.color }}>{s.level}</span>
            </div>
          ))}
          <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
            <button onClick={() => onNavigate && onNavigate(5)} className="btn-secondary" style={{ flex: 1, fontSize: 11, padding: "6px 4px" }}>📚 Cursos</button>
            <button onClick={() => onNavigate && onNavigate(5)} className="btn-secondary" style={{ flex: 1, fontSize: 11, padding: "6px 4px" }}>🃏 Cards</button>
            <button onClick={() => onNavigate && onNavigate(5)} className="btn-secondary" style={{ flex: 1, fontSize: 11, padding: "6px 4px" }}>⏱ Pomodoro</button>
          </div>
        </div>
      );
    }

    if (panelTab === "finanzas") {
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
            {[
              { label: "Balance",  value: `$${(f.balance / 1000).toFixed(1)}k`, color: "#F1F5F9", icon: "💳" },
              { label: "Ingresos", value: `+$${(f.monthIncome / 1000).toFixed(1)}k`, color: "#10B981", icon: "📈" },
              { label: "Gastos",   value: `-$${(f.monthExpense / 1000).toFixed(1)}k`, color: "#EF4444", icon: "📉" },
            ].map((s, i) => (
              <div key={i} style={{ padding: "7px 6px", borderRadius: 7, background: "#0F0F18", border: "1px solid #1E1E30", textAlign: "center" }}>
                <div style={{ fontSize: 14 }}>{s.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: s.color, fontFamily: "'Orbitron',monospace" }}>{s.value}</div>
                <div style={{ fontSize: 9, color: "#64748B" }}>{s.label}</div>
              </div>
            ))}
          </div>
          {barrilesReales.map((b, i) => {
            const pct = Math.round((b.current / b.goal) * 100);
            return (
              <div key={i} style={{ padding: "7px 10px", borderRadius: 7, background: "#0F0F18", border: "1px solid #1E1E30" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: "#F1F5F9", fontWeight: 600 }}>{b.emoji} {b.name}</span>
                  <span style={{ fontSize: 10, color: b.color, fontWeight: 700 }}>{pct}%</span>
                </div>
                <ProgressBar value={b.current} max={b.goal} color={b.color} height={3} />
              </div>
            );
          })}
          <div style={{ padding: "8px 10px", borderRadius: 8, background: "rgba(16,185,129,0.07)", border: "1px solid rgba(16,185,129,0.2)", fontSize: 11 }}>
            <span style={{ color: "#64748B" }}>Ahorro mensual: </span>
            <span style={{ color: "#10B981", fontWeight: 700, fontFamily: "'Orbitron',monospace" }}>${ahorro.toLocaleString()}</span>
          </div>
          {alertasPresupuesto.filter(a => a.excedido).map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 6, padding: "6px 10px", borderRadius: 7, background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 11 }}>
              <span>{a.emoji}</span>
              <span style={{ color: "#FCA5A5" }}>⚠️ {a.cat} excedido {a.pct}%</span>
            </div>
          ))}
        </div>
      );
    }
  };

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* ── Barra DÍA PERFECTO ── */}
      <div className="card" style={{ padding: "16px 20px", borderTop: `3px solid ${diaColor}`, background: `linear-gradient(135deg, ${diaColor}06, #0F0F1A)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: diaColor, letterSpacing: 2, marginBottom: 3 }}>DÍA PERFECTO</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>Completa todo para llegar al 100%</div>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
            <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 36, fontWeight: 900, color: diaColor }}>{puntajeDia}</span>
            <span style={{ fontSize: 16, color: diaColor, fontWeight: 700 }}>%</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
          {diaPerfecto.map((d, i) => {
            const pct = d.total > 0 ? Math.round((d.done / d.total) * 100) : 0;
            const completo = pct >= 100;
            return (
              <div key={i} style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 10, color: completo ? d.color : "#4A5568", fontWeight: completo ? 700 : 400, marginBottom: 5 }}>
                  {completo ? "✅" : ""} {d.label}
                </div>
                <div style={{ height: 6, background: "#1A1A28", borderRadius: 999, overflow: "hidden" }}>
                  <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: d.color, borderRadius: 999, transition: "all 0.4s" }} />
                </div>
                <div style={{ fontSize: 10, color: d.color, marginTop: 3, fontWeight: 700 }}>{d.done}/{d.total}</div>
              </div>
            );
          })}
        </div>
        {/* Widgets de acción rápida */}
        <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: "1px solid #1A1A28" }}>
          <span style={{ fontSize: 11, color: "#4A5568", marginRight: 4, alignSelf: "center" }}>Acción rápida:</span>
          {[
            { label: "💧 +Agua", action: agregarVaso, color: "#06B6D4" },
            { label: "🍽️ Comida", action: onLogMeal, color: "#10B981" },
            { label: "✅ Tarea hecha`, action: async () => {
                const t = tasks.find(t => !t.done);
                if (!t) return;
                try {
                  await fetch(`${API_URL}/api/v1/tasks/${t.id}/complete`, {
                    method: `POST",
                    headers: { "Authorization": `Bearer ${localStorage.getItem("life_hud_token")}`, "Content-Type": "application/json" }
                  });
                } catch(_) {}
                setTasks(p => p.map(x => x.id === t.id ? { ...x, done: true, status: "completed" } : x));
              }, color: "#7C3AED" },
            { label: "🔄 Hábito`, action: async () => {
                const h = habits.find(h => !h.done);
                if (!h) return;
                try {
                  await fetch(`${API_URL}/api/v1/habits/${h.id}/complete`, {
                    method: `POST",
                    headers: { "Authorization": `Bearer ${localStorage.getItem("life_hud_token")}`, "Content-Type": "application/json" },
                    body: JSON.stringify({})
                  });
                } catch(_) {}
                setHabits(p => p.map(x => x.id === h.id ? { ...x, done: true, streak: Math.max(x.streak, 1) } : x));
              }, color: "#10B981" },
          ].map((w, i) => (
            <button key={i} onClick={w.action}
              style={{ padding: "5px 12px", borderRadius: 999, border: `1px solid ${w.color}30`, background: `${w.color}10`, color: w.color, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", transition: "all 0.15s" }}>
              {w.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Stats XP + Nivel ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12 }}>
        {[
          { label: "Nivel",       value: `LVL ${game.level}`,       icon: "⭐", color: "#F59E0B" },
          { label: "XP",          value: `${game.xp}`,              icon: "✨", color: "#A78BFA" },
          { label: "Monedas",     value: `${game.coins}`,           icon: "🪙", color: "#F59E0B" },
          { label: "Racha global",value: `${game.streak}d`,         icon: "🔥", color: "#EF4444" },
          { label: "Disciplina",  value: `${game.disciplina}%`,     icon: "🛡️", color: game.disciplina > 60 ? "#06B6D4" : game.disciplina > 30 ? "#F59E0B" : "#EF4444" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: "12px 16px", borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 18, marginBottom: 3 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 10, color: "#64748B" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Grid principal ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 300px", gap: 16 }}>

        {/* Columna izquierda */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Objetivo principal — datos reales */}
          <div className="card" style={{ padding: 18, borderTop: `3px solid ${activeGoalDash?.roadmap?.color || "#7C3AED"}` }}>
            <div className="section-title">🎯 Objetivo Principal</div>
            {activeGoalDash ? (
              <>
                <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontSize: 32 }}>{activeGoalDash.roadmap?.emoji || "🎯"}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 2 }}>{activeGoalDash.title}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>Ahorro mensual: ${ahorro.toLocaleString()} MXN</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 900, color: activeGoalDash.roadmap?.color || "#7C3AED" }}>
                      {activeGoalDash.progress}%
                    </div>
                  </div>
                </div>
                <ProgressBar value={activeGoalDash.progress} max={100} color={activeGoalDash.roadmap?.color || "#7C3AED"} height={8} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 8 }}>
                  <span style={{ color: "#10B981", fontWeight: 700 }}>{activeGoalDash.hitos?.filter(h=>h.done).length || 0}/{activeGoalDash.hitos?.length || 0} hitos</span>
                  <span style={{ color: "#4A5568" }}>Sprint: {activeGoalDash.sprint?.tareas?.filter(t=>t.done).length || 0}/{activeGoalDash.sprint?.tareas?.length || 0} tareas</span>
                </div>
                {activeGoalDash.roadmap?.dailyPlan?.aiTip && (
                  <div style={{ marginTop: 10, padding: "9px 12px", borderRadius: 8, background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)", fontSize: 11, color: "#67E8F9", lineHeight: 1.6 }}>
                    🤖 {activeGoalDash.roadmap.dailyPlan.aiTip.substring(0, 120)}{activeGoalDash.roadmap.dailyPlan.aiTip.length > 120 ? "..." : ""}
                  </div>
                )}
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#4A5568" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🎯</div>
                <div style={{ fontSize: 12, marginBottom: 12 }}>Sin objetivos activos</div>
                <button className="btn-primary" style={{ fontSize: 11 }} onClick={() => onNavigate && onNavigate(3)}>+ Crear objetivo</button>
              </div>
            )}
          </div>

          {/* Progreso semanal */}
          <div className="card" style={{ padding: 18, flex: 1 }}>
            <div className="section-title">📊 Progreso Semanal</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 80, marginBottom: 8 }}>
              {weekProgress.map((v, i) => (
                <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ flex: 1, width: "100%", background: "#1A1A28", borderRadius: 4, display: "flex", alignItems: "flex-end" }}>
                    <div style={{ width: "100%", height: `${v}%`, borderRadius: 4, background: i === 6 ? "linear-gradient(0deg,#7C3AED,#A78BFA)" : i === 5 ? "#2D3A5A" : "#2D2D45", transition: "all 0.3s" }} />
                  </div>
                  <span style={{ fontSize: 10, color: i === 6 ? "#A78BFA" : "#4A5568" }}>{"LMXJVSD"[i]}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", justify: "space-between", gap: 10 }}>
              {[
                { label: "Mejor día", value: `${Math.max(...weekProgress)}%`, color: "#10B981" },
                { label: "Promedio",  value: `${Math.round(weekProgress.reduce((a,b)=>a+b,0)/7)}%`, color: "#A78BFA" },
                { label: "Hoy",       value: `${weekProgress[6]}%`, color: "#06B6D4" },
              ].map((s, i) => (
                <div key={i} style={{ flex: 1, padding: "7px 8px", borderRadius: 7, background: "#0A0A12", textAlign: "center" }}>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: 9, color: "#4A5568" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Feed de actividad */}
          <div className="card" style={{ padding: 16 }}>
            <div className="section-title">⚡ Actividad Reciente</div>
            {feedItems.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 10, alignItems: "center", padding: "7px 0", borderBottom: i < feedItems.length - 1 ? "1px solid #1A1A28" : "none" }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: `${item.color}15`, border: `1px solid ${item.color}25`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: "#CBD5E1", fontWeight: 600 }}>{item.texto}</div>
                  <div style={{ fontSize: 10, color: "#4A5568", marginTop: 1 }}>{item.tiempo}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Columna central */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Tareas del día */}
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>✅ Tareas de Hoy</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: "#7C3AED", fontWeight: 700 }}>{doneTasks}/{tasks.length}</span>
                <ProgressBar value={doneTasks} max={tasks.length} color="#7C3AED" height={4} />
              </div>
            </div>
            {tasks.map(task => {
              const prioMap = { alta: "high", media: "medium", baja: "low", high: "high", medium: "medium", low: "low" };
              const prioKey = prioMap[task.priority] || prioMap[task.prioridad] || "medium`;
              const p = priorityConfig[prioKey] || priorityConfig.medium;
              return (
                <div key={task.id} onClick={async () => {
                  const nuevoDone = !task.done;
                  try {
                    if (nuevoDone) {
                      await fetch(`${API_URL}/api/v1/tasks/${task.id}/complete`, {
                        method: `POST",
                        headers: { "Authorization": `Bearer ${localStorage.getItem("life_hud_token")}`, "Content-Type": "application/json` }
                      });
                    } else {
                      await fetch(`${API_URL}/api/v1/tasks/${task.id}`, {
                        method: `PATCH",
                        headers: { "Authorization": `Bearer ${localStorage.getItem("life_hud_token")}`, "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "pending" })
                      });
                    }
                  } catch(e) {}
                  setTasks(prev => prev.map(t => t.id === task.id ? { ...t, done: nuevoDone, status: nuevoDone ? "completed" : "pending" } : t));
                }}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 6, background: task.done ? "rgba(124,58,237,0.04)" : "#0A0A12", border: `1px solid ${task.done ? "rgba(124,58,237,0.2)" : "#1A1A28"}`, opacity: task.done ? 0.6 : 1, transition: "all 0.15s" }}>
                  <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${task.done ? "#7C3AED" : p.color}`, background: task.done ? "#7C3AED" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0, color: "white" }}>{task.done && "✓"}</div>
                  <span style={{ flex: 1, fontSize: 13, color: "#E2E8F0", textDecoration: task.done ? "line-through" : "none" }}>{task.title || task.titulo}</span>
                  <span className="tag" style={{ background: p.bg, color: p.color }}>{p.label}</span>
                </div>
              );
            })}
          </div>

          {/* Hábitos del día */}
          <div className="card" style={{ padding: 16, flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>🔄 Hábitos de Hoy</div>
              <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: "#10B981`, fontWeight: 700 }}>{doneHabits}/{habits.length}</span>
            </div>
            {habits.map(habit => (
              <div key={habit.id} onClick={async () => {
                const habitDone = habit.done || habit.history?.[habit.history.length-1]?.done;
                if (habitDone) return; // No se puede desmarcar
                try {
                  await fetch(`${API_URL}/api/v1/habits/${habit.id}/complete`, {
                    method: `POST",
                    headers: { "Authorization": `Bearer ${localStorage.getItem("life_hud_token")}`, "Content-Type": "application/json" },
                    body: JSON.stringify({})
                  });
                } catch(e) {}
                setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, done: true, streak: Math.max(h.streak, 1) } : h));
              }}
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 6, background: habit.done ? "rgba(16,185,129,0.05)" : "#0A0A12", border: `1px solid ${habit.done ? "rgba(16,185,129,0.2)" : "#1A1A28"}`, transition: "all 0.15s" }}>
                <div style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${habit.done ? "#10B981" : "#374151"}`, background: habit.done ? "#10B981" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0, color: "white" }}>{habit.done && "✓"}</div>
                <span style={{ flex: 1, fontSize: 13, color: "#E2E8F0", textDecoration: habit.done ? "line-through" : "none", opacity: habit.done ? 0.6 : 1 }}>{habit.name}</span>
                <span style={{ fontSize: 11, color: "#EF4444", fontWeight: 700 }}>🔥{habit.done ? Math.max(habit.streak, 1) : habit.streak}d</span>
              </div>
            ))}
          </div>
        </div>

        {/* Columna derecha — Panel rotativo */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="card" style={{ padding: 16, flex: 1 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 5, marginBottom: 14 }}>
              {[
                { key: "fitness",  label: "💪 Fitness",   color: "#EF4444" },
                { key: "nutricion",label: "🥗 Nutrición", color: "#10B981" },
                { key: "learning", label: "📚 Learning",  color: "#7C3AED" },
                { key: "finanzas", label: "💰 Finanzas",  color: "#F59E0B" },
              ].map(m => (
                <button key={m.key} onClick={() => setPanelTab(m.key)}
                  style={{ padding: "6px 4px", borderRadius: 8, border: `1px solid ${panelTab === m.key ? m.color : "#2D2D45"}`, background: panelTab === m.key ? `${m.color}15` : "#0F0F18", color: panelTab === m.key ? m.color : "#64748B", fontSize: 11, fontWeight: panelTab === m.key ? 700 : 400, cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", transition: "all 0.15s" }}>
                  {m.label}
                </button>
              ))}
            </div>
            <div key={panelTab} style={{ animation: "fadeSlide 0.25s ease both" }}>
              {renderPanel()}
            </div>
          </div>

          {/* Resumen financiero rápido */}
          <div className="card" style={{ padding: 16 }}>
            <div className="section-title">💰 Resumen Financiero</div>
            {[
              { label: "Balance",        value: `$${f.balance.toLocaleString()}`, color: "#F1F5F9" },
              { label: "Ahorro este mes",value: `$${ahorro.toLocaleString()}`, color: "#10B981" },
              { label: "Tasa de ahorro", value: `${f.savingsRate}%`, color: "#06B6D4" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1A1A28", fontSize: 12 }}>
                <span style={{ color: "#64748B" }}>{s.label}</span>
                <span style={{ color: s.color, fontWeight: 700, fontFamily: "'Orbitron',monospace" }}>{s.value}</span>
              </div>
            ))}
            {alertasPresupuesto.map((a, i) => (
              <div key={i} style={{ display: "flex", gap: 6, marginTop: 8, padding: "6px 9px", borderRadius: 7, background: a.excedido ? "rgba(239,68,68,0.07)" : "rgba(245,158,11,0.07)", border: `1px solid ${a.excedido ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"}`, fontSize: 11 }}>
                <span>{a.emoji}</span>
                <span style={{ color: a.excedido ? "#FCA5A5" : "#FCD34D" }}>{a.excedido ? "⚠️" : "🔶"} {a.cat}: {a.pct}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PÁGINA: OBJETIVOS / METAS 🎯 — versión mejorada
// ============================================================

// Función que calcula datos REALES de los módulos para cada objetivo
const getDatosReales = (goalKey, mockData) => {
  const ahorro = 0; // Se calcula con datos reales en ObjetivosPage
  const balance = 0;

  const METAS_FINANCIERAS = {
    auto:      { nombre: "Auto", emoji: "🚗", costoEstimado: 80000, ahorroNecesario: 40000 },
    casa:      { nombre: "Casa", emoji: "🏠", costoEstimado: 500000, ahorroNecesario: 100000 },
    viaje:     { nombre: "Viaje", emoji: "✈️", costoEstimado: 25000, ahorroNecesario: 25000 },
    negocio:   { nombre: "Negocio", emoji: "🏢", costoEstimado: 50000, ahorroNecesario: 30000 },
    finanzas:  { nombre: "Fondo", emoji: "💰", costoEstimado: 50000, ahorroNecesario: 50000 },
    educacion: { nombre: "Curso", emoji: "📚", costoEstimado: 15000, ahorroNecesario: 15000 },
  };

  const meta = METAS_FINANCIERAS[goalKey] || { nombre: "Meta", emoji: "🎯", costoEstimado: 30000, ahorroNecesario: 30000 };
  const restante = Math.max(meta.ahorroNecesario - balance, 0);
  const mesesRitmoActual = ahorro > 0 ? Math.ceil(restante / ahorro) : 99;
  const mesesOptimizado = ahorro > 0 ? Math.ceil(restante / (ahorro * 1.3)) : 99;

  return {
    finanzas: {
      balance, ahorro, restante,
      mesesRitmoActual, mesesOptimizado,
      costoEstimado: meta.costoEstimado,
      ahorroNecesario: meta.ahorroNecesario,
      pctAhorrado: Math.min(Math.round((balance / meta.ahorroNecesario) * 100), 100),
    },
    fitness: {
      streak: 0,
      rutina: "Sin rutina",
    },
    learning: {
      skills: [],
      minutosHoy: 0,
      cursosActivos: 0,
    },
  };
};

const ObjetivosPage = ({ setGame }) => {
  const [goals, setGoals] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifehud_goals') || '[]'); }
    catch { return []; }
  });
  const [cargando, setCargando] = useState(true);
  const [realFinanzas, setRealFinanzas] = useState({ balance: 0, monthIncome: 0, monthExpense: 0 });
  const [realFitness, setRealFitness] = useState({ streak: 0, rutina: "Push Day" });
  const [realSkills, setRealSkills] = useState([]);

  useEffect(() => {
    // Cargar skills reales
    api.learning.skills()
      .then(data => setRealSkills((data || []).map(s => ({
        id:    s.id,
        name:  s.name,
        icon:  "💡",
        level: s.current_level,
        color: "#06B6D4",
        xp:    s.xp_accumulated || 0,
        hours: s.hours_invested || 0,
      })))).catch(() => {});

    // Cargar datos reales de finanzas y fitness
    api.finanzas.resumen()
      .then(d => setRealFinanzas({
        balance:      parseFloat(d.balance        || 0),
        monthIncome:  parseFloat(d.total_income   || 0),
        monthExpense: parseFloat(d.total_expenses || 0),
      })).catch(() => {});

    api.fitness.resumen()
      .then(d => setRealFitness({
        streak: d.current_streak || 0,
        rutina: "Push Day",
      })).catch(() => {});
  }, []);

  useEffect(() => {
    api.objetivos.listar()
      .then(data => {
        const mapeados = (data || []).map(g => ({
          id:         g.id,
          key:        g.category || "auto",
          title:      g.name,
          customText: g.description || "",
          progress:   g.completion_percentage || 0,
          status:     g.status || "active",
          created:    g.created_at ? g.created_at.split("T")[0] : "",
          hitos:      (g.milestones || []).map(m => ({
            id:     m.id,
            titulo: m.name,
            fecha:  m.completed_at || "",
            done:   m.is_completed,
            emoji:  "🎯",
          })),
          sprint: { semana: "Esta semana", tareas: [] },
        }));
        // Fusionar: conservar roadmaps y datos locales, agregar los del backend que no estén
        if (mapeados.length > 0) {
          setGoals(prev => {
            const merged = [...prev];
            mapeados.forEach(bg => {
              const exists = merged.find(lg => lg.id === bg.id);
              if (!exists) merged.push(bg);
            });
            localStorage.setItem('lifehud_goals', JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const [activeGoalId, setActiveGoalId] = useState(1);
  const [mapView, setMapView] = useState("diario");
  const [activePhase, setActivePhase] = useState(0);
  const [showNewGoal, setShowNewGoal] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  const [form, setForm] = useState({ title: "", text: "", category: "auto" });
  const [phaseActions, setPhaseActions] = useState({});
  const [dailyDone, setDailyDone] = useState({});
  const [toast, setToast] = useState(null);
  const [showAddHito, setShowAddHito] = useState(false);
  const [hitoForm, setHitoForm] = useState({ titulo: "", fecha: "", emoji: "🎯" });
  const [showAddSprintTask, setShowAddSprintTask] = useState(false);
  const [sprintForm, setSprintForm] = useState({ texto: "", modulo: "📋 Tareas" });

  const activeGoal = goals.find(g => g.id === activeGoalId) || goals[0] || null;
  const roadmap = activeGoal ? (activeGoal.roadmap || buildAIRoadmap(activeGoal.key, mockData)) : { phases: [], dailyPlan: { blocks: [] }, weeklyFocus: [], profileAnalysis: [], skillsNeeded: [], color: '#7C3AED', emoji: '🎯', category: 'General', timeline: { months: 0, optimized: 0 } };
  // Construir objeto de datos reales mezclando backend + mockData
  const realData = {
    finance: {
      balance:      realFinanzas.balance,
      monthIncome:  realFinanzas.monthIncome,
      monthExpense: realFinanzas.monthExpense,
      savingsRate:  0,
    },
    fitness: {
      streak:       realFitness.streak,
      todayRoutine: { name: realFitness.rutina },
      records:      [],
    },
    learning: { skills: realSkills, todayMinutes: 0, todayGoal: 60, flashcards: [], books: [], courses: [] },
    nutrition: { quickFoods: mockData.nutrition.quickFoods, recipes: [], water: { consumed: 0, goal: 2.5 }, calories: { consumed: 0, goal: 2200 }, macros: { protein: { consumed: 0, goal: 150 }, carbs: { consumed: 0, goal: 250 }, fat: { consumed: 0, goal: 80 } } },
    weekProgress: [0,0,0,0,0,0,0],
    user: { name: "Usuario" },
    shop: { items: [] },
  };
  const datosReales = activeGoal ? getDatosReales(activeGoal.key, realData) : {};

  // Acciones
  const toggleAction = (phaseIdx, actionIdx) => {
    const key = `${activeGoal.id}-${phaseIdx}-${actionIdx}`;
    setPhaseActions(p => ({ ...p, [key]: !p[key] }));
  };
  const isActionDone = (phaseIdx, actionIdx) => !!phaseActions[`${activeGoal.id}-${phaseIdx}-${actionIdx}`];
  const toggleDailyAction = (blockIdx, actionIdx) => {
    const key = `${activeGoal.id}-d-${blockIdx}-${actionIdx}`;
    setDailyDone(p => ({ ...p, [key]: !p[key] }));
  };
  const isDailyDone = (blockIdx, actionIdx) => !!dailyDone[`${activeGoal.id}-d-${blockIdx}-${actionIdx}`];
  const completedPhaseActions = (phaseIdx) => {
    if (!roadmap) return 0;
    return roadmap.phases[phaseIdx].actions.filter((_, i) => isActionDone(phaseIdx, i)).length;
  };
  const totalDailyActions = roadmap.dailyPlan.blocks.reduce((a, b) => a + b.actions.length, 0);
  const doneDailyActions = roadmap.dailyPlan.blocks.reduce((sum, block, bi) =>
    sum + block.actions.filter((_, ai) => isDailyDone(bi, ai)).length, 0);

  // Hitos
  const saveGoals = (updated) => {
    localStorage.setItem('lifehud_goals', JSON.stringify(updated));
    return updated;
  };

  const toggleHito = (hitoId) => {
    setGoals(prev => {
      const actualizados = prev.map(g => {
        if (g.id !== activeGoal.id) return g;
        const hitosNuevos = g.hitos.map(h => h.id === hitoId ? { ...h, done: !h.done } : h);
        const completados = hitosNuevos.filter(h => h.done).length;
        const progreso    = Math.round((completados / Math.max(hitosNuevos.length, 1)) * 100);
        // ¿Se acaba de completar el hito que lleva el objetivo al 100%?
        const hitoActivado = hitosNuevos.find(h => h.id === hitoId);
        if (hitoActivado?.done && progreso === 100 && setGame) {
          setGame(gg => ({ ...gg, xp: gg.xp + 100, coins: gg.coins + 50 }));
          setTimeout(() => setToast({ msg: `🏆 ¡Objetivo "${g.title}" completado! +100 XP`, color: "#F59E0B" }), 100);
        } else if (hitoActivado?.done && setGame) {
          setGame(gg => ({ ...gg, xp: gg.xp + 1 }));
        }
        return { ...g, hitos: hitosNuevos, progress: progreso };
      });
      return saveGoals(actualizados);
    });
  };
  
  const agregarHito = () => {
    if (!hitoForm.titulo || !hitoForm.fecha) return;
    setGoals(prev => saveGoals(prev.map(g => g.id !== activeGoal.id ? g : {
      ...g,
      hitos: [...g.hitos, { id: Date.now(), ...hitoForm, done: false }].sort((a, b) => new Date(a.fecha) - new Date(b.fecha)),
    })));
    setHitoForm({ titulo: "", fecha: "", emoji: "🎯" });
    setShowAddHito(false);
    setToast({ msg: "✅ Hito agregado", color: "#10B981" });
  };

  // Sprint
  const toggleSprintTask = (taskId) => {
    setGoals(prev => saveGoals(prev.map(g => g.id !== activeGoal.id ? g : {
      ...g,
      sprint: { ...g.sprint, tareas: g.sprint.tareas.map(t => t.id === taskId ? { ...t, done: !t.done } : t) },
    })));
  };
  const agregarSprintTask = () => {
    if (!sprintForm.texto) return;
    setGoals(prev => saveGoals(prev.map(g => g.id !== activeGoal.id ? g : {
      ...g,
      sprint: { ...g.sprint, tareas: [...g.sprint.tareas, { id: Date.now(), ...sprintForm, done: false }] },
    })));
    setSprintForm({ texto: "", modulo: "📋 Tareas" });
    setShowAddSprintTask(false);
  };

  const addGoal = async () => {
    if (!form.title) return;
    setAiThinking(true);
    try {
      // Crear en backend
      const fechaMax = new Date();
      fechaMax.setMonth(fechaMax.getMonth() + 11);
      const targetDate = fechaMax.toISOString().split("T")[0];
      const res = await api.objetivos.crear({
        name: form.title, description: form.text || null,
        category: form.category, priority: 1,
        target_date: targetDate, requires_savings_barrel: false,
      }).catch(() => ({ id: Date.now(), name: form.title, category: form.category, description: form.text }));

      // Recopilar contexto real del usuario
      const gameData   = JSON.parse(localStorage.getItem('lifehud_game') || '{}');
      const macrosMeta = JSON.parse(localStorage.getItem('lifehud_macros_meta') || '{}');
      const calMeta    = localStorage.getItem('lifehud_cal_meta') || '2200';
      const catConfig  = GOAL_CATEGORIES.find(c => c.key === form.category) || GOAL_CATEGORIES[0];

      const contexto = `
Usuario de Life HUD — app de productividad gamificada.
- Nivel: ${gameData.level || 1} | XP: ${gameData.xp || 0}
- Ahorro mensual: $${(realFinanzas.monthIncome - realFinanzas.monthExpense).toLocaleString()} MXN
- Ingresos mes: $${realFinanzas.monthIncome.toLocaleString()} | Gastos: $${realFinanzas.monthExpense.toLocaleString()}
- Balance actual: $${realFinanzas.balance.toLocaleString()}
- Racha fitness: ${realFitness.streak} días
- Skills: ${realSkills.map(s => s.name).join(', ') || 'sin registrar'}
- Meta calórica diaria: ${calMeta} kcal
${form.text ? `- Detalle extra: ${form.text}` : ''}
`.trim();

      // Llamar al backend para generar roadmap con IA (falla silenciosamente)
      let aiRoadmap = null;
      try {
        const backendRes = await fetch(`${API_URL}/api/v1/ai/roadmap`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("life_hud_token")}`,
          },
          body: JSON.stringify({
            goal_title: form.title,
            goal_text:  form.text || "",
            category:   catConfig.label,
            emoji:      catConfig.emoji,
            context:    contexto,
          }),
        });
        if (backendRes.ok) {
          const bd = await backendRes.json();
          const raw = (bd.result || bd.content || "").trim();
          console.log("[IA] status:", backendRes.status, "| raw preview:", raw.substring(0, 150));
          if (raw) {
            // Extraer solo el JSON aunque venga con texto alrededor
            const jsonMatch = raw.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              aiRoadmap = JSON.parse(jsonMatch[0]);
              console.log("[IA] roadmap parseado OK, fases:", aiRoadmap?.phases?.length);
            } else {
              console.log("[IA] no se encontró JSON en la respuesta");
            }
          }
        } else {
          const errBody = await backendRes.text();
          console.log("[IA] backend error:", backendRes.status, errBody.substring(0, 200));
        }
      } catch (parseErr) {
        console.log("[IA] excepción:", parseErr.message);
      }

            // Fallback al roadmap hardcodeado si la API falla
      const fallback = buildAIRoadmap(form.category, mockData);
      const roadmapFinal = aiRoadmap || fallback;

      const nuevo = {
        id:         res.id,
        key:        form.category,
        title:      form.title,
        customText: form.text || "",
        progress:   0,
        status:     "active",
        created:    new Date().toLocaleDateString("es-MX", { month: "short", year: "numeric" }),
        hitos:      [],
        sprint:     { semana: "Esta semana", tareas: [] },
        roadmap:    roadmapFinal,
      };

      setGoals(prev => {
        const nuevos = [...prev, nuevo];
        localStorage.setItem('lifehud_goals', JSON.stringify(nuevos));
        return nuevos;
      });
      setActiveGoalId(nuevo.id);
      setShowNewGoal(false);
      setForm({ title: "", text: "", category: "auto" });
      setActivePhase(0);
      setMapView("diario");
      setToast({ msg: `🎯 "${nuevo.title}" — roadmap generado por IA`, color: "#7C3AED" });
    } catch (e) {
      setToast({ msg: `❌ Error: ${e.message}`, color: "#EF4444" });
    } finally {
      setAiThinking(false);
    }
  };

  const statusConfig = {
    active:    { color: "#10B981", label: "Activo" },
    paused:    { color: "#F59E0B", label: "Pausado" },
    completed: { color: "#7C3AED", label: "Completado" },
    planning:  { color: "#06B6D4", label: "Planificando" },
    cancelled: { color: "#EF4444", label: "Cancelado" },
  };

  const diasHasta = (fecha) => {
    if (!fecha) return null;
    const hoy = new Date(); hoy.setHours(0,0,0,0);
    const f = new Date(fecha); f.setHours(0,0,0,0);
    return Math.ceil((f - hoy) / (1000 * 60 * 60 * 24));
  };

  const hitosCompletados = activeGoal?.hitos?.filter(h => h.done).length || 0;
  const sprintDone = activeGoal?.sprint?.tareas?.filter(t => t.done).length || 0;

  if (cargando) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #1E1E30", borderTop: "3px solid #7C3AED", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontSize: 12, color: "#4A5568", letterSpacing: 2 }}>CARGANDO OBJETIVOS...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  
  if (!activeGoal) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 20 }}>
      <div style={{ fontSize: 48 }}>🎯</div>
      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 700, color: "#F1F5F9" }}>Sin objetivos aún</div>
      <div style={{ fontSize: 13, color: "#64748B", textAlign: "center", maxWidth: 300 }}>
        Crea tu primer objetivo y la IA generará un plan paso a paso para lograrlo.
      </div>
      <button className="btn-primary" onClick={() => setShowNewGoal(true)} style={{ padding: "12px 28px", fontSize: 14 }}>
        + Crear mi primer objetivo
      </button>
      {showNewGoal && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowNewGoal(false)}>
          <div className="modal" style={{ width: 480 }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 20 }}>🎯 Nuevo Objetivo</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input placeholder="¿Qué quieres lograr? Ej: Comprar un auto, Conseguir empleo remoto..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ fontSize: 14 }} autoFocus />
              <div>
                <div style={{ fontSize: 10, color: "#64748B", marginBottom: 8, letterSpacing: 1 }}>CATEGORÍA</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
                  {GOAL_CATEGORIES.map(c => (
                    <div key={c.key} onClick={() => setForm(f => ({ ...f, category: c.key }))}
                      style={{ padding: "10px 8px", borderRadius: 10, textAlign: "center", cursor: "pointer",
                        border: `2px solid ${form.category === c.key ? "#7C3AED" : "#2D2D45"}`,
                        background: form.category === c.key ? "rgba(124,58,237,0.1)" : "#0A0A14" }}>
                      <div style={{ fontSize: 22 }}>{c.emoji}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: form.category === c.key ? "#A78BFA" : "#64748B", marginTop: 3 }}>{c.label}</div>
                    </div>
                  ))}
                </div>
              </div>
              <textarea placeholder="Cuéntale más a la IA: ¿cuánto dinero tienes ahorrado? ¿qué modelo quieres? ¿en cuánto tiempo? — Más detalle = mejor plan" value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} style={{ minHeight: 90, resize: "vertical", fontSize: 12 }} />
              {aiThinking && (
                <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.3)", fontSize: 12, color: "#A78BFA", display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: "2px solid #4A5568", borderTop: "2px solid #7C3AED", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />
                  <span>La IA está analizando tu perfil y generando tu roadmap personalizado...</span>
                </div>
              )}
              <div style={{ display: "flex", gap: 10 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowNewGoal(false)}>Cancelar</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={addGoal} disabled={!form.title || aiThinking}>
                  {aiThinking ? "⏳ Generando plan IA..." : "🤖 Crear con IA"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {toast && <Toast msg={toast.msg} color={toast.color} onDone={() => setToast(null)} />}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { label: "Objetivos activos", value: goals.filter(g => g.status === "active").length, icon: "🎯", color: "#7C3AED" },
          { label: "Ahorro/mes",        value: `$${(realFinanzas.monthIncome - realFinanzas.monthExpense).toLocaleString()}`, icon: "💰", color: "#10B981" },
          { label: "Acciones hoy",      value: `${doneDailyActions}/${totalDailyActions}`, icon: "📋", color: "#F59E0B" },
          { label: "Sprint semana",     value: `${sprintDone}/${activeGoal.sprint.tareas.length}`, icon: "⚡", color: "#06B6D4" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: "14px 18px", borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 16 }}>
        {/* Sidebar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, color: "#4A5568", letterSpacing: 2 }}>MIS OBJETIVOS</span>
            <button className="btn-primary" style={{ fontSize: 11, padding: "5px 12px" }} onClick={() => setShowNewGoal(true)}>+ Nuevo</button>
          </div>

          {goals.map(goal => {
            const rm = goal.roadmap || buildAIRoadmap(goal.key, mockData);
            const isActive = activeGoalId === goal.id;
            const hitosD = goal.hitos.filter(h => h.done).length;
            return (
              <div key={goal.id}
                onClick={() => { setActiveGoalId(goal.id); setActivePhase(0); setMapView("diario"); }}
                style={{ padding: "14px", borderRadius: 12, background: isActive ? `${rm.color}08` : "#0F0F18", border: `2px solid ${isActive ? rm.color + "60" : "#1E1E30"}`, cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 26 }}>{rm.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>{goal.title}</div>
                    <div style={{ display: "flex", gap: 5, marginTop: 3, flexWrap: "wrap" }}>
                      <span className="tag" style={{ background: `${rm.color}20`, color: rm.color }}>{rm.category}</span>
                      <span className="tag" style={{ background: `${(statusConfig[goal.status] || statusConfig.active).color}15`, color: statusConfig[goal.status].color }}>{statusConfig[goal.status].label}</span>
                    </div>
                  </div>
                </div>
                <ProgressBar value={goal.progress} max={100} color={rm.color} height={5} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 6 }}>
                  <span style={{ color: "#64748B" }}>🏁 {hitosD}/{goal.hitos.length} hitos</span>
                  <span style={{ color: rm.color, fontWeight: 700 }}>{goal.progress}%</span>
                </div>
              </div>
            );
          })}

          {/* Perfil rápido */}
          <div className="card" style={{ padding: 14 }}>
            <div style={{ fontSize: 10, color: "#4A5568", letterSpacing: 2, fontFamily: "'Orbitron',monospace", marginBottom: 10 }}>TU PERFIL</div>
            {(realData.learning?.skills || []).slice(0,4).map((s, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <span style={{ fontSize: 11, color: "#94A3B8" }}>{s.icon || "💡"} {s.name}</span>
                <span className="tag" style={{ background: `${s.color || "#7C3AED"}20`, color: s.color || "#7C3AED" }}>{s.level || s.current_level || "beginner"}</span>
              </div>
            ))}
            <div style={{ borderTop: "1px solid #1A1A28", paddingTop: 8, marginTop: 4 }}>
              {[
                { label: "💰 Ahorro/mes", value: `$${(realFinanzas.monthIncome - realFinanzas.monthExpense).toLocaleString()}`, color: "#10B981" },
                { label: "⏱ Estudio/día", value: "0min", color: "#7C3AED" },
                { label: "🔥 Racha fitness", value: `${realFitness.streak} días`, color: "#EF4444" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 4 }}>
                  <span style={{ color: "#64748B" }}>{item.label}</span>
                  <span style={{ color: item.color, fontWeight: 700 }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel principal */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Header objetivo */}
          <div className="card" style={{ padding: 18, borderTop: `3px solid ${roadmap.color}`, background: `linear-gradient(135deg,${roadmap.color}08,#0F0F1A)` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <span style={{ fontSize: 44 }}>{roadmap.emoji}</span>
                <div>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 900, color: "#F1F5F9" }}>{activeGoal.title}</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4, maxWidth: 400 }}>{activeGoal.customText}</div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                    <span className="tag" style={{ background: `${roadmap.color}20`, color: roadmap.color }}>{roadmap.category}</span>
                    <span className="tag" style={{ background: "rgba(124,58,237,0.15)", color: "#A78BFA" }}>🤖 IA activa</span>
                    <span className="tag" style={{ background: "rgba(16,185,129,0.15)", color: "#10B981" }}>⏱ ~{datosReales.finanzas.mesesRitmoActual} meses</span>
                    <span className="tag" style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>⚡ opt. {datosReales.finanzas.mesesOptimizado} meses</span>
                    <span className="tag" style={{ background: "rgba(6,182,212,0.15)", color: "#06B6D4" }}>🏁 {hitosCompletados}/{activeGoal.hitos.length} hitos</span>
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 32, fontWeight: 900, color: roadmap.color }}>{activeGoal.progress}%</div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>completado</div>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button onClick={async () => {
                    const nuevoStatus = activeGoal.status === "active" ? "planning" : "active";
                    try {
                      const endpoint = nuevoStatus === "active" ? "activate" : "cancel`;
await fetch(`${API_URL}/api/v1/goals/${activeGoal.id}/${endpoint}`, {
  method: `POST",
  headers: { "Authorization": `Bearer ${localStorage.getItem("life_hud_token")}`, "Content-Type": "application/json" }
});
                      setGoals(prev => prev.map(g => g.id === activeGoal.id ? { ...g, status: nuevoStatus } : g));
                      setToast({ msg: nuevoStatus === "planning" ? "⏸ Objetivo pausado" : "▶ Objetivo activado", color: "#F59E0B" });
                    } catch(e) { setToast({ msg: `❌ ${e.message}`, color: "#EF4444" }); }
                  }} className="btn-secondary" style={{ fontSize: 11, padding: "5px 10px" }}>
                    {activeGoal.status === "active" ? "⏸ Pausar" : "▶ Activar"}
                  </button>
                  <button onClick={async () => {
                    if (!window.confirm(`¿Eliminar "${activeGoal.title}`?`)) return;
                    try {
                      await fetch(`${API_URL}/api/v1/goals/${activeGoal.id}/cancel`, {
  method: `POST",
  headers: { "Authorization": `Bearer ${localStorage.getItem("life_hud_token")}`, "Content-Type": "application/json" }
});
                      setGoals(prev => {
                        const nuevos = prev.filter(g => g.id !== activeGoal.id);
                        localStorage.setItem('lifehud_goals', JSON.stringify(nuevos));
                        return nuevos;
                      });
                      setActiveGoalId(null);
                      setToast({ msg: "🗑️ Objetivo eliminado", color: "#EF4444" });
                    } catch(e) {
                      // Si el backend falla, igual borramos localmente
                      setGoals(prev => {
                        const nuevos = prev.filter(g => g.id !== activeGoal.id);
                        localStorage.setItem('lifehud_goals', JSON.stringify(nuevos));
                        return nuevos;
                      });
                      setActiveGoalId(null);
                      setToast({ msg: "🗑️ Objetivo eliminado", color: "#EF4444" });
                    }
                  }} className="btn-danger" style={{ fontSize: 11, padding: "5px 10px" }}>🗑️</button>
                </div>
              </div>
            </div>
          </div>

          {/* Análisis de perfil */}
          <div className="card" style={{ padding: 16 }}>
            <div className="section-title">🤖 Análisis de tu Perfil</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
              {roadmap.profileAnalysis.map((item, i) => (
                <div key={i} style={{ padding: "10px", borderRadius: 8, background: item.status === "good" ? "rgba(16,185,129,0.07)" : item.status === "warn" ? "rgba(245,158,11,0.07)" : "rgba(239,68,68,0.07)", border: `1px solid ${item.status === "good" ? "rgba(16,185,129,0.2)" : item.status === "warn" ? "rgba(245,158,11,0.2)" : "rgba(239,68,68,0.2)"}` }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{item.icon}</div>
                  <div style={{ fontSize: 9, color: "#64748B", marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: item.status === "good" ? "#10B981" : item.status === "warn" ? "#F59E0B" : "#EF4444" }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { key: "diario",   label: "📅 Plan de Hoy" },
              { key: "hitos",    label: `🏁 Hitos (${hitosCompletados}/${activeGoal.hitos.length})` },
              { key: "sprint",   label: `⚡ Sprint (${sprintDone}/${activeGoal.sprint.tareas.length})` },
              { key: "datos",    label: "🔗 Datos Reales" },
              { key: "fases",    label: "🗺️ Roadmap" },
              { key: "skills",   label: "🧠 Skills" },
            ].map(v => (
              <button key={v.key} onClick={() => setMapView(v.key)}
                className={mapView === v.key ? "btn-primary" : "btn-secondary"}
                style={{ fontSize: 12 }}>{v.label}</button>
            ))}
          </div>

          {/* ── PLAN DE HOY ── */}
          {mapView === "diario" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.2)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#06B6D4", fontWeight: 700, marginBottom: 4 }}>🤖 FOCO DE HOY — {roadmap.dailyPlan.date}</div>
                    <div style={{ fontSize: 13, color: "#F59E0B", fontWeight: 700, marginBottom: 6 }}>🎯 {roadmap.dailyPlan.focus}</div>
                    <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.6 }}>{roadmap.dailyPlan.aiTip}</div>
                  </div>
                  <div style={{ textAlign: "center", paddingLeft: 16, minWidth: 80 }}>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 24, fontWeight: 900, color: roadmap.color }}>{doneDailyActions}/{totalDailyActions}</div>
                    <div style={{ fontSize: 10, color: "#64748B", marginBottom: 4 }}>acciones hoy</div>
                    <ProgressBar value={doneDailyActions} max={totalDailyActions} color={roadmap.color} height={4} />
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                {roadmap.dailyPlan.blocks.map((block, bi) => (
                  <div key={bi} className="card" style={{ padding: 14, borderTop: `3px solid ${block.color}` }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: block.color, marginBottom: 10 }}>{block.time}</div>
                    {block.actions.map((action, ai) => {
                      const done = isDailyDone(bi, ai);
                      const pColor = action.priority === "high" ? "#EF4444" : action.priority === "medium" ? "#F59E0B" : "#64748B";
                      return (
                        <div key={ai} className="daily-action" onClick={() => toggleDailyAction(bi, ai)}
                          style={{ opacity: done ? 0.5 : 1, borderColor: done ? "rgba(16,185,129,0.3)" : "#1A1A28", background: done ? "rgba(16,185,129,0.05)" : "#0D0D18", marginBottom: 6 }}>
                          <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${done ? "#10B981" : block.color}`, background: done ? "#10B981" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, flexShrink: 0, color: "white" }}>{done && "✓"}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, color: "#E2E8F0", fontWeight: 600, textDecoration: done ? "line-through" : "none", lineHeight: 1.4 }}>{action.task}</div>
                            <div style={{ display: "flex", gap: 5, marginTop: 3, flexWrap: "wrap" }}>
                              <span className="tag" style={{ background: `${pColor}15`, color: pColor }}>{action.priority === "high" ? "🔴" : action.priority === "medium" ? "🟡" : "🟢"} {action.priority === "high" ? "Alta" : action.priority === "medium" ? "Media" : "Baja"}</span>
                              <span className="tag" style={{ background: "rgba(100,116,139,0.15)", color: "#94A3B8" }}>⏱ {action.effort}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── HITOS ── */}
          {mapView === "hitos" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
              <div className="card" style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div className="section-title" style={{ marginBottom: 0 }}>🏁 Timeline de Hitos</div>
                  <button className="btn-primary" style={{ fontSize: 11, padding: "5px 12px" }} onClick={() => setShowAddHito(true)}>+ Agregar hito</button>
                </div>
                {/* Timeline visual */}
                <div style={{ position: "relative", paddingLeft: 32 }}>
                  {/* Línea vertical */}
                  <div style={{ position: "absolute", left: 14, top: 0, bottom: 0, width: 2, background: "#1E1E30" }} />
                  {activeGoal.hitos.map((hito, i) => {
                    const dias = diasHasta(hito.fecha);
                    const vencido = !hito.done && dias !== null && dias < 0;
                    const hoy = dias === 0;
                    const proximo = dias !== null && dias > 0 && dias <= 7;
                    return (
                      <div key={hito.id} style={{ position: "relative", marginBottom: 20 }}>
                        {/* Círculo en timeline */}
                        <div onClick={() => toggleHito(hito.id)}
                          style={{ position: "absolute", left: -32, top: 0, width: 28, height: 28, borderRadius: "50%", background: hito.done ? "#10B981" : vencido ? "#EF4444" : `${roadmap.color}20`, border: `2px solid ${hito.done ? "#10B981" : vencido ? "#EF4444" : roadmap.color}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, cursor: "pointer", zIndex: 1 }}>
                          {hito.done ? "✓" : hito.emoji}
                        </div>
                        {/* Contenido */}
                        <div style={{ padding: "12px 14px", borderRadius: 10, background: hito.done ? "rgba(16,185,129,0.06)" : vencido ? "rgba(239,68,68,0.06)" : "#0A0A12", border: `1px solid ${hito.done ? "#10B98130" : vencido ? "#EF444430" : "#1A1A28"}`, transition: "all 0.15s" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: 700, color: hito.done ? "#64748B" : "#F1F5F9", textDecoration: hito.done ? "line-through" : "none" }}>{hito.titulo}</div>
                              <div style={{ fontSize: 11, color: "#64748B", marginTop: 3 }}>📅 {hito.fecha}</div>
                            </div>
                            <div style={{ marginLeft: 10, flexShrink: 0 }}>
                              {hito.done
                                ? <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "rgba(16,185,129,0.15)", color: "#10B981", fontWeight: 700 }}>✅ Completado</span>
                                : vencido
                                  ? <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "rgba(239,68,68,0.15)", color: "#EF4444", fontWeight: 700 }}>⚠️ Vencido</span>
                                  : hoy
                                    ? <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: "rgba(245,158,11,0.15)", color: "#F59E0B", fontWeight: 700 }}>⚡ Hoy</span>
                                    : proximo
                                      ? <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 999, background: `${roadmap.color}15`, color: roadmap.color, fontWeight: 700 }}>📅 {dias}d</span>
                                      : <span style={{ fontSize: 11, color: "#64748B" }}>{dias}d</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {activeGoal.hitos.length === 0 && (
                    <div style={{ textAlign: "center", padding: "30px 0", color: "#4A5568" }}>
                      <div style={{ fontSize: 36, marginBottom: 8 }}>🏁</div>
                      <div>Agrega tu primer hito para empezar a medir el camino</div>
                    </div>
                  )}
                </div>

                {/* Modal agregar hito */}
                {showAddHito && (
                  <div style={{ marginTop: 16, padding: "16px", borderRadius: 10, background: "#0A0A12", border: `1px solid ${roadmap.color}30` }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: "#F1F5F9", marginBottom: 12 }}>+ Nuevo Hito</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 60px", gap: 8, marginBottom: 10 }}>
                      <input placeholder="Descripción del hito" value={hitoForm.titulo} onChange={e => setHitoForm(f => ({ ...f, titulo: e.target.value }))} style={{ fontSize: 12 }} />
                      <input type="date" value={hitoForm.fecha} onChange={e => setHitoForm(f => ({ ...f, fecha: e.target.value }))} style={{ fontSize: 12, colorScheme: "dark" }} />
                      <input placeholder="🎯" value={hitoForm.emoji} onChange={e => setHitoForm(f => ({ ...f, emoji: e.target.value }))} style={{ fontSize: 16, textAlign: "center" }} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn-secondary" style={{ flex: 1, fontSize: 12 }} onClick={() => setShowAddHito(false)}>Cancelar</button>
                      <button className="btn-primary" style={{ flex: 2, fontSize: 12 }} onClick={agregarHito} disabled={!hitoForm.titulo || !hitoForm.fecha}>✓ Guardar hito</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Panel derecho hitos */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">📊 Progreso de Hitos</div>
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 36, fontWeight: 900, color: roadmap.color }}>{hitosCompletados}/{activeGoal.hitos.length}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>hitos completados</div>
                  </div>
                  <ProgressBar value={hitosCompletados} max={Math.max(activeGoal.hitos.length, 1)} color={roadmap.color} height={10} />
                  <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { label: "Completados", val: hitosCompletados, color: "#10B981" },
                      { label: "Pendientes", val: activeGoal.hitos.filter(h => !h.done && diasHasta(h.fecha) >= 0).length, color: "#F59E0B" },
                      { label: "Vencidos", val: activeGoal.hitos.filter(h => !h.done && diasHasta(h.fecha) < 0).length, color: "#EF4444" },
                    ].map((s, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "7px 10px", borderRadius: 7, background: "#0A0A12", fontSize: 12 }}>
                        <span style={{ color: "#94A3B8" }}>{s.label}</span>
                        <span style={{ color: s.color, fontWeight: 700, fontFamily: "'Orbitron',monospace" }}>{s.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Próximo hito */}
                {(() => {
                  const proximo = activeGoal.hitos.find(h => !h.done && diasHasta(h.fecha) >= 0);
                  if (!proximo) return null;
                  return (
                    <div className="card" style={{ padding: 16, borderTop: `3px solid ${roadmap.color}` }}>
                      <div className="section-title">🎯 Próximo Hito</div>
                      <div style={{ fontSize: 28, marginBottom: 8 }}>{proximo.emoji}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", marginBottom: 6 }}>{proximo.titulo}</div>
                      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 24, fontWeight: 900, color: roadmap.color }}>{diasHasta(proximo.fecha)}d</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>para {proximo.fecha}</div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* ── SPRINT SEMANAL ── */}
          {mapView === "sprint" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 16 }}>
              <div className="card" style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div className="section-title" style={{ marginBottom: 2 }}>⚡ Sprint Semanal</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>📅 {activeGoal.sprint.semana}</div>
                  </div>
                  <button className="btn-primary" style={{ fontSize: 11, padding: "5px 12px" }} onClick={() => setShowAddSprintTask(true)}>+ Tarea</button>
                </div>

                {/* Barra de progreso del sprint */}
                <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.2)", marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: "#06B6D4", fontWeight: 700 }}>Progreso del sprint</span>
                    <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, color: "#06B6D4", fontWeight: 700 }}>{sprintDone}/{activeGoal.sprint.tareas.length}</span>
                  </div>
                  <ProgressBar value={sprintDone} max={Math.max(activeGoal.sprint.tareas.length, 1)} color="#06B6D4" height={8} />
                  <div style={{ fontSize: 11, color: "#64748B", marginTop: 6 }}>
                    {sprintDone === activeGoal.sprint.tareas.length && activeGoal.sprint.tareas.length > 0
                      ? "🎉 ¡Sprint completado! Prepara el siguiente."
                      : `${activeGoal.sprint.tareas.length - sprintDone} tareas restantes esta semana`}
                  </div>
                </div>

                {/* Lista de tareas del sprint */}
                {activeGoal.sprint.tareas.map(t => (
                  <div key={t.id}
                    onClick={() => toggleSprintTask(t.id)}
                    style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 14px", borderRadius: 10, background: t.done ? "rgba(16,185,129,0.05)" : "#0A0A12", border: `1px solid ${t.done ? "#10B98125" : "#1A1A28"}`, marginBottom: 8, cursor: "pointer", transition: "all 0.15s" }}>
                    <div style={{ width: 22, height: 22, borderRadius: 7, border: `2px solid ${t.done ? "#10B981" : roadmap.color}`, background: t.done ? "#10B981" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                      {t.done && <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>✓</span>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, color: t.done ? "#64748B" : "#F1F5F9", fontWeight: 600, textDecoration: t.done ? "line-through" : "none", lineHeight: 1.4 }}>{t.texto}</div>
                      <span style={{ fontSize: 10, color: "#4A5568", marginTop: 4, display: "inline-block" }}>{t.modulo}</span>
                    </div>
                  </div>
                ))}

                {activeGoal.sprint.tareas.length === 0 && (
                  <div style={{ textAlign: "center", padding: "30px", color: "#4A5568" }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>⚡</div>
                    <div>Define las tareas clave de esta semana</div>
                  </div>
                )}

                {/* Agregar tarea */}
                {showAddSprintTask && (
                  <div style={{ marginTop: 12, padding: "14px", borderRadius: 10, background: "#0A0A12", border: `1px solid ${roadmap.color}30` }}>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <input placeholder="Tarea de esta semana..." value={sprintForm.texto} onChange={e => setSprintForm(f => ({ ...f, texto: e.target.value }))} style={{ flex: 1, fontSize: 12 }} />
                      <select value={sprintForm.modulo} onChange={e => setSprintForm(f => ({ ...f, modulo: e.target.value }))} style={{ fontSize: 11, width: 130 }}>
                        {["📚 Learning","💰 Finanzas","💪 Fitness","🥗 Nutrición","📋 Tareas","🔄 Hábitos"].map(m => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button className="btn-secondary" style={{ flex: 1, fontSize: 12 }} onClick={() => setShowAddSprintTask(false)}>Cancelar</button>
                      <button className="btn-primary" style={{ flex: 2, fontSize: 12 }} onClick={agregarSprintTask} disabled={!sprintForm.texto}>+ Agregar</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Panel lateral sprint */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">📊 Por módulo</div>
                  {["📚 Learning","💰 Finanzas","💪 Fitness","📋 Tareas","🔄 Hábitos","🥗 Nutrición"].map(mod => {
                    const tareasMod = activeGoal.sprint.tareas.filter(t => t.modulo === mod);
                    if (tareasMod.length === 0) return null;
                    const doneMod = tareasMod.filter(t => t.done).length;
                    return (
                      <div key={mod} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: "#94A3B8" }}>{mod}</span>
                          <span style={{ color: "#06B6D4", fontWeight: 700 }}>{doneMod}/{tareasMod.length}</span>
                        </div>
                        <ProgressBar value={doneMod} max={tareasMod.length} color="#06B6D4" height={4} />
                      </div>
                    );
                  })}
                </div>
                <div className="card" style={{ padding: 16, background: "rgba(124,58,237,0.05)", border: "1px solid rgba(124,58,237,0.2)" }}>
                  <div style={{ fontSize: 11, color: "#A78BFA", fontWeight: 700, marginBottom: 8 }}>🤖 Tip IA del sprint</div>
                  <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.6 }}>
                    Completar las tareas de Learning esta semana te acerca al skill de FastAPI que es clave para tu objetivo de {activeGoal.title}. Prioriza esas primero.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── DATOS REALES ── */}
          {mapView === "datos" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              {/* Finanzas */}
              <div className="card" style={{ padding: 18, borderTop: "3px solid #10B981" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontSize: 28 }}>💰</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>Finanzas</div>
                    <div style={{ fontSize: 10, color: "#64748B" }}>Datos reales del módulo</div>
                  </div>
                </div>
                {[
                  { label: "Balance actual",    val: `$${datosReales.finanzas.balance.toLocaleString()}`,         color: "#10B981" },
                  { label: "Ahorro/mes",         val: `$${datosReales.finanzas.ahorro.toLocaleString()}`,          color: "#06B6D4" },
                  { label: "Meta financiera",    val: `$${datosReales.finanzas.ahorroNecesario.toLocaleString()}`, color: "#F59E0B" },
                  { label: "Faltan",             val: `$${datosReales.finanzas.restante.toLocaleString()}`,        color: "#EF4444" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1A1A28", fontSize: 12 }}>
                    <span style={{ color: "#94A3B8" }}>{s.label}</span>
                    <span style={{ color: s.color, fontWeight: 700, fontFamily: "'Orbitron',monospace" }}>{s.val}</span>
                  </div>
                ))}
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 10, color: "#64748B", marginBottom: 6 }}>Progreso financiero hacia la meta</div>
                  <ProgressBar value={datosReales.finanzas.pctAhorrado} max={100} color="#10B981" height={8} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 4 }}>
                    <span style={{ color: "#10B981", fontWeight: 700 }}>{datosReales.finanzas.pctAhorrado}%</span>
                    <span style={{ color: "#64748B" }}>~{datosReales.finanzas.mesesRitmoActual} meses al ritmo actual</span>
                  </div>
                </div>
                <div style={{ marginTop: 10, padding: "10px", borderRadius: 8, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", fontSize: 11, color: "#A7F3D0", lineHeight: 1.5 }}>
                  💡 Si aumentas $1,000 extra/mes llegarías en <strong>{Math.ceil(datosReales.finanzas.restante / (datosReales.finanzas.ahorro + 1000))} meses</strong> en vez de {datosReales.finanzas.mesesRitmoActual}.
                </div>
              </div>

              {/* Learning */}
              <div className="card" style={{ padding: 18, borderTop: "3px solid #7C3AED" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontSize: 28 }}>📚</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>Learning</div>
                    <div style={{ fontSize: 10, color: "#64748B" }}>Skills actuales</div>
                  </div>
                </div>
                {datosReales.learning.skills.map((s, i) => (
                  <div key={i} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <span>{s.icon}</span>
                        <span style={{ color: "#CBD5E1" }}>{s.name}</span>
                      </div>
                      <span className="tag" style={{ background: `${s.color}20`, color: s.color }}>{s.level}</span>
                    </div>
                    <ProgressBar value={s.xp} max={s.xpNext} color={s.color} height={4} />
                    <div style={{ fontSize: 10, color: "#4A5568", marginTop: 2 }}>{s.hours}h estudiadas</div>
                  </div>
                ))}
                <div style={{ padding: "10px", borderRadius: 8, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)", fontSize: 11, color: "#C4B5FD", marginTop: 4 }}>
                  📚 {datosReales.learning.minutosTotales || datosReales.learning.minutoosHoy}min estudiados hoy · {datosReales.learning.cursosActivos} cursos en progreso
                </div>
              </div>

              {/* Fitness */}
              <div className="card" style={{ padding: 18, borderTop: "3px solid #EF4444" }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontSize: 28 }}>💪</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>Fitness</div>
                    <div style={{ fontSize: 10, color: "#64748B" }}>Estado físico actual</div>
                  </div>
                </div>
                {[
                  { label: "Racha actual",    val: `${datosReales.fitness.streak} días`, color: "#EF4444" },
                  { label: "Rutina de hoy",   val: datosReales.fitness.rutina, color: "#F59E0B" },
                  { label: "Records",          val: "0 marcas", color: "#7C3AED" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #1A1A28", fontSize: 12 }}>
                    <span style={{ color: "#94A3B8" }}>{s.label}</span>
                    <span style={{ color: s.color, fontWeight: 700 }}>{s.val}</span>
                  </div>
                ))}
                <div style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, marginBottom: 6 }}>Músculo más trabajado (semana)</div>
                  {[{ m: "Pecho", p: 85 }, { m: "Espalda", p: 70 }, { m: "Hombros", p: 60 }].map((m, i) => (
                    <div key={i} style={{ marginBottom: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 2 }}>
                        <span style={{ color: "#64748B" }}>{m.m}</span>
                        <span style={{ color: "#EF4444" }}>{m.p}%</span>
                      </div>
                      <ProgressBar value={m.p} max={100} color="#EF4444" height={4} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── ROADMAP POR FASES ── */}
          {mapView === "fases" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", gap: 0 }}>
                {roadmap.phases.map((phase, i) => (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }} onClick={() => setActivePhase(i)}>
                    <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                      {i > 0 && <div style={{ flex: 1, height: 2, background: i <= activePhase ? roadmap.phases[i - 1].color : "#1E1E30" }} />}
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: i === activePhase ? phase.color : i < activePhase ? `${phase.color}40` : "#1A1A28", border: `2px solid ${i <= activePhase ? phase.color : "#2D2D45"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, boxShadow: i === activePhase ? `0 0 16px ${phase.color}50` : "none", transition: "all 0.3s" }}>
                        {phase.status === "locked" ? "🔒" : phase.icon}
                      </div>
                      {i < roadmap.phases.length - 1 && <div style={{ flex: 1, height: 2, background: i < activePhase ? phase.color : "#1E1E30" }} />}
                    </div>
                    <div style={{ fontSize: 9, color: i === activePhase ? phase.color : "#4A5568", marginTop: 5, textAlign: "center", fontWeight: i === activePhase ? 700 : 400, maxWidth: 90 }}>{phase.weeks}</div>
                  </div>
                ))}
              </div>
              <div key={activePhase} className="phase-card" style={{ borderLeftColor: roadmap.phases[activePhase].color }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 22 }}>{roadmap.phases[activePhase].icon}</span>
                    <div>
                      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: roadmap.phases[activePhase].color }}>{roadmap.phases[activePhase].name}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{roadmap.phases[activePhase].weeks}</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", minWidth: 120 }}>
                    <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>{completedPhaseActions(activePhase)}/{roadmap.phases[activePhase].actions.length} tareas</div>
                    <ProgressBar value={completedPhaseActions(activePhase)} max={roadmap.phases[activePhase].actions.length} color={roadmap.phases[activePhase].color} height={4} />
                  </div>
                </div>
                {roadmap.phases[activePhase].actions.map((action, ai) => {
                  const done = isActionDone(activePhase, ai);
                  const pColor = action.priority === "high" ? "#EF4444" : action.priority === "medium" ? "#F59E0B" : "#64748B";
                  return (
                    <div key={ai} className="action-item" onClick={() => toggleAction(activePhase, ai)}
                      style={{ opacity: done ? 0.55 : 1, borderColor: done ? "rgba(16,185,129,0.3)" : "#1A1A2A", background: done ? "rgba(16,185,129,0.05)" : "#10101A" }}>
                      <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${done ? "#10B981" : roadmap.phases[activePhase].color}`, background: done ? "#10B981" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0, color: "white" }}>{done && "✓"}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, color: "#E2E8F0", fontWeight: 600, textDecoration: done ? "line-through" : "none" }}>{action.task}</div>
                        <span className="tag" style={{ background: `${pColor}15`, color: pColor, marginTop: 3, display: "inline-block" }}>{action.priority === "high" ? "🔴 Alta" : action.priority === "medium" ? "🟡 Media" : "🟢 Baja"}</span>
                      </div>
                    </div>
                  );
                })}
                <div style={{ marginTop: 10, padding: "10px 14px", borderRadius: 8, background: "rgba(6,182,212,0.07)", border: "1px solid rgba(6,182,212,0.15)", fontSize: 12, color: "#67E8F9", lineHeight: 1.6 }}>
                  🤖 <strong>IA:</strong> {roadmap.phases[activePhase].insight}
                </div>
                <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                  {activePhase > 0 && <button className="btn-secondary" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => setActivePhase(p => p - 1)}>← Anterior</button>}
                  {activePhase < roadmap.phases.length - 1 && <button className="btn-primary" style={{ fontSize: 12, padding: "6px 14px", marginLeft: "auto" }} onClick={() => setActivePhase(p => p + 1)}>Siguiente →</button>}
                </div>
              </div>
            </div>
          )}

          {/* ── SKILLS ── */}
          {mapView === "skills" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 14 }}>
              <div className="card" style={{ padding: 16 }}>
                <div className="section-title">🧠 Skills Necesarios para este Objetivo</div>
                {roadmap.skillsNeeded.map((skill, i) => (
                  <div key={i} style={{ padding: "12px 14px", borderRadius: 8, background: "#0A0A12", border: "1px solid #1A1A28", marginBottom: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ fontSize: 14, color: "#F1F5F9", fontWeight: 700 }}>{skill.name}</span>
                      <span className="tag" style={{ background: skill.have ? "rgba(16,185,129,0.2)" : "rgba(245,158,11,0.2)", color: skill.have ? "#10B981" : "#F59E0B" }}>{skill.have ? "✅ Tienes" : "⬜ Falta"}</span>
                    </div>
                    <div style={{ fontSize: 11, color: skill.have ? "#10B981" : "#F59E0B", marginBottom: 3 }}>{skill.level}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>Relevancia: {skill.relevance}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">⏱️ Timeline</div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 40, fontWeight: 900, color: roadmap.color }}>{datosReales.finanzas.mesesRitmoActual}</div>
                    <div style={{ fontSize: 11, color: "#64748B", marginBottom: 12 }}>meses a ritmo actual</div>
                    <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", fontSize: 12, color: "#10B981" }}>⚡ Optimizado: <strong>{datosReales.finanzas.mesesOptimizado} meses</strong></div>
                  </div>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <div className="section-title">📊 Todos mis objetivos</div>
                  {goals.map(g => {
                    const rm = buildAIRoadmap(g.key, mockData);
                    return (
                      <div key={g.id} style={{ marginBottom: 10 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                          <span style={{ color: "#CBD5E1" }}>{rm.emoji} {g.title}</span>
                          <span style={{ color: rm.color, fontWeight: 700 }}>{g.progress}%</span>
                        </div>
                        <ProgressBar value={g.progress} max={100} color={rm.color} height={5} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* MODAL NUEVO OBJETIVO */}
      {showNewGoal && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowNewGoal(false)}>
          <div className="modal" style={{ width: 520 }}>
            {aiThinking ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: 52, marginBottom: 16 }}>🤖</div>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, color: "#A78BFA", marginBottom: 8 }}>Analizando tu perfil...</div>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20 }}>Leyendo skills, finanzas, hábitos y rutinas...</div>
                <div className="ai-thinking" style={{ height: 6, borderRadius: 999 }} />
              </div>
            ) : (
              <>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 4 }}>🎯 Nuevo Objetivo</div>
                <div style={{ fontSize: 12, color: "#64748B", marginBottom: 18 }}>La IA creará un mapa personalizado con tu perfil real</div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>Categoría</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
                    {GOAL_CATEGORIES.map(cat => (
                      <div key={cat.key} onClick={() => setForm(f => ({ ...f, category: cat.key }))}
                        style={{ padding: "10px 8px", borderRadius: 8, cursor: "pointer", textAlign: "center", border: `2px solid ${form.category === cat.key ? "#7C3AED" : "#2D2D45"}`, background: form.category === cat.key ? "rgba(124,58,237,0.15)" : "#0F0F18", transition: "all 0.15s" }}>
                        <div style={{ fontSize: 22 }}>{cat.emoji}</div>
                        <div style={{ fontSize: 11, color: form.category === cat.key ? "#A78BFA" : "#64748B", fontWeight: 600, marginTop: 3 }}>{cat.label}</div>
                        <div style={{ fontSize: 9, color: "#4A5568", marginTop: 1 }}>{cat.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>Nombre del objetivo</div>
                  <input placeholder="Ej. Mi primer auto, Trabajo remoto en USD..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>Descripción (opcional)</div>
                  <textarea rows={3} placeholder="Ej. Quiero un auto seminuevo en menos de 1 año..." value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} style={{ resize: "none" }} />
                </div>
                <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", fontSize: 11, color: "#A78BFA", marginBottom: 16 }}>
                  🤖 IA analizará tus datos actuales y generará un plan personalizado
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowNewGoal(false)}>Cancelar</button>
                  <button className="btn-primary" style={{ flex: 2 }} onClick={addGoal}>🤖 Generar Mapa con IA →</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// PÁGINA: FINANZAS (con tab Negocios)
// ============================================================
const NEGOCIOS_INICIAL = [];

const calcNegocio = (neg) => {
  const ingresos = neg.operaciones.filter(o => o.tipo === "ingreso").reduce((a, o) => a + o.monto, 0);
  const gastos = neg.operaciones.filter(o => o.tipo === "gasto").reduce((a, o) => a + o.monto, 0);
  return { ingresos, gastos, neto: ingresos - gastos };
};

const NegociosTab = () => {
  const [negocios, setNegocios] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lifehud_negocios") || "[]"); } catch { return []; }
  });
  const [selectedId, setSelectedId] = useState(null);
  const [filterTipo, setFilterTipo] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [showNuevoNegocio, setShowNuevoNegocio] = useState(false);
  const [form, setForm] = useState(() => {
    try {
      const neg = JSON.parse(localStorage.getItem("lifehud_negocios") || "[]");
      return { negocioId: neg[0]?.id || null, desc: "", monto: "", tipo: "ingreso" };
    } catch { return { negocioId: null, desc: "", monto: "", tipo: "ingreso" }; }
  });
  const [nuevoNeg, setNuevoNeg] = useState({ nombre: "", emoji: "🏢", color: "#7C3AED" });
  const [toast, setToast] = useState(null);

  const guardarNegocios = (nuevos) => localStorage.setItem("lifehud_negocios", JSON.stringify(nuevos));

  const selected = negocios.find(n => n.id === selectedId) || negocios[0];
  const stats = selected ? calcNegocio(selected) : { ingresos: 0, gastos: 0, neto: 0 };
  const totales = negocios.reduce((a, n) => {
    const s = calcNegocio(n);
    return { ingresos: a.ingresos + s.ingresos, gastos: a.gastos + s.gastos, neto: a.neto + s.neto };
  }, { ingresos: 0, gastos: 0, neto: 0 });

  const ops = selected
    ? (filterTipo === "all" ? selected.operaciones : selected.operaciones.filter(o => o.tipo === filterTipo))
    : [];

  const agregarOp = () => {
    if (!form.desc || !form.monto) return;
    const neg = negocios.find(n => n.id === Number(form.negocioId));
    if (!neg) return;
    const nuevaOp = {
      id: Date.now(), desc: form.desc,
      monto: parseFloat(form.monto), tipo: form.tipo,
      fecha: "Ahora", hora: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    };
    const nuevos = negocios.map(n => n.id === Number(form.negocioId)
      ? { ...n, operaciones: [nuevaOp, ...n.operaciones] }
      : n
    );
    setNegocios(nuevos);
    guardarNegocios(nuevos);
    setSelectedId(Number(form.negocioId));
    setToast({ msg: `${form.tipo === "ingreso" ? "💰" : "💸"} ${neg.emoji} +$${parseFloat(form.monto).toLocaleString()} registrado`, color: form.tipo === "ingreso" ? "#10B981" : "#EF4444" });
    setForm(f => ({ ...f, desc: "", monto: "" }));
    setShowForm(false);
  };

  const agregarNegocio = () => {
    if (!nuevoNeg.nombre) return;
    const nuevo = { id: Date.now(), nombre: nuevoNeg.nombre, color: nuevoNeg.color, emoji: nuevoNeg.emoji, activo: true, operaciones: [] };
    const nuevos = [...negocios, nuevo];
    setNegocios(nuevos);
    guardarNegocios(nuevos);
    setSelectedId(nuevo.id);
    setNuevoNeg({ nombre: "", emoji: "🏢", color: "#7C3AED" });
    setShowNuevoNegocio(false);
    setToast({ msg: `✅ Negocio "${nuevo.nombre}" creado`, color: "#10B981" });
  };

  const eliminarNegocio = (id) => {
    if (!window.confirm("¿Eliminar este negocio y todas sus operaciones?")) return;
    const nuevos = negocios.filter(n => n.id !== id);
    setNegocios(nuevos);
    guardarNegocios(nuevos);
    if (selectedId === id) setSelectedId(negocios.find(n => n.id !== id)?.id || null);
    setToast({ msg: "🗑️ Negocio eliminado", color: "#EF4444" });
  };

  const EMOJI_OPTIONS = ["🍔","🍕","🎬","💻","🛒","🏋️","✂️","🎨","🚗","📱","🎵","💡","🌮","☕","🧁","📦"];
  const COLOR_OPTIONS = ["#7C3AED","#10B981","#F59E0B","#EF4444","#06B6D4","#EC4899","#F97316","#84CC16"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {toast && <Toast msg={toast.msg} color={toast.color} onDone={() => setToast(null)} />}
      {negocios.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: "center", color: "#4A5568" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🏢</div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 }}>Sin negocios registrados</div>
          <div style={{ fontSize: 13, marginBottom: 20 }}>Agrega tu primer negocio o fuente de ingresos para trackear sus operaciones.</div>
          <button className="btn-primary" onClick={() => setShowNuevoNegocio(true)}>+ Crear negocio</button>
        </div>
      )}

      {/* ── TABLA RESUMEN GENERAL ── */}
      <div className="card" style={{ padding: 18 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div className="section-title" style={{ marginBottom: 0 }}>📊 Resumen General de Negocios</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => setShowForm(true)}>
              + Registrar operación
            </button>
            <button className="btn-primary" style={{ fontSize: 12, padding: "5px 12px" }} onClick={() => setShowNuevoNegocio(true)}>
              + Nuevo negocio
            </button>
          </div>
        </div>

        {/* Tabla tipo Excel */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Rajdhani',sans-serif" }}>
            <thead>
              <tr style={{ background: "#0A0A14" }}>
                {["Negocio", "Ingresos", "Gastos", "Utilidad Neta", "Margen", "Operaciones", ""].map((h, i) => (
                  <th key={i} style={{ padding: "10px 14px", textAlign: i === 0 ? "left" : "right", fontSize: 10, color: "#4A5568", borderBottom: "2px solid #1E1E30", textTransform: "uppercase", letterSpacing: 1, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {negocios.map((neg, i) => {
                const s = calcNegocio(neg);
                const margen = s.ingresos > 0 ? Math.round((s.neto / s.ingresos) * 100) : 0;
                const isSelected = selectedId === neg.id;
                return (
                  <tr key={neg.id}
                    onClick={() => setSelectedId(neg.id)}
                    style={{ borderBottom: "1px solid #1A1A28", cursor: "pointer", background: isSelected ? `${neg.color}08` : "transparent", transition: "background 0.15s" }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "rgba(124,58,237,0.04)"; }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}
                  >
                    <td style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 32, height: 32, borderRadius: 8, background: `${neg.color}20`, border: `1px solid ${neg.color}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{neg.emoji}</div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? neg.color : "#F1F5F9" }}>{neg.nombre}</div>
                          <div style={{ fontSize: 10, color: "#4A5568" }}>{neg.operaciones.length} operaciones</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "#10B981" }}>
                      +${s.ingresos.toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "#EF4444" }}>
                      -${s.gastos.toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 900, color: s.neto >= 0 ? "#10B981" : "#EF4444" }}>
                        {s.neto >= 0 ? "+" : ""}${s.neto.toLocaleString()}
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: margen >= 40 ? "rgba(16,185,129,0.15)" : margen >= 20 ? "rgba(245,158,11,0.15)" : "rgba(239,68,68,0.15)", color: margen >= 40 ? "#10B981" : margen >= 20 ? "#F59E0B" : "#EF4444" }}>
                        {margen}%
                      </span>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <div style={{ width: 80, marginLeft: "auto" }}>
                        <ProgressBar value={s.ingresos > 0 ? s.neto : 0} max={s.ingresos > 0 ? s.ingresos : 1} color={neg.color} height={4} />
                      </div>
                    </td>
                    <td style={{ padding: "12px 14px", textAlign: "right" }}>
                      <span style={{ fontSize: 16, color: isSelected ? neg.color : "#4A5568" }}>▶</span>
                    </td>
                  </tr>
                );
              })}
              {/* Fila de totales */}
              <tr style={{ background: "#0A0A14", borderTop: "2px solid #2D2D45" }}>
                <td style={{ padding: "12px 14px", fontSize: 12, fontWeight: 700, color: "#64748B" }}>TOTAL</td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "#10B981" }}>+${totales.ingresos.toLocaleString()}</td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "#EF4444" }}>-${totales.gastos.toLocaleString()}</td>
                <td style={{ padding: "12px 14px", textAlign: "right", fontFamily: "'Orbitron',monospace", fontSize: 15, fontWeight: 900, color: totales.neto >= 0 ? "#10B981" : "#EF4444" }}>+${totales.neto.toLocaleString()}</td>
                <td colSpan={3} style={{ padding: "12px 14px", textAlign: "right" }}>
                  <span style={{ fontSize: 11, color: "#64748B" }}>🏷️ Etiqueta: <strong style={{ color: "#A78BFA" }}>Negocio</strong></span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── DETALLE DEL NEGOCIO SELECCIONADO ── */}
      {selected && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 16 }}>

          {/* Tabla de operaciones */}
          <div className="card" style={{ padding: 18, borderTop: `3px solid ${selected.color}` }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 26 }}>{selected.emoji}</span>
                <div>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: selected.color }}>{selected.nombre}</div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>{selected.operaciones.length} operaciones registradas</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {[{ k: "all", l: "Todas" }, { k: "ingreso", l: "💰" }, { k: "gasto", l: "💸" }].map(t => (
                  <button key={t.k} onClick={() => setFilterTipo(t.k)}
                    className={filterTipo === t.k ? "btn-primary" : "btn-secondary"}
                    style={{ fontSize: 11, padding: "4px 10px" }}>{t.l}</button>
                ))}
                <button onClick={() => eliminarNegocio(selected.id)}
                  className="btn-danger" style={{ fontSize: 11, padding: "4px 10px" }}>🗑️</button>
              </div>
            </div>

            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Rajdhani',sans-serif" }}>
              <thead>
                <tr style={{ background: "#0A0A14" }}>
                  {["Descripción", "Tipo", "Monto", "Fecha", "Hora"].map((h, i) => (
                    <th key={i} style={{ padding: "8px 12px", textAlign: i >= 2 ? "right" : "left", fontSize: 10, color: "#4A5568", borderBottom: "1px solid #1E1E30", textTransform: "uppercase", letterSpacing: 1 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ops.length === 0
                  ? <tr><td colSpan={5} style={{ padding: "20px", textAlign: "center", color: "#4A5568", fontSize: 12 }}>Sin operaciones</td></tr>
                  : ops.map((op, i) => (
                    <tr key={op.id} style={{ borderBottom: "1px solid #1A1A28" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.04)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "10px 12px", fontSize: 13, color: "#F1F5F9" }}>{op.desc}</td>
                      <td style={{ padding: "10px 12px" }}>
                        <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, fontWeight: 700, background: op.tipo === "ingreso" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)", color: op.tipo === "ingreso" ? "#10B981" : "#EF4444" }}>
                          {op.tipo === "ingreso" ? "💰 Ingreso" : "💸 Gasto"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: op.tipo === "ingreso" ? "#10B981" : "#EF4444" }}>
                        {op.tipo === "ingreso" ? "+" : "-"}${op.monto.toLocaleString()}
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 11, color: "#64748B" }}>{op.fecha}</td>
                      <td style={{ padding: "10px 12px", textAlign: "right", fontSize: 11, color: "#4A5568" }}>{op.hora}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>

          {/* Stats del negocio + mini form rápido */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* KPIs */}
            <div className="card" style={{ padding: 16 }}>
              <div className="section-title">📈 KPIs del Negocio</div>
              {[
                { label: "Ingresos totales", value: `+$${stats.ingresos.toLocaleString()}`, color: "#10B981", icon: "📈" },
                { label: "Gastos totales", value: `-$${stats.gastos.toLocaleString()}`, color: "#EF4444", icon: "📉" },
                { label: "Utilidad neta", value: `$${stats.neto.toLocaleString()}`, color: stats.neto >= 0 ? "#10B981" : "#EF4444", icon: "💵", big: true },
                { label: "Margen de ganancia", value: `${stats.ingresos > 0 ? Math.round((stats.neto / stats.ingresos) * 100) : 0}%`, color: selected.color, icon: "%" },
              ].map((kpi, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1A1A28" }}>
                  <span style={{ fontSize: 12, color: "#94A3B8" }}>{kpi.icon} {kpi.label}</span>
                  <span style={{ fontFamily: kpi.big ? "'Orbitron',monospace" : "inherit", fontSize: kpi.big ? 16 : 13, fontWeight: 700, color: kpi.color }}>{kpi.value}</span>
                </div>
              ))}
              <div style={{ marginTop: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
                  <span style={{ color: "#64748B" }}>Eficiencia (gastos vs ingresos)</span>
                  <span style={{ color: selected.color }}>{stats.ingresos > 0 ? Math.round((1 - stats.gastos / stats.ingresos) * 100) : 0}%</span>
                </div>
                <ProgressBar value={stats.ingresos > 0 ? stats.neto : 0} max={stats.ingresos > 0 ? stats.ingresos : 1} color={selected.color} height={6} />
              </div>
            </div>

            {/* Form registro rápido para el negocio seleccionado */}
            <div className="card" style={{ padding: 16 }}>
              <div className="section-title">⚡ Registro Rápido</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                {[{ k: "ingreso", l: "💰 Ingreso" }, { k: "gasto", l: "💸 Gasto" }].map(t => (
                  <button key={t.k} onClick={() => setForm(f => ({ ...f, tipo: t.k, negocioId: selected?.id || f.negocioId }))}
                    style={{ flex: 1, padding: "7px", borderRadius: 8, border: `1px solid ${form.tipo === t.k ? (t.k === "ingreso" ? "#10B981" : "#EF4444") : "#2D2D45"}`, background: form.tipo === t.k ? (t.k === "ingreso" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)") : "#0F0F18", color: form.tipo === t.k ? (t.k === "ingreso" ? "#10B981" : "#EF4444") : "#64748B", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 12 }}>{t.l}</button>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <input placeholder="Descripción (ej. Ventas del día)" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
                <input type="number" placeholder="Monto $" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} />
                <button onClick={agregarOp}
                  className={form.tipo === "ingreso" ? "btn-success" : "btn-danger"}
                  style={{ width: "100%", marginTop: 2 }}
                  disabled={!form.desc || !form.monto}>
                  {form.tipo === "ingreso" ? "💰 Registrar Ingreso" : "💸 Registrar Gasto"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: REGISTRAR OPERACIÓN (cualquier negocio) ── */}
      {showForm && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ width: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>+ Nueva Operación</div>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>Negocio</div>
                <select value={form.negocioId} onChange={e => setForm(f => ({ ...f, negocioId: e.target.value }))}>
                  {negocios.map(n => <option key={n.id} value={n.id}>{n.emoji} {n.nombre}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {[{ k: "ingreso", l: "💰 Ingreso" }, { k: "gasto", l: "💸 Gasto" }].map(t => (
                  <button key={t.k} onClick={() => setForm(f => ({ ...f, tipo: t.k }))}
                    style={{ flex: 1, padding: "9px", borderRadius: 8, border: `1px solid ${form.tipo === t.k ? (t.k === "ingreso" ? "#10B981" : "#EF4444") : "#2D2D45"}`, background: form.tipo === t.k ? (t.k === "ingreso" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)") : "#0F0F18", color: form.tipo === t.k ? (t.k === "ingreso" ? "#10B981" : "#EF4444") : "#64748B", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13 }}>{t.l}</button>
                ))}
              </div>
              <input placeholder="Descripción (ej. Ventas del día, Ingredientes...)" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
              <input type="number" placeholder="Monto $" value={form.monto} onChange={e => setForm(f => ({ ...f, monto: e.target.value }))} />
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancelar</button>
                <button onClick={() => { agregarOp(); setShowForm(false); }}
                  className={form.tipo === "ingreso" ? "btn-success" : "btn-danger"}
                  style={{ flex: 2 }} disabled={!form.desc || !form.monto}>
                  ✓ Registrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: NUEVO NEGOCIO ── */}
      {showNuevoNegocio && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowNuevoNegocio(false)}>
          <div className="modal" style={{ width: 420 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>🏢 Nuevo Negocio</div>
              <button onClick={() => setShowNuevoNegocio(false)} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input placeholder="Nombre del negocio" value={nuevoNeg.nombre} onChange={e => setNuevoNeg(n => ({ ...n, nombre: e.target.value }))} />
              <div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>Ícono</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {EMOJI_OPTIONS.map(em => (
                    <button key={em} onClick={() => setNuevoNeg(n => ({ ...n, emoji: em }))}
                      style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${nuevoNeg.emoji === em ? "#7C3AED" : "#2D2D45"}`, background: nuevoNeg.emoji === em ? "rgba(124,58,237,0.2)" : "#0F0F18", cursor: "pointer", fontSize: 18 }}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>Color</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {COLOR_OPTIONS.map(c => (
                    <button key={c} onClick={() => setNuevoNeg(n => ({ ...n, color: c }))}
                      style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: `3px solid ${nuevoNeg.color === c ? "white" : "transparent"}`, cursor: "pointer" }} />
                  ))}
                </div>
              </div>
              <div style={{ padding: "12px", borderRadius: 10, background: `${nuevoNeg.color}10`, border: `1px solid ${nuevoNeg.color}30`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 28 }}>{nuevoNeg.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: nuevoNeg.color }}>{nuevoNeg.nombre || "Nombre del negocio"}</span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowNuevoNegocio(false)}>Cancelar</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={agregarNegocio} disabled={!nuevoNeg.nombre}>✓ Crear Negocio</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// FINANZAS — PATCH (pegar justo ANTES de "const FinanzasPage")
// Reemplaza desde "const FinanzasPage" hasta el final del archivo
// ============================================================

// ── Datos nuevos ────────────────────────────────────────────

const DEUDAS_INICIAL = [
  {
    id: 1, nombre: "Tarjeta de crédito", emoji: "💳", color: "#EF4444",
    total: 8500, pagado: 2500, pagoMensual: 1200, diaPago: 15,
    tipo: "deuda", interes: 36,
  },
  {
    id: 2, nombre: "Préstamo familiar", emoji: "👨‍👩‍👦", color: "#F59E0B",
    total: 5000, pagado: 1000, pagoMensual: 500, diaPago: 1,
    tipo: "deuda", interes: 0,
  },
  {
    id: 3, nombre: "Renta mensual", emoji: "🏠", color: "#7C3AED",
    total: 4500, pagado: 0, pagoMensual: 4500, diaPago: 5,
    tipo: "fijo", interes: 0,
  },
  {
    id: 4, nombre: "Internet + teléfono", emoji: "📡", color: "#06B6D4",
    total: 699, pagado: 0, pagoMensual: 699, diaPago: 10,
    tipo: "fijo", interes: 0,
  },
  {
    id: 5, nombre: "Suscripciones (Adobe, etc)", emoji: "🎬", color: "#EC4899",
    total: 1350, pagado: 0, pagoMensual: 1350, diaPago: 1,
    tipo: "fijo", interes: 0,
  },
];

const PRESUPUESTO_CAT = [
  { nombre: "Alimentación", emoji: "🛒", color: "#10B981", presupuesto: 2500, gastado: 2100 },
  { nombre: "Vivienda",     emoji: "🏠", color: "#7C3AED", presupuesto: 4500, gastado: 4500 },
  { nombre: "Transporte",   emoji: "⛽", color: "#F59E0B", presupuesto: 1000, gastado: 820  },
  { nombre: "Educación",    emoji: "📚", color: "#06B6D4", presupuesto: 800,  gastado: 450  },
  { nombre: "Entretenimiento", emoji: "📺", color: "#EF4444", presupuesto: 500, gastado: 680 },
  { nombre: "Salud",        emoji: "💪", color: "#EC4899", presupuesto: 600,  gastado: 200  },
];

const ACTIVOS_MOCK = [
  { nombre: "Cuenta bancaria", emoji: "🏦", valor: 15420, color: "#10B981" },
  { nombre: "Ahorros (barriles)", emoji: "🪣", valor: 8300,  color: "#06B6D4" },
  { nombre: "Negocio hamburgesas", emoji: "🍔", valor: 12000, color: "#F59E0B" },
  { nombre: "Negocio videos", emoji: "🎬", valor: 5000, color: "#7C3AED" },
  { nombre: "Equipo / herramientas", emoji: "💻", valor: 3500, color: "#A78BFA" },
];

const PATRIMONIO_HIST = [
  { mes: "Oct", activos: 35000, deudas: 16000 },
  { mes: "Nov", activos: 36200, deudas: 15000 },
  { mes: "Dic", activos: 34800, deudas: 14500 },
  { mes: "Ene", activos: 37500, deudas: 13800 },
  { mes: "Feb", activos: 39100, deudas: 13500 },
  { mes: "Hoy", activos: 44220, deudas: 13500 },
];

// ── FinanzasPage mejorado ────────────────────────────────────

const FinanzasPage = () => {
  const [tab, setTab] = useState("resumen");
  const [txnType, setTxnType] = useState("all");
  const [form, setForm] = useState({ desc: "", amount: "", type: "income", category: "freelance" });
  const [txns, setTxns] = useState([]);
  const [toast, setToast] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [resumen, setResumen] = useState({ balance: 0, monthIncome: 0, monthExpense: 0, savingsRate: 0 });
  const [presupuesto, setPresupuesto] = useState([]);
  const [historialMensual, setHistorialMensual] = useState([]);
  const [activos, setActivos] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lifehud_activos") || "[]"); } catch { return []; }
  });
  const [deudas, setDeudas] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lifehud_deudas") || "[]"); } catch { return []; }
  });
  const [barriles, setBarriles] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lifehud_barriles") || "[]"); } catch { return []; }
  });
  const [showBarrilForm, setShowBarrilForm] = useState(false);
  const [barrilForm, setBarrilForm] = useState({ name: "", emoji: "🪣", color: "#06B6D4", goal: "", monthly: "" });
  const [showDeudaForm, setShowDeudaForm] = useState(false);
  const [showActivoForm, setShowActivoForm] = useState(false);
  const [deudaForm, setDeudaForm] = useState({ nombre: "", emoji: "💳", color: "#EF4444", total: "", pagoMensual: "", diaPago: 1, tipo: "deuda", interes: 0 });
  const [activoForm, setActivoForm] = useState({ nombre: "", emoji: "🏦", color: "#10B981", valor: "" });
  const [proyMeses, setProyMeses] = useState(6);

  // Persistir deudas y activos en localStorage
  useEffect(() => {
    localStorage.setItem("lifehud_deudas", JSON.stringify(deudas));
  }, [deudas]);

  useEffect(() => {
    localStorage.setItem("lifehud_activos", JSON.stringify(activos));
  }, [activos]);

  useEffect(() => {
    localStorage.setItem("lifehud_barriles", JSON.stringify(barriles));
  }, [barriles]);

  const agregarBarril = () => {
    if (!barrilForm.name || !barrilForm.goal) return;
    const nuevo = {
      id: Date.now(), name: barrilForm.name, emoji: barrilForm.emoji, color: barrilForm.color,
      goal:    parseFloat(barrilForm.goal),
      current: 0,
      monthly: parseFloat(barrilForm.monthly) || 0,
    };
    setBarriles(prev => [...prev, nuevo]);
    setBarrilForm({ name: "", emoji: "🪣", color: "#06B6D4", goal: "", monthly: "" });
    setShowBarrilForm(false);
    setToast({ msg: `🪣 "${nuevo.name}" creado`, color: "#06B6D4" });
  };

  const depositarBarril = (id, monto) => {
    setBarriles(prev => prev.map(b => b.id === id ? { ...b, current: Math.min(b.current + monto, b.goal) } : b));
  };

  const eliminarBarril = (id) => {
    setBarriles(prev => prev.filter(b => b.id !== id));
  };

  const agregarActivo = () => {
    if (!activoForm.nombre || !activoForm.valor) return;
    const nuevo = { id: Date.now(), ...activoForm, valor: parseFloat(activoForm.valor) };
    setActivos(prev => [...prev, nuevo]);
    setActivoForm({ nombre: "", emoji: "🏦", color: "#10B981", valor: "" });
    setShowActivoForm(false);
    setToast({ msg: `✅ Activo "${nuevo.nombre}" agregado`, color: "#10B981" });
  };

  const eliminarActivo = (id) => {
    setActivos(prev => prev.filter(a => a.id !== id));
    setToast({ msg: "🗑️ Activo eliminado", color: "#EF4444" });
  };

  useEffect(() => {
    Promise.all([
      api.finanzas.resumen(),
      api.finanzas.transacciones({ limit: 200 }),
      fetch(`${API_URL}/api/v1/finance/categories`, {
        headers: { "Authorization": `Bearer ${localStorage.getItem("life_hud_token")}` }
      }).then(r => r.ok ? r.json() : []).catch(() => []),
    ])
    .then(([sum, txnData, cats]) => {
      setResumen({
        balance:      parseFloat(sum.balance        || 0),
        monthIncome:  parseFloat(sum.total_income   || 0),
        monthExpense: parseFloat(sum.total_expenses || 0),
        savingsRate:  sum.savings_rate || 0,
      });

      const mapeadas = (txnData || []).map(t => ({
        id:       t.id,
        desc:     t.description || "Sin descripción",
        amount:   t.type === "expense" ? -parseFloat(t.amount) : parseFloat(t.amount),
        type:     t.type === "income" ? "income" : "expense",
        category: t.category?.name || "otro",
        date:     t.transaction_date,
        emoji:    t.type === "income" ? "💰" : "💸",
      }));
      setTxns(mapeadas);

      // Construir historial mensual desde transacciones
      const porMes = {};
      (txnData || []).forEach(t => {
        const mes = (t.transaction_date || "").slice(0, 7); // YYYY-MM
        if (!mes) return;
        if (!porMes[mes]) porMes[mes] = { mes, ingresos: 0, gastos: 0 };
        if (t.type === "income") porMes[mes].ingresos += parseFloat(t.amount || 0);
        else porMes[mes].gastos += parseFloat(t.amount || 0);
      });
      const historial = Object.values(porMes)
        .sort((a, b) => a.mes.localeCompare(b.mes))
        .slice(-6)
        .map(m => ({
          ...m,
          label: new Date(m.mes + "-01").toLocaleDateString("es-MX", { month: "short", year: "2-digit" }),
          ahorro: m.ingresos - m.gastos,
        }));
      setHistorialMensual(historial);

      // Construir presupuesto desde categorías reales
      const catExpense = (cats || []).filter(c => c.type === "expense");
      if (catExpense.length > 0) {
        const CAT_EMOJIS = { alimentacion:"🛒", transporte:"🚗", vivienda:"🏠", educacion:"📚", salud:"💊", entretenimiento:"🎬", ropa:"👕", servicios:"⚡", otros:"💡" };
        const gastoPorCat = {};
        (txnData || []).filter(t => t.type === "expense").forEach(t => {
          const catName = t.category?.name || "otros";
          gastoPorCat[catName] = (gastoPorCat[catName] || 0) + parseFloat(t.amount || 0);
        });
        const presu = catExpense.map((c, i) => ({
          emoji:       CAT_EMOJIS[c.name?.toLowerCase()] || "💡",
          nombre:      c.name,
          presupuesto: parseFloat(c.budget_limit || 5000),
          gastado:     gastoPorCat[c.name] || 0,
          color:       ["#7C3AED","#06B6D4","#10B981","#F59E0B","#EF4444","#EC4899"][i % 6],
        }));
        setPresupuesto(presu);
      }
    })
    .catch(() => {})
    .finally(() => setCargando(false));
  }, []);

  const recargarFinanzas = async () => {
    const token = localStorage.getItem("life_hud_token");
    try {
      const [sum, txnData, cats] = await Promise.all([
        api.finanzas.resumen(),
        api.finanzas.transacciones({ limit: 200 }),
        fetch(`${API_URL}/api/v1/finance/categories`, {
          headers: { "Authorization": `Bearer ${token}` }
        }).then(r => r.ok ? r.json() : []).catch(() => []),
      ]);
      setResumen({
        balance:      parseFloat(sum.balance        || 0),
        monthIncome:  parseFloat(sum.total_income   || 0),
        monthExpense: parseFloat(sum.total_expenses || 0),
        savingsRate:  sum.savings_rate || 0,
      });
      const mapeadas = (txnData || []).map(t => ({
        id:       t.id,
        desc:     t.description || "Sin descripción",
        amount:   t.type === "expense" ? -parseFloat(t.amount) : parseFloat(t.amount),
        type:     t.type === "income" ? "income" : "expense",
        category: t.category?.name || "otro",
        date:     t.transaction_date,
        emoji:    t.type === "income" ? "💰" : "💸",
      }));
      setTxns(mapeadas);
      // Historial mensual
      const porMes = {};
      (txnData || []).forEach(t => {
        const mes = (t.transaction_date || "").slice(0, 7);
        if (!mes) return;
        if (!porMes[mes]) porMes[mes] = { mes, ingresos: 0, gastos: 0 };
        if (t.type === "income") porMes[mes].ingresos += parseFloat(t.amount || 0);
        else porMes[mes].gastos += parseFloat(t.amount || 0);
      });
      const historial = Object.values(porMes)
        .sort((a, b) => a.mes.localeCompare(b.mes))
        .slice(-6)
        .map(m => ({
          ...m,
          label: new Date(m.mes + "-01").toLocaleDateString("es-MX", { month: "short", year: "2-digit" }),
          ahorro: m.ingresos - m.gastos,
        }));
      setHistorialMensual(historial);
      // Presupuesto
      const catExpense = (cats || []).filter(c => c.type === "expense");
      if (catExpense.length > 0) {
        const CAT_EMOJIS = { alimentacion:"🛒", transporte:"🚗", vivienda:"🏠", educacion:"📚", salud:"💊", entretenimiento:"🎬", ropa:"👕", servicios:"⚡", otros:"💡" };
        const gastoPorCat = {};
        (txnData || []).filter(t => t.type === "expense").forEach(t => {
          const catName = t.category?.name || "otros";
          gastoPorCat[catName] = (gastoPorCat[catName] || 0) + parseFloat(t.amount || 0);
        });
        setPresupuesto(catExpense.map((c, i) => ({
          emoji:       CAT_EMOJIS[c.name?.toLowerCase()] || "💡",
          nombre:      c.name,
          presupuesto: parseFloat(c.budget_limit || 5000),
          gastado:     gastoPorCat[c.name] || 0,
          color:       ["#7C3AED","#06B6D4","#10B981","#F59E0B","#EF4444","#EC4899"][i % 6],
        })));
      }
    } catch(e) {}
  };

  const agregarDeuda = () => {
    const { nombre, emoji, color, total, pagoMensual, diaPago, tipo, interes } = deudaForm;
    if (!nombre || !total || !pagoMensual) return;
    const nueva = {
      id: Date.now(), nombre, emoji, color,
      total:       parseFloat(total),
      pagado:      0,
      pagoMensual: parseFloat(pagoMensual),
      diaPago:     parseInt(diaPago),
      tipo,
      interes:     parseFloat(interes) || 0,
    };
    setDeudas(prev => [...prev, nueva]);
    setDeudaForm({ nombre: "", emoji: "💳", color: "#EF4444", total: "", pagoMensual: "", diaPago: 1, tipo: "deuda", interes: 0 });
    setShowDeudaForm(false);
    setToast({ msg: `✅ "${nombre}" agregada`, color: "#10B981" });
  };

  const addTxn = async () => {
    if (!form.desc || !form.amount) return;
    try {
      const CATEGORY_IDS = {
        income:  "8849a4a9-b885-4527-b4d7-9faa160d7256",
        expense: "f899a8bf-226d-427c-b7f6-0fb0632953db",
      };
      const nueva = await api.finanzas.crearTransaccion({
        amount:           parseFloat(form.amount),
        description:      form.desc,
        transaction_date: new Date().toISOString().split("T")[0],
        category_id:      CATEGORY_IDS[form.type] || null,
        tags:             [],
      });
      const mapeada = {
        id:       nueva.id,
        desc:     nueva.description || form.desc,
        amount:   form.type === "expense" ? -parseFloat(nueva.amount) : parseFloat(nueva.amount),
        type:     form.type,
        category: form.category,
        date:     nueva.transaction_date,
        emoji:    form.type === "income" ? "💰" : "💸",
      };
      setTxns(p => [mapeada, ...p]);
      setResumen(r => ({
        ...r,
        balance:      form.type === "income" ? r.balance + parseFloat(form.amount) : r.balance - parseFloat(form.amount),
        monthIncome:  form.type === "income"  ? r.monthIncome  + parseFloat(form.amount) : r.monthIncome,
        monthExpense: form.type === "expense" ? r.monthExpense + parseFloat(form.amount) : r.monthExpense,
      }));
      setForm({ desc: "", amount: "", type: "income", category: "freelance" });
      setToast({ msg: `${form.type === "income" ? "💰 Ingreso" : "💸 Gasto"} registrado: $${form.amount}`, color: form.type === "income" ? "#10B981" : "#EF4444" });
      // Recargar datos reales del backend
      setTimeout(() => recargarFinanzas(), 500);
    } catch (e) {
      setToast({ msg: `❌ Error: ${e.message}`, color: "#EF4444" });
    }
  };

  const filteredTxns = txnType === "all" ? txns : txns.filter(t => t.type === txnType);
  const maxBar = 1;

  // Cálculos patrimonio
  const totalActivos = activos.reduce((a, x) => a + (x.valor || 0), 0);
  const totalDeudas  = deudas.filter(d => d.tipo === "deuda").reduce((a, d) => a + (d.total - d.pagado), 0);
  const patrimonioNeto = totalActivos - totalDeudas;
  const pagosFijosTotal = deudas.filter(d => d.tipo === "fijo").reduce((a, d) => a + d.pagoMensual, 0);

  // Cálculos proyección
  const ahorro = resumen.monthIncome - resumen.monthExpense;
  const proyeccion = Array.from({ length: proyMeses }, (_, i) => ({
    mes: i + 1,
    balance: Math.round(resumen.balance + ahorro * (i + 1)),
    label: ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"][(new Date().getMonth() + i + 1) % 12],
  }));
  const maxProy = Math.max(...proyeccion.map(p => p.balance));

  // Alertas presupuesto
  const alertas = presupuesto.filter(c => c.gastado / c.presupuesto >= 0.85);

  // Días hasta pago
  const diasHastaPago = (dia) => {
    const hoy = new Date().getDate();
    return dia >= hoy ? dia - hoy : 30 - hoy + dia;
  };

  if (cargando) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #1E1E30", borderTop: "3px solid #10B981", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontSize: 12, color: "#4A5568", letterSpacing: 2 }}>CARGANDO FINANZAS...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {toast && <Toast msg={toast.msg} color={toast.color} onDone={() => setToast(null)} />}

      {/* Stats superiores */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { label: "Balance actual",   value: `$${resumen.balance.toLocaleString()}`,      icon: "💳", color: "#F1F5F9", sub: "MXN" },
          { label: "Ingresos Feb",     value: `$${resumen.monthIncome.toLocaleString()}`,   icon: "📈", color: "#10B981", sub: "+12% vs Ene" },
          { label: "Gastos Feb",       value: `$${resumen.monthExpense.toLocaleString()}`,  icon: "📉", color: "#EF4444", sub: "-2% vs Ene" },
          { label: "Patrimonio neto",  value: `$${patrimonioNeto.toLocaleString()}`,  icon: "🏆", color: "#F59E0B", sub: `Activos $${(totalActivos/1000).toFixed(0)}k` },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: "16px 18px", borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 10, color: s.color, marginTop: 2, opacity: 0.7 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Alertas de presupuesto (siempre visibles si hay) */}
      {alertas.length > 0 && (
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {alertas.map((a, i) => {
            const pct = Math.round((a.gastado / a.presupuesto) * 100);
            const excedido = a.gastado > a.presupuesto;
            return (
              <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 14px", borderRadius: 10, background: excedido ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)", border: `1px solid ${excedido ? "#EF444440" : "#F59E0B40"}`, fontSize: 12 }}>
                <span>{a.emoji}</span>
                <span style={{ color: excedido ? "#FCA5A5" : "#FCD34D" }}>
                  {excedido ? "⚠️ Excediste" : "🔶 Al límite"} en {a.nombre}: {pct}% ({excedido ? `+$${(a.gastado - a.presupuesto).toLocaleString()} sobre` : `$${(a.presupuesto - a.gastado).toLocaleString()} restantes`})
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { key: "resumen",         label: "📊 Resumen" },
          { key: "presupuesto",     label: `🎯 Presupuesto${alertas.length > 0 ? ` 🔴${alertas.length}` : ""}` },

          { key: "deudas",          label: "💳 Deudas & Fijos" },
          { key: "patrimonio",      label: "🏆 Patrimonio" },
          { key: "barriles",        label: "🪣 Barriles" },
          { key: "transacciones",   label: "📋 Transacciones" },
          { key: "negocios",        label: "🏢 Negocios" },
          { key: "graficas",        label: "📈 Gráficas" },
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={tab === t.key ? "btn-primary" : "btn-secondary"}
            style={{ fontSize: 12 }}>{t.label}</button>
        ))}
      </div>

      {/* ── RESUMEN ── */}
      {tab === "resumen" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <div className="section-title">📅 Historial Mensual</div>
            {historialMensual.length === 0 ? (
              <div style={{ textAlign: "center", color: "#4A5568", padding: "20px 0", fontSize: 12 }}>
                Registra transacciones para ver el historial mensual
              </div>
            ) : historialMensual.map((m, i) => {
              const prev = historialMensual[i - 1];
              const ahorroActual = m.ingresos - m.gastos;
              const ahorroPrev = prev ? prev.ingresos - prev.gastos : 0;
              const tendencia = prev ? ahorroActual - ahorroPrev : 0;
              const maxLocal = Math.max(...historialMensual.map(x => Math.max(x.ingresos, x.gastos)), 1);
              return (
                <div key={i} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: "#CBD5E1", fontWeight: 600 }}>{m.label}</span>
                      {prev && <span style={{ fontSize: 10, color: tendencia >= 0 ? "#10B981" : "#EF4444" }}>
                        {tendencia >= 0 ? "▲" : "▼"} ${Math.abs(tendencia).toLocaleString()}
                      </span>}
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <span style={{ color: "#10B981" }}>+${m.ingresos.toLocaleString()}</span>
                      <span style={{ color: "#EF4444" }}>-${m.gastos.toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ height: 6, background: "#1A1A28", borderRadius: 999, overflow: "hidden", marginBottom: 2 }}>
                    <div style={{ width: `${(m.ingresos / maxLocal) * 100}%`, height: "100%", background: "#10B981", borderRadius: 999 }} />
                  </div>
                  <div style={{ height: 4, background: "#1A1A28", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${(m.gastos / maxLocal) * 100}%`, height: "100%", background: "#EF4444", borderRadius: 999 }} />
                  </div>
                  <div style={{ fontSize: 10, color: "#4A5568", marginTop: 3 }}>
                    Ahorro: <span style={{ color: ahorroActual > 0 ? "#10B981" : "#EF4444", fontWeight: 700 }}>${ahorroActual.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="card" style={{ padding: 18 }}>
            <div className="section-title">💸 Gastos por Categoría</div>
            {[].filter(()=>false).map((cat, i) => (
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
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ padding: 18 }}>
              <div className="section-title">💰 Ingresos por Tipo</div>
              {[].filter(()=>false).map((inc, i) => (
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
                { icon: "🔴", msg: "Entretenimiento excedió presupuesto este mes +$180." },
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

      {/* ── PRESUPUESTO ── */}
      {tab === "presupuesto" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title">🎯 Presupuesto por Categoría — Este Mes</div>
            {presupuesto.map((cat, i) => {
              const pct = Math.round((cat.gastado / cat.presupuesto) * 100);
              const excedido = cat.gastado > cat.presupuesto;
              const alLimite = !excedido && pct >= 85;
              const barColor = excedido ? "#EF4444" : alLimite ? "#F59E0B" : cat.color;
              return (
                <div key={i} style={{ marginBottom: 18 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 18 }}>{cat.emoji}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>{cat.nombre}</span>
                      {excedido && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "rgba(239,68,68,0.15)", color: "#EF4444", fontWeight: 700 }}>⚠️ Excedido</span>}
                      {alLimite && <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: "rgba(245,158,11,0.15)", color: "#F59E0B", fontWeight: 700 }}>🔶 Al límite</span>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: barColor }}>${cat.gastado.toLocaleString()}</span>
                      <span style={{ fontSize: 11, color: "#4A5568" }}>/${cat.presupuesto.toLocaleString()}</span>
                    </div>
                  </div>
                  <div style={{ position: "relative", height: 10, background: "#1A1A28", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: barColor, borderRadius: 999, transition: "all 0.3s" }} />
                    {excedido && (
                      <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(45deg,transparent,transparent 4px,rgba(239,68,68,0.15) 4px,rgba(239,68,68,0.15) 8px)", borderRadius: 999 }} />
                    )}
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 4 }}>
                    <span style={{ color: barColor, fontWeight: 700 }}>{pct}%</span>
                    <span style={{ color: excedido ? "#EF4444" : "#4A5568" }}>
                      {excedido ? `+$${(cat.gastado - cat.presupuesto).toLocaleString()} sobre presupuesto` : `$${(cat.presupuesto - cat.gastado).toLocaleString()} disponibles`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen alertas */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card" style={{ padding: 18 }}>
              <div className="section-title">🚦 Estado General</div>
              {[
                { label: "Categorías al día", val: presupuesto.filter(c => c.gastado / c.presupuesto < 0.85).length, color: "#10B981", icon: "✅" },
                { label: "Al límite (>85%)",  val: presupuesto.filter(c => { const p = c.gastado/c.presupuesto; return p >= 0.85 && p <= 1; }).length, color: "#F59E0B", icon: "🔶" },
                { label: "Excedidas",          val: presupuesto.filter(c => c.gastado > c.presupuesto).length, color: "#EF4444", icon: "⚠️" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #1A1A28" }}>
                  <span style={{ fontSize: 13, color: "#94A3B8" }}>{s.icon} {s.label}</span>
                  <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700, color: s.color }}>{s.val}</span>
                </div>
              ))}
              <div style={{ marginTop: 14, padding: "12px", borderRadius: 10, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)", fontSize: 12 }}>
                <div style={{ color: "#A78BFA", fontWeight: 700, marginBottom: 4 }}>🤖 Recomendación IA</div>
                <div style={{ color: "#94A3B8", lineHeight: 1.6 }}>
                  Entretenimiento excedió $180. Si recortas $300 en ocio el próximo mes cubrirías el excedente y aportarías $120 extra al barril de emergencias.
                </div>
              </div>
            </div>

            <div className="card" style={{ padding: 18 }}>
              <div className="section-title">📊 Distribución vs Presupuesto</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 120, marginBottom: 8 }}>
                {presupuesto.map((cat, i) => {
                  const pct = cat.gastado / cat.presupuesto;
                  const excedido = pct > 1;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ width: "100%", position: "relative", height: 90, display: "flex", alignItems: "flex-end" }}>
                        {/* Barra presupuesto (fondo) */}
                        <div style={{ position: "absolute", bottom: 0, width: "100%", height: "100%", background: "#1A1A28", borderRadius: "4px 4px 0 0" }} />
                        {/* Barra gastado */}
                        <div style={{ position: "absolute", bottom: 0, width: "100%", height: `${Math.min(pct * 100, 110)}%`, background: excedido ? "#EF4444" : cat.color, borderRadius: "4px 4px 0 0", opacity: 0.85, transition: "all 0.3s" }} />
                      </div>
                      <span style={{ fontSize: 14 }}>{cat.emoji}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                {[{ c: "#1A1A28", l: "Presupuesto" }, { c: "#7C3AED", l: "Gastado" }, { c: "#EF4444", l: "Excedido" }].map(x => (
                  <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: x.c }} />
                    <span style={{ fontSize: 10, color: "#64748B" }}>{x.l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ── DEUDAS & PAGOS FIJOS ── */}
      {tab === "deudas" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Deudas */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: 11, color: "#EF4444", fontWeight: 700, fontFamily: "'Orbitron',monospace", letterSpacing: 2 }}>💳 DEUDAS</div>
              <button className="btn-primary" style={{ fontSize: 11, padding: "5px 12px" }} onClick={() => setShowDeudaForm(true)}>+ Agregar</button>
            </div>
            {deudas.filter(d => d.tipo === "deuda").map(d => {
              const pct = Math.round((d.pagado / d.total) * 100);
              const restante = d.total - d.pagado;
              const mesesRestantes = Math.ceil(restante / d.pagoMensual);
              const diasHasta = diasHastaPago(d.diaPago);
              const urgente = diasHasta <= 3;
              return (
                <div key={d.id} className="card" style={{ padding: 16, borderLeft: `4px solid ${d.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 26 }}>{d.emoji}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>{d.nombre}</div>
                        <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                          {d.interes > 0 && <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 999, background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>{d.interes}% anual</span>}
                          <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 999, background: urgente ? "rgba(239,68,68,0.15)" : "rgba(100,116,139,0.15)", color: urgente ? "#EF4444" : "#64748B" }}>
                            {urgente ? "⚡" : "📅"} Pago en {diasHasta}d (día {d.diaPago})
                          </span>
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 15, fontWeight: 700, color: d.color }}>${restante.toLocaleString()}</div>
                      <div style={{ fontSize: 10, color: "#64748B" }}>restante</div>
                    </div>
                  </div>
                  <ProgressBar value={d.pagado} max={d.total} color={d.color} height={8} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 6 }}>
                    <span style={{ color: d.color }}>{pct}% pagado</span>
                    <span style={{ color: "#64748B" }}>~{mesesRestantes} meses · ${d.pagoMensual.toLocaleString()}/mes</span>
                  </div>
                </div>
              );
            })}

            {/* Total deudas */}
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 700 }}>Total deuda pendiente</span>
              <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 900, color: "#EF4444" }}>${totalDeudas.toLocaleString()}</span>
            </div>
          </div>

          {/* Pagos fijos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 11, color: "#A78BFA", fontWeight: 700, fontFamily: "'Orbitron',monospace", letterSpacing: 2 }}>📆 PAGOS FIJOS MENSUALES</div>
            {deudas.filter(d => d.tipo === "fijo").map(d => {
              const diasHasta = diasHastaPago(d.diaPago);
              const urgente = diasHasta <= 3;
              return (
                <div key={d.id} className="card" style={{ padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: `3px solid ${d.color}` }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 24 }}>{d.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>{d.nombre}</div>
                      <div style={{ fontSize: 10, color: urgente ? "#EF4444" : "#64748B", marginTop: 2 }}>
                        {urgente ? "⚡" : "📅"} Vence en {diasHasta} días (día {d.diaPago})
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: d.color }}>${d.pagoMensual.toLocaleString()}</div>
                    <div style={{ fontSize: 10, color: "#64748B" }}>mensual</div>
                  </div>
                </div>
              );
            })}

            {/* Total pagos fijos */}
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 13, color: "#94A3B8", fontWeight: 700 }}>Total compromisos mensuales</span>
              <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 900, color: "#A78BFA" }}>${(totalDeudas > 0 ? deudas.filter(d=>d.tipo==="deuda").reduce((a,d)=>a+d.pagoMensual,0) : 0) + pagosFijosTotal}/mes</span>
            </div>

            {/* Calendario próximos pagos */}
            <div className="card" style={{ padding: 16 }}>
              <div className="section-title">📅 Próximos vencimientos</div>
              {deudas
                .map(d => ({ ...d, dias: diasHastaPago(d.diaPago) }))
                .sort((a, b) => a.dias - b.dias)
                .slice(0, 5)
                .map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #1A1A28" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span>{d.emoji}</span>
                      <span style={{ fontSize: 12, color: "#CBD5E1" }}>{d.nombre}</span>
                    </div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: d.color }}>${d.pagoMensual.toLocaleString()}</span>
                      <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: d.dias <= 3 ? "rgba(239,68,68,0.15)" : "rgba(100,116,139,0.1)", color: d.dias <= 3 ? "#EF4444" : "#64748B", fontWeight: 700 }}>
                        {d.dias === 0 ? "¡Hoy!" : `${d.dias}d`}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* ── PATRIMONIO ── */}
      {tab === "patrimonio" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {/* Activos y deudas */}
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div className="section-title" style={{ marginBottom: 0 }}>📈 Activos</div>
                <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 700, color: "#10B981" }}>${totalActivos.toLocaleString()}</span>
              </div>
              {activos.length === 0 && (
                <div style={{ textAlign: "center", color: "#4A5568", padding: "16px 0", fontSize: 12 }}>
                  Sin activos registrados
                </div>
              )}
              {activos.map((a, i) => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span>{a.emoji}</span>
                      <span style={{ color: "#CBD5E1" }}>{a.nombre}</span>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span style={{ color: a.color, fontWeight: 700 }}>{totalActivos > 0 ? Math.round((a.valor / totalActivos) * 100) : 0}%</span>
                      <span style={{ color: "#64748B" }}>${a.valor.toLocaleString()}</span>
                      <button onClick={() => eliminarActivo(a.id)} style={{ background: "none", border: "none", color: "#4A5568", cursor: "pointer", fontSize: 12 }}>🗑️</button>
                    </div>
                  </div>
                  <ProgressBar value={a.valor} max={Math.max(totalActivos, 1)} color={a.color} height={5} />
                </div>
              ))}
              <button onClick={() => setShowActivoForm(true)} className="btn-secondary" style={{ width: "100%", fontSize: 12, marginTop: 8 }}>+ Agregar activo</button>
              {showActivoForm && (
                <div style={{ marginTop: 12, padding: 14, borderRadius: 10, background: "#0A0A12", border: "1px solid #1E1E30" }}>
                  <input placeholder="Nombre (ej. Ahorro banco)" value={activoForm.nombre} onChange={e => setActivoForm(f => ({...f, nombre: e.target.value}))} style={{ width: "100%", marginBottom: 8 }} />
                  <input type="number" placeholder="Valor ($)" value={activoForm.valor} onChange={e => setActivoForm(f => ({...f, valor: e.target.value}))} style={{ width: "100%", marginBottom: 8 }} />
                  <div style={{ display: "flex", gap: 6 }}>
                    {["🏦","🏠","🚗","💰","📈","💎"].map(e => (
                      <button key={e} onClick={() => setActivoForm(f => ({...f, emoji: e}))}
                        style={{ flex: 1, padding: "6px", borderRadius: 6, border: `1px solid ${activoForm.emoji === e ? "#10B981" : "#1E1E30"}`, background: activoForm.emoji === e ? "rgba(16,185,129,0.15)" : "#0F0F18", cursor: "pointer" }}>{e}</button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowActivoForm(false)}>Cancelar</button>
                    <button className="btn-primary" style={{ flex: 2 }} onClick={agregarActivo}>✓ Agregar</button>
                  </div>
                </div>
              )}
            </div>
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div className="section-title" style={{ marginBottom: 0 }}>📉 Deudas</div>
                <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 700, color: "#EF4444" }}>${totalDeudas.toLocaleString()}</span>
              </div>
              {deudas.filter(d => d.tipo === "deuda").map((d, i) => {
                const restante = d.total - d.pagado;
                return (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "8px 0", borderBottom: "1px solid #1A1A28" }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <span>{d.emoji}</span>
                      <span style={{ color: "#CBD5E1" }}>{d.nombre}</span>
                    </div>
                    <span style={{ color: "#EF4444", fontWeight: 700 }}>-${restante.toLocaleString()}</span>
                  </div>
                );
              })}
              <div style={{ marginTop: 14, padding: "14px 16px", borderRadius: 10, background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.25)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14 }}>
                  <span style={{ color: "#94A3B8", fontWeight: 700 }}>Patrimonio Neto</span>
                  <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 900, color: "#10B981" }}>${patrimonioNeto.toLocaleString()}</span>
                </div>
                <div style={{ marginTop: 8 }}>
                  <ProgressBar value={totalActivos - totalDeudas} max={totalActivos} color="#10B981" height={8} />
                </div>
              </div>
            </div>
          </div>

          {/* Evolución patrimonio */}
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title">📈 Evolución del Patrimonio</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 180, marginBottom: 14 }}>
              {historialMensual.length === 0 ? (
                <div style={{ flex: 1, textAlign: "center", color: "#4A5568", fontSize: 12, paddingTop: 60 }}>Registra transacciones para ver la evolución</div>
              ) : historialMensual.map((h, i) => {
                const maxVal = Math.max(...historialMensual.map(x => x.ingresos + totalActivos), 1);
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 9, color: "#10B981" }}>${((totalActivos + h.ahorro * (i+1)) / 1000).toFixed(0)}k</div>
                    <div style={{ width: "100%", height: `${Math.min(((totalActivos + h.ahorro * (i+1)) / maxVal) * 140, 140)}px`, minHeight: 4, background: "#10B981", borderRadius: "4px 4px 0 0", opacity: 0.6 + (i / historialMensual.length) * 0.4 }} />
                    <span style={{ fontSize: 10, color: "#64748B" }}>{h.label}</span>
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { label: "Activos totales",    val: `$${totalActivos.toLocaleString()}`,    color: "#10B981" },
                { label: "Deudas totales",     val: `$${totalDeudas.toLocaleString()}`,     color: "#EF4444" },
                { label: "Patrimonio neto",    val: `$${patrimonioNeto.toLocaleString()}`,  color: "#F59E0B" },
                { label: "Ratio activos/deudas", val: totalDeudas > 0 ? `${(totalActivos / totalDeudas).toFixed(1)}x` : "∞", color: "#06B6D4" },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 12px", borderRadius: 8, background: "#0A0A12", border: "1px solid #1A1A28", fontSize: 12 }}>
                  <span style={{ color: "#94A3B8" }}>{s.label}</span>
                  <span style={{ color: s.color, fontWeight: 700, fontFamily: "'Orbitron',monospace" }}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── BARRILES ── */}
      {tab === "barriles" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 11, color: "#06B6D4", fontWeight: 700, fontFamily: "'Orbitron',monospace", letterSpacing: 2 }}>🪣 FONDOS DE AHORRO</div>
            <button className="btn-primary" style={{ fontSize: 11, padding: "5px 12px" }} onClick={() => setShowBarrilForm(true)}>+ Nuevo barril</button>
          </div>
          {barriles.length === 0 && (
            <div className="card" style={{ padding: 40, textAlign: "center", color: "#4A5568" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>🪣</div>
              <div style={{ fontSize: 14, marginBottom: 6 }}>Sin barriles de ahorro</div>
              <div style={{ fontSize: 12 }}>Crea fondos separados para tus metas (emergencias, viaje, auto...)</div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {barriles.map(b => {
              const pct = Math.min((b.current / b.goal) * 100, 100);
              const remaining = Math.max(b.goal - b.current, 0);
              const months = b.monthly > 0 ? Math.ceil(remaining / b.monthly) : "∞";
              return (
                <div key={b.id} className="card" style={{ padding: 18, borderTop: `3px solid ${b.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontSize: 30 }}>{b.emoji}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginTop: 4 }}>{b.name}</div>
                    </div>
                    <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color: b.color }}>{Math.round(pct)}%</div>
                      <button onClick={() => { if(window.confirm(`¿Eliminar "${b.name}"?`)) eliminarBarril(b.id); }}
                        style={{ background: "none", border: "none", color: "#4A5568", cursor: "pointer", fontSize: 14 }}>🗑️</button>
                    </div>
                  </div>
                  <ProgressBar value={b.current} max={b.goal} color={b.color} height={10} />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 6, marginBottom: 12 }}>
                    <span style={{ color: b.color, fontWeight: 700 }}>${b.current.toLocaleString()}</span>
                    <span style={{ color: "#4A5568" }}>meta: ${b.goal.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[100, 500, 1000].map(monto => (
                      <button key={monto} onClick={() => depositarBarril(b.id, monto)}
                        className="btn-secondary" style={{ flex: 1, fontSize: 11, padding: "5px 4px" }}>
                        +${monto}
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: 10, color: "#64748B", marginTop: 6, textAlign: "center" }}>
                    {months === "∞" ? "Sin aportación mensual" : `~${months} meses · $${(b.monthly || 0).toLocaleString()}/mes`}
                  </div>
                </div>
              );
            })}
          </div>
          {showBarrilForm && (
            <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowBarrilForm(false)}>
              <div className="modal" style={{ width: 420 }}>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 20 }}>🪣 Nuevo Barril de Ahorro</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input placeholder="Nombre (ej. Fondo emergencias)" value={barrilForm.name} onChange={e => setBarrilForm(f => ({...f, name: e.target.value}))} />
                  <input type="number" placeholder="Meta ($)" value={barrilForm.goal} onChange={e => setBarrilForm(f => ({...f, goal: e.target.value}))} />
                  <input type="number" placeholder="Aportación mensual ($) — opcional" value={barrilForm.monthly} onChange={e => setBarrilForm(f => ({...f, monthly: e.target.value}))} />
                  <div style={{ display: "flex", gap: 6 }}>
                    {["🪣","🚨","✈️","🚗","🏠","💊","📚","💰"].map(e => (
                      <button key={e} onClick={() => setBarrilForm(f => ({...f, emoji: e}))}
                        style={{ flex: 1, padding: "6px", borderRadius: 6, border: `1px solid ${barrilForm.emoji === e ? "#06B6D4" : "#1E1E30"}`, background: barrilForm.emoji === e ? "rgba(6,182,212,0.15)" : "#0F0F18", cursor: "pointer" }}>{e}</button>
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["#06B6D4","#10B981","#7C3AED","#F59E0B","#EF4444","#EC4899"].map(c => (
                      <button key={c} onClick={() => setBarrilForm(f => ({...f, color: c}))}
                        style={{ flex: 1, height: 28, borderRadius: 6, background: c, border: `3px solid ${barrilForm.color === c ? "white" : "transparent"}`, cursor: "pointer" }} />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowBarrilForm(false)}>Cancelar</button>
                    <button className="btn-primary" style={{ flex: 2 }} onClick={agregarBarril} disabled={!barrilForm.name || !barrilForm.goal}>✓ Crear barril</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {showDeudaForm && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowDeudaForm(false)}>
          <div className="modal" style={{ width: 440 }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 20 }}>💳 Agregar Deuda / Pago Fijo</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 8 }}>
                {[{v:"deuda",l:"💳 Deuda"},{v:"fijo",l:"📅 Pago fijo"}].map(o => (
                  <button key={o.v} onClick={() => setDeudaForm(f => ({...f, tipo: o.v}))}
                    className={deudaForm.tipo === o.v ? "btn-primary" : "btn-secondary"} style={{ flex: 1, fontSize: 12 }}>{o.l}</button>
                ))}
              </div>
              <input placeholder="Nombre (ej. Tarjeta Banamex)" value={deudaForm.nombre} onChange={e => setDeudaForm(f => ({...f, nombre: e.target.value}))} />
              <input type="number" placeholder={deudaForm.tipo === "deuda" ? "Total de la deuda ($)" : "Monto mensual ($)"} value={deudaForm.total} onChange={e => setDeudaForm(f => ({...f, total: e.target.value}))} />
              <input type="number" placeholder="Pago mensual ($)" value={deudaForm.pagoMensual} onChange={e => setDeudaForm(f => ({...f, pagoMensual: e.target.value}))} />
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>Día de pago</div>
                  <input type="number" min="1" max="31" value={deudaForm.diaPago} onChange={e => setDeudaForm(f => ({...f, diaPago: parseInt(e.target.value)}))} />
                </div>
                {deudaForm.tipo === "deuda" && (
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>Interés anual (%)</div>
                    <input type="number" min="0" value={deudaForm.interes} onChange={e => setDeudaForm(f => ({...f, interes: e.target.value}))} />
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                {["💳","🏠","🚗","📱","🏥","⚡","🎓","💊"].map(e => (
                  <button key={e} onClick={() => setDeudaForm(f => ({...f, emoji: e}))}
                    style={{ flex: 1, padding: "6px", borderRadius: 6, border: `1px solid ${deudaForm.emoji === e ? "#EF4444" : "#1E1E30"}`, background: deudaForm.emoji === e ? "rgba(239,68,68,0.15)" : "#0F0F18", cursor: "pointer" }}>{e}</button>
                ))}
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowDeudaForm(false)}>Cancelar</button>
                <button className="btn-danger" style={{ flex: 2 }} onClick={agregarDeuda} disabled={!deudaForm.nombre || !deudaForm.total}>✓ Agregar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TRANSACCIONES ── */}
      {tab === "transacciones" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>📋 Movimientos</div>
              <div style={{ display: "flex", gap: 6 }}>
                {[{ k: "all", l: "Todos" }, { k: "income", l: "💰 Ingresos" }, { k: "expense", l: "💸 Gastos" }].map(t => (
                  <button key={t.k} onClick={() => setTxnType(t.k)}
                    className={txnType === t.k ? "btn-primary" : "btn-secondary"}
                    style={{ fontSize: 11, padding: "4px 10px" }}>{t.l}</button>
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
          <div className="card" style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="section-title">+ Registrar</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[{ k: "income", l: "💰 Ingreso" }, { k: "expense", l: "💸 Gasto" }].map(t => (
                <button key={t.k} onClick={() => setForm(f => ({ ...f, type: t.k }))}
                  style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${form.type === t.k ? (t.k === "income" ? "#10B981" : "#EF4444") : "#2D2D45"}`, background: form.type === t.k ? (t.k === "income" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)") : "#0F0F18", color: form.type === t.k ? (t.k === "income" ? "#10B981" : "#EF4444") : "#64748B", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13 }}>
                  {t.l}
                </button>
              ))}
            </div>
            <input placeholder="Descripción" value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} />
            <input type="number" placeholder="Monto MXN" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
            <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
              {(form.type === "income"
                ? [["freelance","💻 Freelance"],["pasivo","📈 Pasivo"],["salario","💼 Salario"],["negocio","🏢 Negocio"],["otro","🔹 Otro"]]
                : [["alimentacion","🛒 Alimentación"],["vivienda","🏠 Vivienda"],["transporte","⛽ Transporte"],["educacion","📚 Educación"],["entretenimiento","📺 Entretenimiento"],["salud","💪 Salud"],["negocio","🏢 Negocio"],["otro","🔹 Otro"]]
              ).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
            </select>
            <button onClick={addTxn} className={form.type === "income" ? "btn-success" : "btn-danger"} style={{ width: "100%" }}>
              {form.type === "income" ? "💰 Registrar Ingreso" : "💸 Registrar Gasto"}
            </button>
          </div>
        </div>
      )}

      {tab === "negocios" && <NegociosTab />}

      {/* ── GRÁFICAS ── */}
      {tab === "graficas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Ingresos vs Gastos histórico */}
          <div className="card" style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 0 }}>
              <div className="section-title" style={{ marginBottom: 0 }}>📊 Ingresos vs Gastos — Últimos 6 meses</div>
              <button onClick={recargarFinanzas} className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>🔄 Actualizar</button>
            </div>
            {historialMensual.length === 0 ? (
              <div style={{ textAlign: "center", color: "#4A5568", padding: 30 }}>Registra transacciones para ver el historial</div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 160, marginBottom: 12 }}>
                  {historialMensual.map((m, i) => {
                    const maxBar = Math.max(...historialMensual.map(x => Math.max(x.ingresos, x.gastos)), 1);
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        <div style={{ width: "100%", display: "flex", gap: 2, alignItems: "flex-end", height: 140 }}>
                          <div style={{ flex: 1, background: "#10B981", borderRadius: "4px 4px 0 0", height: `${(m.ingresos / maxBar) * 130}px`, minHeight: 4 }} />
                          <div style={{ flex: 1, background: "#EF4444", borderRadius: "4px 4px 0 0", height: `${(m.gastos / maxBar) * 130}px`, minHeight: 4 }} />
                        </div>
                        <span style={{ fontSize: 10, color: "#4A5568" }}>{m.label}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
                  {[{ c: "#10B981", l: "Ingresos" }, { c: "#EF4444", l: "Gastos" }, { c: "#06B6D4", l: "Ahorro" }].map(x => (
                    <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 2, background: x.c }} />
                      <span style={{ fontSize: 11, color: "#64748B" }}>{x.l}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Ahorro mensual */}
          <div className="card" style={{ padding: 18 }}>
            <div className="section-title">💰 Ahorro Neto por Mes</div>
            {historialMensual.length === 0 ? (
              <div style={{ textAlign: "center", color: "#4A5568", padding: 20 }}>Sin datos aún</div>
            ) : (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120 }}>
                {historialMensual.map((m, i) => {
                  const maxAhorro = Math.max(...historialMensual.map(x => Math.abs(x.ahorro)), 1);
                  const positive = m.ahorro >= 0;
                  return (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                      <div style={{ fontSize: 9, color: positive ? "#10B981" : "#EF4444", fontWeight: 700 }}>
                        ${(Math.abs(m.ahorro) / 1000).toFixed(1)}k
                      </div>
                      <div style={{ width: "100%", height: `${(Math.abs(m.ahorro) / maxAhorro) * 90}px`, minHeight: 4, background: positive ? "#10B981" : "#EF4444", borderRadius: "4px 4px 0 0", opacity: 0.8 }} />
                      <span style={{ fontSize: 10, color: "#4A5568" }}>{m.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Distribución por categoría */}
          <div className="card" style={{ padding: 18 }}>
            <div className="section-title">🍕 Distribución de Gastos este Mes</div>
            {presupuesto.length === 0 ? (
              <div style={{ textAlign: "center", color: "#4A5568", padding: 20 }}>Crea categorías en el backend para ver la distribución</div>
            ) : (
              <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
                <svg width="140" height="140" viewBox="0 0 120 120">
                  {(() => {
                    let offset = 0;
                    const total = presupuesto.reduce((a, c) => a + c.gastado, 0) || 1;
                    const r = 44; const circ = 2 * Math.PI * r;
                    return presupuesto.filter(c => c.gastado > 0).map((cat, i) => {
                      const pct = cat.gastado / total;
                      const dash = circ * pct;
                      const el = <circle key={i} cx="60" cy="60" r={r} fill="none" stroke={cat.color} strokeWidth="20" strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={-offset} transform="rotate(-90 60 60)" />;
                      offset += dash;
                      return el;
                    });
                  })()}
                  <circle cx="60" cy="60" r="34" fill="#0F0F18" />
                  <text x="60" y="64" textAnchor="middle" fill="#64748B" fontSize="9" fontFamily="Rajdhani,sans-serif">${(resumen.monthExpense / 1000).toFixed(1)}k</text>
                </svg>
                <div style={{ flex: 1 }}>
                  {presupuesto.filter(c => c.gastado > 0).map((cat, i) => {
                    const total = presupuesto.reduce((a, c) => a + c.gastado, 0) || 1;
                    return (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: "1px solid #1A1A28" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ width: 8, height: 8, borderRadius: 2, background: cat.color }} />
                          <span style={{ color: "#94A3B8" }}>{cat.emoji} {cat.nombre}</span>
                        </div>
                        <span style={{ color: cat.color, fontWeight: 700 }}>{Math.round((cat.gastado/total)*100)}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// PÁGINA: TAREAS
// ============================================================

const TAREAS_CATEGORIAS = [
  { id: "trabajo", label: "Trabajo", icon: "💼", color: "#7C3AED" },
  { id: "estudio", label: "Estudio", icon: "📚", color: "#06B6D4" },
  { id: "personal", label: "Personal", icon: "🙋", color: "#10B981" },
  { id: "finanzas", label: "Finanzas", icon: "💰", color: "#F59E0B" },
  { id: "salud", label: "Salud", icon: "💪", color: "#EF4444" },
  { id: "hogar", label: "Hogar", icon: "🏠", color: "#EC4899" },
];

const PRIORIDAD_CONFIG = {
  alta:   { label: "Alta",   color: "#EF4444", bg: "rgba(239,68,68,0.12)",   dot: "🔴" },
  media:  { label: "Media",  color: "#F59E0B", bg: "rgba(245,158,11,0.12)",  dot: "🟡" },
  baja:   { label: "Baja",   color: "#10B981", bg: "rgba(16,185,129,0.12)",  dot: "🟢" },
};

const ESTADO_CONFIG = {
  pendiente:   { label: "Pendiente",    color: "#64748B", bg: "#1A1A28" },
  progreso:    { label: "En Progreso",  color: "#06B6D4", bg: "rgba(6,182,212,0.1)" },
  completado:  { label: "Completado",   color: "#10B981", bg: "rgba(16,185,129,0.1)" },
};

const TAREAS_INICIAL = [
  {
    id: 1, titulo: "Completar módulo FastAPI", categoria: "estudio", prioridad: "alta",
    estado: "progreso", fecha: "2026-03-15", descripcion: "Terminar secciones de autenticación y middleware",
    subtareas: [
      { id: 1, texto: "JWT con OAuth2", done: true },
      { id: 2, texto: "Middleware de logging", done: true },
      { id: 3, texto: "Rate limiting", done: false },
      { id: 4, texto: "Tests unitarios", done: false },
    ],
  },
  {
    id: 2, titulo: "Aplicar a 3 proyectos freelance", categoria: "trabajo", prioridad: "alta",
    estado: "pendiente", fecha: "2026-03-13", descripcion: "Buscar en Upwork, Workana y LinkedIn",
    subtareas: [
      { id: 1, texto: "Actualizar portfolio en GitHub", done: false },
      { id: 2, texto: "Aplicar en Upwork", done: false },
      { id: 3, texto: "Aplicar en Workana", done: false },
    ],
  },
  {
    id: 3, titulo: "Registrar gastos de la semana", categoria: "finanzas", prioridad: "media",
    estado: "pendiente", fecha: "2026-03-14", descripcion: "Revisar y categorizar todos los movimientos",
    subtareas: [
      { id: 1, texto: "Supermercado", done: true },
      { id: 2, texto: "Transporte", done: false },
      { id: 3, texto: "Servicios", done: false },
    ],
  },
  {
    id: 4, titulo: "Revisar rutina de nutrición", categoria: "salud", prioridad: "baja",
    estado: "completado", fecha: "2026-03-12", descripcion: "Ajustar macros según objetivo actual",
    subtareas: [
      { id: 1, texto: "Calcular TDEE actualizado", done: true },
      { id: 2, texto: "Ajustar proteína", done: true },
    ],
  },
  {
    id: 5, titulo: "Leer Clean Code cap. 8-10", categoria: "estudio", prioridad: "media",
    estado: "pendiente", fecha: "2026-03-16", descripcion: "",
    subtareas: [],
  },
  {
    id: 6, titulo: "Pagar renta", categoria: "hogar", prioridad: "alta",
    estado: "completado", fecha: "2026-03-01", descripcion: "",
    subtareas: [{ id: 1, texto: "Transferencia bancaria", done: true }],
  },
];

const diasRestantes = (fecha) => {
  if (!fecha) return null;
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const f = new Date(fecha); f.setHours(0,0,0,0);
  return Math.ceil((f - hoy) / (1000 * 60 * 60 * 24));
};

const FechaTag = ({ fecha, estado }) => {
  if (!fecha || estado === "completado") return null;
  const d = diasRestantes(fecha);
  const color = d < 0 ? "#EF4444" : d === 0 ? "#F97316" : d <= 2 ? "#F59E0B" : "#64748B";
  const label = d < 0 ? `Vencida hace ${Math.abs(d)}d` : d === 0 ? "Vence hoy" : d === 1 ? "Mañana" : `${d} días`;
  return (
    <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: `${color}15`, color, fontWeight: 700, border: `1px solid ${color}30` }}>
      📅 {label}
    </span>
  );
};

const TareasPage = ({ setGame }) => {
  const [tareas, setTareas] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.tareas.listar()
      .then(data => {
        const mapeadas = (data || []).map(t => ({
          id:          t.id,
          titulo:      t.title,
          descripcion: t.description || "",
          categoria:   t.category    || "trabajo",
          prioridad:   ({ high: "alta", medium: "media", low: "baja" }[t.priority]) || t.priority || "media",
          estado:      t.status === "completed" ? "completado" : t.status === "in_progress" ? "progreso" : "pendiente",
          fecha:       t.due_date    ? t.due_date.split("T")[0] : "",
          subtareas:   (t.subtasks  || []).map(s => ({ id: s.id, texto: s.title, done: s.completed })),
        }));
        setTareas(mapeadas);
      })
      .catch(() => setTareas([]))
      .finally(() => setCargando(false));
  }, []);
  const [vista, setVista] = useState("lista"); // lista | kanban
  const [filtroCategoria, setFiltroCategoria] = useState("todas");
  const [filtroPrioridad, setFiltroPrioridad] = useState("todas");
  const [filtroEstado, setFiltroEstado] = useState("todas");
  const [busqueda, setBusqueda] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    titulo: "", descripcion: "", categoria: "trabajo",
    prioridad: "media", estado: "pendiente", fecha: "",
  });
  const [nuevoSub, setNuevoSub] = useState("");

  const selected = tareas.find(t => t.id === selectedId);

  // Filtrado
  const tareasFiltradas = tareas.filter(t => {
    if (filtroCategoria !== "todas" && t.categoria !== filtroCategoria) return false;
    if (filtroPrioridad !== "todas" && t.prioridad !== filtroPrioridad) return false;
    if (filtroEstado !== "todas" && t.estado !== filtroEstado) return false;
    if (busqueda && !t.titulo.toLowerCase().includes(busqueda.toLowerCase())) return false;
    return true;
  });

  const getCat = (id) => TAREAS_CATEGORIAS.find(c => c.id === id) || TAREAS_CATEGORIAS[0];

  // Acciones
  const toggleEstado = async (id) => {
    const tarea = tareas.find(t => t.id === id);
    if (!tarea) return;
    const siguiente = tarea.estado === "pendiente" ? "progreso" : tarea.estado === "progreso" ? "completado" : "pendiente";
    const statusMap = { pendiente: "pending", progreso: "in_progress", completado: "completed" };
    try {
      await api.tareas.editar(id, { status: statusMap[siguiente] });
      setTareas(prev => prev.map(t => t.id !== id ? t : { ...t, estado: siguiente }));
      if (siguiente === "completado") {
        if (setGame) setGame(g => ({ ...g, xp: g.xp + 1, coins: g.coins + 1 }));
        setToast({ msg: `✅ "${tarea.titulo}" completada +1 XP`, color: "#10B981" });
      }
    } catch (e) {
      setToast({ msg: `❌ Error: ${e.message}`, color: "#EF4444" });
    }
  };

  const cambiarEstadoKanban = async (id, nuevoEstado) => {
    const statusMap = { pendiente: "pending", progreso: "in_progress", completado: "completed" };
    try {
      await api.tareas.editar(id, { status: statusMap[nuevoEstado] });
      setTareas(prev => prev.map(t => t.id === id ? { ...t, estado: nuevoEstado } : t));
    } catch (e) {
      setToast({ msg: `❌ Error: ${e.message}`, color: "#EF4444" });
    }
  };

  const toggleSubtarea = async (tareaId, subId) => {
    const tarea = tareas.find(t => t.id === tareaId);
    const sub = tarea?.subtareas?.find(s => s.id === subId);
    if (!sub) return;
    try {
      await api.tareas.toggleSubtarea(tareaId, subId, !sub.done);
      setTareas(prev => prev.map(t => t.id !== tareaId ? t : {
        ...t,
        subtareas: t.subtareas.map(s => s.id === subId ? { ...s, done: !s.done } : s),
      }));
    } catch (e) {
      // Actualizar local de todas formas
      setTareas(prev => prev.map(t => t.id !== tareaId ? t : {
        ...t,
        subtareas: t.subtareas.map(s => s.id === subId ? { ...s, done: !s.done } : s),
      }));
    }
  };

  const agregarSubtarea = async (tareaId) => {
    if (!nuevoSub.trim()) return;
    try {
      const res = await api.tareas.agregarSubtarea(tareaId, { title: nuevoSub.trim() });
      const nueva = { id: res.id, texto: res.title || nuevoSub.trim(), done: res.completed || false };
      setTareas(prev => prev.map(t => t.id !== tareaId ? t : {
        ...t,
        subtareas: [...t.subtareas, nueva],
      }));
      setNuevoSub("");
    } catch (e) {
      // Fallback local si falla
      setTareas(prev => prev.map(t => t.id !== tareaId ? t : {
        ...t,
        subtareas: [...t.subtareas, { id: Date.now(), texto: nuevoSub.trim(), done: false }],
      }));
      setNuevoSub("");
    }
  };

  const eliminarTarea = async (id) => {
    try {
      await api.tareas.eliminar(id);
      setTareas(prev => prev.filter(t => t.id !== id));
      setSelectedId(null);
      setToast({ msg: "🗑️ Tarea eliminada", color: "#EF4444" });
    } catch (e) {
      setToast({ msg: `❌ Error: ${e.message}`, color: "#EF4444" });
    }
  };

  const crearTarea = async () => {
    if (!form.titulo.trim()) return;
    try {
      const prioridadMap = { alta: "high", media: "medium", baja: "low" };
      const nueva = await api.tareas.crear({
        title:       form.titulo,
        description: form.descripcion || null,
        priority:    prioridadMap[form.prioridad] || "medium",
        category_id: null,
        due_date:    form.fecha ? form.fecha + "T00:00:00" : null,
      });
      const mapeada = {
        id:          nueva.id,
        titulo:      nueva.title,
        descripcion: nueva.description || "",
        categoria:   nueva.category    || "trabajo",
        prioridad: ({ high: "alta", medium: "media", low: "baja" }[nueva.priority]) || "media",
        estado:      "pendiente",
        fecha:       nueva.due_date ? nueva.due_date.split("T")[0] : "",
        subtareas:   [],
      };
      setTareas(prev => [mapeada, ...prev]);
      setSelectedId(mapeada.id);
      setShowForm(false);
      setForm({ titulo: "", descripcion: "", categoria: "trabajo", prioridad: "media", estado: "pendiente", fecha: "" });
      setToast({ msg: `📝 Tarea "${mapeada.titulo}" creada`, color: "#7C3AED" });
    } catch (e) {
      setToast({ msg: `❌ Error: ${e.message}`, color: "#EF4444" });
    }
  };

  // Stats
  const total = tareas.length;
  const completadas = tareas.filter(t => t.estado === "completado").length;
  const vencidas = tareas.filter(t => t.estado !== "completado" && t.fecha && diasRestantes(t.fecha) < 0).length;
  const hoy = tareas.filter(t => t.estado !== "completado" && t.fecha && diasRestantes(t.fecha) === 0).length;

  // Componente tarjeta reutilizable
  const TareaCard = ({ tarea, compact = false }) => {
    const cat = getCat(tarea.categoria);
    const pr = PRIORIDAD_CONFIG[tarea.prioridad];
    const est = ESTADO_CONFIG[tarea.estado];
    const subDone = tarea.subtareas.filter(s => s.done).length;
    const isSelected = selectedId === tarea.id;

    return (
      <div
        onClick={() => setSelectedId(isSelected ? null : tarea.id)}
        style={{ padding: compact ? "10px 12px" : "14px 16px", borderRadius: 10, background: isSelected ? `${cat.color}08` : "#0F0F18", border: `1px solid ${isSelected ? cat.color + "50" : "#1E1E30"}`, cursor: "pointer", transition: "all 0.15s", marginBottom: compact ? 6 : 0 }}
        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = cat.color + "30"; }}
        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = "#1E1E30"; }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
          {/* Botón de estado circular */}
          <button
            onClick={e => { e.stopPropagation(); toggleEstado(tarea.id); }}
            style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${est.color}`, background: tarea.estado === "completado" ? est.color : "transparent", flexShrink: 0, cursor: "pointer", marginTop: 1, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
            {tarea.estado === "completado" && <span style={{ color: "white", fontSize: 11, fontWeight: 700 }}>✓</span>}
            {tarea.estado === "progreso" && <div style={{ width: 8, height: 8, borderRadius: "50%", background: est.color }} />}
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: tarea.estado === "completado" ? "#4A5568" : "#F1F5F9", textDecoration: tarea.estado === "completado" ? "line-through" : "none", lineHeight: 1.3 }}>
              {tarea.titulo}
            </div>
            <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap", alignItems: "center" }}>
              <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: `${cat.color}15`, color: cat.color, fontWeight: 700 }}>{cat.icon} {cat.label}</span>
              <span style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: pr.bg, color: pr.color, fontWeight: 700 }}>{pr.dot} {pr.label}</span>
              <FechaTag fecha={tarea.fecha} estado={tarea.estado} />
              {tarea.subtareas.length > 0 && (
                <span style={{ fontSize: 10, color: "#64748B" }}>☑ {subDone}/{tarea.subtareas.length}</span>
              )}
            </div>
            {tarea.subtareas.length > 0 && !compact && (
              <div style={{ marginTop: 8 }}>
                <ProgressBar value={subDone} max={tarea.subtareas.length} color={cat.color} height={3} />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (cargando) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #1E1E30", borderTop: "3px solid #7C3AED", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontSize: 12, color: "#4A5568", letterSpacing: 2 }}>CARGANDO TAREAS...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {toast && <Toast msg={toast.msg} color={toast.color} onDone={() => setToast(null)} />}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { label: "Total tareas", value: total, icon: "📋", color: "#7C3AED" },
          { label: "Completadas", value: completadas, icon: "✅", color: "#10B981", sub: `${Math.round((completadas/total)*100)||0}%` },
          { label: "Vencen hoy", value: hoy, icon: "⚡", color: "#F59E0B" },
          { label: "Vencidas", value: vencidas, icon: "🔴", color: "#EF4444" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: "14px 18px", borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>{s.label}</div>
            {s.sub && <div style={{ fontSize: 10, color: s.color, opacity: 0.7 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Barra de controles */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        {/* Vista */}
        <div style={{ display: "flex", gap: 4, background: "#0A0A12", borderRadius: 8, padding: 3, border: "1px solid #1E1E30" }}>
          {[{ k: "lista", l: "☰ Lista" }, { k: "kanban", l: "⬛ Kanban" }].map(v => (
            <button key={v.k} onClick={() => setVista(v.k)}
              style={{ padding: "5px 12px", borderRadius: 6, border: "none", background: vista === v.k ? "#7C3AED" : "transparent", color: vista === v.k ? "white" : "#64748B", cursor: "pointer", fontSize: 12, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, transition: "all 0.15s" }}>
              {v.l}
            </button>
          ))}
        </div>

        {/* Búsqueda */}
        <input placeholder="🔍 Buscar tarea..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
          style={{ flex: 1, minWidth: 160, padding: "7px 12px", fontSize: 12 }} />

        {/* Filtros */}
        <select value={filtroCategoria} onChange={e => setFiltroCategoria(e.target.value)} style={{ fontSize: 12, padding: "7px 10px", width: "auto" }}>
          <option value="todas">📂 Todas las categorías</option>
          {TAREAS_CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
        </select>

        <select value={filtroPrioridad} onChange={e => setFiltroPrioridad(e.target.value)} style={{ fontSize: 12, padding: "7px 10px", width: "auto" }}>
          <option value="todas">🎯 Prioridad</option>
          {Object.entries(PRIORIDAD_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.dot} {v.label}</option>)}
        </select>

        <select value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)} style={{ fontSize: 12, padding: "7px 10px", width: "auto" }}>
          <option value="todas">📊 Estado</option>
          {Object.entries(ESTADO_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>

        <button className="btn-primary" style={{ fontSize: 12, padding: "7px 16px", flexShrink: 0 }} onClick={() => setShowForm(true)}>
          + Nueva tarea
        </button>
      </div>

      {/* ── VISTA: LISTA ── */}
      {vista === "lista" && (
        <div style={{ display: "grid", gridTemplateColumns: selectedId ? "1fr 360px" : "1fr", gap: 16 }}>
          {/* Lista */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {/* Grupo por prioridad */}
            {["alta", "media", "baja"].map(pr => {
              const grupo = tareasFiltradas.filter(t => t.prioridad === pr);
              if (grupo.length === 0) return null;
              const cfg = PRIORIDAD_CONFIG[pr];
              return (
                <div key={pr}>
                  <div style={{ fontSize: 10, color: cfg.color, fontWeight: 700, fontFamily: "'Orbitron',monospace", letterSpacing: 2, marginBottom: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: cfg.color }} />
                    {cfg.label.toUpperCase()} — {grupo.length}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {grupo.map(t => <TareaCard key={t.id} tarea={t} />)}
                  </div>
                </div>
              );
            })}
            {tareasFiltradas.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#4A5568" }}>
                <div style={{ fontSize: 40, marginBottom: 10 }}>📭</div>
                <div style={{ fontSize: 14 }}>No hay tareas con esos filtros</div>
              </div>
            )}
          </div>

          {/* Panel detalle */}
          {selected && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {(() => {
                const cat = getCat(selected.categoria);
                const pr = PRIORIDAD_CONFIG[selected.prioridad];
                const est = ESTADO_CONFIG[selected.estado];
                const subDone = selected.subtareas.filter(s => s.done).length;
                return (
                  <>
                    <div className="card" style={{ padding: 18, borderTop: `3px solid ${cat.color}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "#F1F5F9", lineHeight: 1.4, marginBottom: 8 }}>{selected.titulo}</div>
                          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                            <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 999, background: `${cat.color}15`, color: cat.color, fontWeight: 700 }}>{cat.icon} {cat.label}</span>
                            <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 999, background: pr.bg, color: pr.color, fontWeight: 700 }}>{pr.dot} {pr.label}</span>
                            <span style={{ fontSize: 11, padding: "3px 9px", borderRadius: 999, background: est.bg, color: est.color, fontWeight: 700 }}>{est.label}</span>
                          </div>
                        </div>
                        <button onClick={() => setSelectedId(null)} style={{ background: "none", border: "none", color: "#4A5568", cursor: "pointer", fontSize: 18, marginLeft: 8 }}>✕</button>
                      </div>

                      {selected.descripcion && (
                        <div style={{ fontSize: 12, color: "#94A3B8", lineHeight: 1.6, padding: "10px 12px", borderRadius: 8, background: "#0A0A12", marginBottom: 12 }}>
                          {selected.descripcion}
                        </div>
                      )}

                      {selected.fecha && (
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12, fontSize: 12, color: "#64748B" }}>
                          <span>📅 Fecha límite:</span>
                          <FechaTag fecha={selected.fecha} estado={selected.estado} />
                        </div>
                      )}

                      {/* Cambiar estado */}
                      <div style={{ display: "flex", gap: 6 }}>
                        {Object.entries(ESTADO_CONFIG).map(([k, v]) => (
                          <button key={k} onClick={() => cambiarEstadoKanban(selected.id, k)}
                            style={{ flex: 1, padding: "7px 4px", borderRadius: 8, border: `1px solid ${selected.estado === k ? v.color : "#2D2D45"}`, background: selected.estado === k ? `${v.color}15` : "#0A0A12", color: selected.estado === k ? v.color : "#4A5568", cursor: "pointer", fontSize: 11, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, transition: "all 0.15s" }}>
                            {v.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Subtareas */}
                    <div className="card" style={{ padding: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                        <div className="section-title" style={{ marginBottom: 0 }}>☑ Subtareas</div>
                        <span style={{ fontSize: 11, color: cat.color, fontWeight: 700 }}>{subDone}/{selected.subtareas.length}</span>
                      </div>
                      {selected.subtareas.length > 0 && (
                        <div style={{ marginBottom: 10 }}>
                          <ProgressBar value={subDone} max={selected.subtareas.length} color={cat.color} height={5} />
                        </div>
                      )}
                      {selected.subtareas.map(sub => (
                        <div key={sub.id} onClick={() => toggleSubtarea(selected.id, sub.id)}
                          style={{ display: "flex", gap: 10, alignItems: "center", padding: "8px 10px", borderRadius: 8, marginBottom: 5, cursor: "pointer", background: sub.done ? `${cat.color}06` : "#0A0A12", border: `1px solid ${sub.done ? cat.color + "25" : "#1A1A28"}`, transition: "all 0.15s" }}>
                          <div style={{ width: 18, height: 18, borderRadius: 4, border: `2px solid ${sub.done ? cat.color : "#2D2D45"}`, background: sub.done ? cat.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.15s" }}>
                            {sub.done && <span style={{ color: "white", fontSize: 10, fontWeight: 700 }}>✓</span>}
                          </div>
                          <span style={{ fontSize: 12, color: sub.done ? "#64748B" : "#CBD5E1", textDecoration: sub.done ? "line-through" : "none", flex: 1 }}>{sub.texto}</span>
                        </div>
                      ))}
                      {/* Agregar subtarea */}
                      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                        <input placeholder="+ Agregar subtarea..." value={nuevoSub}
                          onChange={e => setNuevoSub(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && agregarSubtarea(selected.id)}
                          style={{ flex: 1, fontSize: 12, padding: "6px 10px" }} />
                        <button onClick={() => agregarSubtarea(selected.id)} className="btn-primary" style={{ padding: "6px 12px", fontSize: 12 }}>+</button>
                      </div>
                    </div>

                    <button onClick={() => eliminarTarea(selected.id)}
                      style={{ padding: "9px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)", color: "#EF4444", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, transition: "all 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.14)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.06)"}>
                      🗑 Eliminar tarea
                    </button>
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ── VISTA: KANBAN ── */}
      {vista === "kanban" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, alignItems: "start" }}>
          {Object.entries(ESTADO_CONFIG).map(([estado, cfg]) => {
            const columna = tareasFiltradas.filter(t => t.estado === estado);
            return (
              <div key={estado} style={{ background: "#0A0A12", borderRadius: 12, padding: 14, border: `1px solid ${cfg.color}25` }}>
                {/* Header columna */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, paddingBottom: 10, borderBottom: `2px solid ${cfg.color}30` }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: cfg.color }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: cfg.color, fontFamily: "'Orbitron',monospace" }}>{cfg.label.toUpperCase()}</span>
                  </div>
                  <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 999, background: `${cfg.color}15`, color: cfg.color, fontWeight: 700 }}>{columna.length}</span>
                </div>

                {/* Tarjetas */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, minHeight: 60 }}>
                  {columna.map(t => {
                    const cat = getCat(t.categoria);
                    const pr = PRIORIDAD_CONFIG[t.prioridad];
                    const subDone = t.subtareas.filter(s => s.done).length;
                    return (
                      <div key={t.id}
                        onClick={() => { setSelectedId(t.id === selectedId ? null : t.id); setVista("lista"); }}
                        style={{ padding: "12px 13px", borderRadius: 10, background: "#13131F", border: `1px solid ${cat.color}30`, cursor: "pointer", borderLeft: `3px solid ${cat.color}`, transition: "all 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#F1F5F9", marginBottom: 8, lineHeight: 1.4 }}>{t.titulo}</div>
                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginBottom: 8 }}>
                          <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 999, background: `${cat.color}15`, color: cat.color, fontWeight: 700 }}>{cat.icon} {cat.label}</span>
                          <span style={{ fontSize: 10, padding: "2px 6px", borderRadius: 999, background: pr.bg, color: pr.color, fontWeight: 700 }}>{pr.dot}</span>
                          <FechaTag fecha={t.fecha} estado={t.estado} />
                        </div>
                        {t.subtareas.length > 0 && (
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#4A5568", marginBottom: 4 }}>
                              <span>☑ {subDone}/{t.subtareas.length}</span>
                              <span style={{ color: cat.color }}>{Math.round((subDone/t.subtareas.length)*100)}%</span>
                            </div>
                            <ProgressBar value={subDone} max={t.subtareas.length} color={cat.color} height={3} />
                          </div>
                        )}
                        {/* Botones mover columna */}
                        <div style={{ display: "flex", gap: 4, marginTop: 8 }}>
                          {Object.entries(ESTADO_CONFIG).filter(([k]) => k !== estado).map(([k, v]) => (
                            <button key={k} onClick={e => { e.stopPropagation(); cambiarEstadoKanban(t.id, k); }}
                              style={{ flex: 1, padding: "4px", borderRadius: 6, border: `1px solid ${v.color}30`, background: `${v.color}08`, color: v.color, cursor: "pointer", fontSize: 10, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700 }}>
                              → {v.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {columna.length === 0 && (
                    <div style={{ textAlign: "center", padding: "20px 0", color: "#2D2D45", fontSize: 12 }}>
                      Sin tareas
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── MODAL: NUEVA TAREA ── */}
      {showForm && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ width: 480 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>📝 Nueva Tarea</div>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input placeholder="Título de la tarea *" value={form.titulo} onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))} style={{ fontSize: 14 }} />
              <textarea placeholder="Descripción (opcional)..." value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} style={{ minHeight: 70, resize: "vertical", fontSize: 12 }} />

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>Categoría</div>
                  <select value={form.categoria} onChange={e => setForm(f => ({ ...f, categoria: e.target.value }))}>
                    {TAREAS_CATEGORIAS.map(c => <option key={c.id} value={c.id}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>Fecha límite</div>
                  <input type="date" value={form.fecha} onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))} style={{ colorScheme: "dark" }} />
                </div>
              </div>

              <div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>Prioridad</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {Object.entries(PRIORIDAD_CONFIG).map(([k, v]) => (
                    <button key={k} onClick={() => setForm(f => ({ ...f, prioridad: k }))}
                      style={{ flex: 1, padding: "9px", borderRadius: 8, border: `1px solid ${form.prioridad === k ? v.color : "#2D2D45"}`, background: form.prioridad === k ? v.bg : "#0F0F18", color: form.prioridad === k ? v.color : "#64748B", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, transition: "all 0.15s" }}>
                      {v.dot} {v.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div style={{ padding: "10px 14px", borderRadius: 10, background: `${getCat(form.categoria).color}08`, border: `1px solid ${getCat(form.categoria).color}25`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 20 }}>{getCat(form.categoria).icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>{form.titulo || "Título de la tarea"}</div>
                  <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>{getCat(form.categoria).label} · {PRIORIDAD_CONFIG[form.prioridad].dot} {PRIORIDAD_CONFIG[form.prioridad].label}{form.fecha ? ` · 📅 ${form.fecha}` : ""}</div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancelar</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={crearTarea} disabled={!form.titulo.trim()}>✓ Crear Tarea</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// PÁGINA: HÁBITOS
// ============================================================

// Genera historial falso de 84 días (12 semanas) para el calendario
const genHistory = (streakBase, frequency) => {
  const days = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    let done = false;
    if (frequency === "daily") {
      done = Math.random() > (i < 20 ? 0.15 : 0.35);
    } else if (frequency === "weekly") {
      done = d.getDay() === 1 && Math.random() > 0.3;
    } else {
      done = [1, 3, 5].includes(d.getDay()) && Math.random() > 0.25;
    }
    days.push({ date: d.toISOString().split("T")[0], done });
  }
  // Últimos días forzados para coincidir con racha
  for (let i = 0; i < Math.min(streakBase, 14); i++) {
    if (days[83 - i]) days[83 - i].done = true;
  }
  return days;
};

const HABITOS_INICIAL = [
  { id: 1, name: "Estudiar Python 2h", icon: "🐍", color: "#F59E0B", frequency: "daily", streak: 7, best: 14, type: "good", history: genHistory(7, "daily") },
  { id: 2, name: "Registrar ingresos/gastos", icon: "💰", color: "#10B981", frequency: "daily", streak: 3, best: 10, type: "good", history: genHistory(3, "daily") },
  { id: 3, name: "Aplicar a 1 freelance/día", icon: "💻", color: "#7C3AED", frequency: "daily", streak: 5, best: 5, type: "good", history: genHistory(5, "daily") },
  { id: 4, name: "Ejercicio 30 min", icon: "💪", color: "#EF4444", frequency: "daily", streak: 12, best: 20, type: "good", history: genHistory(12, "daily") },
  { id: 5, name: "Leer 20 min", icon: "📚", color: "#06B6D4", frequency: "daily", streak: 4, best: 9, type: "good", history: genHistory(4, "daily") },
];

const MALOS_INICIAL = [
  { id: 1, name: "Fumar", icon: "🚬", color: "#EF4444", daysFree: 12, best: 30, relapses: 2, active: true },
  { id: 2, name: "Redes sociales +2h", icon: "📱", color: "#F59E0B", daysFree: 3, best: 7, relapses: 5, active: true },
  { id: 3, name: "Comida chatarra", icon: "🍔", color: "#F97316", daysFree: 5, best: 14, relapses: 3, active: true },
];

const FREQ_LABELS = { daily: "Diario", weekly: "Semanal", "3x": "3x semana" };
const FREQ_OPTIONS = [["daily","📅 Diario"], ["3x","🔄 3x semana"], ["weekly","📆 Semanal"]];

// Mini calendario tipo GitHub — 12 semanas alineado por día real
const HabitCalendar = ({ history, color }) => {
  // history[0] = hace 83 días, history[83] = hoy
  // Necesitamos saber qué día de semana fue el día más antiguo
  // para alinear correctamente (L=0 ... D=6)

  // Construir mapa de fecha→done
  const donePorFecha = {};
  (history || []).forEach(d => {
    if (d.dateStr || d.date) donePorFecha[d.dateStr || d.date] = d.done;
  });

  // Calcular el inicio del grid: el lunes de la semana de hace 83 días
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const hace83 = new Date(hoy);
  hace83.setDate(hoy.getDate() - 83);

  // Retroceder hasta el lunes de esa semana (getDay(): 0=Dom,1=Lun,...,6=Sáb)
  const diaSemana = hace83.getDay(); // 0=Dom
  const diasHastaLunes = diaSemana === 0 ? 6 : diaSemana - 1;
  const inicioGrid = new Date(hace83);
  inicioGrid.setDate(hace83.getDate() - diasHastaLunes);

  // Construir 12 semanas × 7 días desde inicioGrid
  const weeks = [];
  for (let w = 0; w < 12; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const fecha = new Date(inicioGrid);
      fecha.setDate(inicioGrid.getDate() + w * 7 + d);
      const key = fecha.toISOString().split("T")[0];
      const esFuturo = fecha > hoy;
      week.push({ dateStr: key, done: !!donePorFecha[key], futuro: esFuturo });
    }
    weeks.push(week);
  }

  const dayLabels = ["L","M","X","J","V","S","D"];
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, marginRight: 2, paddingTop: 1 }}>
        {dayLabels.map((d, i) => (
          <div key={i} style={{ height: 10, fontSize: 8, color: "#4A5568", lineHeight: "10px", width: 10, textAlign: "center" }}>
            {i % 2 === 0 ? d : ""}
          </div>
        ))}
      </div>
      {weeks.map((week, wi) => (
        <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {week.map((day, di) => (
            <div key={di}
              title={day.dateStr}
              style={{
                width: 10, height: 10, borderRadius: 2,
                background: day.futuro ? "transparent" : day.done ? color : "#1A1A28",
                border: `1px solid ${day.futuro ? "transparent" : day.done ? color + "60" : "#252535"}`,
                opacity: day.futuro ? 0 : day.done ? 1 : 0.7,
                transition: "all 0.1s",
                cursor: "default",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const HabitosPage = ({ onHabitUpdate, setGame }) => {
  const [habitos, setHabitos] = useState([]);
  const [malos, setMalos] = useState(() => {
    try {
      const guardados = JSON.parse(localStorage.getItem("lifehud_malos") || "[]");
      const hoy = new Date(); hoy.setHours(0,0,0,0);
      return guardados.map(m => {
        if (m.lastRelapseDate) {
          const ultima = new Date(m.lastRelapseDate); ultima.setHours(0,0,0,0);
          return { ...m, daysFree: Math.floor((hoy - ultima) / 86400000) };
        }
        if (m.createdAt) {
          const creado = new Date(m.createdAt); creado.setHours(0,0,0,0);
          return { ...m, daysFree: Math.floor((hoy - creado) / 86400000) };
        }
        return m;
      });
    } catch(e) { return []; }
  });
  const [cargando, setCargando] = useState(true);
  const yaFueCargado = useRef(false);
  // Al desmontar, resetear para que recargue al volver
  useEffect(() => () => { yaFueCargado.current = false; }, []);

  // ── Helper: leer/guardar completions en localStorage ────────
  const getLocalCalendar = (habitId) => {
    try { return JSON.parse(localStorage.getItem(`lifehud_habit_cal_${habitId}`) || '{}'); }
    catch { return {}; }
  };
  const saveLocalCalendar = (habitId, calendar) => {
    localStorage.setItem(`lifehud_habit_cal_${habitId}`, JSON.stringify(calendar));
  };

  // ── Helper: construir historial 84 días fusionando backend + localStorage ──
  const buildHistory = (calendar, habitId) => {
    const local = habitId ? getLocalCalendar(habitId) : {};
    const merged = { ...calendar, ...local }; // localStorage gana si hay conflicto
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return Array(84).fill(null).map((_, j) => {
      const d = new Date(hoy);
      d.setDate(d.getDate() - (83 - j));
      const key = d.toISOString().split("T")[0];
      return { date: j, dateStr: key, done: !!merged[key] };
    });
  };

  // Calcular streak real desde el calendario — cuenta días consecutivos hacia atrás desde hoy
  const calcStreakDesdeCalendar = (calendar) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    let streak = 0;
    for (let i = 0; i < 365; i++) {
      const d = new Date(hoy);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      if (calendar[key]) {
        streak++;
      } else {
        break; // Primer día sin completar → racha termina
      }
    }
    return streak;
  };

  const recargarHabitos = async () => {
    setCargando(true);
    const token = localStorage.getItem("life_hud_token");
    try {
      const data = await api.habitos.listar();
      // Solo hábitos activos sin prefijo [MALO]
      const activos = (data || []).filter(h => h.is_active !== false && !h.name?.startsWith("[MALO]`));
      const statsArray = await Promise.all(
        activos.map(h =>
          fetch(`${API_URL}/api/v1/habits/${h.id}/stats`, {
            headers: { `Authorization": `Bearer ${token}` }
          }).then(r => r.ok ? r.json() : null).catch(() => null)
        )
      );
      const mapeados = activos.map((h, i) => {
        const calendar = statsArray[i]?.calendar || {};
        return {
          id:        h.id,
          name:      h.name,
          icon:      h.icon || "⭐",
          color:     "#7C3AED",
          frequency: h.frequency_type?.toLowerCase() || "daily",
          streak:    calcStreakDesdeCalendar(calendar),
          best:      h.best_streak    || 0,
          history:   buildHistory(calendar, h.id),
          type:      "good",
        };
      });
      setHabitos(mapeados);
    } catch(e) {
      setHabitos([]);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (yaFueCargado.current) return;
    yaFueCargado.current = true;
    recargarHabitos();
    // Hábitos malos ya cargados desde localStorage en useState
  }, []);

  const [view, setView] = useState("buenos");
  const [selectedId, setSelectedId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showMaloForm, setShowMaloForm] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "⭐", color: "#7C3AED", frequency: "daily" });
  const [maloForm, setMaloForm] = useState({ name: "", icon: "🚫", color: "#EF4444" });
  const [toast, setToast] = useState(null);

  const selected = habitos.find(h => h.id === selectedId) || habitos[0];
  const todayStr = new Date().toISOString().split("T")[0];

  const guardarMalos = (nuevos) => {
    localStorage.setItem("lifehud_malos", JSON.stringify(nuevos));
  };

  const toggleHoy = async (id) => {
    const h = habitos.find(h => h.id === id);
    if (!h) return;
    const doneHoy = h.history[h.history.length - 1]?.done;
    if (doneHoy) return;
    try {
      const res = await api.habitos.completar(id);
      const xpGanado = 1;
      // Guardar en localStorage como backup del calendario
      const hoyStr = new Date().toISOString().split("T")[0];
      const calLocal = getLocalCalendar(id);
      calLocal[hoyStr] = true;
      saveLocalCalendar(id, calLocal);

      // Marcar hoy en historial local inmediatamente
      setHabitos(prev => prev.map(hh => {
        if (hh.id !== id) return hh;
        const newHistory = [...hh.history];
        newHistory[newHistory.length - 1] = { ...newHistory[newHistory.length - 1], done: true };
        return { ...hh, history: newHistory };
      }));
      if (setGame) setGame(g => ({ ...g, xp: g.xp + 1, coins: g.coins + 1 }));
      setToast({ msg: `🔥 ${h.icon} ${h.name} — ¡completado! +${xpGanado} XP`, color: h.color });
      // Obtener streak real del backend
      const token = localStorage.getItem("life_hud_token`);
      const actualizado = await fetch(`${API_URL}/api/v1/habits/${id}`, {
        headers: { `Authorization": `Bearer ${token}` }
      }).then(r => r.json()).catch(() => null);
      const nuevoStreak = actualizado?.current_streak > 0 ? actualizado.current_streak : h.streak + 1;
      setHabitos(prev => prev.map(hh =>
        hh.id !== id ? hh : { ...hh, streak: nuevoStreak, best: Math.max(hh.best, nuevoStreak) }
      ));
      // Sincronizar con LifeHUD
      if (onHabitUpdate) onHabitUpdate(id, { done: true, streak: nuevoStreak });
    } catch (e) {
      setToast({ msg: `❌ Error: ${e.message}`, color: "#EF4444" });
    }
  };

  const registrarRecaida = (id) => {
    const hoy = new Date().toISOString().split("T")[0];
    const nuevos = malos.map(m => m.id === id
      ? { ...m, daysFree: 0, relapses: m.relapses + 1, lastRelapseDate: hoy }
      : m
    );
    setMalos(nuevos);
    guardarMalos(nuevos);
    setToast({ msg: "💪 Registrado. ¡Mañana es un nuevo día!", color: "#F59E0B" });
  };

  const eliminarHabito = async (id) => {
    try {
      await api.habitos.eliminar(id);
      setHabitos(prev => prev.filter(h => h.id !== id));
      setSelectedId(null);
      setToast({ msg: "🗑️ Hábito eliminado", color: "#EF4444" });
    } catch (e) {
      setToast({ msg: `❌ Error: ${e.message}`, color: "#EF4444" });
    }
  };

  const agregarHabito = async () => {
    if (!form.name) return;
    try {
      const res = await api.habitos.crear({
        name:           form.name,
        icon:           form.icon,
        frequency_type: form.frequency.toLowerCase(),
      });
      const nuevo = {
        id:        res.id,
        name:      res.name,
        icon:      res.icon || form.icon,
        color:     form.color,
        frequency: res.frequency_type?.toLowerCase() || "daily",
        streak:    0,
        best:      0,
        type:      "good",
        history:   buildHistory({}, res.id),
      };
      setHabitos(p => [...p, nuevo]);
      setSelectedId(nuevo.id);
      setForm({ name: "", icon: "⭐", color: "#7C3AED", frequency: "daily" });
      setShowForm(false);
      setToast({ msg: `✅ Hábito "${nuevo.name}" creado`, color: "#10B981" });
    } catch (e) {
      setToast({ msg: `❌ Error: ${e.message}`, color: "#EF4444" });
    }
  };

  // Hábitos malos — solo localStorage, no backend
  const agregarMalo = () => {
    if (!maloForm.name) return;
    const nuevo = { id: Date.now(), name: maloForm.name, icon: maloForm.icon, color: maloForm.color, daysFree: 0, best: 0, relapses: 0, active: true, createdAt: new Date().toISOString().split("T")[0] };
    const nuevos = [...malos, nuevo];
    setMalos(nuevos);
    guardarMalos(nuevos);
    setMaloForm({ name: "", icon: "🚫", color: "#EF4444" });
    setShowMaloForm(false);
    setToast({ msg: `💪 Eliminando "${nuevo.name}" — ¡tú puedes!`, color: "#10B981" });
  };

  const eliminarMalo = (id) => {
    if (!window.confirm("¿Eliminar este hábito malo?")) return;
    const nuevos = malos.filter(m => m.id !== id);
    setMalos(nuevos);
    guardarMalos(nuevos);
    setToast({ msg: "🗑️ Hábito malo eliminado", color: "#EF4444" });
  };

  const totalHoy = habitos.filter(h => h.history[h.history.length - 1]?.done).length;
  const pctHoy = Math.round((totalHoy / habitos.length) * 100);
  const avgStreak = habitos.length ? Math.round(habitos.reduce((a, h) => a + h.streak, 0) / habitos.length) : 0;
  const bestHabit = habitos.length ? habitos.reduce((a, b) => a.streak > b.streak ? a : b) : null;

  const ICON_OPTIONS = ["⭐","🐍","💰","💻","💪","📚","🧘","🥗","🏃","💧","🎯","🔥","📝","🎨","🎵","🛏️"];
  const COLOR_OPTIONS = ["#7C3AED","#10B981","#F59E0B","#EF4444","#06B6D4","#EC4899","#F97316","#84CC16"];

  if (cargando) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #1E1E30", borderTop: "3px solid #10B981", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontSize: 12, color: "#4A5568", letterSpacing: 2 }}>CARGANDO HÁBITOS...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  
  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {toast && <Toast msg={toast.msg} color={toast.color} onDone={() => setToast(null)} />}

      {/* Stats superiores */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { label: "Completados hoy", value: `${totalHoy}/${habitos.length}`, icon: "✅", color: pctHoy >= 80 ? "#10B981" : pctHoy >= 50 ? "#F59E0B" : "#EF4444", sub: `${pctHoy}% del día` },
          { label: "Racha promedio", value: `${avgStreak}d`, icon: "🔥", color: "#EF4444", sub: "todos los hábitos" },
          { label: "Mejor racha activa", value: bestHabit ? `${bestHabit.streak}d` : "—", icon: "🏆", color: "#F59E0B", sub: bestHabit ? bestHabit.icon + " " + bestHabit.name : "Sin hábitos aún" },
          { label: "Hábitos malos activos", value: malos.filter(m => m.active).length, icon: "⚔️", color: "#A78BFA", sub: "en proceso de eliminar" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: "14px 18px", borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>{s.label}</div>
            <div style={{ fontSize: 10, color: s.color, opacity: 0.7, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs + botón agregar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", gap: 8 }}>
          {[{ k: "buenos", l: "✅ Hábitos Buenos" }, { k: "malos", l: "⚔️ Hábitos a Eliminar" }, { k: "stats", l: "📊 Estadísticas" }].map(t => (
            <button key={t.k} onClick={() => setView(t.k)}
              className={view === t.k ? "btn-primary" : "btn-secondary"}
              style={{ fontSize: 13 }}>{t.l}</button>
          ))}
        </div>
        <button className="btn-primary" style={{ fontSize: 12, padding: "6px 14px" }}
          onClick={() => view === "malos" ? setShowMaloForm(true) : setShowForm(true)}>
          + {view === "malos" ? "Agregar hábito malo" : "Nuevo hábito"}
        </button>
      </div>

      {/* ── VISTA: HÁBITOS BUENOS ── */}
      {view === "buenos" && (
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16 }}>

          {/* Lista lateral */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {habitos.map(h => {
              const doneHoy = h.history[h.history.length - 1]?.done;
              const isSelected = selectedId === h.id;
              return (
                <div key={h.id}
                  onClick={() => setSelectedId(h.id)}
                  style={{ padding: "12px 14px", borderRadius: 10, background: isSelected ? `${h.color}10` : "#0F0F18", border: `1px solid ${isSelected ? h.color + "50" : "#1E1E30"}`, cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{h.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: isSelected ? h.color : "#F1F5F9", lineHeight: 1.3 }}>{h.name}</div>
                      <div style={{ fontSize: 10, color: "#4A5568" }}>{FREQ_LABELS[h.frequency]}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#EF4444" }}>🔥 {h.streak}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <ProgressBar value={h.streak} max={Math.max(h.best, 1)} color={h.color} height={4} />
                    <button
                      onClick={e => { e.stopPropagation(); toggleHoy(h.id); }}
                      style={{ marginLeft: 10, padding: "4px 10px", borderRadius: 6, border: `1px solid ${doneHoy ? h.color : "#2D2D45"}`, background: doneHoy ? `${h.color}25` : "#0A0A14", color: doneHoy ? h.color : "#4A5568", cursor: "pointer", fontSize: 11, fontWeight: 700, fontFamily: "'Rajdhani',sans-serif", flexShrink: 0, transition: "all 0.15s" }}>
                      {doneHoy ? "✓ Hecho" : "Marcar"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detalle + calendario */}
          {selected && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Header */}
              <div className="card" style={{ padding: 18, borderTop: `3px solid ${selected.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <span style={{ fontSize: 44 }}>{selected.icon}</span>
                    <div>
                      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 15, fontWeight: 700, color: "#F1F5F9" }}>{selected.name}</div>
                      <div style={{ display: "flex", gap: 8, marginTop: 6, flexWrap: "wrap" }}>
                        <span className="tag" style={{ background: `${selected.color}20`, color: selected.color }}>{FREQ_LABELS[selected.frequency]}</span>
                        <span className="tag" style={{ background: "rgba(239,68,68,0.15)", color: "#EF4444" }}>🔥 {selected.streak} días racha</span>
                        <span className="tag" style={{ background: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>🏆 Mejor: {selected.best}d</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleHoy(selected.id)}
                    className={selected.history[selected.history.length - 1]?.done ? "btn-success" : "btn-primary"}
                    style={{ fontSize: 13, padding: "8px 18px" }}>
                    {selected.history[selected.history.length - 1]?.done ? "✓ Completado hoy" : "Marcar hoy"}
                  </button>
                  <button onClick={() => { if(window.confirm(`¿Eliminar "${selected.name}"?`)) eliminarHabito(selected.id); }}
                    className="btn-danger" style={{ fontSize: 12, padding: "8px 12px" }}>🗑️</button>
                </div>
              </div>

              {/* Calendario GitHub */}
              <div className="card" style={{ padding: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div className="section-title" style={{ marginBottom: 0 }}>📅 Actividad — últimas 12 semanas</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#4A5568" }}>
                    <span>Menos</span>
                    {["#1A1A28", "#" + selected.color.slice(1) + "50", selected.color + "90", selected.color].map((c, i) => (
                      <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />
                    ))}
                    <span>Más</span>
                  </div>
                </div>
                <HabitCalendar history={selected.history} color={selected.color} />
                <div style={{ marginTop: 12, display: "flex", gap: 16 }}>
                  {(() => {
                    const done = selected.history.filter(d => d.done).length;
                    const total = selected.history.length;
                    const pct = Math.round((done / total) * 100);
                    return [
                      { label: "Días completados", value: done, color: selected.color },
                      { label: "Tasa de cumplimiento", value: `${pct}%`, color: pct >= 70 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444" },
                      { label: "Días restantes al mejor", value: Math.max(0, selected.best - selected.streak), color: "#94A3B8" },
                    ].map((stat, i) => (
                      <div key={i} style={{ flex: 1, padding: "10px 12px", borderRadius: 8, background: "#0A0A12", border: "1px solid #1A1A28", textAlign: "center" }}>
                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700, color: stat.color }}>{stat.value}</div>
                        <div style={{ fontSize: 10, color: "#4A5568", marginTop: 3 }}>{stat.label}</div>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Semana actual */}
              <div className="card" style={{ padding: 16 }}>
                <div className="section-title">Esta semana</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {["L","M","X","J","V","S","D"].map((d, i) => {
                    const dayIdx = 83 - (6 - i);
                    const day = selected.history[dayIdx];
                    return (
                      <div key={i} style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 10, color: "#4A5568", marginBottom: 6 }}>{d}</div>
                        <div style={{ width: "100%", aspectRatio: "1", borderRadius: 8, background: day?.done ? selected.color : "#1A1A28", border: `1px solid ${day?.done ? selected.color + "60" : "#252535"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>
                          {day?.done ? "✓" : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── VISTA: HÁBITOS MALOS ── */}
      {view === "malos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 12, color: "#FCA5A5" }}>
            ⚔️ Registra tus hábitos malos aquí para hacerles seguimiento y eliminarlos uno a uno. Cada día sin caer es una victoria.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
            {malos.map(m => {
              const progressPct = Math.min((m.daysFree / Math.max(m.best, 30)) * 100, 100);
              return (
                <div key={m.id} className="card" style={{ padding: 18, borderTop: `3px solid ${m.color}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 32 }}>{m.icon}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>{m.name}</div>
                        <div style={{ fontSize: 10, color: "#4A5568", marginTop: 2 }}>Hábito a eliminar</div>
                      </div>
                    </div>
                  </div>

                  {/* Días libres — número grande */}
                  <div style={{ textAlign: "center", padding: "14px 0", borderRadius: 10, background: `${m.color}08`, border: `1px solid ${m.color}20`, marginBottom: 14 }}>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 36, fontWeight: 900, color: m.color }}>{m.daysFree}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>días sin caer</div>
                  </div>

                  <ProgressBar value={m.daysFree} max={Math.max(m.best, 30)} color={m.color} height={6} />

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, margin: "12px 0" }}>
                    {[
                      { label: "Mejor racha", value: `${m.best}d`, color: "#F59E0B" },
                      { label: "Recaídas", value: m.relapses, color: m.relapses === 0 ? "#10B981" : m.relapses < 3 ? "#F59E0B" : "#EF4444" },
                    ].map((s, i) => (
                      <div key={i} style={{ padding: "8px 10px", borderRadius: 8, background: "#080810", border: "1px solid #1A1A28", textAlign: "center" }}>
                        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: "#4A5568" }}>{s.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Mensaje motivacional */}
                  <div style={{ fontSize: 11, color: "#94A3B8", textAlign: "center", marginBottom: 12, padding: "6px 8px", borderRadius: 6, background: "#0A0A12" }}>
                    {m.daysFree === 0
                      ? "💪 Hoy es el día 1. ¡Tú puedes!"
                      : m.daysFree < 7
                      ? `🌱 ${7 - m.daysFree} días para completar tu primera semana`
                      : m.daysFree < 21
                      ? `⚡ ${21 - m.daysFree} días para los 21 días del hábito`
                      : m.daysFree < 66
                      ? `🏆 ${66 - m.daysFree} días para los 66 (automatismo)`
                      : "🎖️ ¡Más de 66 días — ya es automático!"}
                  </div>

                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => registrarRecaida(m.id)}
                      style={{ flex: 1, padding: "8px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.07)", color: "#EF4444", cursor: "pointer", fontSize: 12, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, transition: "all 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(239,68,68,0.15)"}
                      onMouseLeave={e => e.currentTarget.style.background = "rgba(239,68,68,0.07)"}>
                      ⚠️ Registrar recaída
                    </button>
                    <button onClick={() => eliminarMalo(m.id)}
                      style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid rgba(100,116,139,0.3)", background: "transparent", color: "#64748B", cursor: "pointer", fontSize: 12, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700 }}>
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VISTA: ESTADÍSTICAS ── */}
      {view === "stats" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <div className="section-title">🏆 Ranking de Rachas</div>
            {[...habitos].sort((a, b) => b.streak - a.streak).map((h, i) => (
              <div key={h.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid #1A1A28" }}>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 900, color: i === 0 ? "#F59E0B" : i === 1 ? "#94A3B8" : i === 2 ? "#F97316" : "#4A5568", width: 20 }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: 20 }}>{h.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: "#F1F5F9", fontWeight: 600 }}>{h.name}</div>
                  <ProgressBar value={h.streak} max={Math.max(...habitos.map(x => x.best))} color={h.color} height={4} />
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#EF4444" }}>🔥 {h.streak}d</div>
                  <div style={{ fontSize: 10, color: "#4A5568" }}>best: {h.best}d</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card" style={{ padding: 18 }}>
              <div className="section-title">📊 Cumplimiento (últimas 12 semanas)</div>
              {habitos.map(h => {
                const done = h.history.filter(d => d.done).length;
                const pct = Math.round((done / h.history.length) * 100);
                return (
                  <div key={h.id} style={{ marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: "#CBD5E1" }}>{h.icon} {h.name}</span>
                      <span style={{ color: pct >= 70 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444", fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <ProgressBar value={pct} max={100} color={pct >= 70 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444"} height={5} />
                  </div>
                );
              })}
            </div>
            <div className="card" style={{ padding: 18, flex: 1 }}>
              <div className="section-title">🤖 Tips IA</div>
              {[
                { icon: "🟢", msg: bestHabit ? `"${bestHabit.name}" es tu hábito más fuerte con ${bestHabit.streak} días seguidos.` : "Aún no tienes hábitos registrados." },
                { icon: "💡", msg: `Completaste el ${pctHoy}% de tus hábitos hoy. ${pctHoy >= 80 ? "¡Excelente!" : "¡Puedes llegar al 100%!"}` },
                { icon: "⚡", msg: `Llevas ${malos[0]?.daysFree || 0} días sin "${malos[0]?.name}". ${malos[0]?.daysFree >= 7 ? "¡Ya superaste la primera semana!" : "¡Llega a 7 días!"}` },
                { icon: "🎯", msg: `Tu racha promedio es de ${avgStreak} días. Intenta superar ${avgStreak + 3} días en todos.` },
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

      {/* ── MODAL: NUEVO HÁBITO ── */}
      {showForm && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
          <div className="modal" style={{ width: 400 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>+ Nuevo Hábito</div>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input placeholder="Nombre del hábito (ej. Leer 20 min)" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>Frecuencia</div>
                <div style={{ display: "flex", gap: 6 }}>
                  {FREQ_OPTIONS.map(([k, l]) => (
                    <button key={k} onClick={() => setForm(f => ({ ...f, frequency: k }))}
                      style={{ flex: 1, padding: "8px 4px", borderRadius: 8, border: `1px solid ${form.frequency === k ? "#7C3AED" : "#2D2D45"}`, background: form.frequency === k ? "rgba(124,58,237,0.15)" : "#0F0F18", color: form.frequency === k ? "#A78BFA" : "#64748B", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 11 }}>
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>Ícono</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {ICON_OPTIONS.map(em => (
                    <button key={em} onClick={() => setForm(f => ({ ...f, icon: em }))}
                      style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${form.icon === em ? "#7C3AED" : "#2D2D45"}`, background: form.icon === em ? "rgba(124,58,237,0.2)" : "#0F0F18", cursor: "pointer", fontSize: 18 }}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>Color</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {COLOR_OPTIONS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{ width: 28, height: 28, borderRadius: "50%", background: c, border: `3px solid ${form.color === c ? "white" : "transparent"}`, cursor: "pointer" }} />
                  ))}
                </div>
              </div>
              {/* Preview */}
              <div style={{ padding: "10px 14px", borderRadius: 10, background: `${form.color}10`, border: `1px solid ${form.color}30`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 26 }}>{form.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: form.color }}>{form.name || "Nombre del hábito"}</div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>{FREQ_LABELS[form.frequency]} · Racha: 0 días</div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowForm(false)}>Cancelar</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={agregarHabito} disabled={!form.name}>✓ Crear Hábito</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: NUEVO HÁBITO MALO ── */}
      {showMaloForm && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowMaloForm(false)}>
          <div className="modal" style={{ width: 380 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>⚔️ Hábito a Eliminar</div>
              <button onClick={() => setShowMaloForm(false)} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 18 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ padding: "10px 12px", borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 11, color: "#FCA5A5" }}>
                💪 Agrégalo aquí y empieza a contar los días sin caer. ¡Cada día cuenta!
              </div>
              <input placeholder="¿Qué hábito malo quieres eliminar?" value={maloForm.name} onChange={e => setMaloForm(f => ({ ...f, name: e.target.value }))} />
              <div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>Ícono</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {["🚬","📱","🍔","🍺","🎮","😴","💸","🍕","☕","🧁"].map(em => (
                    <button key={em} onClick={() => setMaloForm(f => ({ ...f, icon: em }))}
                      style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${maloForm.icon === em ? "#EF4444" : "#2D2D45"}`, background: maloForm.icon === em ? "rgba(239,68,68,0.15)" : "#0F0F18", cursor: "pointer", fontSize: 18 }}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowMaloForm(false)}>Cancelar</button>
                <button style={{ flex: 2, padding: "9px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.4)", background: "rgba(239,68,68,0.12)", color: "#EF4444", cursor: "pointer", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 14 }} onClick={agregarMalo} disabled={!maloForm.name}>
                  ⚔️ Comenzar a eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// NUTRICIÓN — versión mejorada
// ============================================================

const SEMANA_CALORIAS = [
  { dia: "Lun", cal: 2050, meta: 2200 },
  { dia: "Mar", cal: 1980, meta: 2200 },
  { dia: "Mié", cal: 2340, meta: 2200 },
  { dia: "Jue", cal: 1760, meta: 2200 },
  { dia: "Vie", cal: 2100, meta: 2200 },
  { dia: "Sáb", cal: 2580, meta: 2200 },
  { dia: "Hoy", cal: 1840, meta: 2200 },
];

const MODO_MACROS = {
  mantenimiento: { label: "Mantenimiento", icon: "⚖️", color: "#06B6D4", proteina: 0.8,  carbs: 0.45, grasa: 0.25 },
  bulking:        { label: "Bulking",        icon: "📈", color: "#10B981", proteina: 1.0,  carbs: 0.50, grasa: 0.25 },
  cutting:        { label: "Cutting",        icon: "🔥", color: "#EF4444", proteina: 1.2,  carbs: 0.35, grasa: 0.25 },
};

const NutricionPage = () => {
  const [tab, setTab] = useState("hoy");
  const [vasos, setVasos] = useState(0);
  const todayKey = () => `lifehud_meals_${new Date().toISOString().split('T')[0]}`;
  const [meals, setMeals] = useState(() => {
    try { return JSON.parse(localStorage.getItem(todayKey()) || '[]'); }
    catch { return []; }
  });
  const [showMealModal, setShowMealModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [cargando, setCargando] = useState(true);

  // ── Recetas ────────────────────────────────────────────────
  const [recetas, setRecetas] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifehud_recetas') || '[]'); }
    catch { return []; }
  });
  const [showFormReceta, setShowFormReceta] = useState(false);
  const [formReceta, setFormReceta] = useState({
    nombre: '', emoji: '🍽️', tiempo: '', tipo: 'almuerzo', ingredientes: [],
  });
  const [formIng, setFormIng] = useState({ nombre: '', gramos: '', cal100: '', p100: '', c100: '', f100: '' });

  const scaleIng = (val, g) => Math.round(((parseFloat(val) || 0) * (parseFloat(g) || 0)) / 100 * 10) / 10;

  const agregarIngrediente = () => {
    if (!formIng.nombre || !formIng.gramos) return;
    const g = parseFloat(formIng.gramos) || 0;
    const ing = {
      nombre: formIng.nombre,
      gramos: g,
      cal:  scaleIng(formIng.cal100, g),
      p:    scaleIng(formIng.p100,   g),
      c:    scaleIng(formIng.c100,   g),
      fat:  scaleIng(formIng.f100,   g),
    };
    setFormReceta(r => ({ ...r, ingredientes: [...r.ingredientes, ing] }));
    setFormIng({ nombre: '', gramos: '', cal100: '', p100: '', c100: '', f100: '' });
  };

  const guardarReceta = () => {
    if (!formReceta.nombre || formReceta.ingredientes.length === 0) return;
    const totales = formReceta.ingredientes.reduce(
      (a, i) => ({ cal: a.cal + i.cal, p: a.p + i.p, c: a.c + i.c, fat: a.fat + i.fat }),
      { cal: 0, p: 0, c: 0, fat: 0 }
    );
    const nueva = {
      id: Date.now(),
      nombre:        formReceta.nombre,
      emoji:         formReceta.emoji,
      tiempo:        formReceta.tiempo,
      tipo:          formReceta.tipo,
      ingredientes:  formReceta.ingredientes,
      cal:           Math.round(totales.cal),
      proteina:      Math.round(totales.p),
      carbs:         Math.round(totales.c),
      grasa:         Math.round(totales.fat),
    };
    const nuevas = [...recetas, nueva];
    setRecetas(nuevas);
    localStorage.setItem('lifehud_recetas', JSON.stringify(nuevas));
    setFormReceta({ nombre: '', emoji: '🍽️', tiempo: '', tipo: 'almuerzo', ingredientes: [] });
    setFormIng({ nombre: '', gramos: '', cal100: '', p100: '', c100: '', f100: '' });
    setShowFormReceta(false);
    setToast({ msg: `📖 Receta "${nueva.nombre}" guardada`, color: '#10B981' });
  };

  const eliminarReceta = (id) => {
    const nuevas = recetas.filter(r => r.id !== id);
    setRecetas(nuevas);
    localStorage.setItem('lifehud_recetas', JSON.stringify(nuevas));
  };

  const registrarRecetaComoComida = (r) => {
    const mt = MEAL_TYPES.find(m => m.key === r.tipo) || MEAL_TYPES[1];
    const nueva = {
      id: Date.now(), name: r.nombre, type: r.tipo,
      time: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
      calories: r.cal, icon: r.emoji,
      foods: r.ingredientes.map(i => ({ name: i.nombre, cal: i.cal, p: i.p, c: i.c, f: i.fat, gramos: i.gramos })),
    };
    setMeals(prev => {
      const nuevas = [...prev, nueva];
      localStorage.setItem(todayKey(), JSON.stringify(nuevas));
      return nuevas;
    });
    setToast({ msg: `${r.emoji} ${r.nombre} registrada — ${r.cal} kcal`, color: mt.color });
  };
  const [statsHoy, setStatsHoy] = useState({
    calories_consumed: 0, calories_target: 2200,
    protein_consumed_g: 0, carbs_consumed_g: 0, fat_consumed_g: 0,
    protein_target_g: 150, carbs_target_g: 250, fat_target_g: 80,
    water_consumed_ml: 0, water_target_ml: 2000,
  });

  useEffect(() => {
    Promise.all([
      api.nutricion.resumenHoy(),
      api.nutricion.comidas(),
    ])
    .then(([stats, mealsData]) => {
      if (stats) {
        setStatsHoy(stats);
        setVasos(Math.round((stats.water_consumed_ml || 0) / 250));
        if (stats.calories_target) setCalMeta(stats.calories_target);
      }
      const lista = mealsData?.meals || mealsData || [];
      const mapeadas = lista.map(m => ({
        id:       m.id,
        name:     m.name || m.meal_type,
        type:     m.meal_type === "breakfast" ? "desayuno" :
                  m.meal_type === "lunch"     ? "almuerzo" :
                  m.meal_type === "dinner"    ? "cena"     : "snack",
        time:     m.meal_date ? m.meal_date.split("T")[1]?.slice(0,5) : "",
        calories: m.total_calories || 0,
        icon:     m.meal_type === "breakfast" ? "🌅" :
                  m.meal_type === "lunch"     ? "☀️" :
                  m.meal_type === "dinner"    ? "🌙" : "🍎",
        foods:    (m.foods || []).map(f => ({
          name: f.food_name, cal: f.calories,
          p: f.protein_g, c: f.carbs_g, f: f.fat_g
        })),
      }));
      // Solo reemplazar si el backend devuelve datos reales;
      // si viene vacío, conservar lo guardado en localStorage
      if (mapeadas.length > 0) {
        setMeals(mapeadas);
      }
    })
    .catch(() => {})
    .finally(() => setCargando(false));
  }, []);

  // TDEE state
  const [tdeeForm, setTdeeForm] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifehud_tdee_form') || 'null') || { peso: 75, altura: 175, edad: 25, sexo: "hombre", actividad: 1.55 }; }
    catch { return { peso: 75, altura: 175, edad: 25, sexo: "hombre", actividad: 1.55 }; }
  });
  const [tdeeResult, setTdeeResult] = useState(null);

  // Macros editables — persisten en localStorage
  const [modoMacro, setModoMacro] = useState(() => localStorage.getItem('lifehud_modo_macro') || "mantenimiento");
  const [calMeta, setCalMeta] = useState(() => parseInt(localStorage.getItem('lifehud_cal_meta') || '2200'));
  const [macrosMeta, setMacrosMeta] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifehud_macros_meta') || 'null') || { proteina: 150, carbs: 250, grasa: 80 }; }
    catch { return { proteina: 150, carbs: 250, grasa: 80 }; }
  });

  const calcularTDEE = () => {
    const { peso, altura, edad, sexo, actividad } = tdeeForm;
    const tmb = sexo === "hombre"
      ? 88.36 + 13.4 * peso + 4.8 * altura - 5.7 * edad
      : 447.6 + 9.2 * peso + 3.1 * altura - 4.3 * edad;
    const tdee = Math.round(tmb * actividad);
    const modo = MODO_MACROS[modoMacro];
    const nuevosMacros = {
      proteina: Math.round(peso * modo.proteina * (modoMacro === "mantenimiento" ? 1.8 : modoMacro === "bulking" ? 2.0 : 2.4)),
      carbs: Math.round((tdee * modo.carbs) / 4),
      grasa: Math.round((tdee * modo.grasa) / 9),
    };
    setTdeeResult({ tmb: Math.round(tmb), tdee, cutting: tdee - 400, bulking: tdee + 300 });
    setCalMeta(tdee);
    setMacrosMeta(nuevosMacros);
    localStorage.setItem('lifehud_tdee_form',   JSON.stringify(tdeeForm));
    localStorage.setItem('lifehud_cal_meta',    String(tdee));
    localStorage.setItem('lifehud_macros_meta', JSON.stringify(nuevosMacros));
    setToast({ msg: `✅ TDEE calculado: ${tdee} kcal/día — metas actualizadas`, color: "#06B6D4" });
  };

  const aplicarModo = (modo) => {
    const m = MODO_MACROS[modo];
    const nuevosMacros = {
      proteina: Math.round(tdeeForm.peso * (modo === "cutting" ? 2.4 : modo === "bulking" ? 2.0 : 1.8)),
      carbs: Math.round((calMeta * m.carbs) / 4),
      grasa: Math.round((calMeta * m.grasa) / 9),
    };
    setModoMacro(modo);
    setMacrosMeta(nuevosMacros);
    localStorage.setItem('lifehud_modo_macro',  modo);
    localStorage.setItem('lifehud_macros_meta', JSON.stringify(nuevosMacros));
  };

  const handleSaveMeal = (mealData) => {
    const mt = MEAL_TYPES.find(m => m.key === mealData.type);
    const nueva = {
      id: Date.now(), name: mt.label, type: mealData.type,
      time: mealData.time, calories: mealData.totalCal, icon: mt.icon,
      foods: mealData.foods.map(f => ({ name: f.name, cal: f.cal, p: f.p || 0, c: f.c || 0, f: f.f || 0, gramos: f.gramos || 100 })),
    };
    setMeals(prev => {
      const nuevas = [...prev, nueva];
      localStorage.setItem(todayKey(), JSON.stringify(nuevas));
      return nuevas;
    });
    setToast({ msg: `${mt.icon} ${mt.label} registrado — ${mealData.totalCal} kcal`, color: mt.color });
    setShowMealModal(false);
  };

  const eliminarComida = (id) => {
    setMeals(prev => {
      const nuevas = prev.filter(m => m.id !== id);
      localStorage.setItem(todayKey(), JSON.stringify(nuevas));
      return nuevas;
    });
  };

  // Cálculos del día
  const calConsumidas = meals.reduce((a, m) => a + m.calories, 0);
  const calRestantes = calMeta - calConsumidas;
  const calPct = Math.min((calConsumidas / calMeta) * 100, 100);
  const calColor = calPct > 105 ? "#EF4444" : calPct > 90 ? "#F59E0B" : "#10B981";

  const macrosConsumidos = meals.reduce((a, m) => ({
    proteina: a.proteina + m.foods.reduce((x, f) => x + (f.p || 0), 0),
    carbs:    a.carbs    + m.foods.reduce((x, f) => x + (f.c || 0), 0),
    grasa:    a.grasa    + m.foods.reduce((x, f) => x + (f.f || 0), 0),
  }), { proteina: 0, carbs: 0, grasa: 0 });

  const macroColors = { proteina: "#7C3AED", carbs: "#06B6D4", grasa: "#F59E0B" };
  const macroLabels = { proteina: "Proteína", carbs: "Carbos", grasa: "Grasa" };

  const aguaLitros = (vasos * 250 / 1000).toFixed(1);
  const VASOS_META = statsHoy.water_target_ml ? Math.round(statsHoy.water_target_ml / 250) : 10;

  const maxCal = calMeta;

  if (cargando) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #1E1E30", borderTop: "3px solid #10B981", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontSize: 12, color: "#4A5568", letterSpacing: 2 }}>CARGANDO NUTRICIÓN...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {toast && <Toast msg={toast.msg} color={toast.color} onDone={() => setToast(null)} />}
      {showMealModal && <MealLogModal onClose={() => setShowMealModal(false)} onSave={handleSaveMeal} />}

      {/* Stats superiores */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { label: "Consumidas", value: `${calConsumidas}`, sub: `meta ${calMeta} kcal`, icon: "🔥", color: calColor },
          { label: "Restantes", value: calRestantes >= 0 ? `${calRestantes}` : `+${Math.abs(calRestantes)}`, sub: calRestantes >= 0 ? "puedes comer" : "excedido", icon: calRestantes >= 0 ? "✅" : "⚠️", color: calRestantes >= 0 ? "#10B981" : "#EF4444" },
          { label: "Agua", value: `${aguaLitros}L`, sub: `${vasos}/${VASOS_META} vasos`, icon: "💧", color: "#06B6D4" },
          { label: "Comidas hoy", value: meals.length, sub: "registradas", icon: "🍽️", color: "#A78BFA" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: "14px 18px", borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>{s.label}</div>
            <div style={{ fontSize: 10, color: s.color, opacity: 0.7, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { k: "hoy",     l: "📊 Hoy" },
          { k: "semana",  l: "📅 Esta Semana" },
          { k: "comidas", l: "🍽️ Comidas" },
          { k: "macros",  l: "⚙️ Objetivos" },
          { k: "tdee",    l: "🧮 Calculadora" },
          { k: "recetas", l: "📖 Recetas" },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={tab === t.k ? "btn-primary" : "btn-secondary"}
            style={{ fontSize: 12 }}>{t.l}</button>
        ))}
      </div>

      {/* ── TAB: HOY ── */}
      {tab === "hoy" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

          {/* Anillo de calorías */}
          <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
            <div className="section-title" style={{ alignSelf: "flex-start" }}>🔥 Calorías del Día</div>
            <div style={{ position: "relative", width: 150, height: 150 }}>
              <svg width="150" height="150" viewBox="0 0 150 150">
                <circle cx="75" cy="75" r="60" fill="none" stroke="#1A1A28" strokeWidth="12" />
                <circle cx="75" cy="75" r="60" fill="none"
                  stroke={calColor}
                  strokeWidth="12"
                  strokeDasharray={`${2 * Math.PI * 60 * Math.min(calPct / 100, 1)} ${2 * Math.PI * 60}`}
                  strokeLinecap="round"
                  transform="rotate(-90 75 75)"
                  style={{ transition: "stroke-dasharray 0.8s ease, stroke 0.3s" }}
                />
                {/* Excedido */}
                {calPct > 100 && (
                  <circle cx="75" cy="75" r="60" fill="none"
                    stroke="#EF444460"
                    strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 60 * Math.min((calPct - 100) / 100, 1)} ${2 * Math.PI * 60}`}
                    strokeLinecap="round"
                    transform="rotate(-90 75 75)"
                  />
                )}
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 26, fontWeight: 900, color: calColor }}>{Math.round(calPct)}%</div>
                <div style={{ fontSize: 11, color: "#64748B" }}>{calConsumidas} kcal</div>
              </div>
            </div>
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "Consumidas", val: calConsumidas, color: calColor },
                { label: "Restantes",  val: Math.max(calRestantes, 0), color: "#10B981" },
                { label: "Meta",        val: calMeta,       color: "#4A5568" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
                  <span style={{ color: "#64748B" }}>{r.label}</span>
                  <span style={{ color: r.color, fontWeight: 700, fontFamily: "'Orbitron',monospace" }}>{r.val} kcal</span>
                </div>
              ))}
            </div>
            {calRestantes < 0 && (
              <div style={{ width: "100%", padding: "8px 12px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 11, color: "#FCA5A5", textAlign: "center" }}>
                ⚠️ Excediste tu meta por {Math.abs(calRestantes)} kcal
              </div>
            )}
            <button className="btn-primary" style={{ width: "100%", fontSize: 13 }} onClick={() => setShowMealModal(true)}>
              + Registrar comida
            </button>
          </div>

          {/* Macros */}
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title">🧬 Macronutrientes</div>
            {Object.entries(macrosMeta).map(([key, meta]) => {
              const consumido = Math.round(macrosConsumidos[key] || 0);
              const pct = Math.min((consumido / meta) * 100, 100);
              const color = macroColors[key];
              return (
                <div key={key} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                    <span style={{ color: "#CBD5E1", fontWeight: 600 }}>{macroLabels[key]}</span>
                    <span style={{ color, fontWeight: 700 }}>{consumido}<span style={{ color: "#4A5568", fontWeight: 400 }}>/{meta}g</span></span>
                  </div>
                  <div style={{ position: "relative" }}>
                    <ProgressBar value={consumido} max={meta} color={color} height={10} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginTop: 4 }}>
                    <span style={{ color: "#4A5568" }}>{Math.round(pct)}% completado</span>
                    <span style={{ color }}>faltan {Math.max(meta - consumido, 0)}g</span>
                  </div>
                </div>
              );
            })}
            <div style={{ padding: "10px 12px", borderRadius: 8, background: `${MODO_MACROS[modoMacro].color}08`, border: `1px solid ${MODO_MACROS[modoMacro].color}25`, textAlign: "center", fontSize: 11, color: MODO_MACROS[modoMacro].color, fontWeight: 700 }}>
              {MODO_MACROS[modoMacro].icon} Modo: {MODO_MACROS[modoMacro].label}
            </div>
          </div>

          {/* Agua */}
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title">💧 Hidratación</div>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 36, fontWeight: 900, color: "#06B6D4" }}>{aguaLitros}L</div>
              <div style={{ fontSize: 11, color: "#64748B" }}>{vasos} de {VASOS_META} vasos (250ml)</div>
            </div>

            {/* Vasos clickeables */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
              {Array.from({ length: VASOS_META }).map((_, i) => (
                <div key={i}
                  onClick={() => {
                    if (i >= vasos) {
                      // Agregar vaso
                      setVasos(i + 1);
                      api.nutricion.registrarAgua(250).catch(()=>{});
                    }
                  }}
                  title={i < vasos ? "Ya registrado" : "Click para marcar"}
                  style={{ aspectRatio: "1", borderRadius: 10, border: `2px solid ${i < vasos ? "#06B6D4" : "#1E1E30"}`, background: i < vasos ? "rgba(6,182,212,0.15)" : "#0A0A12", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: i < vasos ? "default" : "pointer", transition: "all 0.15s", gap: 2 }}>
                  <span style={{ fontSize: 20 }}>{i < vasos ? "🥤" : "⬜"}</span>
                  <span style={{ fontSize: 9, color: i < vasos ? "#06B6D4" : "#4A5568" }}>{(i + 1) * 250}ml</span>
                </div>
              ))}
            </div>

            <ProgressBar value={vasos} max={VASOS_META} color="#06B6D4" height={8} />
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11 }}>
              <span style={{ color: "#64748B" }}>Meta: {statsHoy.water_target_ml ? (statsHoy.water_target_ml/1000).toFixed(1) : (VASOS_META * 0.25).toFixed(1)}L</span>
              <span style={{ color: vasos >= VASOS_META ? "#10B981" : "#06B6D4", fontWeight: 700 }}>
                {vasos >= VASOS_META ? "✅ ¡Meta lograda!" : `Faltan ${VASOS_META - vasos} vasos`}
              </span>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
              {[250, 500, 1000].map(ml => (
                <button key={ml} onClick={() => {
                  const vasosExtra = Math.round(ml / 250);
                  setVasos(v => Math.min(v + vasosExtra, VASOS_META));
                  api.nutricion.registrarAgua(ml).catch(()=>{});
                  setToast({ msg: `💧 +${ml}ml registrados`, color: "#06B6D4" });
                }} className="btn-secondary" style={{ flex: 1, fontSize: 11, padding: "8px 4px" }}>
                  +{ml}ml
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB: SEMANA ── */}
      {tab === "semana" && (() => {
        const diasNombres = ["Dom","Lun","Mar","Mié","Jue","Vie","Sáb"];
        const semanaData = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const fecha = d.toISOString().split('T')[0];
          let calDia = 0;
          try {
            const stored = JSON.parse(localStorage.getItem(`lifehud_meals_${fecha}`) || '[]');
            calDia = stored.reduce((sum, m) => sum + (m.calories || 0), 0);
          } catch {}
          return { dia: i === 6 ? "Hoy" : diasNombres[d.getDay()], cal: calDia, meta: calMeta, esHoy: i === 6 };
        });
        const diasConDatos  = semanaData.filter(d => d.cal > 0).length;
        const totalSemana   = semanaData.reduce((s, d) => s + d.cal, 0);
        const promedio      = diasConDatos > 0 ? Math.round(totalSemana / diasConDatos) : 0;
        const dentroMeta    = semanaData.filter(d => d.cal > 0 && d.cal <= d.meta).length;
        const excedidos     = semanaData.filter(d => d.cal > d.meta).length;
        const peakCal       = Math.max(...semanaData.map(d => d.cal), calMeta, 1);
        return (
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
            <div className="card" style={{ padding: 20 }}>
              <div className="section-title">📅 Calorías — Últimos 7 días</div>
              {diasConDatos === 0 ? (
                <div style={{ textAlign: "center", color: "#4A5568", fontSize: 13, padding: "40px 0" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
                  Registra comidas en el tab Hoy para ver tu historial aquí
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 180, marginBottom: 10 }}>
                  {semanaData.map((d, i) => {
                    const pct     = d.cal  / peakCal;
                    const metaPct = d.meta / peakCal;
                    const sobre   = d.cal > d.meta && d.cal > 0;
                    return (
                      <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                        {d.cal > 0 && (
                          <div style={{ fontSize: 9, color: sobre ? "#EF4444" : "#10B981", fontWeight: 700 }}>
                            {sobre ? `+${d.cal - d.meta}` : `${d.cal}`}
                          </div>
                        )}
                        <div style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", height: 140, position: "relative" }}>
                          <div style={{ position: "absolute", bottom: `${metaPct * 140}px`, left: 0, right: 0, borderTop: "1px dashed #374151", zIndex: 1 }} />
                          <div style={{ width: "100%", height: `${Math.max(pct * 140, d.cal > 0 ? 4 : 0)}px`, borderRadius: "4px 4px 0 0", background: sobre ? "#EF4444" : d.esHoy ? "#7C3AED" : "#06B6D4", opacity: d.esHoy ? 1 : 0.75, transition: "all 0.3s" }} />
                        </div>
                        <div style={{ fontSize: 10, color: d.esHoy ? "#A78BFA" : "#64748B", fontWeight: d.esHoy ? 700 : 400 }}>{d.dia}</div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
                {[{ c: "#7C3AED", l: "Hoy" }, { c: "#06B6D4", l: "Días anteriores" }, { c: "#EF4444", l: "Excedido" }, { c: "#374151", l: "-- Meta" }].map(x => (
                  <div key={x.l} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: x.l === "-- Meta" ? 16 : 10, height: x.l === "-- Meta" ? 0 : 10, background: x.c, borderRadius: 2, borderTop: x.l === "-- Meta" ? `2px dashed ${x.c}` : "none" }} />
                    <span style={{ fontSize: 10, color: "#64748B" }}>{x.l}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div className="card" style={{ padding: 16 }}>
                <div className="section-title">📊 Resumen Semanal</div>
                {[
                  { label: "Promedio diario",     val: diasConDatos > 0 ? `${promedio} kcal`    : "—", color: "#06B6D4" },
                  { label: "Días dentro de meta", val: diasConDatos > 0 ? `${dentroMeta}/7`     : "—", color: "#10B981" },
                  { label: "Días excedidos",       val: diasConDatos > 0 ? `${excedidos}/7`      : "—", color: "#EF4444" },
                  { label: "Total semana",         val: diasConDatos > 0 ? `${totalSemana} kcal` : "—", color: "#F59E0B" },
                ].map((s, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid #1A1A28", fontSize: 12 }}>
                    <span style={{ color: "#94A3B8" }}>{s.label}</span>
                    <span style={{ color: s.color, fontWeight: 700, fontFamily: "'Orbitron',monospace" }}>{s.val}</span>
                  </div>
                ))}
              </div>
              <div className="card" style={{ padding: 16 }}>
                <div className="section-title">💡 Análisis</div>
                {diasConDatos === 0
                  ? <div style={{ fontSize: 12, color: "#4A5568", padding: "8px 0" }}>Registra comidas para ver tu análisis semanal.</div>
                  : [
                      promedio <= calMeta
                        ? { icon: "🟢", msg: `Promedio de ${promedio} kcal — dentro de tu meta de ${calMeta} kcal.` }
                        : { icon: "🔴", msg: `Promedio de ${promedio} kcal — ${promedio - calMeta} kcal sobre tu meta diaria.` },
                      dentroMeta >= 5
                        ? { icon: "💡", msg: `${dentroMeta} de 7 días dentro de meta. ¡Excelente consistencia!` }
                        : { icon: "🟡", msg: `Solo ${dentroMeta} días dentro de meta. Intenta reducir porciones.` },
                    ].map((t, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, padding: "8px 0", borderBottom: "1px solid #1A1A28", fontSize: 11 }}>
                        <span>{t.icon}</span>
                        <span style={{ color: "#94A3B8", lineHeight: 1.5 }}>{t.msg}</span>
                      </div>
                    ))
                }
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── TAB: COMIDAS ── */}
      {tab === "comidas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => setShowMealModal(true)}>+ Registrar comida</button>
          </div>
          {MEAL_TYPES.map(mt => {
            const comidas = meals.filter(m => m.type === mt.key);
            const totalCal = comidas.reduce((a, m) => a + m.calories, 0);
            return (
              <div key={mt.key} className="card" style={{ padding: 16, borderLeft: `3px solid ${mt.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: comidas.length > 0 ? 12 : 0 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 26 }}>{mt.icon}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>{mt.label}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{comidas.length} registros · {totalCal} kcal</div>
                    </div>
                  </div>
                  <button onClick={() => setShowMealModal(true)} className="btn-secondary" style={{ fontSize: 12, padding: "5px 12px" }}>+ Agregar</button>
                </div>
                {comidas.map((comida, i) => (
                  <div key={i} style={{ padding: "10px 12px", borderRadius: 8, background: "#0A0A12", border: "1px solid #1A1A28", marginBottom: 6 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#F1F5F9" }}>{comida.name}</span>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: "#64748B" }}>{comida.time}</span>
                        <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, color: mt.color, fontWeight: 700 }}>{comida.calories} kcal</span>
                        <span onClick={() => eliminarComida(comida.id)} style={{ color: "#EF4444", cursor: "pointer", fontWeight: 700, fontSize: 14, lineHeight: 1 }} title="Eliminar">x</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {comida.foods.slice(0, 5).map((f, j) => (
                        <span key={j} style={{ fontSize: 10, padding: "2px 7px", borderRadius: 999, background: `${mt.color}15`, color: mt.color }}>
                          {f.name}{f.gramos ? ` ${f.gramos}g` : ""} - {f.cal} kcal
                        </span>
                      ))}
                      {comida.foods.length > 5 && <span style={{ fontSize: 10, color: "#4A5568" }}>+{comida.foods.length - 5} mas</span>}
                    </div>
                  </div>
                ))}
                {comidas.length === 0 && (
                  <div style={{ padding: "12px 0", textAlign: "center", color: "#2D2D45", fontSize: 12, borderTop: "1px dashed #1A1A28", marginTop: 8 }}>
                    Sin registros — haz click en + Agregar
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── TAB: OBJETIVOS DE MACROS ── */}
      {tab === "macros" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title">🎯 Modo de Objetivo</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
              {Object.entries(MODO_MACROS).map(([key, m]) => (
                <div key={key} onClick={() => aplicarModo(key)}
                  style={{ padding: "14px 16px", borderRadius: 10, border: `2px solid ${modoMacro === key ? m.color : "#1E1E30"}`, background: modoMacro === key ? `${m.color}10` : "#0F0F18", cursor: "pointer", transition: "all 0.15s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span style={{ fontSize: 24 }}>{m.icon}</span>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 700, color: modoMacro === key ? m.color : "#F1F5F9" }}>{m.label}</div>
                        <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                          {key === "mantenimiento" && "Mantén tu peso actual"}
                          {key === "bulking" && "Gana músculo y masa"}
                          {key === "cutting" && "Pierde grasa conservando músculo"}
                        </div>
                      </div>
                    </div>
                    {modoMacro === key && <span style={{ color: m.color, fontSize: 18 }}>✓</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="section-title">⚙️ Ajuste Manual</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748B", marginBottom: 6 }}>
                  <span>🔥 Meta de calorías</span>
                  <span style={{ color: "#F1F5F9", fontWeight: 700 }}>{calMeta} kcal</span>
                </div>
                <input type="range" min="1200" max="4000" step="50" value={calMeta}
                  onChange={e => setCalMeta(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#7C3AED" }} />
              </div>
              {[
                { key: "proteina", label: "💜 Proteína", color: "#7C3AED", max: 300 },
                { key: "carbs",    label: "💙 Carbohidratos", color: "#06B6D4", max: 500 },
                { key: "grasa",    label: "💛 Grasa", color: "#F59E0B", max: 200 },
              ].map(m => (
                <div key={m.key}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#64748B", marginBottom: 6 }}>
                    <span>{m.label}</span>
                    <span style={{ color: m.color, fontWeight: 700 }}>{macrosMeta[m.key]}g</span>
                  </div>
                  <input type="range" min="50" max={m.max} step="5" value={macrosMeta[m.key]}
                    onChange={e => setMacrosMeta(prev => ({ ...prev, [m.key]: Number(e.target.value) }))}
                    style={{ width: "100%", accentColor: m.color }} />
                </div>
              ))}
            </div>
          </div>

          {/* Preview macros */}
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title">📊 Tu Distribución Actual</div>
            {/* Donut de macros */}
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              {(() => {
                const totalCal = macrosMeta.proteina * 4 + macrosMeta.carbs * 4 + macrosMeta.grasa * 9;
                const pcts = {
                  proteina: (macrosMeta.proteina * 4 / totalCal) * 100,
                  carbs:    (macrosMeta.carbs    * 4 / totalCal) * 100,
                  grasa:    (macrosMeta.grasa    * 9 / totalCal) * 100,
                };
                const r = 55; const circ = 2 * Math.PI * r;
                let offset = 0;
                return (
                  <div style={{ position: "relative" }}>
                    <svg width="140" height="140" viewBox="0 0 140 140">
                      {Object.entries(pcts).map(([key, pct]) => {
                        const dash = circ * pct / 100;
                        const el = (
                          <circle key={key} cx="70" cy="70" r={r} fill="none"
                            stroke={macroColors[key]} strokeWidth="18"
                            strokeDasharray={`${dash} ${circ - dash}`}
                            strokeDashoffset={-offset}
                            transform="rotate(-90 70 70)" />
                        );
                        offset += dash;
                        return el;
                      })}
                      <circle cx="70" cy="70" r="46" fill="#0F0F18" />
                      <text x="70" y="66" textAnchor="middle" fill="#F1F5F9" fontSize="11" fontFamily="Orbitron,monospace" fontWeight="700">{totalCal}</text>
                      <text x="70" y="80" textAnchor="middle" fill="#64748B" fontSize="8" fontFamily="Rajdhani,sans-serif">kcal/día</text>
                    </svg>
                  </div>
                );
              })()}
            </div>
            {Object.entries(macrosMeta).map(([key, val]) => {
              const kcal = key === "grasa" ? val * 9 : val * 4;
              const totalKcal = macrosMeta.proteina * 4 + macrosMeta.carbs * 4 + macrosMeta.grasa * 9;
              return (
                <div key={key} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
                    <span style={{ color: "#CBD5E1" }}>{macroLabels[key]}</span>
                    <div style={{ display: "flex", gap: 10 }}>
                      <span style={{ color: macroColors[key], fontWeight: 700 }}>{val}g</span>
                      <span style={{ color: "#4A5568" }}>{kcal} kcal</span>
                      <span style={{ color: "#64748B" }}>{Math.round(kcal / totalKcal * 100)}%</span>
                    </div>
                  </div>
                  <ProgressBar value={kcal} max={totalKcal} color={macroColors[key]} height={6} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB: CALCULADORA TDEE ── */}
      {tab === "tdee" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title">🧮 Calculadora de TDEE</div>
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 16, lineHeight: 1.6 }}>
              El TDEE (Total Daily Energy Expenditure) es el total de calorías que tu cuerpo gasta al día. Úsalo como base para tu meta.
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 5 }}>⚖️ Peso (kg)</div>
                  <input type="number" value={tdeeForm.peso} onChange={e => setTdeeForm(f => ({ ...f, peso: Number(e.target.value) }))} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 5 }}>📏 Altura (cm)</div>
                  <input type="number" value={tdeeForm.altura} onChange={e => setTdeeForm(f => ({ ...f, altura: Number(e.target.value) }))} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 5 }}>🎂 Edad</div>
                  <input type="number" value={tdeeForm.edad} onChange={e => setTdeeForm(f => ({ ...f, edad: Number(e.target.value) }))} />
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 5 }}>⚧ Sexo</div>
                  <select value={tdeeForm.sexo} onChange={e => setTdeeForm(f => ({ ...f, sexo: e.target.value }))}>
                    <option value="hombre">Hombre</option>
                    <option value="mujer">Mujer</option>
                  </select>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 5 }}>🏃 Nivel de actividad</div>
                <select value={tdeeForm.actividad} onChange={e => setTdeeForm(f => ({ ...f, actividad: Number(e.target.value) }))}>
                  <option value={1.2}>Sedentario (sin ejercicio)</option>
                  <option value={1.375}>Ligero (1-3 días/sem)</option>
                  <option value={1.55}>Moderado (3-5 días/sem)</option>
                  <option value={1.725}>Activo (6-7 días/sem)</option>
                  <option value={1.9}>Muy activo (2x día)</option>
                </select>
              </div>
              <button onClick={calcularTDEE} className="btn-primary" style={{ width: "100%", fontSize: 14 }}>
                🧮 Calcular mi TDEE
              </button>
            </div>
          </div>

          {/* Resultado TDEE */}
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title">📊 Resultado</div>
            {tdeeResult ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ textAlign: "center", padding: "20px", borderRadius: 12, background: "rgba(6,182,212,0.08)", border: "1px solid rgba(6,182,212,0.2)" }}>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>Tu TMB (metabolismo basal)</div>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 700, color: "#64748B" }}>{tdeeResult.tmb} kcal</div>
                </div>
                <div style={{ textAlign: "center", padding: "20px", borderRadius: 12, background: "rgba(6,182,212,0.12)", border: "2px solid rgba(6,182,212,0.4)" }}>
                  <div style={{ fontSize: 11, color: "#06B6D4", marginBottom: 4, fontWeight: 700 }}>TDEE — Mantenimiento</div>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 32, fontWeight: 900, color: "#06B6D4" }}>{tdeeResult.tdee}</div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>kcal/día</div>
                </div>
                {[
                  { label: "🔥 Cutting (déficit -400)", val: tdeeResult.cutting, color: "#EF4444", desc: "Perder grasa" },
                  { label: "📈 Bulking (superávit +300)", val: tdeeResult.bulking, color: "#10B981", desc: "Ganar músculo" },
                ].map((r, i) => (
                  <div key={i} style={{ padding: "12px 16px", borderRadius: 10, background: `${r.color}08`, border: `1px solid ${r.color}25`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: r.color }}>{r.label}</div>
                      <div style={{ fontSize: 10, color: "#64748B" }}>{r.desc}</div>
                    </div>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 900, color: r.color }}>{r.val}</div>
                  </div>
                ))}
                <button onClick={() => { setCalMeta(tdeeResult.tdee); setTab("macros"); setToast({ msg: "✅ Meta actualizada a " + tdeeResult.tdee + " kcal", color: "#10B981" }); }}
                  className="btn-success" style={{ width: "100%", fontSize: 13, marginTop: 4 }}>
                  ✓ Usar este TDEE como mi meta
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "80%", gap: 12, color: "#4A5568" }}>
                <span style={{ fontSize: 56 }}>🧮</span>
                <div style={{ fontSize: 14, textAlign: "center" }}>Completa el formulario y calcula tu TDEE para obtener tu meta de calorías personalizada</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: RECETAS ── */}
      {tab === "recetas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: "#64748B" }}>{recetas.length} receta{recetas.length !== 1 ? "s" : ""} guardada{recetas.length !== 1 ? "s" : ""}</div>
            <button className="btn-primary" style={{ fontSize: 13 }} onClick={() => setShowFormReceta(true)}>+ Nueva receta</button>
          </div>

          {/* Modal nueva receta */}
          {showFormReceta && (
            <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowFormReceta(false)}>
              <div className="modal" style={{ width: 600, maxHeight: "90vh", overflowY: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>📖 Nueva Receta</div>
                  <button onClick={() => setShowFormReceta(false)} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 18 }}>✕</button>
                </div>

                {/* Datos básicos */}
                <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 100px", gap: 10, marginBottom: 14 }}>
                  <input placeholder="🍽️" value={formReceta.emoji}
                    onChange={e => setFormReceta(r => ({ ...r, emoji: e.target.value }))}
                    style={{ fontSize: 22, textAlign: "center" }} />
                  <input placeholder="Nombre de la receta" value={formReceta.nombre}
                    onChange={e => setFormReceta(r => ({ ...r, nombre: e.target.value }))}
                    style={{ fontSize: 13 }} />
                  <input placeholder="⏱ 20 min" value={formReceta.tiempo}
                    onChange={e => setFormReceta(r => ({ ...r, tiempo: e.target.value }))}
                    style={{ fontSize: 12 }} />
                </div>

                {/* Tipo de comida */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 10, color: "#64748B", marginBottom: 8, letterSpacing: 1 }}>REGISTRAR COMO</div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {MEAL_TYPES.map(mt => (
                      <button key={mt.key} onClick={() => setFormReceta(r => ({ ...r, tipo: mt.key }))}
                        className={formReceta.tipo === mt.key ? "btn-primary" : "btn-secondary"}
                        style={{ flex: 1, fontSize: 11, padding: "6px 4px" }}>
                        {mt.icon} {mt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Agregar ingrediente */}
                <div style={{ padding: 14, borderRadius: 10, background: "#0A0A12", border: "1px solid #1E1E30", marginBottom: 14 }}>
                  <div style={{ fontSize: 10, color: "#64748B", marginBottom: 10, letterSpacing: 1 }}>+ INGREDIENTE (valores por 100g)</div>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 70px 70px 60px 60px 60px", gap: 7, marginBottom: 8 }}>
                    <input placeholder="Ingrediente" value={formIng.nombre}
                      onChange={e => setFormIng(f => ({ ...f, nombre: e.target.value }))} style={{ fontSize: 12 }} />
                    <input type="number" placeholder="Gramos" value={formIng.gramos}
                      onChange={e => setFormIng(f => ({ ...f, gramos: e.target.value }))} style={{ fontSize: 12 }} />
                    <input type="number" placeholder="kcal" value={formIng.cal100}
                      onChange={e => setFormIng(f => ({ ...f, cal100: e.target.value }))} style={{ fontSize: 12 }} />
                    <input type="number" placeholder="P(g)" value={formIng.p100}
                      onChange={e => setFormIng(f => ({ ...f, p100: e.target.value }))} style={{ fontSize: 12 }} />
                    <input type="number" placeholder="C(g)" value={formIng.c100}
                      onChange={e => setFormIng(f => ({ ...f, c100: e.target.value }))} style={{ fontSize: 12 }} />
                    <input type="number" placeholder="G(g)" value={formIng.f100}
                      onChange={e => setFormIng(f => ({ ...f, f100: e.target.value }))} style={{ fontSize: 12 }} />
                  </div>
                  {/* Preview del ingrediente */}
                  {formIng.nombre && formIng.gramos && (
                    <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 8, padding: "6px 8px", background: "rgba(16,185,129,0.06)", borderRadius: 6 }}>
                      {formIng.nombre} · {formIng.gramos}g →
                      <span style={{ color: "#F59E0B" }}> {scaleIng(formIng.cal100, formIng.gramos)} kcal</span>
                      <span style={{ color: "#7C3AED" }}> · P:{scaleIng(formIng.p100, formIng.gramos)}g</span>
                      <span style={{ color: "#06B6D4" }}> · C:{scaleIng(formIng.c100, formIng.gramos)}g</span>
                      <span style={{ color: "#F59E0B" }}> · G:{scaleIng(formIng.f100, formIng.gramos)}g</span>
                    </div>
                  )}
                  <button className="btn-secondary" style={{ fontSize: 12, width: "100%" }}
                    onClick={agregarIngrediente} disabled={!formIng.nombre || !formIng.gramos}>
                    + Agregar ingrediente
                  </button>
                </div>

                {/* Lista de ingredientes agregados */}
                {formReceta.ingredientes.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: "#64748B", marginBottom: 8, letterSpacing: 1 }}>INGREDIENTES ({formReceta.ingredientes.length})</div>
                    {formReceta.ingredientes.map((ing, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: "1px solid #1A1A28", fontSize: 12 }}>
                        <span style={{ color: "#F1F5F9" }}>{ing.nombre} <span style={{ color: "#64748B" }}>({ing.gramos}g)</span></span>
                        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                          <span style={{ color: "#F59E0B", fontSize: 11, fontFamily: "'Orbitron',monospace" }}>{ing.cal} kcal</span>
                          <span style={{ color: "#7C3AED", fontSize: 10 }}>P:{ing.p}g</span>
                          <span style={{ color: "#06B6D4", fontSize: 10 }}>C:{ing.c}g</span>
                          <span onClick={() => setFormReceta(r => ({ ...r, ingredientes: r.ingredientes.filter((_, j) => j !== i) }))}
                            style={{ color: "#EF4444", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>×</span>
                        </div>
                      </div>
                    ))}
                    {/* Totales */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 10, padding: "8px 0" }}>
                      {(() => {
                        const tot = formReceta.ingredientes.reduce((a, i) => ({ cal: a.cal + i.cal, p: a.p + i.p, c: a.c + i.c, fat: a.fat + i.fat }), { cal: 0, p: 0, c: 0, fat: 0 });
                        return [
                          { l: "Total", v: `${Math.round(tot.cal)} kcal`, c: "#F59E0B" },
                          { l: "P", v: `${Math.round(tot.p)}g`, c: "#7C3AED" },
                          { l: "C", v: `${Math.round(tot.c)}g`, c: "#06B6D4" },
                          { l: "G", v: `${Math.round(tot.fat)}g`, c: "#F59E0B" },
                        ].map((s, i) => (
                          <div key={i} style={{ textAlign: "center" }}>
                            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: s.c }}>{s.v}</div>
                            <div style={{ fontSize: 9, color: "#4A5568" }}>{s.l}</div>
                          </div>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowFormReceta(false)}>Cancelar</button>
                  <button className="btn-primary" style={{ flex: 2 }}
                    disabled={!formReceta.nombre || formReceta.ingredientes.length === 0}
                    onClick={guardarReceta}>✅ Guardar receta</button>
                </div>
              </div>
            </div>
          )}

          {/* Grid de recetas */}
          {recetas.length === 0 ? (
            <div className="card" style={{ padding: 40, textAlign: "center", color: "#4A5568" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📖</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>Sin recetas todavía</div>
              <div style={{ fontSize: 12, marginBottom: 16 }}>Crea tu primera receta con sus ingredientes y valores nutricionales</div>
              <button className="btn-primary" onClick={() => setShowFormReceta(true)}>+ Crear primera receta</button>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
              {recetas.map(r => {
                const mt = MEAL_TYPES.find(m => m.key === r.tipo) || MEAL_TYPES[1];
                return (
                  <div key={r.id} className="card" style={{ padding: 16, borderTop: `3px solid ${mt.color}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                        <span style={{ fontSize: 32 }}>{r.emoji}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>{r.nombre}</div>
                          <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
                            {r.tiempo && <span style={{ fontSize: 10, color: "#64748B" }}>⏱ {r.tiempo}</span>}
                            <span style={{ fontSize: 10, color: mt.color }}>{mt.icon} {mt.label}</span>
                          </div>
                        </div>
                      </div>
                      <span onClick={() => eliminarReceta(r.id)}
                        style={{ color: "#EF4444", cursor: "pointer", fontSize: 16, fontWeight: 700, lineHeight: 1 }}>×</span>
                    </div>

                    {/* Macros */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 5, marginBottom: 12 }}>
                      {[
                        { l: "kcal", v: r.cal,      c: "#F59E0B" },
                        { l: "Prot", v: `${r.proteina}g`, c: "#7C3AED" },
                        { l: "Carb", v: `${r.carbs}g`,    c: "#06B6D4" },
                        { l: "Gras", v: `${r.grasa}g`,    c: "#10B981" },
                      ].map((s, i) => (
                        <div key={i} style={{ padding: "6px 4px", borderRadius: 7, background: "#0A0A12", border: "1px solid #1A1A28", textAlign: "center" }}>
                          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 12, fontWeight: 700, color: s.c }}>{s.v}</div>
                          <div style={{ fontSize: 9, color: "#4A5568" }}>{s.l}</div>
                        </div>
                      ))}
                    </div>

                    {/* Ingredientes */}
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: "#4A5568", marginBottom: 5 }}>INGREDIENTES ({r.ingredientes.length})</div>
                      {r.ingredientes.slice(0, 3).map((ing, i) => (
                        <div key={i} style={{ fontSize: 11, color: "#94A3B8", padding: "3px 0", borderBottom: "1px solid #1A1A28" }}>
                          · {ing.nombre} <span style={{ color: "#64748B" }}>({ing.gramos}g · {ing.cal} kcal)</span>
                        </div>
                      ))}
                      {r.ingredientes.length > 3 && (
                        <div style={{ fontSize: 10, color: "#4A5568", marginTop: 3 }}>+{r.ingredientes.length - 3} más</div>
                      )}
                    </div>

                    <button className="btn-success" style={{ width: "100%", fontSize: 12 }}
                      onClick={() => registrarRecetaComoComida(r)}>
                      + Registrar hoy
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ============================================================
// LEARNING
// ============================================================
const PomodoroTimer = () => {
  const [mode, setMode] = useState("focus"); const [seconds, setSeconds] = useState(25 * 60); const [running, setRunning] = useState(false); const [pomodoros, setPomodoros] = useState(3); const timerRef = useRef(null);
  const total = mode === "focus" ? 25 * 60 : 5 * 60; const r = 54; const circ = 2 * Math.PI * r; const pct = ((total - seconds) / total) * 100;
  useEffect(() => { if (running) { timerRef.current = setInterval(() => { setSeconds(s => { if (s <= 1) { clearInterval(timerRef.current); setRunning(false); if (mode === "focus") { setPomodoros(p => p + 1); setMode("break"); setSeconds(5 * 60); } else { setMode("focus"); setSeconds(25 * 60); } return 0; } return s - 1; }); }, 1000); } else clearInterval(timerRef.current); return () => clearInterval(timerRef.current); }, [running, mode]);
  const reset = () => { setRunning(false); setSeconds(mode === "focus" ? 25 * 60 : 5 * 60); };
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0"); const ss = String(seconds % 60).padStart(2, "0");
  return <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}><div className="section-title" style={{ alignSelf: "flex-start" }}>⏱️ Pomodoro</div><div style={{ display: "flex", gap: 8 }}>{["focus", "break"].map(m => <button key={m} onClick={() => { setMode(m); setRunning(false); setSeconds(m === "focus" ? 25 * 60 : 5 * 60); }} className={mode === m ? "btn-primary" : "btn-secondary"} style={{ fontSize: 12, padding: "4px 12px" }}>{m === "focus" ? "🔴 Focus" : "🟢 Descanso"}</button>)}</div><div style={{ position: "relative" }}><svg width="130" height="130" viewBox="0 0 130 130"><circle cx="65" cy="65" r={r} fill="none" stroke="#1E1E30" strokeWidth="8" /><circle cx="65" cy="65" r={r} fill="none" stroke={mode === "focus" ? "#7C3AED" : "#10B981"} strokeWidth="8" strokeDasharray={`${circ * pct / 100} ${circ}`} strokeLinecap="round" transform="rotate(-90 65 65)" style={{ transition: "stroke-dasharray 1s linear" }} /></svg><div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}><div style={{ fontFamily: "'Orbitron',monospace", fontSize: 28, fontWeight: 900, color: "#F1F5F9" }}>{mm}:{ss}</div><div style={{ fontSize: 10, color: "#64748B" }}>{mode === "focus" ? "FOCUS" : "BREAK"}</div></div></div><div style={{ display: "flex", gap: 8 }}><button className="btn-primary" style={{ padding: "7px 24px" }} onClick={() => setRunning(r => !r)}>{running ? "⏸" : "▶ Iniciar"}</button><button className="btn-secondary" style={{ padding: "7px 14px" }} onClick={reset}>↺</button></div><div style={{ display: "flex", gap: 6 }}>{Array.from({ length: 4 }).map((_, i) => <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: i < pomodoros % 4 ? "#7C3AED" : "#1E1E30", border: `2px solid ${i < pomodoros % 4 ? "#7C3AED" : "#2D2D45"}` }} />)}</div><div style={{ fontSize: 12, color: "#64748B" }}>🍅 {pomodoros} hoy</div></div>;
};

const FlashcardViewer = ({ cards }) => {
  const dueCards = cards.filter(c => c.due); const [idx, setIdx] = useState(0); const [flipped, setFlipped] = useState(false); const [done, setDone] = useState([]);
  if (!dueCards.length || done.length >= dueCards.length) return <div style={{ padding: "30px", textAlign: "center" }}><div style={{ fontSize: 40 }}>🎉</div><div style={{ color: "#10B981", fontWeight: 700 }}>¡Al día!</div></div>;
  const card = dueCards[idx % dueCards.length]; const next = () => { setDone(d => [...d, card.id]); setFlipped(false); setTimeout(() => setIdx(i => i + 1), 200); };
  return <div style={{ display: "flex", flexDirection: "column", gap: 12 }}><div style={{ display: "flex", justifyContent: "space-between" }}><span className="tag" style={{ background: "rgba(124,58,237,0.2)", color: "#A78BFA" }}>📦 {card.deck}</span><span style={{ fontSize: 12, color: "#64748B" }}>{done.length + 1}/{dueCards.length}</span></div><div onClick={() => setFlipped(f => !f)} style={{ minHeight: 160, padding: 20, borderRadius: 12, border: `1px solid ${flipped ? "rgba(16,185,129,0.4)" : "rgba(124,58,237,0.3)"}`, background: flipped ? "linear-gradient(135deg,#0A1A12,#0F1A14)" : "linear-gradient(135deg,#12121E,#1A1230)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", textAlign: "center" }}><div style={{ fontSize: 14, color: flipped ? "#A7F3D0" : "#F1F5F9", fontWeight: 600, lineHeight: 1.6 }}>{flipped ? card.back : card.front}</div></div><div style={{ fontSize: 11, color: "#4A5568", textAlign: "center" }}>{flipped ? "¿Cómo te fue?" : "Toca para ver respuesta"}</div>{flipped && <div style={{ display: "flex", gap: 8 }}>{[{ label: "Difícil 😅", color: "#EF4444" }, { label: "Bien 🙂", color: "#F59E0B" }, { label: "Fácil 😎", color: "#10B981" }].map((btn, i) => <button key={i} onClick={next} style={{ flex: 1, padding: "8px", borderRadius: 8, border: `1px solid ${btn.color}40`, background: `${btn.color}15`, color: btn.color, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'Rajdhani',sans-serif" }}>{btn.label}</button>)}</div>}</div>;
};

// ============================================================
// LEARNING — versión mejorada
// ============================================================

const SKILL_ROADMAP = [
  {
    id: "python_basico", name: "Python Básico", icon: "🐍", color: "#10B981", nivel: "Fundamento",
    horas: 20, completado: true, desc: "Variables, funciones, listas, dicts",
    unlocks: ["python_inter", "sql_basico"],
  },
  {
    id: "sql_basico", name: "SQL Básico", icon: "🗄️", color: "#06B6D4", nivel: "Fundamento",
    horas: 15, completado: true, desc: "SELECT, JOIN, filtros, agregaciones",
    unlocks: ["sql_avanzado", "fastapi"],
  },
  {
    id: "python_inter", name: "Python Intermedio", icon: "🐍", color: "#10B981", nivel: "Intermedio",
    horas: 45, completado: false, horasHechas: 28, desc: "POO, decoradores, async, generators",
    unlocks: ["fastapi", "django"],
  },
  {
    id: "fastapi", name: "FastAPI", icon: "⚡", color: "#7C3AED", nivel: "Intermedio",
    horas: 30, completado: false, horasHechas: 12, desc: "APIs REST, autenticación, WebSockets",
    unlocks: ["microservicios", "backend_avanzado"],
  },
  {
    id: "sql_avanzado", name: "SQL Avanzado", icon: "🗄️", color: "#06B6D4", nivel: "Intermedio",
    horas: 20, completado: false, horasHechas: 8, desc: "Window functions, CTEs, optimización",
    unlocks: ["data_engineering"],
  },
  {
    id: "django", name: "Django", icon: "🟩", color: "#16A34A", nivel: "Intermedio",
    horas: 35, completado: false, horasHechas: 0, desc: "Framework web full-stack con Python",
    unlocks: ["backend_avanzado"],
    bloqueado: true,
  },
  {
    id: "microservicios", name: "Microservicios", icon: "🔧", color: "#F59E0B", nivel: "Avanzado",
    horas: 40, completado: false, horasHechas: 0, desc: "Docker, Kubernetes, arquitectura",
    unlocks: ["cloud"],
    bloqueado: true,
  },
  {
    id: "backend_avanzado", name: "Backend Avanzado", icon: "🚀", color: "#EF4444", nivel: "Avanzado",
    horas: 50, completado: false, horasHechas: 0, desc: "Caché, colas, patrones de diseño",
    unlocks: ["cloud"],
    bloqueado: true,
  },
  {
    id: "data_engineering", name: "Data Engineering", icon: "📊", color: "#EC4899", nivel: "Avanzado",
    horas: 60, completado: false, horasHechas: 0, desc: "ETL, pipelines, warehouses",
    unlocks: [],
    bloqueado: true,
  },
  {
    id: "cloud", name: "Cloud / DevOps", icon: "☁️", color: "#A78BFA", nivel: "Élite",
    horas: 80, completado: false, horasHechas: 0, desc: "AWS/GCP, CI/CD, infraestructura",
    unlocks: [],
    bloqueado: true,
  },
];

const CURSOS_INICIAL = [
  {
    id: 1, name: "Python Completo", platform: "Udemy", icon: "🐍", color: "#10B981",
    progress: 72, done: 22, lessons: 31, skillId: "python_inter",
    modulos: [
      { id: 1, nombre: "Variables y tipos de datos", lecciones: [
        { id: 1, titulo: "Introducción", done: true }, { id: 2, titulo: "Tipos numéricos", done: true },
        { id: 3, titulo: "Strings", done: true }, { id: 4, titulo: "Listas y tuplas", done: true },
      ]},
      { id: 2, nombre: "POO", lecciones: [
        { id: 5, titulo: "Clases y objetos", done: true }, { id: 6, titulo: "Herencia", done: true },
        { id: 7, titulo: "Decoradores", done: false }, { id: 8, titulo: "Metaprogramación", done: false },
      ]},
      { id: 3, nombre: "Async & Concurrencia", lecciones: [
        { id: 9, titulo: "asyncio básico", done: false }, { id: 10, titulo: "gather y tasks", done: false },
        { id: 11, titulo: "Generators", done: false },
      ]},
    ],
  },
  {
    id: 2, name: "FastAPI Moderno", platform: "YouTube", icon: "⚡", color: "#7C3AED",
    progress: 38, done: 8, lessons: 21, skillId: "fastapi",
    modulos: [
      { id: 1, nombre: "Fundamentos", lecciones: [
        { id: 1, titulo: "Setup y primer endpoint", done: true }, { id: 2, titulo: "Path params", done: true },
        { id: 3, titulo: "Body y Pydantic", done: true },
      ]},
      { id: 2, nombre: "Autenticación", lecciones: [
        { id: 4, titulo: "JWT tokens", done: true }, { id: 5, titulo: "OAuth2", done: false },
        { id: 6, titulo: "Permisos y roles", done: false },
      ]},
      { id: 3, nombre: "Base de datos", lecciones: [
        { id: 7, titulo: "SQLAlchemy", done: false }, { id: 8, titulo: "Migraciones", done: false },
        { id: 9, titulo: "Async DB", done: false },
      ]},
    ],
  },
  {
    id: 3, name: "SQL para Devs", platform: "Platzi", icon: "🗄️", color: "#06B6D4",
    progress: 55, done: 11, lessons: 20, skillId: "sql_avanzado",
    modulos: [
      { id: 1, nombre: "Consultas básicas", lecciones: [
        { id: 1, titulo: "SELECT y WHERE", done: true }, { id: 2, titulo: "JOINs", done: true },
        { id: 3, titulo: "Agregaciones", done: true }, { id: 4, titulo: "Subqueries", done: true },
      ]},
      { id: 2, nombre: "Avanzado", lecciones: [
        { id: 5, titulo: "Window functions", done: true }, { id: 6, titulo: "CTEs", done: false },
        { id: 7, titulo: "Índices y optimización", done: false },
      ]},
    ],
  },
];

// Mapa de estudio 30 días
const generar30Dias = () => {
  const dias = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const rand = Math.random();
    dias.push({
      fecha: d.toISOString().split("T")[0],
      minutos: i === 0 ? 45 : rand > 0.35 ? Math.floor(20 + rand * 120) : 0,
      dia: d.toLocaleDateString("es", { weekday: "short" }),
    });
  }
  return dias;
};
const DIAS_ESTUDIO = generar30Dias();

const NIVEL_COLORS_L = { Fundamento: "#10B981", Intermedio: "#06B6D4", Avanzado: "#F59E0B", Élite: "#A78BFA" };

// Tracks disponibles para el Roadmap
const ROADMAP_TRACKS = {
  programacion: {
    label: "Programación", emoji: "💻", color: "#7C3AED",
    desc: "Desde cero hasta backend/fullstack profesional",
    nodos: [
      { id: 1, name: "Lógica de Programación", emoji: "🧠", nivel: "Fundamento", horas: 20, color: "#10B981", bloqueado: false, unlocks: [2, 3], desc: "Algoritmos, variables, bucles, funciones" },
      { id: 2, name: "Python / JS Básico",     emoji: "🐍", nivel: "Fundamento", horas: 30, color: "#10B981", bloqueado: false, unlocks: [4, 5], desc: "Sintaxis, listas, objetos, funciones" },
      { id: 3, name: "HTML + CSS",             emoji: "🎨", nivel: "Fundamento", horas: 20, color: "#F59E0B", bloqueado: false, unlocks: [6],    desc: "Estructura web, estilos, layout" },
      { id: 4, name: "Python Intermedio",      emoji: "⚙️", nivel: "Intermedio", horas: 40, color: "#7C3AED", bloqueado: true,  unlocks: [7],    desc: "POO, decoradores, async, generators" },
      { id: 5, name: "SQL",                    emoji: "🗄️", nivel: "Intermedio", horas: 25, color: "#06B6D4", bloqueado: true,  unlocks: [7, 8], desc: "SELECT, JOINs, funciones ventana" },
      { id: 6, name: "React / Vue",            emoji: "⚛️", nivel: "Intermedio", horas: 35, color: "#F59E0B", bloqueado: true,  unlocks: [9],    desc: "Componentes, estado, hooks" },
      { id: 7, name: "FastAPI / Node.js",      emoji: "⚡", nivel: "Avanzado",   horas: 30, color: "#EF4444", bloqueado: true,  unlocks: [10],   desc: "APIs REST, autenticación, WebSockets" },
      { id: 8, name: "PostgreSQL Avanzado",    emoji: "🐘", nivel: "Avanzado",   horas: 20, color: "#0EA5E9", bloqueado: true,  unlocks: [10],   desc: "Índices, CTEs, rendimiento" },
      { id: 9, name: "TypeScript",             emoji: "🔷", nivel: "Avanzado",   horas: 25, color: "#3B82F6", bloqueado: true,  unlocks: [11],   desc: "Tipado estático, interfaces, genéricos" },
      { id: 10, name: "Docker + CI/CD",        emoji: "🐳", nivel: "Avanzado",   horas: 30, color: "#10B981", bloqueado: true,  unlocks: [11],   desc: "Contenedores, pipelines, despliegue" },
      { id: 11, name: "Arquitectura Senior",   emoji: "🏆", nivel: "Élite",      horas: 60, color: "#A78BFA", bloqueado: true,  unlocks: [],     desc: "Microservicios, patrones, escalabilidad" },
    ],
  },
  diseno: {
    label: "Diseño UI/UX", emoji: "🎨", color: "#EC4899",
    desc: "De cero a diseñador de producto profesional",
    nodos: [
      { id: 1, name: "Fundamentos Diseño",   emoji: "✏️", nivel: "Fundamento", horas: 15, color: "#EC4899", bloqueado: false, unlocks: [2, 3], desc: "Tipografía, color, composición, espacio" },
      { id: 2, name: "Figma Básico",         emoji: "🖌️", nivel: "Fundamento", horas: 20, color: "#EC4899", bloqueado: false, unlocks: [4],    desc: "Frames, componentes, auto layout" },
      { id: 3, name: "Principios UX",        emoji: "👤", nivel: "Fundamento", horas: 15, color: "#F59E0B", bloqueado: false, unlocks: [5],    desc: "Investigación, empatía, flows, wireframes" },
      { id: 4, name: "Figma Avanzado",       emoji: "⚙️", nivel: "Intermedio", horas: 25, color: "#7C3AED", bloqueado: true,  unlocks: [6],    desc: "Variants, prototipos, sistemas de diseño" },
      { id: 5, name: "UX Research",          emoji: "🔬", nivel: "Intermedio", horas: 20, color: "#06B6D4", bloqueado: true,  unlocks: [7],    desc: "Entrevistas, tests usabilidad, heurísticas" },
      { id: 6, name: "Design System",        emoji: "📐", nivel: "Avanzado",   horas: 30, color: "#EF4444", bloqueado: true,  unlocks: [8],    desc: "Tokens, librería de componentes, guías" },
      { id: 7, name: "Product Design",       emoji: "📱", nivel: "Avanzado",   horas: 35, color: "#F59E0B", bloqueado: true,  unlocks: [8],    desc: "Discovery, métricas, roadmap de producto" },
      { id: 8, name: "Senior UI/UX",         emoji: "🏆", nivel: "Élite",      horas: 50, color: "#A78BFA", bloqueado: true,  unlocks: [],     desc: "Liderazgo de diseño, cultura, mentoría" },
    ],
  },
  idiomas: {
    label: "Idiomas", emoji: "🌍", color: "#10B981",
    desc: "Domina un nuevo idioma desde cero hasta C2",
    nodos: [
      { id: 1, name: "Fonética + Pronunciación", emoji: "🗣️", nivel: "Fundamento", horas: 10, color: "#10B981", bloqueado: false, unlocks: [2],    desc: "Sonidos, ritmo, entonación del idioma" },
      { id: 2, name: "Vocabulario A1–A2",        emoji: "📖", nivel: "Fundamento", horas: 25, color: "#10B981", bloqueado: false, unlocks: [3, 4], desc: "500–1000 palabras esenciales, frases cotidianas" },
      { id: 3, name: "Gramática Básica",         emoji: "✏️", nivel: "Fundamento", horas: 20, color: "#F59E0B", bloqueado: false, unlocks: [5],    desc: "Tiempos verbales, sustantivos, artículos" },
      { id: 4, name: "Listening & Speaking A2",  emoji: "🎧", nivel: "Intermedio", horas: 30, color: "#06B6D4", bloqueado: true,  unlocks: [6],    desc: "Podcasts, shadowing, conversación básica" },
      { id: 5, name: "Gramática Intermedia B1",  emoji: "📚", nivel: "Intermedio", horas: 30, color: "#7C3AED", bloqueado: true,  unlocks: [7],    desc: "Condicionales, modales, subjuntivo" },
      { id: 6, name: "Conversación Fluida B2",   emoji: "💬", nivel: "Avanzado",   horas: 40, color: "#EF4444", bloqueado: true,  unlocks: [8],    desc: "Debates, expresión de opinión, argot" },
      { id: 7, name: "Lectura Avanzada B2+",     emoji: "📰", nivel: "Avanzado",   horas: 35, color: "#F59E0B", bloqueado: true,  unlocks: [8],    desc: "Artículos, libros, análisis de contexto" },
      { id: 8, name: "Dominio C1–C2",            emoji: "🏆", nivel: "Élite",      horas: 60, color: "#A78BFA", bloqueado: true,  unlocks: [],     desc: "Fluidez nativa, matices, escritura académica" },
    ],
  },
  negocios: {
    label: "Negocios", emoji: "💼", color: "#F59E0B",
    desc: "De empleado a emprendedor con bases sólidas",
    nodos: [
      { id: 1, name: "Mindset Emprendedor",  emoji: "🧠", nivel: "Fundamento", horas: 10, color: "#F59E0B", bloqueado: false, unlocks: [2, 3], desc: "Mentalidad de crecimiento, tolerancia al riesgo" },
      { id: 2, name: "Finanzas Personales",  emoji: "💰", nivel: "Fundamento", horas: 15, color: "#10B981", bloqueado: false, unlocks: [4],    desc: "Presupuesto, ahorro, inversión básica" },
      { id: 3, name: "Marketing Digital",    emoji: "📱", nivel: "Fundamento", horas: 20, color: "#EC4899", bloqueado: false, unlocks: [5],    desc: "Redes sociales, contenido, funnel básico" },
      { id: 4, name: "Contabilidad Básica",  emoji: "📊", nivel: "Intermedio", horas: 20, color: "#06B6D4", bloqueado: true,  unlocks: [6],    desc: "Flujo de caja, P&L, impuestos simples" },
      { id: 5, name: "Ventas & Persuasión",  emoji: "🤝", nivel: "Intermedio", horas: 25, color: "#7C3AED", bloqueado: true,  unlocks: [7],    desc: "Objeciones, cierre, propuesta de valor" },
      { id: 6, name: "Modelo de Negocio",    emoji: "🏗️", nivel: "Avanzado",   horas: 30, color: "#EF4444", bloqueado: true,  unlocks: [8],    desc: "Canvas, validación, unit economics" },
      { id: 7, name: "Crecimiento & Equipo", emoji: "📈", nivel: "Avanzado",   horas: 35, color: "#F59E0B", bloqueado: true,  unlocks: [8],    desc: "Hiring, liderazgo, OKRs, sistemas" },
      { id: 8, name: "Scale Up",             emoji: "🚀", nivel: "Élite",      horas: 50, color: "#A78BFA", bloqueado: true,  unlocks: [],     desc: "Inversión, expansión, exit strategy" },
    ],
  },
  musica: {
    label: "Música", emoji: "🎵", color: "#8B5CF6",
    desc: "Aprende un instrumento o producción musical",
    nodos: [
      { id: 1, name: "Teoría Musical Básica",  emoji: "🎼", nivel: "Fundamento", horas: 15, color: "#8B5CF6", bloqueado: false, unlocks: [2, 3], desc: "Notas, ritmo, compás, escalas" },
      { id: 2, name: "Instrumento: Nivel 1",   emoji: "🎸", nivel: "Fundamento", horas: 30, color: "#EC4899", bloqueado: false, unlocks: [4],    desc: "Acordes básicos, postura, primeras canciones" },
      { id: 3, name: "Oído Musical",           emoji: "👂", nivel: "Fundamento", horas: 20, color: "#F59E0B", bloqueado: false, unlocks: [5],    desc: "Intervalos, dictado, reconocimiento de acordes" },
      { id: 4, name: "Instrumento: Nivel 2",   emoji: "🎹", nivel: "Intermedio", horas: 40, color: "#7C3AED", bloqueado: true,  unlocks: [6],    desc: "Técnica, velocidad, repertorio intermedio" },
      { id: 5, name: "Armonía & Composición",  emoji: "🎵", nivel: "Intermedio", horas: 30, color: "#10B981", bloqueado: true,  unlocks: [7],    desc: "Progresiones, modulación, crear melodías" },
      { id: 6, name: "Instrumento: Nivel 3",   emoji: "🥁", nivel: "Avanzado",   horas: 50, color: "#EF4444", bloqueado: true,  unlocks: [8],    desc: "Improvisación, estilos, interpretación" },
      { id: 7, name: "Producción / DAW",       emoji: "🎛️", nivel: "Avanzado",   horas: 40, color: "#06B6D4", bloqueado: true,  unlocks: [8],    desc: "DAW, mezcla, masterización básica" },
      { id: 8, name: "Artista Completo",       emoji: "🏆", nivel: "Élite",      horas: 80, color: "#A78BFA", bloqueado: true,  unlocks: [],     desc: "Presentaciones en vivo, grabación profesional" },
    ],
  },
  fitness_learn: {
    label: "Fitness", emoji: "💪", color: "#EF4444",
    desc: "Conocimiento profundo del cuerpo y entrenamiento",
    nodos: [
      { id: 1, name: "Anatomía Básica",       emoji: "🧬", nivel: "Fundamento", horas: 10, color: "#10B981", bloqueado: false, unlocks: [2, 3], desc: "Grupos musculares, articulaciones, movimientos" },
      { id: 2, name: "Nutrición Deportiva",   emoji: "🥗", nivel: "Fundamento", horas: 15, color: "#F59E0B", bloqueado: false, unlocks: [4],    desc: "Macros, timing, suplementos básicos" },
      { id: 3, name: "Principios Entren.",    emoji: "📋", nivel: "Fundamento", horas: 15, color: "#EF4444", bloqueado: false, unlocks: [5],    desc: "Sobrecarga progresiva, volumen, frecuencia" },
      { id: 4, name: "Periodización",         emoji: "📅", nivel: "Intermedio", horas: 20, color: "#7C3AED", bloqueado: true,  unlocks: [6],    desc: "Mesociclos, deload, adaptación" },
      { id: 5, name: "Biomecánica",           emoji: "⚙️", nivel: "Intermedio", horas: 20, color: "#06B6D4", bloqueado: true,  unlocks: [7],    desc: "Técnica profunda, palancas, ejecución" },
      { id: 6, name: "Planificación Avanzada",emoji: "🏋️", nivel: "Avanzado",   horas: 30, color: "#EF4444", bloqueado: true,  unlocks: [8],    desc: "Diseño de mesociclos, autorregulación" },
      { id: 7, name: "Nutrición Avanzada",    emoji: "🔬", nivel: "Avanzado",   horas: 25, color: "#10B981", bloqueado: true,  unlocks: [8],    desc: "Déficit/superávit calculado, recomposición" },
      { id: 8, name: "Coach Experto",         emoji: "🏆", nivel: "Élite",      horas: 50, color: "#A78BFA", bloqueado: true,  unlocks: [],     desc: "Programas personalizados, evaluación, coaching" },
    ],
  },
};

const LEARNING_ROADMAP = ROADMAP_TRACKS.programacion.nodos; // compatibilidad hacia atrás
// Pomodoro mejorado con vinculación
const PomodoroMejorado = ({ cursos, skills, onSesionCompletada }) => {
  const HOY_KEY = `lifehud_pom_${new Date().toISOString().split("T")[0]}`;

  // ── Cargar desde localStorage al montar ──────────────────────
  const [mode, setMode] = useState("focus");
  const [duracion, setDuracion] = useState(25);
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);
  const [pomodoros, setPomodoros] = useState(() => {
    const saved = localStorage.getItem(`${HOY_KEY}_count`);
    return saved ? parseInt(saved) : 0;
  });
  const [vinculo, setVinculo] = useState(null);
  const [sesiones, setSesiones] = useState(() => {
    try { return JSON.parse(localStorage.getItem(`${HOY_KEY}_sesiones`) || "[]"); }
    catch { return []; }
  });
  const timerRef = useRef(null);
  const firedRef = useRef(false); // ← guard contra doble disparo

  // ── Refs para evitar stale closure dentro del timer ──────────
  const vincuRef    = useRef(vinculo);
  const onSesionRef = useRef(onSesionCompletada);
  const cursosRef   = useRef(cursos);
  const skillsRef   = useRef(skills);
  const modeRef     = useRef(mode);

  useEffect(() => { vincuRef.current    = vinculo;            }, [vinculo]);
  useEffect(() => { onSesionRef.current = onSesionCompletada; }, [onSesionCompletada]);
  useEffect(() => { cursosRef.current   = cursos;             }, [cursos]);
  useEffect(() => { skillsRef.current   = skills;             }, [skills]);
  useEffect(() => { modeRef.current     = mode;               }, [mode]);

  const total = duracion * 60;
  const r = 54; const circ = 2 * Math.PI * r;
  const pct = ((total - seconds) / total) * 100;

  useEffect(() => {
    if (running) {
      firedRef.current = false; // resetear guard al iniciar
      timerRef.current = setInterval(() => {
        setSeconds(s => {
          if (s === 1 && !firedRef.current) {
            firedRef.current = true; // ← evita doble disparo en s=0
            clearInterval(timerRef.current);
            setRunning(false);

            if (modeRef.current === "focus") {
              const minutos = duracion;
              const vinculoActual = vincuRef.current;
              const etiqueta = vinculoActual
                ? (vinculoActual.tipo === "curso"
                  ? cursosRef.current.find(c => c.id === vinculoActual.id)?.name
                  : skillsRef.current.find(s => s.id === vinculoActual.id)?.name) || "General"
                : "Sin vínculo";

              const nueva = {
                tipo: etiqueta,
                minutos,
                hora: new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
              };

              // Actualizar sesiones y persistir
              setSesiones(prev => {
                const nuevas = [nueva, ...prev];
                localStorage.setItem(`${HOY_KEY}_sesiones`, JSON.stringify(nuevas));
                return nuevas;
              });

              // Actualizar contador y persistir
              setPomodoros(p => {
                const nuevo = p + 1;
                localStorage.setItem(`${HOY_KEY}_count`, nuevo);
                return nuevo;
              });

              // Notificar al padre (actualiza mapa + skills)
              onSesionRef.current(vinculoActual, minutos);

              setMode("break");
              return 5 * 60;
            } else {
              setMode("focus");
              return 25 * 60;
            }
          }
          return s <= 0 ? 0 : s - 1;
        });
      }, 1000);
    } else clearInterval(timerRef.current);
    return () => clearInterval(timerRef.current);
  }, [running]); // solo depende de running; refs manejan el resto

  const reset = () => { setRunning(false); setSeconds(duracion * 60); };
  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");
  const vincObj = vinculo && (vinculo.tipo === "curso"
    ? cursos.find(c => c.id === vinculo.id)
    : skills.find(s => s.id === vinculo.id));

  return (
    <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 16 }}>
      <div className="card" style={{ padding: 20, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {/* Selector duración */}
        <div style={{ width: "100%" }}>
          <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6, fontWeight: 700 }}>⏱ Duración</div>
          <div style={{ display: "flex", gap: 6 }}>
            {[{ m: 1, l: "1m" }, { m: 5, l: "5m" }, { m: 25, l: "25m" }, { m: 30, l: "30m" }, { m: 60, l: "1h" }].map(op => (
              <button key={op.m}
                onClick={() => { if (!running) { setDuracion(op.m); setSeconds(op.m * 60); } }}
                className={duracion === op.m ? "btn-primary" : "btn-secondary"}
                style={{ flex: 1, fontSize: 11, padding: "5px 4px", opacity: running ? 0.5 : 1 }}>
                {op.l}
              </button>
            ))}
          </div>
        </div>

        {/* Timer */}
        <div style={{ position: "relative" }}>
          <svg width="130" height="130" viewBox="0 0 130 130">
            <circle cx="65" cy="65" r={r} fill="none" stroke="#1E1E30" strokeWidth="8" />
            <circle cx="65" cy="65" r={r} fill="none"
              stroke={mode === "focus" ? "#7C3AED" : "#10B981"}
              strokeWidth="8"
              strokeDasharray={`${circ * pct / 100} ${circ}`}
              strokeLinecap="round"
              transform="rotate(-90 65 65)"
              style={{ transition: "stroke-dasharray 1s linear" }} />
          </svg>
          <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 28, fontWeight: 900, color: "#F1F5F9" }}>{mm}:{ss}</div>
            <div style={{ fontSize: 10, color: "#64748B" }}>{mode === "focus" ? "FOCUS" : "BREAK"}</div>
          </div>
        </div>

        {/* Puntos de pomodoro */}
        <div style={{ display: "flex", gap: 6 }}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ width: 18, height: 18, borderRadius: "50%", background: i < pomodoros % 4 ? "#7C3AED" : "#1E1E30", border: `2px solid ${i < pomodoros % 4 ? "#7C3AED" : "#2D2D45"}` }} />
          ))}
        </div>
        <div style={{ fontSize: 12, color: "#64748B" }}>🍅 {pomodoros} completados hoy</div>

        {/* Controles */}
        <div style={{ display: "flex", gap: 8, width: "100%" }}>
          <button className="btn-primary" style={{ flex: 2, padding: "8px" }} onClick={() => setRunning(r => !r)}>
            {running ? "⏸ Pausar" : "▶ Iniciar"}
          </button>
          <button className="btn-secondary" style={{ flex: 1, padding: "8px" }} onClick={reset}>↺</button>
        </div>

        {/* Vinculación */}
        <div style={{ width: "100%", padding: "12px", borderRadius: 10, background: "#0A0A12", border: "1px solid #1E1E30" }}>
          <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8, fontWeight: 700 }}>🔗 Vincular sesión a:</div>
          <select value={vinculo ? `${vinculo.tipo}:${vinculo.id}` : ""}
            onChange={e => {
              if (!e.target.value) { setVinculo(null); return; }
              const [tipo, id] = e.target.value.split(":");
              setVinculo({ tipo, id: tipo === "curso" ? Number(id) : id });
            }}
            style={{ width: "100%", fontSize: 11, padding: "6px 8px" }}>
            <option value="">— Solo mapa de estudio —</option>
            <optgroup label="📚 Cursos">
              {cursos.map(c => <option key={c.id} value={`curso:${c.id}`}>{c.icon} {c.name}</option>)}
            </optgroup>
            <optgroup label="🧠 Skills">
              {skills.map(s => <option key={s.id} value={`skill:${s.id}`}>{s.icon} {s.name}</option>)}
            </optgroup>
          </select>
          {vincObj ? (
            <div style={{ marginTop: 8, fontSize: 11, color: vincObj.color || "#7C3AED", fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              <span>{vincObj.icon || "💡"}</span> Sumará 25 min a <strong>{vincObj.name}</strong>
            </div>
          ) : (
            <div style={{ marginTop: 8, fontSize: 11, color: "#4A5568" }}>
              ℹ️ Solo se registrará en el mapa de estudio
            </div>
          )}
        </div>
      </div>

      {/* Historial sesiones */}
      <div className="card" style={{ padding: 18 }}>
        <div className="section-title">📋 Sesiones de hoy</div>
        <div style={{ marginBottom: 14 }}>
          {[
            { label: "Minutos hoy", val: sesiones.reduce((a, s) => a + s.minutos, 0) + "m", color: "#7C3AED" },
            { label: "Pomodoros",   val: pomodoros,      color: "#F59E0B" },
            { label: "Sesiones",    val: sesiones.length, color: "#10B981" },
          ].map((s, i) => (
            <span key={i} style={{ marginRight: 16, fontSize: 12 }}>
              <span style={{ color: "#64748B" }}>{s.label}: </span>
              <span style={{ color: s.color, fontWeight: 700, fontFamily: "'Orbitron',monospace" }}>{s.val}</span>
            </span>
          ))}
        </div>
        {sesiones.length === 0 && (
          <div style={{ textAlign: "center", color: "#4A5568", fontSize: 12, padding: "30px 0" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🍅</div>
            Completa tu primer pomodoro para ver el historial
          </div>
        )}
        {sesiones.map((s, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", borderRadius: 8, background: "#0A0A12", border: "1px solid #1A1A28", marginBottom: 6 }}>
            <div>
              <div style={{ fontSize: 13, color: "#F1F5F9", fontWeight: 600 }}>{s.tipo}</div>
              <div style={{ fontSize: 10, color: "#64748B", marginTop: 2 }}>🕐 {s.hora}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: "#A78BFA", fontWeight: 700, fontFamily: "'Orbitron',monospace" }}>{s.minutos}m</div>
              <div style={{ fontSize: 10, color: "#64748B" }}>🍅 1 pomodoro</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const LearningPage = () => {
  const [tab, setTab] = useState("cursos");
  const [cursos, setCursos] = useState([]);
  const [skills, setSkills] = useState([]);
  const [flashcards, setFlashcards] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    Promise.all([
      api.learning.cursos(),
      api.learning.skills(),
      api.learning.flashcards(),
    ])
    .then(([cursosData, skillsData, flashData]) => {
      setCursos((cursosData || []).map(c => {
      // ← esta línea ya existe, agrégale lo de localStorage abajo:
      const modulosGuardados = JSON.parse(localStorage.getItem(`lifehud_modulos_${c.id}`) || "[]");
      const todasLecciones  = modulosGuardados.flatMap(m => m.lecciones || []);
      const leccionesHechas = todasLecciones.filter(l => l.done).length;
      const progressLocal   = todasLecciones.length > 0
        ? Math.round((leccionesHechas / todasLecciones.length) * 100)
        : Math.round(c.progress_percentage || 0);
      return {
        id:       c.id,
        name:     c.name,
        platform: c.platform || c.provider || "Otro",
        icon:     "🎓",
        progress: progressLocal,
        lessons:  todasLecciones.length || c.total_lessons || 0,
        done:     leccionesHechas || c.completed_lessons || 0,
        color:    "#7C3AED",
        modulos:  modulosGuardados,
      };
    }));
      setSkills((skillsData || []).map(s => {
        // Fusionar horas del backend con las acumuladas localmente
        const horasLocal   = parseFloat(localStorage.getItem(`lifehud_skill_hours_${s.id}`) || "0");
        const horasBackend = s.hours_invested || 0;
        const horas        = Math.max(horasLocal, horasBackend);
        return {
          id:     s.id,
          name:   s.name,
          icon:   "💡",
          level:  s.current_level === "beginner"     ? "Principiante" :
                  s.current_level === "intermediate"  ? "Intermedio"   :
                  s.current_level === "advanced"      ? "Avanzado"     : "Experto",
          xp:     s.xp_accumulated || 0,
          xpNext: 3000,
          hours:  horas,
          color:  "#06B6D4",
        };
      }));
      const due = (flashData || []).map(fc => ({
        id:       fc.id,
        front:    fc.question,
        back:     fc.answer,
        deck:     "General",
        due:      new Date(fc.next_review_date) <= new Date(),
        difficulty: fc.difficulty,
      }));
      setFlashcards(due);
    })
    .catch(() => {})
    .finally(() => setCargando(false));
  }, []);

  // Estado del roadmap con tracks
  const [roadmapTrack, setRoadmapTrack] = useState("programacion");
  const [roadmapProgreso, setRoadmapProgreso] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lifehud_roadmap_progreso") || "{}"); }
    catch { return {}; }
  });
  // Estado de notas
  const [notas, setNotas] = useState(() => {
    try { return JSON.parse(localStorage.getItem("lifehud_notas") || "[]"); }
    catch { return []; }
  });
  const [notaActiva, setNotaActiva] = useState(null);
  const [notaBuscador, setNotaBuscador] = useState("");
  const [showFormNota, setShowFormNota] = useState(false);
  const [formNota, setFormNota] = useState({ titulo: "", contenido: "", tag: "General", color: "#7C3AED" });

  const NOTA_TAGS = ["General", "Curso", "Idea", "Resumen", "Tarea", "Investigación"];
  const NOTA_COLORS = ["#7C3AED", "#06B6D4", "#10B981", "#F59E0B", "#EF4444", "#EC4899"];

  const guardarNota = () => {
    if (!formNota.titulo.trim()) return;
    const nueva = {
      id: Date.now(),
      titulo: formNota.titulo,
      contenido: formNota.contenido,
      tag: formNota.tag,
      color: formNota.color,
      fecha: new Date().toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" }),
      editado: new Date().toISOString(),
    };
    const actualizadas = [nueva, ...notas];
    setNotas(actualizadas);
    localStorage.setItem("lifehud_notas", JSON.stringify(actualizadas));
    setNotaActiva(nueva);
    setShowFormNota(false);
    setFormNota({ titulo: "", contenido: "", tag: "General", color: "#7C3AED" });
  };

  const actualizarNota = (id, campo, valor) => {
    const actualizadas = notas.map(n => n.id === id ? { ...n, [campo]: valor, editado: new Date().toISOString() } : n);
    setNotas(actualizadas);
    setNotaActiva(prev => prev?.id === id ? { ...prev, [campo]: valor } : prev);
    localStorage.setItem("lifehud_notas", JSON.stringify(actualizadas));
  };

  const eliminarNota = (id) => {
    const actualizadas = notas.filter(n => n.id !== id);
    setNotas(actualizadas);
    if (notaActiva?.id === id) setNotaActiva(null);
    localStorage.setItem("lifehud_notas", JSON.stringify(actualizadas));
  };

  const toggleRoadmapNodo = (nodoId) => {
    const key = `${roadmapTrack}_${nodoId}`;
    const nuevo = { ...roadmapProgreso, [key]: !roadmapProgreso[key] };
    setRoadmapProgreso(nuevo);
    localStorage.setItem("lifehud_roadmap_progreso", JSON.stringify(nuevo));
  };

  const [selectedCurso, setSelectedCurso] = useState(null);
  const [selectedRoadmap, setSelectedRoadmap] = useState(null);
  const [showFormFlash, setShowFormFlash] = useState(false);
  const [newFlash, setNewFlash] = useState({ front: "", back: "", deck: "General", skillId: "", difficulty: "medium" });
  const [toast, setToast] = useState(null);
  const [diasEstudio, setDiasEstudio] = useState([]);

  useEffect(() => {
  // Construir los últimos 30 días desde localStorage
  const dias30 = Array(30).fill(0).map((_, i) => {
    const d = new Date(Date.now() - (29 - i) * 86400000);
    const fecha = d.toLocaleDateString("es-MX", { day: "2-digit", month: "short" });
    const key = `lifehud_study_${d.toISOString().split("T")[0]}`;
    const minutos = parseInt(localStorage.getItem(key) || "0");
    return { fecha, minutos };
  });
  setDiasEstudio(dias30);
}, []);
  const [showFormCurso, setShowFormCurso] = useState(false);
  const [showFormSkill, setShowFormSkill] = useState(false);
  const [newSkill, setNewSkill] = useState({ name: "", category: "programming", target_hours: "" });

  const crearSkill = async () => {
    if (!newSkill.name.trim()) return;
    try {
      const res = await api.learning.crearSkill({
        name:         newSkill.name,
        category:     newSkill.category,
        target_hours: parseFloat(newSkill.target_hours) || null,
      });
      setSkills(prev => [...prev, {
        id:     res.id,
        name:   res.name,
        icon:   "💡",
        level:  "Principiante",
        xp:     0,
        xpNext: 3000,
        hours:  0,
        color:  "#06B6D4",
      }]);
      setNewSkill({ name: "", category: "programming", target_hours: "" });
      setShowFormSkill(false);
      setToast({ msg: `💡 Skill "${res.name}" creada`, color: "#06B6D4" });
    } catch (e) {
      setToast({ msg: `❌ Error: ${e.message}`, color: "#EF4444" });
    }
  };
  const [moduloExpandido, setModuloExpandido] = useState(null);
  const [nuevaLeccionTexto, setNuevaLeccionTexto] = useState("");
  const [newCurso, setNewCurso] = useState({ name: "", platform: "", url: "", total_lessons: 0 });
  const [libros, setLibros] = useState([]);
  const [showFormLibro, setShowFormLibro] = useState(false);
  const [newLibro, setNewLibro] = useState({ title: "", author: "", total_pages: "", notes: "" });

  useEffect(() => {
    api.learning.libros()
      .then(data => setLibros(data || []))
      .catch(() => {});
  }, []);

  const crearLibro = async () => {
    if (!newLibro.title.trim()) return;
    try {
      const res = await api.learning.crearLibro({
        title:       newLibro.title,
        author:      newLibro.author || null,
        total_pages: parseInt(newLibro.total_pages) || null,
        notes:       newLibro.notes || null,
      });
      setLibros(prev => [...prev, res]);
      setNewLibro({ title: "", author: "", total_pages: "", notes: "" });
      setShowFormLibro(false);
      setToast({ msg: `📚 "${res.title}" agregado`, color: "#06B6D4" });
    } catch (e) {
      setToast({ msg: `❌ Error: ${e.message}`, color: "#EF4444` });
    }
  };

  const eliminarLibro = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/v1/learning/books/${id}`, {
        method: `DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("life_hud_token")}` }
      });
      if (!res.ok && res.status !== 204) throw new Error(`Error ${res.status}`);
      setLibros(prev => prev.filter(b => b.id !== id));
      setToast({ msg: "🗑️ Libro eliminado", color: "#EF4444" });
    } catch (e) {
      setToast({ msg: `❌ Error: ${e.message}`, color: "#EF4444" });
    }
  };

  const eliminarCurso = async (id, nombre) => {
    if (!window.confirm(`¿Eliminar "${nombre}`?`)) return;
    try {
      await fetch(`${API_URL}/api/v1/learning/courses/${id}`, {
        method: `DELETE",
        headers: { "Authorization": `Bearer ${localStorage.getItem("life_hud_token")}` }
      });
      setCursos(prev => prev.filter(c => c.id !== id));
      if (selectedCurso?.id === id) setSelectedCurso(null);
      setToast({ msg: "🗑️ Curso eliminado", color: "#EF4444" });
    } catch (e) {
      setToast({ msg: `❌ Error: ${e.message}`, color: "#EF4444" });
    }
  };

  const crearCurso = async () => {
    if (!newCurso.name.trim()) return;
    try {
      const res = await api.learning.crearCurso({
        name:         newCurso.name,
        platform:     newCurso.platform || null,
        url:          newCurso.url || null,
        total_lessons: parseInt(newCurso.total_lessons) || 0,
      });
      setCursos(prev => [...prev, {
        id:       res.id,
        name:     res.name,
        platform: res.platform || res.provider || "Otro",
        icon:     "🎓",
        progress: 0,
        lessons:  res.total_lessons || 0,
        done:     0,
        color:    "#7C3AED",
        modulos:  [],
      }]);
      setNewCurso({ name: "", platform: "", url: "", total_lessons: 0 });
      setShowFormCurso(false);
      setToast({ msg: `📚 Curso "${res.name}" agregado`, color: "#7C3AED" });
    } catch (e) {
      setToast({ msg: `❌ Error: ${e.message}`, color: "#EF4444" });
    }
  };

  const onSesionCompletada = async (vinculo, minutos) => {
    const tipo = vinculo?.tipo || null;
    const id   = vinculo?.id   || null;

    // 1) Guardar en backend + actualizar skill/curso en pantalla
    if (tipo) {
      try {
        await api.learning.iniciarSesion({
          duration_minutes:    minutos,
          pomodoros_completed: Math.floor(minutos / 25),
          skill_id:  tipo === "skill" ? id : null,
          course_id: tipo === "curso" ? id : null,
        });
      } catch (_) {}

      if (tipo === "curso") {
        setCursos(prev => prev.map(c =>
          c.id === id ? { ...c, progress: Math.min(c.progress + 3, 100) } : c
        ));
      } else {
        // Actualizar horas en pantalla Y persistir en localStorage
        setSkills(prev => prev.map(s => {
          if (s.id !== id) return s;
          const nuevasHoras = +(s.hours + minutos / 60).toFixed(2);
          const nuevoXp    = s.xp + Math.round(minutos * 2);
          // Guardar horas acumuladas localmente para sobrevivir recargas
          const lsKey = `lifehud_skill_hours_${id}`;
          localStorage.setItem(lsKey, nuevasHoras);
          return { ...s, hours: nuevasHoras, xp: nuevoXp };
        }));
      }
    }

    // 2) SIEMPRE guardar al mapa de estudio (con o sin vínculo)
    const hoy = new Date().toISOString().split("T")[0];
    const mapaKey = `lifehud_study_${hoy}`;
    localStorage.setItem(mapaKey, parseInt(localStorage.getItem(mapaKey) || "0") + minutos);

    // 3) Actualizar cuadro de hoy en el mapa visual inmediatamente
    setDiasEstudio(prev => prev.map((d, i) =>
      i === prev.length - 1 ? { ...d, minutos: d.minutos + minutos } : d
    ));

    const etiquetaToast = tipo
      ? `en ${tipo === "curso" ? "curso" : "skill"}`
      : "en mapa de estudio";
    setToast({ msg: `🍅 +${minutos}min registrados ${etiquetaToast}`, color: "#10B981" });
  };

  const agregarModulo = (cursoId, nombreModulo) => {
  if (!nombreModulo.trim()) return;
  setCursos(prev => {
    const actualizados = prev.map(c => {
      if (c.id !== cursoId) return c;
      const nuevoMod = { id: Date.now(), nombre: nombreModulo, lecciones: [] };
      const nuevoCurso = { ...c, modulos: [...(c.modulos || []), nuevoMod] };
      // Guardar en localStorage
      localStorage.setItem(`lifehud_modulos_${cursoId}`, JSON.stringify(nuevoCurso.modulos));
      return nuevoCurso;
    });
    return actualizados;
  });
};

  const agregarLeccion = (cursoId, moduloId, tituloLeccion) => {
    if (!tituloLeccion.trim()) return;
    setCursos(prev => prev.map(c => {
      if (c.id !== cursoId) return c;
      const modulos = (c.modulos || []).map(m => {
        if (m.id !== moduloId) return m;
        const nuevaLec = { id: Date.now(), titulo: tituloLeccion, done: false };
        return { ...m, lecciones: [...m.lecciones, nuevaLec] };
      });
      const totalL = modulos.flatMap(m => m.lecciones).length;
      const doneL = modulos.flatMap(m => m.lecciones).filter(l => l.done).length;
      return { ...c, modulos, lessons: totalL, done: doneL };
    }));
  };

  const toggleLeccion = (cursoId, moduloId, leccionId) => {
  setCursos(prev => {
    const actualizados = prev.map(c => {
      if (c.id !== cursoId) return c;
      const modulos = c.modulos.map(m => m.id !== moduloId ? m : {
        ...m,
        lecciones: m.lecciones.map(l => l.id !== leccionId ? l : { ...l, done: !l.done }),
      });
      const totalL = modulos.flatMap(m => m.lecciones).length;
      const doneL  = modulos.flatMap(m => m.lecciones).filter(l => l.done).length;
      // Guardar en localStorage
      localStorage.setItem(`lifehud_modulos_${cursoId}`, JSON.stringify(modulos));
      return { ...c, modulos, progress: Math.round((doneL / totalL) * 100), done: doneL, lessons: totalL };
    });
    return actualizados;
  });
};

  const agregarFlashcard = async () => {
    if (!newFlash.front || !newFlash.back) return;
    // Requiere skill_id obligatorio
    const skillId = newFlash.skillId || skills[0]?.id || null;
    if (!skillId) {
      setToast({ msg: "⚠️ Crea una skill primero para asociar la flashcard", color: "#F59E0B" });
      return;
    }
    try {
      const res = await api.learning.crearFlashcard({
        skill_id:   skillId,
        question:   newFlash.front,
        answer:     newFlash.back,
        difficulty: newFlash.difficulty || "medium",
      });
      setFlashcards(prev => [...prev, {
        id:    res.id,
        front: res.question,
        back:  res.answer,
        deck:  newFlash.deck,
        due:   true,
      }]);
      setNewFlash({ front: "", back: "", deck: newFlash.deck });
      setToast({ msg: `🃏 Flashcard agregada a ${newFlash.deck}`, color: "#F59E0B" });
    } catch (e) {
      setToast({ msg: `❌ Error: ${e.message}`, color: "#EF4444" });
    }
  };

  const diasActivos = diasEstudio.filter(d => d.minutos > 0).length;
  const minutosTotales = diasEstudio.reduce((a, d) => a + d.minutos, 0);
  const rachaActual = (() => {
    let racha = 0;
    for (let i = diasEstudio.length - 1; i >= 0; i--) {
      if (diasEstudio[i].minutos > 0) racha++;
      else break;
    }
    return racha;
  })();

  if (cargando) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 14 }}>
      <div style={{ width: 40, height: 40, borderRadius: "50%", border: "3px solid #1E1E30", borderTop: "3px solid #7C3AED", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontSize: 12, color: "#4A5568", letterSpacing: 2 }}>CARGANDO LEARNING...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {toast && <Toast msg={toast.msg} color={toast.color} onDone={() => setToast(null)} />}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { label: "Hoy", value: `${minutosTotales}m`, icon: "⏱️", color: "#7C3AED" },
          { label: "Racha actual", value: `${rachaActual}d`, icon: "🔥", color: "#EF4444" },
          { label: "Días activos", value: `${diasActivos}/30`, icon: "📅", color: "#10B981" },
          { label: "Flashcards pend.", value: flashcards.filter(f => f.due).length, icon: "🃏", color: "#F59E0B" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: "14px 16px", borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { k: "cursos",    l: "🎓 Cursos" },
          { k: "pomodoro",  l: "⏱️ Pomodoro" },
          { k: "mapa",      l: "📅 Mapa de Estudio" },
          { k: "flashcards",l: "🃏 Flashcards" },
          { k: "libros",    l: "📖 Libros" },
          { k: "skills",    l: "🧠 Skills" },
          { k: "roadmap",   l: "🗺️ Roadmap" },
          { k: "notas",     l: "📝 Notas" },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={tab === t.k ? "btn-primary" : "btn-secondary"}
            style={{ fontSize: 12 }}>{t.l}</button>
        ))}
      </div>    

      {/* ── CURSOS ── */}
      {tab === "cursos" && (
        <div style={{ display: "grid", gridTemplateColumns: selectedCurso ? "1fr 380px" : "1fr 1fr 1fr", gap: 16 }}>
          <div style={{ display: selectedCurso ? "flex" : "grid", flexDirection: "column", gridTemplateColumns: selectedCurso ? undefined : "repeat(3,1fr)", gap: 14 }}>
            {/* Botón agregar curso */}
            <div className="card" onClick={() => setShowFormCurso(true)}
              style={{ padding: 16, borderTop: "3px solid #7C3AED", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 80, background: "rgba(124,58,237,0.04)", border: "1px dashed #3D2070" }}>
              <span style={{ fontSize: 24 }}>+</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#A78BFA" }}>Agregar curso</span>
            </div>
            {cursos.map(c => (
              <div key={c.id} className="card"
                onClick={() => setSelectedCurso(selectedCurso?.id === c.id ? null : c)}
                style={{ padding: 16, borderTop: `3px solid ${c.color}`, cursor: "pointer", border: `1px solid ${selectedCurso?.id === c.id ? c.color + "50" : "#1E1E30"}`, background: selectedCurso?.id === c.id ? `${c.color}08` : "#0F0F18" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                  <span style={{ fontSize: 30 }}>{c.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "#64748B" }}>{c.platform}</div>
                  </div>
                  <span style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 700, color: c.color }}>{c.progress}%</span>
                  <button onClick={e => { e.stopPropagation(); eliminarCurso(c.id, c.name); }}
                    style={{ background: "none", border: "none", color: "#4A5568", cursor: "pointer", fontSize: 14, padding: "2px 4px", marginLeft: 4 }}>🗑️</button>
                </div>
                <ProgressBar value={c.progress} max={100} color={c.color} height={7} />
                <div style={{ fontSize: 11, color: "#64748B", marginTop: 6 }}>{c.done}/{c.lessons} lecciones</div>
              </div>
            ))}
          </div>

          {/* Panel módulos */}
          {selectedCurso && (() => {
            const c = cursos.find(x => x.id === selectedCurso.id);
            if (!c) return null;
            return (
              <div className="card" style={{ padding: 18, borderTop: `3px solid ${c.color}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  <div>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>{c.name}</div>
                    <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>📋 Módulos y lecciones</div>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => {
                    const nom = window.prompt("Nombre del módulo:");
                    if (nom) agregarModulo(c.id, nom);
                  }} className="btn-secondary" style={{ fontSize: 11, padding: "4px 10px" }}>+ Módulo</button>
                  <button onClick={() => setSelectedCurso(null)} style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: 18 }}>✕</button>
                </div>
                </div>
                {(c.modulos || []).length === 0 && (
                  <div style={{ textAlign: "center", color: "#4A5568", fontSize: 12, padding: "12px 0" }}>Sin módulos. Agrega el primero:</div>
                )}
                {(c.modulos || []).map(mod => {
                  const doneL = mod.lecciones.filter(l => l.done).length;
                  const modKey = `${c.id}-${mod.id}`;
                  return (
                    <div key={mod.id} style={{ marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#CBD5E1" }}>📦 {mod.nombre}</div>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <span style={{ fontSize: 10, color: c.color, fontWeight: 700 }}>{doneL}/{mod.lecciones.length}</span>
                          <button onClick={() => setModuloExpandido(moduloExpandido === modKey ? null : modKey)}
                            style={{ background: "none", border: "none", color: "#4A5568", cursor: "pointer", fontSize: 14 }}>+</button>
                        </div>
                      </div>
                      {moduloExpandido === modKey && (
                        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                          <input placeholder="Título de lección" value={nuevaLeccionTexto} onChange={e => setNuevaLeccionTexto(e.target.value)}
                            style={{ flex: 1, fontSize: 11, padding: "4px 8px" }} />
                          <button onClick={() => { agregarLeccion(c.id, mod.id, nuevaLeccionTexto); setNuevaLeccionTexto(""); setModuloExpandido(null); }}
                            className="btn-primary" style={{ fontSize: 11, padding: "4px 8px" }}>✓</button>
                        </div>
                      )}
                      <ProgressBar value={doneL} max={Math.max(mod.lecciones.length, 1)} color={c.color} height={3} />
                      <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 4 }}>
                        {mod.lecciones.map(lec => (
                          <div key={lec.id}
                            onClick={e => { e.stopPropagation(); toggleLeccion(c.id, mod.id, lec.id); }}
                            style={{ display: "flex", gap: 8, alignItems: "center", padding: "7px 10px", borderRadius: 7, background: lec.done ? `${c.color}08` : "#0A0A12", border: `1px solid ${lec.done ? c.color + "25" : "#1A1A28"}`, cursor: "pointer", transition: "all 0.12s" }}>
                            <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${lec.done ? c.color : "#2D2D45"}`, background: lec.done ? c.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {lec.done && <span style={{ color: "white", fontSize: 9, fontWeight: 700 }}>✓</span>}
                            </div>
                            <span style={{ fontSize: 12, color: lec.done ? "#64748B" : "#CBD5E1", textDecoration: lec.done ? "line-through" : "none" }}>{lec.titulo}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      )}

      {/* ── POMODORO ── */}
      {tab === "pomodoro" && (
        <PomodoroMejorado cursos={cursos} skills={skills} onSesionCompletada={onSesionCompletada} />
      )}

      {/* ── MAPA DE ESTUDIO ── */}
      {tab === "mapa" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title">📅 Mapa de Estudio — Últimos 30 días</div>
            <div style={{ display: "flex", gap: 3, flexWrap: "wrap", marginBottom: 16 }}>
              {diasEstudio.map((d, i) => {
                const intensidad = d.minutos === 0 ? 0 : d.minutos < 30 ? 1 : d.minutos < 60 ? 2 : d.minutos < 90 ? 3 : 4;
                const colors = ["#1A1A28", "#312E81", "#5B21B6", "#7C3AED", "#A78BFA"];
                const isHoy = i === diasEstudio.length - 1;
                return (
                  <div key={i} title={`${d.fecha}: ${d.minutos > 0 ? d.minutos + " min" : "Sin estudio"}`}
                    style={{ width: 28, height: 28, borderRadius: 6, background: colors[intensidad], border: isHoy ? "2px solid #7C3AED" : "1px solid #1A1A28", cursor: "default", transition: "transform 0.1s", display: "flex", alignItems: "center", justifyContent: "center" }}
                    onMouseEnter={e => e.currentTarget.style.transform = "scale(1.2)"}
                    onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                    {d.minutos > 0 && <span style={{ fontSize: 8, color: "white", fontWeight: 700 }}>{d.minutos}m</span>}
                  </div>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 16 }}>
              <span style={{ fontSize: 11, color: "#64748B" }}>Menos</span>
              {["#1A1A28", "#312E81", "#5B21B6", "#7C3AED", "#A78BFA"].map((c, i) => (
                <div key={i} style={{ width: 16, height: 16, borderRadius: 3, background: c, border: "1px solid #2D2D45" }} />
              ))}
              <span style={{ fontSize: 11, color: "#64748B" }}>Más</span>
            </div>

            {/* Stats del mapa */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
              {[
                { label: "Racha actual", val: `${rachaActual} días`, color: "#EF4444", icon: "🔥" },
                { label: "Días activos", val: `${diasActivos}/30`, color: "#10B981", icon: "✅" },
                { label: "Total horas", val: `${Math.round(minutosTotales / 60)}h`, color: "#7C3AED", icon: "⏱️" },
                { label: "Promedio/día", val: `${Math.round(minutosTotales / 30)}m`, color: "#F59E0B", icon: "📊" },
              ].map((s, i) => (
                <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: "#0A0A12", border: `1px solid ${s.color}25` }}>
                  <div style={{ fontSize: 18, marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, fontWeight: 700, color: s.color }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: "#64748B" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Gráfica semanal */}
          <div className="card" style={{ padding: 20 }}>
            <div className="section-title">📊 Minutos de estudio — Esta semana</div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 120 }}>
              {diasEstudio.slice(-7).map((d, i) => {
                const pct = d.minutos / 120;
                const isHoy = i === 6;
                return (
                  <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 10, color: "#A78BFA", fontWeight: 700 }}>{d.minutos > 0 ? `${d.minutos}m` : ""}</div>
                    <div style={{ width: "100%", height: `${Math.max(pct * 90, d.minutos > 0 ? 6 : 0)}px`, borderRadius: "4px 4px 0 0", background: isHoy ? "#7C3AED" : "#4C1D95", opacity: isHoy ? 1 : 0.7, minHeight: d.minutos > 0 ? 4 : 0, transition: "all 0.3s" }} />
                    <div style={{ fontSize: 10, color: isHoy ? "#A78BFA" : "#64748B", fontWeight: isHoy ? 700 : 400 }}>
                      {(d.fecha || d.dia || "").charAt(0).toUpperCase() + (d.fecha || d.dia || "").slice(1, 3)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── ROADMAP ── */}
      {/* ── ROADMAP CON TRACKS ── */}
      {tab === "roadmap" && (() => {
        const track = ROADMAP_TRACKS[roadmapTrack];
        const nodos = track.nodos.map(nodo => {
          const key = `${roadmapTrack}_${nodo.id}`;
          const completado = !!roadmapProgreso[key];
          // desbloquear si el nodo que lo desbloquea ya está completado
          let bloqueado = nodo.bloqueado;
          if (bloqueado) {
            const desbloqueador = track.nodos.find(n => n.unlocks.includes(nodo.id) && roadmapProgreso[`${roadmapTrack}_${n.id}`]);
            if (desbloqueador) bloqueado = false;
          }
          return { ...nodo, completado, bloqueado };
        });
        const completados = nodos.filter(n => n.completado).length;
        const pctTotal = Math.round((completados / nodos.length) * 100);
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Selector de track */}
            <div className="card" style={{ padding: 16 }}>
              <div style={{ fontSize: 11, color: "#4A5568", fontFamily: "'Orbitron',monospace", letterSpacing: 1, marginBottom: 12 }}>ELIGE TU ÁREA DE APRENDIZAJE</div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {Object.entries(ROADMAP_TRACKS).map(([k, t]) => (
                  <button key={k} onClick={() => setRoadmapTrack(k)}
                    style={{ padding: "8px 14px", borderRadius: 20, border: `2px solid ${roadmapTrack === k ? t.color : "#2D2D45"}`, background: roadmapTrack === k ? `${t.color}18` : "transparent", color: roadmapTrack === k ? t.color : "#64748B", cursor: "pointer", fontSize: 13, fontWeight: roadmapTrack === k ? 700 : 400, transition: "all 0.15s", fontFamily: "'Rajdhani',sans-serif" }}>
                    {t.emoji} {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Header del track */}
            <div className="card" style={{ padding: "16px 20px", borderTop: `3px solid ${track.color}`, background: `linear-gradient(135deg,${track.color}08,#0F0F1A)` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 15, fontWeight: 700, color: "#F1F5F9" }}>{track.emoji} {track.label}</div>
                  <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>{track.desc}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 28, fontWeight: 900, color: track.color }}>{pctTotal}%</div>
                  <div style={{ fontSize: 11, color: "#4A5568" }}>{completados}/{nodos.length} skills</div>
                </div>
              </div>
              <div style={{ marginTop: 10 }}>
                <ProgressBar value={pctTotal} max={100} color={track.color} height={6} />
              </div>
            </div>

            {/* Nodos por nivel */}
            {["Fundamento", "Intermedio", "Avanzado", "Élite"].map(nivel => {
              const delNivel = nodos.filter(n => n.nivel === nivel);
              if (!delNivel.length) return null;
              const coloresNivel = { Fundamento: "#10B981", Intermedio: "#06B6D4", Avanzado: "#F59E0B", Élite: "#A78BFA" };
              const cn = coloresNivel[nivel];
              return (
                <div key={nivel}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div style={{ flex: 1, height: 1, background: `${cn}30` }} />
                    <span style={{ fontSize: 10, color: cn, fontWeight: 700, fontFamily: "'Orbitron',monospace", letterSpacing: 2 }}>{nivel.toUpperCase()}</span>
                    <div style={{ flex: 1, height: 1, background: `${cn}30` }} />
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                    {delNivel.map(nodo => (
                      <div key={nodo.id}
                        onClick={() => !nodo.bloqueado && toggleRoadmapNodo(nodo.id)}
                        style={{ flex: 1, minWidth: 150, maxWidth: 220, padding: "14px 16px", borderRadius: 14, background: nodo.completado ? `${nodo.color}15` : nodo.bloqueado ? "#09090F" : "#0F0F18", border: `2px solid ${nodo.completado ? nodo.color : nodo.bloqueado ? "#1A1A28" : nodo.color + "40"}`, cursor: nodo.bloqueado ? "default" : "pointer", opacity: nodo.bloqueado ? 0.4 : 1, transition: "all 0.2s" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 24 }}>{nodo.emoji}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: nodo.bloqueado ? "#4A5568" : "#F1F5F9", lineHeight: 1.2 }}>{nodo.name}</div>
                          </div>
                          <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${nodo.completado ? nodo.color : nodo.bloqueado ? "#2D2D45" : nodo.color + "60"}`, background: nodo.completado ? nodo.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 12 }}>
                            {nodo.completado ? "✓" : nodo.bloqueado ? "🔒" : ""}
                          </div>
                        </div>
                        <div style={{ fontSize: 10, color: "#4A5568", lineHeight: 1.4 }}>{nodo.desc}</div>
                        <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontSize: 9, color: nodo.bloqueado ? "#2D2D45" : nodo.color, fontWeight: 700, fontFamily: "'Orbitron',monospace" }}>{nodo.horas}h estimadas</span>
                          {nodo.unlocks.length > 0 && !nodo.bloqueado && !nodo.completado && (
                            <span style={{ fontSize: 9, color: "#4A5568" }}>🔓 desbloquea {nodo.unlocks.length}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {/* Instrucciones */}
            <div style={{ textAlign: "center", fontSize: 11, color: "#2D2D45", padding: "4px 0" }}>
              Haz clic en un skill para marcarlo como completado · Los skills bloqueados se desbloquean al completar sus prerequisitos
            </div>
          </div>
        );
      })()}

      {/* ── NOTAS ── */}
      {tab === "notas" && (
        <div style={{ display: "grid", gridTemplateColumns: notaActiva ? "320px 1fr" : "1fr", gap: 16 }}>

          {/* Panel izquierdo: lista de notas */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Buscador + botón nueva */}
            <div style={{ display: "flex", gap: 8 }}>
              <input
                placeholder="🔍 Buscar notas..."
                value={notaBuscador}
                onChange={e => setNotaBuscador(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", fontSize: 12 }}
              />
              <button className="btn-primary" style={{ fontSize: 12, whiteSpace: "nowrap" }}
                onClick={() => { setShowFormNota(true); setNotaActiva(null); }}>
                + Nueva
              </button>
            </div>

            {/* Formulario nueva nota */}
            {showFormNota && (
              <div className="card" style={{ padding: 16, border: "1px solid rgba(124,58,237,0.3)" }}>
                <div style={{ fontSize: 11, color: "#A78BFA", fontFamily: "'Orbitron',monospace", marginBottom: 12 }}>NUEVA NOTA</div>
                <input
                  placeholder="Título de la nota"
                  value={formNota.titulo}
                  onChange={e => setFormNota(p => ({ ...p, titulo: e.target.value }))}
                  style={{ width: "100%", marginBottom: 8, padding: "7px 10px", fontSize: 13 }}
                />
                {/* Selector de tag */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
                  {NOTA_TAGS.map(tag => (
                    <button key={tag} onClick={() => setFormNota(p => ({ ...p, tag }))}
                      style={{ padding: "3px 10px", borderRadius: 999, border: `1px solid ${formNota.tag === tag ? "#7C3AED" : "#2D2D45"}`, background: formNota.tag === tag ? "rgba(124,58,237,0.2)" : "transparent", color: formNota.tag === tag ? "#A78BFA" : "#4A5568", cursor: "pointer", fontSize: 11, fontFamily: "'Rajdhani',sans-serif" }}>
                      {tag}
                    </button>
                  ))}
                </div>
                {/* Selector de color */}
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  {NOTA_COLORS.map(c => (
                    <div key={c} onClick={() => setFormNota(p => ({ ...p, color: c }))}
                      style={{ width: 18, height: 18, borderRadius: 4, background: c, cursor: "pointer", border: formNota.color === c ? "2px solid #F1F5F9" : "2px solid transparent", transition: "border 0.1s" }} />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn-secondary" style={{ flex: 1, fontSize: 12 }} onClick={() => setShowFormNota(false)}>Cancelar</button>
                  <button className="btn-primary" style={{ flex: 2, fontSize: 12 }} onClick={guardarNota} disabled={!formNota.titulo.trim()}>Crear nota</button>
                </div>
              </div>
            )}

            {/* Lista de notas */}
            {notas
              .filter(n => !notaBuscador || n.titulo.toLowerCase().includes(notaBuscador.toLowerCase()) || n.contenido?.toLowerCase().includes(notaBuscador.toLowerCase()))
              .map(nota => (
                <div key={nota.id}
                  onClick={() => { setNotaActiva(nota); setShowFormNota(false); }}
                  style={{ padding: "12px 14px", borderRadius: 12, background: notaActiva?.id === nota.id ? `${nota.color}15` : "#0F0F18", border: `2px solid ${notaActiva?.id === nota.id ? nota.color : "#1A1A28"}`, cursor: "pointer", borderLeft: `4px solid ${nota.color}`, transition: "all 0.15s" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9", marginBottom: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{nota.titulo}</div>
                      <div style={{ fontSize: 10, color: "#4A5568", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {nota.contenido ? nota.contenido.substring(0, 60) + (nota.contenido.length > 60 ? "..." : "") : "Sin contenido aún"}
                      </div>
                    </div>
                    <button onClick={e => { e.stopPropagation(); eliminarNota(nota.id); }}
                      style={{ background: "none", border: "none", color: "#2D2D45", cursor: "pointer", fontSize: 14, padding: "0 0 0 8px", flexShrink: 0 }}
                      onMouseEnter={e => e.currentTarget.style.color = "#EF4444"}
                      onMouseLeave={e => e.currentTarget.style.color = "#2D2D45"}>×</button>
                  </div>
                  <div style={{ display: "flex", gap: 6, marginTop: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 9, padding: "2px 7px", borderRadius: 999, background: `${nota.color}20`, color: nota.color, fontWeight: 700 }}>{nota.tag}</span>
                    <span style={{ fontSize: 9, color: "#2D2D45" }}>{nota.fecha}</span>
                  </div>
                </div>
              ))
            }

            {notas.length === 0 && !showFormNota && (
              <div style={{ textAlign: "center", color: "#2D2D45", padding: "30px 0", fontSize: 13 }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📝</div>
                Crea tu primera nota de estudio
              </div>
            )}
          </div>

          {/* Panel derecho: editor de nota activa */}
          {notaActiva && (
            <div className="card" style={{ padding: 0, overflow: "hidden", borderTop: `3px solid ${notaActiva.color}` }}>
              {/* Barra superior del editor */}
              <div style={{ padding: "12px 18px", background: `${notaActiva.color}08`, borderBottom: "1px solid #1A1A28", display: "flex", alignItems: "center", gap: 10 }}>
                <input
                  value={notaActiva.titulo}
                  onChange={e => actualizarNota(notaActiva.id, "titulo", e.target.value)}
                  style={{ flex: 1, fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, background: "transparent", border: "none", outline: "none", color: "#F1F5F9" }}
                />
                <div style={{ display: "flex", gap: 5 }}>
                  {NOTA_TAGS.map(tag => (
                    <button key={tag} onClick={() => actualizarNota(notaActiva.id, "tag", tag)}
                      style={{ padding: "3px 9px", borderRadius: 999, border: `1px solid ${notaActiva.tag === tag ? notaActiva.color : "#2D2D45"}`, background: notaActiva.tag === tag ? `${notaActiva.color}20` : "transparent", color: notaActiva.tag === tag ? notaActiva.color : "#4A5568", cursor: "pointer", fontSize: 10, fontFamily: "'Rajdhani',sans-serif" }}>
                      {tag}
                    </button>
                  ))}
                </div>
                {/* Selector color inline */}
                <div style={{ display: "flex", gap: 4 }}>
                  {NOTA_COLORS.map(c => (
                    <div key={c} onClick={() => actualizarNota(notaActiva.id, "color", c)}
                      style={{ width: 14, height: 14, borderRadius: 3, background: c, cursor: "pointer", border: notaActiva.color === c ? "2px solid #F1F5F9" : "2px solid transparent" }} />
                  ))}
                </div>
              </div>

              {/* Área de escritura */}
              <textarea
                value={notaActiva.contenido || ""}
                onChange={e => actualizarNota(notaActiva.id, "contenido", e.target.value)}
                placeholder="Escribe aquí tus notas, apuntes, ideas, resúmenes...

Puedes usar formato de texto libre:
- Viñetas con el símbolo •
→ Flechas para flujos
# Títulos con #
[ ] Tareas pendientes
[x] Tareas completadas"
                style={{ width: "100%", minHeight: "60vh", padding: "20px 24px", background: "#080810", border: "none", outline: "none", color: "#F1F5F9", fontSize: 14, lineHeight: 1.8, resize: "none", fontFamily: "'Rajdhani',sans-serif", boxSizing: "border-box" }}
              />

              {/* Pie del editor */}
              <div style={{ padding: "8px 18px", background: "#0A0A12", borderTop: "1px solid #1A1A28", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 10, color: "#2D2D45" }}>
                  {notaActiva.contenido ? notaActiva.contenido.length : 0} caracteres · Guardado automáticamente
                </span>
                <span style={{ fontSize: 10, color: "#2D2D45" }}>Editado: {notaActiva.fecha}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── FLASHCARDS ── */}
      {tab === "flashcards" && (
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="card" style={{ padding: 18 }}>
              <div className="section-title">🃏 Repaso</div>
              <FlashcardViewer cards={flashcards} />
            </div>
            {/* Crear flashcard */}
            <div className="card" style={{ padding: 18 }}>
              <div className="section-title">+ Nueva Flashcard</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>Skill asociada *</div>
                  {skills.length === 0 ? (
                    <div style={{ fontSize: 12, color: "#EF4444", padding: "8px", borderRadius: 6, background: "rgba(239,68,68,0.08)" }}>
                      ⚠️ Crea una skill primero en el tab Skills
                    </div>
                  ) : (
                    <select value={newFlash.skillId} onChange={e => setNewFlash(f => ({...f, skillId: e.target.value}))} style={{ fontSize: 12 }}>
                      <option value="">-- Selecciona una skill --</option>
                      {skills.map(s => <option key={s.id} value={s.id}>💡 {s.name}</option>)}
                    </select>
                  )}
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>Dificultad</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[{v:"easy",l:"🟢 Fácil"},{v:"medium",l:"🟡 Media"},{v:"hard",l:"🔴 Difícil"}].map(o => (
                      <button key={o.v} onClick={() => setNewFlash(f => ({...f, difficulty: o.v}))}
                        className={newFlash.difficulty === o.v ? "btn-primary" : "btn-secondary"}
                        style={{ flex: 1, fontSize: 11, padding: "5px 4px" }}>{o.l}</button>
                    ))}
                  </div>
                </div>
                <textarea placeholder="❓ Pregunta (anverso)..." value={newFlash.front}
                  onChange={e => setNewFlash(f => ({ ...f, front: e.target.value }))}
                  style={{ minHeight: 70, resize: "vertical", fontSize: 12 }} />
                <textarea placeholder="✅ Respuesta (reverso)..." value={newFlash.back}
                  onChange={e => setNewFlash(f => ({ ...f, back: e.target.value }))}
                  style={{ minHeight: 70, resize: "vertical", fontSize: 12 }} />
                <button onClick={agregarFlashcard} className="btn-primary" style={{ fontSize: 13 }}
                  disabled={!newFlash.front || !newFlash.back || !newFlash.skillId}>
                  + Agregar tarjeta
                </button>
              </div>
            </div>
          </div>

          {/* Mazos */}
          <div className="card" style={{ padding: 18 }}>
            <div className="section-title">📦 Mazos por Skill</div>
            {skills.length === 0 ? (
              <div style={{ textAlign: "center", color: "#4A5568", fontSize: 12, padding: 20 }}>Crea skills para organizar tus flashcards</div>
            ) : skills.map(skill => {
              const dc = flashcards.filter(f => f.skillId === skill.id || f.deck === skill.name);
              const due = dc.filter(f => f.due).length;
              const deck = skill.name;
              return (
                <div key={skill.id} style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 14px", borderRadius: 10, background: "#0F0F18", border: `1px solid ${skill.color}30`, marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#F1F5F9", fontWeight: 700 }}>💡 {deck}</div>
                      <div style={{ fontSize: 11, color: "#64748B" }}>{dc.length} tarjetas en total</div>
                    </div>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      {due > 0 ? <span className="tag" style={{ background: "rgba(239,68,68,0.2)", color: "#EF4444" }}>{due} pend.</span>
                        : <span className="tag" style={{ background: "rgba(16,185,129,0.2)", color: "#10B981" }}>Al día ✓</span>}
                    </div>
                  </div>
                  {dc.slice(-3).map((f, i) => (
                    <div key={i} style={{ padding: "8px 12px", borderRadius: 8, background: "#0A0A12", border: "1px solid #1A1A28", marginBottom: 4, fontSize: 11 }}>
                      <div style={{ color: "#CBD5E1", marginBottom: 2 }}>❓ {f.front}</div>
                      <div style={{ color: "#64748B" }}>✅ {f.back}</div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── LIBROS ── */}
      {tab === "libros" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 13, color: "#94A3B8" }}>{libros.length} libros registrados</div>
            <button className="btn-primary" onClick={() => setShowFormLibro(true)} style={{ fontSize: 12 }}>+ Agregar libro</button>
          </div>
          {libros.length === 0 && (
            <div className="card" style={{ padding: 40, textAlign: "center", color: "#4A5568" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>📚</div>
              <div>Aún no tienes libros registrados</div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
            {libros.map(b => {
              const sc = { reading: "#06B6D4", completed: "#10B981", to_read: "#64748B", abandoned: "#EF4444" };
              const sl = { reading: "📖 Leyendo", completed: "✅ Listo", to_read: "📚 Pendiente", abandoned: "❌ Abandonado" };
              const status = b.status || "to_read";
              return (
                <div key={b.id} className="card" style={{ padding: 18, borderTop: `3px solid ${sc[status] || "#64748B"}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>{b.title}</div>
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{b.author || "Autor desconocido"}</div>
                      <span className="tag" style={{ background: `${sc[status]}20`, color: sc[status], marginTop: 6, display: "inline-block" }}>{sl[status]}</span>
                    </div>
                    <button onClick={() => { if(window.confirm(`¿Eliminar "${b.title}"?`)) eliminarLibro(b.id); }}
                      style={{ background: "none", border: "none", color: "#4A5568", cursor: "pointer", fontSize: 16, padding: 4 }}>🗑️</button>
                  </div>
                  {b.total_pages && (
                    <>
                      <ProgressBar value={b.pages_read || 0} max={b.total_pages} color={sc[status]} height={5} />
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 5, marginBottom: 8, color: "#64748B" }}>
                        <span>Pág. {b.pages_read || 0}</span>
                        <span>de {b.total_pages}</span>
                      </div>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <input type="number" placeholder="Pág. actual"
                          defaultValue={b.pages_read || 0}
                          min={0} max={b.total_pages}
                          id={`pages-${b.id}`}
                          style={{ width: "80px", fontSize: 12, padding: "4px 8px` }} />
                        <button onClick={async () => {
                          const input = document.getElementById(`pages-${b.id}`);
                          const pages = parseInt(input?.value || 0);
                          try {
                            await fetch(`${API_URL}/api/v1/learning/books/${b.id}/pages`, {
                              method: `PUT",
                              headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("life_hud_token")}` },
                              body: JSON.stringify({ pages_read: pages })
                            });
                            setLibros(prev => prev.map(lb => lb.id === b.id ? { ...lb, pages_read: pages } : lb));
                            setToast({ msg: `📖 Pág. ${pages} guardada`, color: sc[status] });
                          } catch(e) { setToast({ msg: "❌ Error al guardar", color: "#EF4444" }); }
                        }} className="btn-primary" style={{ fontSize: 11, padding: "4px 10px", flex: 1 }}>
                          Guardar
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          {showFormLibro && (
            <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowFormLibro(false)}>
              <div className="modal" style={{ width: 420 }}>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 20 }}>📚 Agregar Libro</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input placeholder="Título *" value={newLibro.title} onChange={e => setNewLibro(f => ({...f, title: e.target.value}))} style={{ fontSize: 14 }} />
                  <input placeholder="Autor" value={newLibro.author} onChange={e => setNewLibro(f => ({...f, author: e.target.value}))} style={{ fontSize: 13 }} />
                  <input type="number" placeholder="Total de páginas" value={newLibro.total_pages} onChange={e => setNewLibro(f => ({...f, total_pages: e.target.value}))} style={{ fontSize: 13 }} />
                  <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                    <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowFormLibro(false)}>Cancelar</button>
                    <button className="btn-primary" style={{ flex: 2 }} onClick={crearLibro} disabled={!newLibro.title.trim()}>✓ Agregar</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── SKILLS ── */}
      {tab === "skills" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: "#94A3B8" }}>{skills.length} skills registradas</div>
            <button className="btn-primary" style={{ fontSize: 12 }} onClick={() => setShowFormSkill(true)}>+ Nueva Skill</button>
          </div>
          {skills.length === 0 && (
            <div className="card" style={{ padding: 40, textAlign: "center", color: "#4A5568" }}>
              <div style={{ fontSize: 40, marginBottom: 10 }}>💡</div>
              <div style={{ fontSize: 14, marginBottom: 6 }}>Sin skills registradas</div>
              <div style={{ fontSize: 12 }}>Crea una skill para trackear tus horas y XP (ej. Python, React, Inglés)</div>
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
          {skills.map(skill => (
            <div key={skill.id} className="card" style={{ padding: 18, borderTop: `3px solid ${skill.color}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                <span style={{ fontSize: 30 }}>{skill.icon}</span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#F1F5F9" }}>{skill.name}</div>
                  <span className="tag" style={{ background: `${skill.color}20`, color: skill.color }}>{skill.level}</span>
                </div>
              </div>
              <ProgressBar value={skill.xp} max={skill.xpNext} color={skill.color} height={8} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginTop: 8, marginBottom: 10 }}>
                <span style={{ color: "#64748B" }}>XP: {skill.xp}/{skill.xpNext}</span>
                <span style={{ color: skill.color, fontWeight: 700 }}>{skill.hours}h</span>
              </div>
              <button onClick={() => { setSkills(prev => prev.map(s => s.id === skill.id ? { ...s, hours: s.hours + 1, xp: s.xp + 120 } : s)); setToast({ msg: `+1h registrada en ${skill.name}`, color: skill.color }); }}
                className="btn-secondary" style={{ width: "100%", fontSize: 12 }}>
                + Registrar 1h de práctica
              </button>
            </div>
          ))}
          </div>
        </div>
      )}
      {showFormSkill && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowFormSkill(false)}>
          <div className="modal" style={{ width: 420 }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 20 }}>💡 Nueva Skill</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input placeholder="Nombre (ej. Python, React, Inglés)" value={newSkill.name}
                onChange={e => setNewSkill(f => ({...f, name: e.target.value}))} />
              <div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>Categoría</div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {[{v:"programming",l:"💻 Programación"},{v:"languages",l:"🌍 Idiomas"},{v:"professional",l:"💼 Profesional"},{v:"personal",l:"🧘 Personal"},{v:"creative",l:"🎨 Creativo"},{v:"health",l:"💪 Salud"}].map(o => (
                    <button key={o.v} onClick={() => setNewSkill(f => ({...f, category: o.v}))}
                      className={newSkill.category === o.v ? "btn-primary" : "btn-secondary"}
                      style={{ fontSize: 11, padding: "5px 10px" }}>{o.l}</button>
                  ))}
                </div>
              </div>
              <input type="number" placeholder="Horas objetivo (opcional)" value={newSkill.target_hours}
                onChange={e => setNewSkill(f => ({...f, target_hours: e.target.value}))} />
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowFormSkill(false)}>Cancelar</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={crearSkill} disabled={!newSkill.name.trim()}>✓ Crear Skill</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showFormCurso && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowFormCurso(false)}>
          <div className="modal" style={{ width: 440 }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 20 }}>📚 Nuevo Curso</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <input placeholder="Nombre del curso *" value={newCurso.name}
                onChange={e => setNewCurso(f => ({ ...f, name: e.target.value }))}
                style={{ fontSize: 14 }} />
              <input placeholder="Plataforma (Udemy, YouTube, etc.)" value={newCurso.platform}
                onChange={e => setNewCurso(f => ({ ...f, platform: e.target.value }))}
                style={{ fontSize: 13 }} />
              <input placeholder="URL del curso (opcional)" value={newCurso.url}
                onChange={e => setNewCurso(f => ({ ...f, url: e.target.value }))}
                style={{ fontSize: 13 }} />
              <div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>Total de lecciones</div>
                <input type="number" placeholder="0" value={newCurso.total_lessons}
                  onChange={e => setNewCurso(f => ({ ...f, total_lessons: e.target.value }))}
                  style={{ fontSize: 13, width: "100%", boxSizing: "border-box" }} />
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowFormCurso(false)}>Cancelar</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={crearCurso} disabled={!newCurso.name.trim()}>
                  ✓ Agregar Curso
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// PÁGINA: FITNESS (versión mejorada)
// ============================================================

const DIAS_SEMANA = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const PLAN_SEMANAL_BASE = [
  { dia: "Lun", tipo: "gym", rutina: "Push Day" },
  { dia: "Mar", tipo: "calistenia", rutina: "Upper Body" },
  { dia: "Mié", tipo: "gym", rutina: "Pull Day" },
  { dia: "Jue", tipo: "calistenia", rutina: "Core & Skills" },
  { dia: "Vie", tipo: "gym", rutina: "Leg Day" },
  { dia: "Sáb", tipo: "calistenia", rutina: "Piernas" },
  { dia: "Dom", tipo: "descanso", rutina: "Descanso" },
];

// Genera plan semanal según perfil de fitness
const generarPlanDesdePerfilFitness = (perfil) => {
  const dias = ["Lun","Mar","Mié","Jue","Vie","Sáb","Dom"];
  const metodo = perfil.training_method; // gym | calisthenics | hybrid
  const split  = perfil.split_type;     // ppl | upper_lower | full_body | bro_split
  const numDias = perfil.training_days_per_week || 5;

  const tipoRutina = (metodo) => {
    if (metodo === "gym")          return "gym";
    if (metodo === "calisthenics") return "calistenia";
    return "hybrid"; // alterna
  };

  // Plantillas de splits
  const splits = {
    ppl: [
      { tipo: tipoRutina(metodo), rutina: metodo === "calisthenics" ? "Upper Body" : "Push Day" },
      { tipo: tipoRutina(metodo), rutina: metodo === "calisthenics" ? "Upper Body" : "Pull Day" },
      { tipo: tipoRutina(metodo), rutina: "Piernas" },
      { tipo: tipoRutina(metodo), rutina: metodo === "calisthenics" ? "Core & Skills" : "Push Day" },
      { tipo: tipoRutina(metodo), rutina: metodo === "calisthenics" ? "Upper Body" : "Pull Day" },
      { tipo: tipoRutina(metodo), rutina: "Piernas" },
    ],
    upper_lower: [
      { tipo: tipoRutina(metodo), rutina: metodo === "calisthenics" ? "Upper Body" : "Push Day" },
      { tipo: tipoRutina(metodo), rutina: "Piernas" },
      { tipo: tipoRutina(metodo), rutina: metodo === "calisthenics" ? "Core & Skills" : "Pull Day" },
      { tipo: tipoRutina(metodo), rutina: "Piernas" },
    ],
    full_body: [
      { tipo: tipoRutina(metodo), rutina: metodo === "calisthenics" ? "Upper Body" : "Push Day" },
      { tipo: tipoRutina(metodo), rutina: metodo === "calisthenics" ? "Upper Body" : "Pull Day" },
      { tipo: tipoRutina(metodo), rutina: metodo === "calisthenics" ? "Core & Skills" : "Push Day" },
    ],
    bro_split: [
      { tipo: "gym", rutina: "Push Day" },
      { tipo: "gym", rutina: "Pull Day" },
      { tipo: "gym", rutina: "Leg Day" },
      { tipo: "calistenia", rutina: "Core & Skills" },
      { tipo: "gym", rutina: "Push Day" },
    ],
  };

  const template = splits[split] || splits.ppl;

  return dias.map((dia, i) => {
    if (i < numDias) {
      const rutina = template[i % template.length];
      return { dia, tipo: rutina.tipo, rutina: rutina.rutina };
    }
    return { dia, tipo: "descanso", rutina: "Descanso" };
  });
};

// Mapa: nombre de ejercicio → qué músculos activa
const EJERCICIO_MUSCULO = {
  // Empuje (Push)
  "Press de Banca":        ["chest", "frontDelts", "triceps"],
  "Press Inclinado":       ["chest", "frontDelts", "triceps"],
  "Press Declinado":       ["chest", "triceps"],
  "Press Militar":         ["frontDelts", "triceps", "traps"],
  "Press Arnold":          ["frontDelts", "triceps"],
  "Elevaciones Laterales": ["frontDelts"],
  "Elevaciones Frontales": ["frontDelts"],
  "Fondos lastrados":      ["chest", "triceps", "frontDelts"],
  "Fondos":                ["chest", "triceps"],
  "Archer Push-ups":       ["chest", "frontDelts"],
  "Pike Push-ups":         ["frontDelts", "triceps"],
  "Flexiones":             ["chest", "triceps", "frontDelts"],
  "Extensiones Tríceps":   ["triceps"],
  "Press Francés":         ["triceps"],
  "Handstand Push-up":     ["frontDelts", "triceps", "traps"],
  "Handstand Hold":        ["frontDelts", "traps"],
  // Jalón (Pull)
  "Peso Muerto":           ["lats", "traps", "lowerBack", "glutes", "hamstrings"],
  "Dominadas lastradas":   ["lats", "biceps", "rearDelts"],
  "Dominadas":             ["lats", "biceps", "rearDelts"],
  "Remo con Barra":        ["lats", "traps", "rearDelts"],
  "Remo Mancuerna":        ["lats", "traps", "rearDelts"],
  "Remo Australiano":      ["lats", "traps", "rearDelts"],
  "Jalón al Pecho":        ["lats", "biceps"],
  "Face Pulls":            ["traps", "rearDelts"],
  "Curl Bíceps":           ["biceps", "forearms"],
  "Curl Martillo":         ["biceps", "forearms"],
  "One Arm Pull-up":       ["lats", "biceps"],
  "Front Lever":           ["lats", "abs"],
  "Back Lever":            ["chest", "lowerBack"],
  "Human Flag":            ["lats", "obliques"],
  "Muscle Up":             ["lats", "chest", "triceps"],
  // Piernas (Legs)
  "Sentadilla":            ["quads", "glutes", "lowerBack"],
  "Leg Press":             ["quads", "glutes"],
  "Romanian Deadlift":     ["hamstrings", "lowerBack", "glutes"],
  "Peso Muerto Rumano":    ["hamstrings", "lowerBack", "glutes"],
  "Leg Curl":              ["hamstrings"],
  "Pantorrillas":          ["calves"],
  "Calf Raises":           ["calves"],
  "Pistol Squat":          ["quads", "glutes"],
  "Jump Squats":           ["quads", "glutes", "calves"],
  "Nordic Curls":          ["hamstrings"],
  "Bulgarian Split":       ["quads", "glutes", "hamstrings"],
  "Zancadas":              ["quads", "glutes", "hamstrings"],
  "Hip Thrust":            ["glutes", "hamstrings"],
  // Core / Núcleo
  "L-Sit":                 ["abs", "quads"],
  "Hollow Body":           ["abs"],
  "Dragon Flag":           ["abs", "lowerBack"],
  "Ab Wheel":              ["abs", "lowerBack"],
  "Planche":               ["chest", "frontDelts", "abs"],
  "Plancha":               ["abs", "lowerBack"],
  "Crunches":              ["abs"],
  "Abdominales":           ["abs"],
  "Russian Twist":         ["obliques", "abs"],
};

const GYM_RUTINAS = [
  {
    id: "push", name: "Push Day", emoji: "🏋️", color: "#EF4444", dia: "Lun / Jue",
    ejercicios: [
      { id: 1, name: "Press de Banca", sets: 4, repsTarget: "8-10", weightTarget: "80kg", musculos: "Pecho" },
      { id: 2, name: "Press Inclinado", sets: 3, repsTarget: "10-12", weightTarget: "60kg", musculos: "Pecho Alto" },
      { id: 3, name: "Press Militar", sets: 4, repsTarget: "8-10", weightTarget: "50kg", musculos: "Hombros" },
      { id: 4, name: "Elevaciones Laterales", sets: 3, repsTarget: "12-15", weightTarget: "12kg", musculos: "Deltoides" },
      { id: 5, name: "Fondos lastrados", sets: 3, repsTarget: "10-12", weightTarget: "+20kg", musculos: "Tríceps" },
    ],
  },
  {
    id: "pull", name: "Pull Day", emoji: "🔱", color: "#06B6D4", dia: "Mar / Vie",
    ejercicios: [
      { id: 1, name: "Peso Muerto", sets: 4, repsTarget: "5", weightTarget: "140kg", musculos: "Espalda" },
      { id: 2, name: "Dominadas lastradas", sets: 4, repsTarget: "8", weightTarget: "+20kg", musculos: "Lats" },
      { id: 3, name: "Remo con Barra", sets: 3, repsTarget: "10", weightTarget: "80kg", musculos: "Espalda Media" },
      { id: 4, name: "Curl Bíceps", sets: 3, repsTarget: "12", weightTarget: "18kg", musculos: "Bíceps" },
      { id: 5, name: "Face Pulls", sets: 3, repsTarget: "15", weightTarget: "20kg", musculos: "Trapecio" },
    ],
  },
  {
    id: "legs", name: "Leg Day", emoji: "🦵", color: "#10B981", dia: "Miércoles",
    ejercicios: [
      { id: 1, name: "Sentadilla", sets: 5, repsTarget: "5", weightTarget: "120kg", musculos: "Cuádriceps" },
      { id: 2, name: "Leg Press", sets: 4, repsTarget: "12", weightTarget: "200kg", musculos: "Cuádriceps" },
      { id: 3, name: "Romanian Deadlift", sets: 3, repsTarget: "10", weightTarget: "100kg", musculos: "Isquios" },
      { id: 4, name: "Leg Curl", sets: 3, repsTarget: "12", weightTarget: "50kg", musculos: "Isquios" },
      { id: 5, name: "Pantorrillas", sets: 4, repsTarget: "20", weightTarget: "60kg", musculos: "Gemelos" },
    ],
  },
];

const CALI_RUTINAS = [
  {
    id: "upper", name: "Upper Body", emoji: "💪", color: "#7C3AED", dia: "Lun / Jue",
    ejercicios: [
      { id: 1, name: "Dominadas", sets: 4, repsTarget: "8-10", weightTarget: "Corporal", musculos: "Lats" },
      { id: 2, name: "Fondos", sets: 4, repsTarget: "12-15", weightTarget: "Corporal", musculos: "Pecho/Tríceps" },
      { id: 3, name: "Pike Push-ups", sets: 3, repsTarget: "10-12", weightTarget: "Corporal", musculos: "Hombros" },
      { id: 4, name: "Remo Australiano", sets: 3, repsTarget: "12", weightTarget: "Corporal", musculos: "Espalda" },
      { id: 5, name: "Archer Push-ups", sets: 3, repsTarget: "6 c/lado", weightTarget: "Corporal", musculos: "Pecho" },
    ],
  },
  {
    id: "core", name: "Core & Skills", emoji: "🧘", color: "#F59E0B", dia: "Mar / Sáb",
    ejercicios: [
      { id: 1, name: "L-Sit", sets: 5, repsTarget: "10-15s", weightTarget: "Corporal", musculos: "Core" },
      { id: 2, name: "Hollow Body", sets: 3, repsTarget: "30s", weightTarget: "Corporal", musculos: "Core" },
      { id: 3, name: "Dragon Flag", sets: 3, repsTarget: "5", weightTarget: "Corporal", musculos: "Core" },
      { id: 4, name: "Ab Wheel", sets: 3, repsTarget: "10", weightTarget: "Corporal", musculos: "Abdomen" },
      { id: 5, name: "Handstand Hold", sets: 5, repsTarget: "15-20s", weightTarget: "Corporal", musculos: "Hombros" },
    ],
  },
  {
    id: "legs_c", name: "Piernas", emoji: "🦵", color: "#10B981", dia: "Mié / Dom",
    ejercicios: [
      { id: 1, name: "Pistol Squat", sets: 4, repsTarget: "5 c/lado", weightTarget: "Corporal", musculos: "Cuádriceps" },
      { id: 2, name: "Jump Squats", sets: 3, repsTarget: "15", weightTarget: "Corporal", musculos: "Cuádriceps" },
      { id: 3, name: "Nordic Curls", sets: 3, repsTarget: "8", weightTarget: "Corporal", musculos: "Isquios" },
      { id: 4, name: "Calf Raises", sets: 4, repsTarget: "20", weightTarget: "Corporal", musculos: "Gemelos" },
      { id: 5, name: "Bulgarian Split", sets: 3, repsTarget: "10 c/lado", weightTarget: "Corporal", musculos: "Glúteos" },
    ],
  },
];

// Árbol de progresión de skills
const SKILL_TREE = [
  {
    id: "dominadas", name: "Dominadas", emoji: "🏋️", color: "#06B6D4", nivel: "Base",
    current: 12, goal: 20, unit: "reps", xp: 600,
    desc: "Base de todo el árbol de tracción",
    unlocks: ["dominadas_lastradas", "muscle_up"],
    desbloqueado: true,
  },
  {
    id: "fondos", name: "Fondos", emoji: "💪", color: "#7C3AED", nivel: "Base",
    current: 20, goal: 30, unit: "reps", xp: 500,
    desc: "Base del árbol de empuje",
    unlocks: ["fondos_lastrados", "muscle_up"],
    desbloqueado: true,
  },
  {
    id: "dominadas_lastradas", name: "Dominadas Lastradas", emoji: "⚙️", color: "#06B6D4", nivel: "Intermedio",
    current: 5, goal: 10, unit: "reps +20kg", xp: 750,
    desc: "Fuerza extra para el muscle up",
    unlocks: ["one_arm_pull"],
    desbloqueado: true,
  },
  {
    id: "fondos_lastrados", name: "Fondos Lastrados", emoji: "⛓️", color: "#7C3AED", nivel: "Intermedio",
    current: 5, goal: 10, unit: "reps +20kg", xp: 700,
    desc: "Prerequisito para muscle up",
    unlocks: ["muscle_up"],
    desbloqueado: true,
  },
  {
    id: "muscle_up", name: "Muscle Up", emoji: "⚡", color: "#F59E0B", nivel: "Avanzado",
    current: 2, goal: 5, unit: "reps", xp: 1200,
    desc: "Combinación de dominada + fondo",
    unlocks: ["muscle_up_archer"],
    desbloqueado: true,
  },
  {
    id: "handstand", name: "Handstand", emoji: "🤸", color: "#10B981", nivel: "Intermedio",
    current: 15, goal: 60, unit: "seg", xp: 800,
    desc: "Parada de manos estática",
    unlocks: ["hspu", "one_arm_hs"],
    desbloqueado: true,
  },
  {
    id: "hspu", name: "Handstand Push-up", emoji: "🔝", color: "#EF4444", nivel: "Avanzado",
    current: 3, goal: 10, unit: "reps", xp: 1000,
    desc: "Press de hombros invertido",
    unlocks: ["deficit_hspu"],
    desbloqueado: true,
  },
  {
    id: "deficit_hspu", name: "Deficit HSPU", emoji: "🔝🔥", color: "#EF4444", nivel: "Élite",
    current: 0, goal: 5, unit: "reps", xp: 1400,
    desc: "HSPU con rango de movimiento extendido",
    unlocks: [],
    desbloqueado: false,
  },
  {
    id: "one_arm_pull", name: "One Arm Pull-up", emoji: "🦾", color: "#EC4899", nivel: "Élite",
    current: 0, goal: 3, unit: "reps", xp: 1600,
    desc: "El rey de la tracción",
    unlocks: [],
    desbloqueado: false,
  },
  {
    id: "muscle_up_archer", name: "Archer Muscle Up", emoji: "🏹", color: "#F97316", nivel: "Élite",
    current: 0, goal: 3, unit: "reps", xp: 1500,
    desc: "Muscle up asimétrico",
    unlocks: [],
    desbloqueado: false,
  },
  {
    id: "one_arm_hs", name: "One Arm Handstand", emoji: "☝️", color: "#A78BFA", nivel: "Élite",
    current: 0, goal: 5, unit: "seg", xp: 2000,
    desc: "El pináculo del equilibrio",
    unlocks: [],
    desbloqueado: false,
  },
];

const HISTORIAL_MOCK = [
  {
    id: 1, fecha: "Hoy", tipo: "gym", rutina: "Push Day", emoji: "🏋️", color: "#EF4444",
    duracion: 65, volumen: 12400, ejercicios: 5, series: 17,
    log: [
      { name: "Press de Banca", series: [{ r: 10, w: 80 }, { r: 9, w: 80 }, { r: 8, w: 82 }, { r: 8, w: 82 }] },
      { name: "Press Inclinado", series: [{ r: 12, w: 60 }, { r: 10, w: 62 }, { r: 10, w: 62 }] },
    ],
  },
  {
    id: 2, fecha: "Ayer", tipo: "calistenia", rutina: "Core & Skills", emoji: "🧘", color: "#F59E0B",
    duracion: 40, volumen: 0, ejercicios: 5, series: 15,
    log: [
      { name: "L-Sit", series: [{ r: "12s" }, { r: "10s" }, { r: "8s" }, { r: "10s" }, { r: "12s" }] },
      { name: "Handstand Hold", series: [{ r: "18s" }, { r: "15s" }, { r: "20s" }, { r: "22s" }, { r: "16s" }] },
    ],
  },
  {
    id: 3, fecha: "Hace 2 días", tipo: "gym", rutina: "Pull Day", emoji: "🔱", color: "#06B6D4",
    duracion: 70, volumen: 18600, ejercicios: 5, series: 17,
    log: [],
  },
  {
    id: 4, fecha: "Hace 3 días", tipo: "calistenia", rutina: "Upper Body", emoji: "💪", color: "#7C3AED",
    duracion: 45, volumen: 0, ejercicios: 5, series: 17,
    log: [],
  },
  {
    id: 5, fecha: "Hace 4 días", tipo: "gym", rutina: "Leg Day", emoji: "🦵", color: "#10B981",
    duracion: 75, volumen: 24800, ejercicios: 5, series: 19,
    log: [],
  },
];

// Timer de descanso
const RestTimer = ({ onClose }) => {
  const [seconds, setSeconds] = useState(90);
  const [running, setRunning] = useState(true);
  const [initial, setInitial] = useState(90);
  const OPTIONS = [60, 90, 120, 180];

  useEffect(() => {
    if (!running || seconds <= 0) return;
    const t = setInterval(() => setSeconds(s => s - 1), 1000);
    return () => clearInterval(t);
  }, [running, seconds]);

  const pct = Math.max(0, (seconds / initial) * 100);
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ width: 320, textAlign: "center" }}>
        <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, color: "#A78BFA", marginBottom: 18, letterSpacing: 2 }}>⏱ DESCANSO</div>
        <div style={{ position: "relative", width: 140, height: 140, margin: "0 auto 20px" }}>
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="60" fill="none" stroke="#1A1A28" strokeWidth="10" />
            <circle cx="70" cy="70" r="60" fill="none"
              stroke={seconds <= 10 ? "#EF4444" : seconds <= 30 ? "#F59E0B" : "#7C3AED"}
              strokeWidth="10"
              strokeDasharray={`${2 * Math.PI * 60}`}
              strokeDashoffset={`${2 * Math.PI * 60 * (1 - pct / 100)}`}
              strokeLinecap="round"
              transform="rotate(-90 70 70)"
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 32, fontWeight: 900, color: seconds <= 10 ? "#EF4444" : "#F1F5F9" }}>
              {m}:{s.toString().padStart(2, "0")}
            </div>
            <div style={{ fontSize: 10, color: "#4A5568" }}>{running ? "descansando" : "pausado"}</div>
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginBottom: 16 }}>
          {OPTIONS.map(o => (
            <button key={o} onClick={() => { setSeconds(o); setInitial(o); setRunning(true); }}
              style={{ padding: "5px 10px", borderRadius: 6, border: `1px solid ${initial === o ? "#7C3AED" : "#2D2D45"}`, background: initial === o ? "rgba(124,58,237,0.2)" : "#0F0F18", color: initial === o ? "#A78BFA" : "#4A5568", cursor: "pointer", fontSize: 11, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700 }}>
              {o}s
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setRunning(r => !r)} className="btn-secondary" style={{ flex: 1, fontSize: 13 }}>
            {running ? "⏸ Pausar" : "▶ Reanudar"}
          </button>
          <button onClick={onClose} className="btn-primary" style={{ flex: 1, fontSize: 13 }}>✓ Listo</button>
        </div>
      </div>
    </div>
  );
};

// Log de entrenamiento activo
const WorkoutLog = ({ rutina, tipo, onFinish }) => {
  const [seriesLog, setSeriesLog] = useState(() =>
    rutina.ejercicios.reduce((acc, ej) => {
      acc[ej.id] = Array.from({ length: ej.sets }, (_, i) => ({ reps: "", weight: ej.weightTarget === "Corporal" ? "" : ej.weightTarget.replace("kg","").replace("+",""), done: false }));
      return acc;
    }, {})
  );
  const [showTimer, setShowTimer] = useState(false);
  const [startTime] = useState(Date.now());
  const [elapsed, setElapsed] = useState(0);
  const [showAddEj, setShowAddEj] = useState(false);
  const [newEj, setNewEj] = useState({ name: "", sets: 3, repsTarget: "10", weightTarget: "Corporal" });

  useEffect(() => {
    const t = setInterval(() => setElapsed(Math.floor((Date.now() - startTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [startTime]);

  const updateSerie = (ejId, setIdx, field, val) => {
    setSeriesLog(prev => ({
      ...prev,
      [ejId]: prev[ejId].map((s, i) => i === setIdx ? { ...s, [field]: val } : s),
    }));
  };

  const toggleSerie = (ejId, setIdx) => {
    const serie = seriesLog[ejId][setIdx];
    updateSerie(ejId, setIdx, "done", !serie.done);
    if (!serie.done) setShowTimer(true);
  };

  const totalDone = Object.values(seriesLog).flat().filter(s => s.done).length;
  const totalSeries = Object.values(seriesLog).flat().length;
  const elMin = Math.floor(elapsed / 60);
  const elSec = elapsed % 60;

  const agregarEjercicio = () => {
    if (!newEj.name) return;
    rutina.ejercicios.push({ id: Date.now(), name: newEj.name, sets: newEj.sets, repsTarget: newEj.repsTarget, weightTarget: newEj.weightTarget, musculos: "Custom" });
    setSeriesLog(prev => ({
      ...prev,
      [rutina.ejercicios[rutina.ejercicios.length - 1].id]: Array.from({ length: newEj.sets }, () => ({ reps: "", weight: "", done: false })),
    }));
    setNewEj({ name: "", sets: 3, repsTarget: "10", weightTarget: "Corporal" });
    setShowAddEj(false);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {showTimer && <RestTimer onClose={() => setShowTimer(false)} />}

      {/* Header del workout */}
      <div className="card" style={{ padding: "14px 18px", borderTop: `3px solid ${rutina.color}`, background: `linear-gradient(135deg,${rutina.color}08,#0F0F1A)` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span style={{ fontSize: 32 }}>{rutina.emoji}</span>
            <div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>{rutina.name}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                <span className="tag" style={{ background: `${rutina.color}20`, color: rutina.color }}>{tipo === "gym" ? "🏋️ Gimnasio" : "💪 Calistenia"}</span>
                <span className="tag" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>⏱ {elMin}:{elSec.toString().padStart(2, "0")}</span>
                <span className="tag" style={{ background: "rgba(245,158,11,0.1)", color: "#F59E0B" }}>📊 {totalDone}/{totalSeries} series</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setShowTimer(true)} className="btn-secondary" style={{ fontSize: 12 }}>⏱ Descanso</button>
            <button onClick={() => {
                const logFinal = rutina.ejercicios.map(ej => ({
                  name:   ej.name,
                  weight: (seriesLog[ej.id] || []).find(s => s.weight)?.weight || "",
                  reps:   (seriesLog[ej.id] || []).find(s => s.reps)?.reps   || "",
                  series: (seriesLog[ej.id] || []).map(s => ({ r: s.reps, w: s.weight })),
                })).filter(ej => ej.series.some(s => s.r || s.w));
                onFinish({ duracion: Math.floor(elapsed / 60), series: totalDone, log: logFinal });
              }} className="btn-success" style={{ fontSize: 12 }}>✓ Terminar</button>
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <ProgressBar value={totalDone} max={totalSeries} color={rutina.color} height={6} />
        </div>
      </div>

      {/* Ejercicios */}
      {rutina.ejercicios.map(ej => (
        <div key={ej.id} className="card" style={{ padding: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>{ej.name}</div>
              <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>
                {ej.sets} series · {ej.repsTarget} reps · objetivo: {ej.weightTarget}
                {ej.musculos && <span style={{ color: "#4A5568" }}> · {ej.musculos}</span>}
              </div>
            </div>
          </div>
          {/* Cabecera tabla */}
          <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr 80px", gap: 8, marginBottom: 6, padding: "0 4px" }}>
            {["#", tipo === "gym" ? "Peso (kg)" : "Reps/Tiempo", "Reps", ""].map((h, i) => (
              <div key={i} style={{ fontSize: 10, color: "#4A5568", textAlign: i > 0 ? "center" : "left" }}>{h}</div>
            ))}
          </div>
          {(seriesLog[ej.id] || []).map((serie, idx) => (
            <div key={idx} style={{ display: "grid", gridTemplateColumns: "40px 1fr 1fr 80px", gap: 8, marginBottom: 6, alignItems: "center", padding: "6px", borderRadius: 8, background: serie.done ? `${rutina.color}08` : "#0A0A12", border: `1px solid ${serie.done ? rutina.color + "30" : "#1A1A28"}`, transition: "all 0.15s" }}>
              <div style={{ fontSize: 12, color: serie.done ? rutina.color : "#4A5568", fontWeight: 700, textAlign: "center" }}>{idx + 1}</div>
              {tipo === "gym" ? (
                <input
                  type="number" placeholder={ej.weightTarget.replace("kg","").replace("+","")}
                  value={serie.weight}
                  onChange={e => updateSerie(ej.id, idx, "weight", e.target.value)}
                  style={{ textAlign: "center", padding: "5px", fontSize: 12, borderColor: serie.done ? rutina.color + "40" : undefined }}
                />
              ) : (
                <div style={{ fontSize: 12, color: "#64748B", textAlign: "center" }}>{ej.repsTarget}</div>
              )}
              <input
                type={tipo === "gym" ? "number" : "text"} placeholder={ej.repsTarget}
                value={serie.reps}
                onChange={e => updateSerie(ej.id, idx, "reps", e.target.value)}
                style={{ textAlign: "center", padding: "5px", fontSize: 12, borderColor: serie.done ? rutina.color + "40" : undefined }}
              />
              <button
                onClick={() => toggleSerie(ej.id, idx)}
                style={{ padding: "6px", borderRadius: 7, border: `1px solid ${serie.done ? rutina.color : "#2D2D45"}`, background: serie.done ? `${rutina.color}20` : "#0F0F18", color: serie.done ? rutina.color : "#4A5568", cursor: "pointer", fontSize: 13, fontWeight: 700, fontFamily: "'Rajdhani',sans-serif", transition: "all 0.15s" }}>
                {serie.done ? "✓ Hecho" : "Marcar"}
              </button>
            </div>
          ))}
        </div>
      ))}

      {/* Agregar ejercicio */}
      {showAddEj ? (
        <div className="card" style={{ padding: 16, border: "1px dashed #2D2D45" }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: "#4A5568", marginBottom: 12 }}>+ EJERCICIO EXTRA</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 80px 1fr", gap: 8, marginBottom: 10 }}>
            <input placeholder="Nombre del ejercicio" value={newEj.name} onChange={e => setNewEj(n => ({ ...n, name: e.target.value }))} />
            <input type="number" placeholder="Series" value={newEj.sets} onChange={e => setNewEj(n => ({ ...n, sets: parseInt(e.target.value) || 3 }))} />
            <input placeholder="Reps" value={newEj.repsTarget} onChange={e => setNewEj(n => ({ ...n, repsTarget: e.target.value }))} />
            <input placeholder="Peso/Corporal" value={newEj.weightTarget} onChange={e => setNewEj(n => ({ ...n, weightTarget: e.target.value }))} />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" style={{ flex: 1, fontSize: 12 }} onClick={() => setShowAddEj(false)}>Cancelar</button>
            <button className="btn-primary" style={{ flex: 2, fontSize: 12 }} onClick={agregarEjercicio} disabled={!newEj.name}>+ Agregar</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowAddEj(true)} style={{ padding: "12px", borderRadius: 10, border: "1px dashed #2D2D45", background: "transparent", color: "#4A5568", cursor: "pointer", fontSize: 13, fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#7C3AED"; e.currentTarget.style.color = "#A78BFA"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#2D2D45"; e.currentTarget.style.color = "#4A5568"; }}>
          + Agregar ejercicio extra
        </button>
      )}
    </div>
  );
};

const FitnessPage = ({ game, setGame }) => {
  const [tab, setTab] = useState("hoy");
  const [planSemanal, setPlanSemanal] = useState(PLAN_SEMANAL_BASE);
  const [historial, setHistorial] = useState([]);
  const [streak, setStreak] = useState(0);
  const [cargandoStats, setCargandoStats] = useState(true);
  const [records, setRecords] = useState([]);
  // Array con TODAS las fechas entrenadas (formato "YYYY-MM-DD")
  const [diasEntrenados, setDiasEntrenados] = useState(() => {
    try {
      const arr = JSON.parse(localStorage.getItem('lifehud_dias_entrenados') || '[]');
      // Migración: si tenía la clave vieja y el array está vacío, importar ese día
      if (arr.length === 0) {
        const viejo = localStorage.getItem('lifehud_fitness_hoy');
        if (viejo) return [viejo];
      }
      return arr;
    } catch { return []; }
  });

  // Derivado: ¿entrenó hoy?
  const hoyISO = new Date().toISOString().split('T')[0];
  const entrenadoHoy = diasEntrenados.includes(hoyISO);
  const [recordsLocales, setRecordsLocales] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifehud_records') || '[]'); }
    catch { return []; }
  });
  const [tienePerfil, setTienePerfil] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [perfilForm, setPerfilForm] = useState({
    training_method:      "hybrid",
    primary_goal:         "hypertrophy",
    training_days_per_week: 5,
    split_type:           "ppl",
    available_equipment:  ["pull_up_bar", "dumbbells"],
    experience_level:     "beginner",
  });
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  const guardarPerfil = async () => {
    setGuardandoPerfil(true);
    try {
      await fetch(`${API_URL}/api/v1/fitness/profile/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("life_hud_token")}`,
        },
        body: JSON.stringify(perfilForm),
      });
      setTienePerfil(true);
      setShowOnboarding(false);
      // Regenerar plan semanal con el nuevo perfil
      const planAdaptado = generarPlanDesdePerfilFitness(perfilForm);
      setPlanSemanal(planAdaptado);
    } catch (e) {
      console.error(e);
    } finally {
      setGuardandoPerfil(false);
    }
  };

  useEffect(() => {
    api.fitness.resumen()
      .then(data => setStreak(data.current_streak || data.streak || 0))
      .catch(() => {})
      .finally(() => setCargandoStats(false));

    // Cargar perfil de fitness y adaptar plan semanal
    fetch(`${API_URL}/api/v1/fitness/profile`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("life_hud_token")}` }
    })
    .then(async r => {
      if (r.status === 404) {
        setTienePerfil(false);
        setShowOnboarding(true);
        return;
      }
      const perfil = await r.json();
      setTienePerfil(true);
      // Actualizar form con datos del perfil guardado
      setPerfilForm({
        training_method:        perfil.training_method       || "hybrid",
        primary_goal:           perfil.primary_goal          || "hypertrophy",
        training_days_per_week: perfil.training_days_per_week|| 5,
        split_type:             perfil.split_type            || "ppl",
        available_equipment:    perfil.available_equipment   || ["pull_up_bar"],
        experience_level:       perfil.experience_level      || "beginner",
      });
      // Adaptar plan semanal al perfil
      const planAdaptado = generarPlanDesdePerfilFitness(perfil);
      setPlanSemanal(planAdaptado);
    })
    .catch(() => {});

    api.fitness.records()
      .then(data => { if (Array.isArray(data) && data.length) setRecords(data); })
      .catch(() => {});

    api.fitness.workouts({ limit: 10 })
      .then(data => {
        const lista = data?.workouts || data || [];
        if (lista.length > 0) {
          const mapeados = lista.map(w => ({
            id:        w.id,
            fecha:     w.workout_date,
            tipo:      w.training_method || "gym",
            rutina:    w.name,
            emoji:     w.workout_type === "push" ? "💪" : w.workout_type === "pull" ? "🔙" : w.workout_type === "legs" ? "🦵" : "🏋️",
            color:     "#7C3AED",
            duracion:  w.duration_minutes || 0,
            series:    w.total_sets || 0,
            volumen:   w.total_volume || 0,
            ejercicios: 0,
            log:       [],
          }));
          setHistorial(mapeados);
        }
      })
      .catch(() => {});
  }, []);
  // Rutinas personalizadas — guardadas en localStorage
  const [rutinasCustom, setRutinasCustom] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifehud_rutinas') || '[]'); }
    catch { return []; }
  });
  const [showFormRutina, setShowFormRutina] = useState(false);
  const [formRutina, setFormRutina] = useState({ name: '', emoji: '🏋️', tipo: 'gym', color: '#7C3AED', ejercicios: [] });
  const [formEjercicio, setFormEjercicio] = useState({ name: '', sets: 3, repsTarget: '10', weightTarget: '' });
  const [workoutActivo, setWorkoutActivo] = useState(false);
  const [rutinaActiva, setRutinaActiva] = useState(null);
  const [tipoActivo, setTipoActivo] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [toast, setToast] = useState(null);
  // Skills personalizadas + progreso del SKILL_TREE — guardados en localStorage
  const [skillsCustom, setSkillsCustom] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifehud_skills_fitness') || '[]'); }
    catch { return []; }
  });
  const [skillsProgress, setSkillsProgress] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifehud_skills_progress') || '{}'); }
    catch { return {}; }
  });
  const [showFormSkillF, setShowFormSkillF] = useState(false);
  const [formSkillF, setFormSkillF] = useState({ name: '', emoji: '⚡', nivel: 'Base', unit: 'reps', goal: 10, color: '#7C3AED', desc: '' });
  // Calcula la activación muscular de los últimos 7 días
  const calcularHeatmapSemana = () => {
    const musculos = {
      chest: 0, frontDelts: 0, biceps: 0, forearms: 0, abs: 0, obliques: 0, quads: 0, calves: 0,
      traps: 0, rearDelts: 0, lats: 0, triceps: 0, lowerBack: 0, glutes: 0, hamstrings: 0,
    };
    const ejerciciosPorMusculo = {};
    Object.keys(musculos).forEach(k => { ejerciciosPorMusculo[k] = []; });

    const haceSiete = new Date();
    haceSiete.setDate(haceSiete.getDate() - 7);

    let histMuscular = [];
    try { histMuscular = JSON.parse(localStorage.getItem('lifehud_historial_muscular') || '[]'); } catch {}

    histMuscular.forEach(w => {
      if (new Date(w.fecha) >= haceSiete) {
        (w.ejercicios || []).forEach(ej => {
          const muscs = EJERCICIO_MUSCULO[ej.name] || [];
          const sets = ej.series?.length || 3;
          muscs.forEach(m => {
            if (musculos[m] !== undefined) {
              musculos[m] = Math.min(100, musculos[m] + sets * 20);
              if (!ejerciciosPorMusculo[m].includes(ej.name)) {
                ejerciciosPorMusculo[m].push(ej.name);
              }
            }
          });
        });
      }
    });

    return {
      front: {
        chest:      musculos.chest,
        frontDelts: musculos.frontDelts,
        biceps:     musculos.biceps,
        forearms:   musculos.forearms,
        abs:        musculos.abs,
        obliques:   musculos.obliques,
        quads:      musculos.quads,
        calves:     musculos.calves,
      },
      back: {
        traps:      musculos.traps,
        rearDelts:  musculos.rearDelts,
        lats:       musculos.lats,
        triceps:    musculos.triceps,
        forearms:   musculos.forearms,
        lowerBack:  musculos.lowerBack,
        glutes:     musculos.glutes,
        hamstrings: musculos.hamstrings,
        calves:     musculos.calves,
      },
      exercises: ejerciciosPorMusculo,
    };
  };

  const hoyIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
  const hoyPlan = planSemanal[hoyIdx];

  const getRutinaObj = (tipo, nombre) => {
    const custom = rutinasCustom.find(r => r.name === nombre);
    if (custom) return custom;
    if (tipo === "gym") return GYM_RUTINAS.find(r => r.name === nombre) || null;
    if (tipo === "calistenia") return CALI_RUTINAS.find(r => r.name === nombre) || null;
    return null;
  };

  const iniciarEntrenamiento = (tipo, nombre) => {
    const rutina = getRutinaObj(tipo, nombre);
    if (!rutina) return;
    setRutinaActiva({ ...rutina, ejercicios: rutina.ejercicios.map(e => ({ ...e })) });
    setTipoActivo(tipo);
    setWorkoutActivo(true);
    setTab("hoy");
  };

  const finalizarEntrenamiento = async ({ duracion, series, log = [] }) => {
    const xpGanado     = 5;
    const coinsGanados = 2;
    const hoy = new Date().toISOString().split("T")[0];
    const nuevo = {
      id:         Date.now(),
      fecha:      new Date().toLocaleDateString("es-MX", { day: "numeric", month: "short" }),
      tipo:       tipoActivo,
      rutina:     rutinaActiva.name,
      emoji:      rutinaActiva.emoji,
      color:      rutinaActiva.color,
      duracion, series,
      volumen:    tipoActivo === "gym" ? Math.floor(Math.random() * 10000 + 8000) : 0,
      ejercicios: rutinaActiva.ejercicios.length,
      log,
    };

    setHistorial(p => [nuevo, ...p]);
    setWorkoutActivo(false);
    setRutinaActiva(null);
    // Guardar en array histórico de días entrenados
    setDiasEntrenados(prev => {
      if (prev.includes(hoy)) return prev;
      const nuevo = [...prev, hoy];
      localStorage.setItem('lifehud_dias_entrenados', JSON.stringify(nuevo));
      localStorage.setItem('lifehud_fitness_hoy', hoy); // compatibilidad
      return nuevo;
    });
    if (setGame) setGame(g => ({ ...g, xp: g.xp + xpGanado, coins: g.coins + coinsGanados }));
    if (log.length > 0) {
      const fecha = new Date().toLocaleDateString("es-MX", { day: "numeric", month: "short" });
      const nuevosRec = log.filter(ej => ej.weight).map(ej => ({
        exercise: ej.name, record: ej.weight, reps: ej.reps || "—", date: fecha, trend: "up",
      }));
      if (nuevosRec.length > 0) {
        setRecordsLocales(prev => {
          const merged = [...nuevosRec, ...prev.filter(r => !nuevosRec.find(n => n.exercise === r.exercise))];
          localStorage.setItem("lifehud_records", JSON.stringify(merged));
          return merged;
        });
      }
    }

    // Guardar historial muscular para el mapa de calor
    try {
      const histMuscular = JSON.parse(localStorage.getItem('lifehud_historial_muscular') || '[]');
      const entryMuscular = {
        fecha: new Date().toISOString(),
        rutina: rutinaActiva.name,
        ejercicios: log,
      };
      localStorage.setItem('lifehud_historial_muscular', JSON.stringify([entryMuscular, ...histMuscular].slice(0, 30)));
    } catch (_) {}

    setToast({ msg: `✅ ${rutinaActiva.emoji} ${rutinaActiva.name} — +${xpGanado} XP  +${coinsGanados} 🪙`, color: rutinaActiva.color });
    try {
      const tipoMap = { gym: "gym", calistenia: "calisthenics", hybrid: "hybrid" };
      const nombre = rutinaActiva.name || "Entrenamiento";
      const nombreFinal = nombre.length >= 3 ? nombre : nombre + " Day";
      const workoutTypeFinal =
        nombre.toLowerCase().includes("push")  ? "push"      :
        nombre.toLowerCase().includes("pull")  ? "pull"      :
        nombre.toLowerCase().includes("leg")   ? "legs"      :
        nombre.toLowerCase().includes("upper") ? "upper"     :
        nombre.toLowerCase().includes("lower") ? "lower"     :
        nombre.toLowerCase().includes("full")  ? "full_body" : "custom";
      await api.fitness.iniciarWorkout({
        name:            nombreFinal,
        workout_type:    workoutTypeFinal,
        training_method: tipoMap[tipoActivo] || "gym",
        workout_date:    hoy,
      });
      setStreak(s => s + 1);
    } catch (_) {}
  };

  const cambiarDia = (idx, tipo) => {
    const rutinas = tipo === "gym" ? GYM_RUTINAS : tipo === "calistenia" ? CALI_RUTINAS : [];
    const primera = rutinas[0]?.name || "Descanso";
    setPlanSemanal(prev => prev.map((d, i) => i === idx ? { ...d, tipo, rutina: tipo === "descanso" ? "Descanso" : primera } : d));
  };

  const NIVEL_COLORS = { Base: "#10B981", Intermedio: "#06B6D4", Avanzado: "#F59E0B", Élite: "#EF4444" };

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {toast && <Toast msg={toast.msg} color={toast.color} onDone={() => setToast(null)} />}

      {/* Banner onboarding si no tiene perfil */}
      {!tienePerfil && (
        <div style={{ padding: "16px 20px", borderRadius: 12, background: "linear-gradient(135deg,rgba(124,58,237,0.15),rgba(6,182,212,0.1))", border: "1px solid rgba(124,58,237,0.3)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "#A78BFA", marginBottom: 4 }}>⚡ CONFIGURA TU PERFIL FITNESS</div>
            <div style={{ fontSize: 12, color: "#64748B" }}>Personaliza tus rutinas según tu método, objetivo y nivel de experiencia.</div>
          </div>
          <button className="btn-primary" onClick={() => setShowOnboarding(true)} style={{ flexShrink: 0, fontSize: 13 }}>
            Configurar →
          </button>
        </div>
      )}

      {/* Modal onboarding */}
      {showOnboarding && (
        <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowOnboarding(false)}>
          <div className="modal" style={{ width: 500 }}>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginBottom: 6 }}>⚡ PERFIL FITNESS</div>
            <div style={{ fontSize: 12, color: "#64748B", marginBottom: 20 }}>Configúralo una vez — la app adapta tus rutinas automáticamente.</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

              {/* Método */}
              <div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8, letterSpacing: 1 }}>MÉTODO DE ENTRENAMIENTO</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {[{v:"gym",l:"🏋️ Gym"},{v:"calisthenics",l:"💪 Calistenia"},{v:"hybrid",l:"⚡ Híbrido"}].map(o => (
                    <button key={o.v} onClick={() => setPerfilForm(f => ({...f, training_method: o.v}))}
                      className={perfilForm.training_method === o.v ? "btn-primary" : "btn-secondary"}
                      style={{ flex: 1, fontSize: 12 }}>{o.l}</button>
                  ))}
                </div>
              </div>

              {/* Objetivo */}
              <div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8, letterSpacing: 1 }}>OBJETIVO PRINCIPAL</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {[{v:"hypertrophy",l:"💪 Hipertrofia"},{v:"strength",l:"🏆 Fuerza"},{v:"cut",l:"🔥 Definición"},{v:"skills",l:"🤸 Skills"},{v:"maintenance",l:"⚖️ Mantenimiento"}].map(o => (
                    <button key={o.v} onClick={() => setPerfilForm(f => ({...f, primary_goal: o.v}))}
                      className={perfilForm.primary_goal === o.v ? "btn-primary" : "btn-secondary"}
                      style={{ fontSize: 12 }}>{o.l}</button>
                  ))}
                </div>
              </div>

              {/* Split */}
              <div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8, letterSpacing: 1 }}>TIPO DE DIVISIÓN</div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[{v:"ppl",l:"PPL"},{v:"upper_lower",l:"Upper/Lower"},{v:"full_body",l:"Full Body"},{v:"bro_split",l:"Bro Split"}].map(o => (
                    <button key={o.v} onClick={() => setPerfilForm(f => ({...f, split_type: o.v}))}
                      className={perfilForm.split_type === o.v ? "btn-primary" : "btn-secondary"}
                      style={{ fontSize: 12 }}>{o.l}</button>
                  ))}
                </div>
              </div>

              {/* Días y experiencia */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8, letterSpacing: 1 }}>DÍAS POR SEMANA</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[3,4,5,6,7].map(d => (
                      <button key={d} onClick={() => setPerfilForm(f => ({...f, training_days_per_week: d}))}
                        className={perfilForm.training_days_per_week === d ? "btn-primary" : "btn-secondary"}
                        style={{ flex: 1, fontSize: 13, padding: "8px 4px" }}>{d}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8, letterSpacing: 1 }}>EXPERIENCIA</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[{v:"beginner",l:"Principiante"},{v:"intermediate",l:"Intermedio"},{v:"advanced",l:"Avanzado"}].map(o => (
                      <button key={o.v} onClick={() => setPerfilForm(f => ({...f, experience_level: o.v}))}
                        className={perfilForm.experience_level === o.v ? "btn-primary" : "btn-secondary"}
                        style={{ flex: 1, fontSize: 10, padding: "8px 4px" }}>{o.l}</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Botones */}
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowOnboarding(false)}>Cancelar</button>
                <button className="btn-primary" style={{ flex: 2 }} onClick={guardarPerfil} disabled={guardandoPerfil}>
                  {guardandoPerfil ? "⏳ Guardando..." : "✅ Guardar Perfil"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>
        {[
          { label: "Racha actual", value: `${cargandoStats ? "..." : streak}d`, icon: "🔥", color: "#EF4444" },
          { label: "Entrenamientos (mes)", value: historial.length, icon: "📅", color: "#7C3AED" },
          { label: "Volumen total", value: `${(historial.reduce((a,h)=>a+h.volumen,0)/1000).toFixed(0)}k kg`, icon: "⚖️", color: "#06B6D4" },
          { label: "Skills fitness", value: "Ver Skills", icon: "🏆", color: "#F59E0B" },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: "14px 18px", borderLeft: `3px solid ${s.color}` }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748B" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8 }}>
        {[
          { k: "hoy", l: "🏋️ Hoy" },
          { k: "rutinas", l: "📋 Rutinas" },
          { k: "skills", l: "⚡ Skills" },
          { k: "heatmap", l: "🔥 Mapa Calor" },
          { k: "historial", l: "📅 Historial" },
          { k: "records", l: "🏆 Récords" },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={tab === t.k ? "btn-primary" : "btn-secondary"}
            style={{ fontSize: 13 }}>{t.l}</button>
        ))}
      </div>

      {/* ── TAB: HOY ── */}
      {tab === "hoy" && (
        workoutActivo && rutinaActiva ? (
          <WorkoutLog rutina={rutinaActiva} tipo={tipoActivo} onFinish={finalizarEntrenamiento} />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Calendario semanal + mensual */}
            {(() => {
              // Calcular la fecha ISO de cada día del plan (Lun=0 … Dom=6)
              const dateForIdx = (i) => {
                const d = new Date();
                d.setDate(d.getDate() + (i - hoyIdx));
                return d.toISOString().split('T')[0];
              };

              // Calendario mensual
              const ahora      = new Date();
              const anio       = ahora.getFullYear();
              const mes        = ahora.getMonth();
              const diasEnMes  = new Date(anio, mes + 1, 0).getDate();
              const primerDia  = new Date(anio, mes, 1).getDay(); // 0=Dom
              const offsetLun  = primerDia === 0 ? 6 : primerDia - 1; // convertir a lunes=0
              const nombreMes  = ahora.toLocaleDateString("es-MX", { month: "long", year: "numeric" });
              const diasSemana = ["L","M","X","J","V","S","D"];

              // Contar entrenados este mes
              const prefixMes = `${anio}-${String(mes + 1).padStart(2,'0')}`;
              const entrenadosMes = diasEntrenados.filter(d => d.startsWith(prefixMes)).length;
              // Racha actual
              let rachaActual = 0;
              for (let i = 0; i < 60; i++) {
                const d = new Date(); d.setDate(d.getDate() - i);
                if (diasEntrenados.includes(d.toISOString().split('T')[0])) rachaActual++;
                else break;
              }

              return (
                <>
                  {/* Plan semanal */}
                  <div className="card" style={{ padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div className="section-title" style={{ margin: 0 }}>📅 Plan Semanal</div>
                      <div style={{ display: "flex", gap: 16 }}>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 900, color: "#F59E0B" }}>{rachaActual}</div>
                          <div style={{ fontSize: 9, color: "#4A5568" }}>racha</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 18, fontWeight: 900, color: "#10B981" }}>{entrenadosMes}</div>
                          <div style={{ fontSize: 9, color: "#4A5568" }}>este mes</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 8 }}>
                      {planSemanal.map((d, i) => {
                        const fechaDia   = dateForIdx(i);
                        const fueHoy     = i === hoyIdx;
                        const esPasado   = fechaDia < hoyISO;
                        const fueEntren  = diasEntrenados.includes(fechaDia);
                        const color      = d.tipo === "gym" ? "#EF4444" : d.tipo === "calistenia" ? "#7C3AED" : "#4A5568";
                        const bg         = fueEntren ? "rgba(16,185,129,0.15)" : fueHoy ? `${color}15` : "#0A0A12";
                        const border     = fueEntren ? "#10B981" : fueHoy ? color : esPasado && d.tipo !== "descanso" ? "#3D1A1A" : "#1A1A28";
                        const emoji      = fueEntren ? "✅" : esPasado && d.tipo !== "descanso" ? "❌" : d.tipo === "gym" ? "🏋️" : d.tipo === "calistenia" ? "💪" : "😴";
                        const textoColor = fueEntren ? "#10B981" : esPasado && d.tipo !== "descanso" ? "#EF4444" : color;
                        return (
                          <div key={i} style={{ textAlign: "center", padding: "12px 6px", borderRadius: 10, background: bg, border: `2px solid ${border}`, position: "relative" }}>
                            <div style={{ fontSize: 10, color: fueHoy ? color : "#64748B", fontWeight: 700, marginBottom: 6 }}>{d.dia}</div>
                            <div style={{ fontSize: 20, marginBottom: 4 }}>{emoji}</div>
                            <div style={{ fontSize: 9, color: textoColor, fontWeight: 700, marginBottom: 8 }}>
                              {fueEntren ? "¡Hecho!" : d.rutina}
                            </div>
                            <div style={{ display: "flex", justifyContent: "center", gap: 3 }}>
                              {["gym","calistenia","descanso"].map(t => (
                                <button key={t} onClick={() => cambiarDia(i, t)} title={t}
                                  style={{ width: 18, height: 18, borderRadius: 4, border: `1px solid ${d.tipo === t ? color : "#2D2D45"}`, background: d.tipo === t ? `${color}30` : "#080810", cursor: "pointer", fontSize: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  {t === "gym" ? "🏋" : t === "calistenia" ? "💪" : "💤"}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Calendario mensual */}
                  <div className="card" style={{ padding: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <div className="section-title" style={{ margin: 0, textTransform: "capitalize" }}>
                        🗓️ {nombreMes}
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 10, color: "#64748B" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 3, background: "#10B981", display: "inline-block" }} /> Entrenado
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 3, background: "#1C2A4A", display: "inline-block" }} /> Descanso
                        </span>
                        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <span style={{ width: 10, height: 10, borderRadius: 3, background: "#3D1A1A", display: "inline-block" }} /> Faltó
                        </span>
                      </div>
                    </div>

                    {/* Cabecera días semana */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4, marginBottom: 4 }}>
                      {diasSemana.map(ds => (
                        <div key={ds} style={{ textAlign: "center", fontSize: 10, color: "#4A5568", fontWeight: 700, fontFamily: "'Orbitron',monospace" }}>{ds}</div>
                      ))}
                    </div>

                    {/* Días del mes */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 4 }}>
                      {/* Espacios en blanco para el offset */}
                      {Array(offsetLun).fill(null).map((_, i) => (
                        <div key={`off-${i}`} />
                      ))}
                      {Array(diasEnMes).fill(null).map((_, i) => {
                        const numDia   = i + 1;
                        const fechaStr = `${anio}-${String(mes+1).padStart(2,'0')}-${String(numDia).padStart(2,'0')}`;
                        const esHoy    = fechaStr === hoyISO;
                        const esFuturo = fechaStr > hoyISO;
                        const esPasado = fechaStr < hoyISO;
                        const esPlanDesc = (() => {
                          // Saber si ese día estaba planificado como descanso
                          const dow = new Date(fechaStr + 'T12:00:00').getDay();
                          const planIdx = dow === 0 ? 6 : dow - 1;
                          return planSemanal[planIdx]?.tipo === "descanso";
                        })();
                        const fueEntren = diasEntrenados.includes(fechaStr);
                        let bg, borderC, textC;
                        if (esHoy) {
                          bg = fueEntren ? "rgba(16,185,129,0.25)" : "rgba(124,58,237,0.2)";
                          borderC = fueEntren ? "#10B981" : "#7C3AED";
                          textC = fueEntren ? "#10B981" : "#A78BFA";
                        } else if (fueEntren) {
                          bg = "rgba(16,185,129,0.15)"; borderC = "#10B981"; textC = "#10B981";
                        } else if (esFuturo) {
                          bg = "#0A0A12"; borderC = "#1A1A28"; textC = "#2D2D45";
                        } else if (esPasado && esPlanDesc) {
                          bg = "#0D0D1A"; borderC = "#1A1A28"; textC = "#2D2D45";
                        } else if (esPasado) {
                          bg = "rgba(61,26,26,0.4)"; borderC = "#3D1A1A"; textC = "#64748B";
                        } else {
                          bg = "#0A0A12"; borderC = "#1A1A28"; textC = "#64748B";
                        }
                        return (
                          <div key={numDia}
                            style={{ aspectRatio: "1", borderRadius: 6, background: bg, border: `1px solid ${borderC}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: esHoy ? 900 : fueEntren ? 700 : 400, color: textC, fontFamily: esHoy || fueEntren ? "'Orbitron',monospace" : "'Rajdhani',sans-serif", transition: "all 0.2s", position: "relative" }}>
                            {numDia}
                            {fueEntren && <div style={{ position: "absolute", top: 1, right: 2, fontSize: 7 }}>✓</div>}
                          </div>
                        );
                      })}
                    </div>

                    {/* Resumen del mes */}
                    <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid #1A1A28", display: "flex", gap: 20, justifyContent: "center" }}>
                      {[
                        { l: "Entrenados", v: entrenadosMes, c: "#10B981" },
                        { l: "Racha actual", v: `${rachaActual} días`, c: "#F59E0B" },
                        { l: "Este mes", v: `${Math.round((entrenadosMes / diasEnMes) * 100)}%`, c: "#7C3AED" },
                      ].map(s => (
                        <div key={s.l} style={{ textAlign: "center" }}>
                          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color: s.c }}>{s.v}</div>
                          <div style={{ fontSize: 10, color: "#4A5568" }}>{s.l}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Rutina de hoy */}
            {hoyPlan.tipo !== "descanso" ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {/* Rutina programada */}
                {(() => {
                  const rutina = getRutinaObj(hoyPlan.tipo, hoyPlan.rutina);
                  if (!rutina) return null;
                  return (
                    <div className="card" style={{ padding: 18, borderTop: `3px solid ${rutina.color}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                          <span style={{ fontSize: 36 }}>{rutina.emoji}</span>
                          <div>
                            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>{rutina.name}</div>
                            <span className="tag" style={{ background: `${rutina.color}20`, color: rutina.color, marginTop: 4, display: "inline-block" }}>
                              {hoyPlan.tipo === "gym" ? "🏋️ Gimnasio" : "💪 Calistenia"} · HOY
                            </span>
                          </div>
                        </div>
                      </div>
                      {rutina.ejercicios.map((ej, i) => (
                        <div key={i} className="exercise-row">
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: `${rutina.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: rutina.color, flexShrink: 0 }}>{i + 1}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, color: "#F1F5F9", fontWeight: 600 }}>{ej.name}</div>
                            <div style={{ fontSize: 10, color: "#64748B" }}>{ej.sets} × {ej.repsTarget} · {ej.weightTarget}</div>
                          </div>
                        </div>
                      ))}
                      <button onClick={() => iniciarEntrenamiento(hoyPlan.tipo, hoyPlan.rutina)}
                        className="btn-primary" style={{ width: "100%", marginTop: 14, fontSize: 14 }}>
                        ▶ Iniciar Entrenamiento
                      </button>
                    </div>
                  );
                })()}

                {/* Cambiar rutina */}
                <div className="card" style={{ padding: 18 }}>
                  <div className="section-title">🔄 Cambiar rutina de hoy</div>
                  <div style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: "#F59E0B", marginBottom: 8, fontWeight: 700 }}>🏋️ Gimnasio</div>
                    {GYM_RUTINAS.map(r => (
                      <div key={r.id} onClick={() => { setPlanSemanal(p => p.map((d,i) => i===hoyIdx ? {...d, tipo:"gym", rutina:r.name} : d)); }}
                        className="routine-card" style={{ marginBottom: 6, borderColor: hoyPlan.rutina === r.name && hoyPlan.tipo === "gym" ? r.color + "60" : "#1E1E30", background: hoyPlan.rutina === r.name && hoyPlan.tipo === "gym" ? `${r.color}08` : "#0F0F18" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 18 }}>{r.emoji}</span>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>{r.name}</div>
                          </div>
                          {hoyPlan.rutina === r.name && hoyPlan.tipo === "gym" && <span style={{ color: r.color, fontSize: 16 }}>✓</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: "#A78BFA", marginBottom: 8, fontWeight: 700 }}>💪 Calistenia</div>
                    {CALI_RUTINAS.map(r => (
                      <div key={r.id} onClick={() => { setPlanSemanal(p => p.map((d,i) => i===hoyIdx ? {...d, tipo:"calistenia", rutina:r.name} : d)); }}
                        className="routine-card" style={{ marginBottom: 6, borderColor: hoyPlan.rutina === r.name && hoyPlan.tipo === "calistenia" ? r.color + "60" : "#1E1E30", background: hoyPlan.rutina === r.name && hoyPlan.tipo === "calistenia" ? `${r.color}08` : "#0F0F18" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span style={{ fontSize: 18 }}>{r.emoji}</span>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>{r.name}</div>
                          </div>
                          {hoyPlan.rutina === r.name && hoyPlan.tipo === "calistenia" && <span style={{ color: r.color, fontSize: 16 }}>✓</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: 32, textAlign: "center" }}>
                <div style={{ fontSize: 64, marginBottom: 12 }}>😴</div>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 16, color: "#F1F5F9", marginBottom: 8 }}>Día de Descanso</div>
                <div style={{ fontSize: 13, color: "#4A5568", marginBottom: 16 }}>El descanso es parte del entrenamiento.</div>
                <button onClick={() => cambiarDia(hoyIdx, "gym")} className="btn-secondary" style={{ fontSize: 13 }}>Entrenar de todas formas</button>
              </div>
            )}
          </div>
        )
      )}

      {/* ── TAB: RUTINAS ── */}
      {tab === "rutinas" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontSize: 12, color: "#64748B" }}>{rutinasCustom.length} rutina{rutinasCustom.length !== 1 ? "s" : ""} guardada{rutinasCustom.length !== 1 ? "s" : ""}</div>
            <button className="btn-primary" onClick={() => setShowFormRutina(true)} style={{ fontSize: 12 }}>+ Nueva rutina</button>
          </div>

          {/* Sin rutinas */}
          {rutinasCustom.length === 0 && (
            <div className="card" style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🏋️</div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, color: "#F1F5F9", marginBottom: 8 }}>Sin rutinas aún</div>
              <div style={{ fontSize: 12, color: "#4A5568", marginBottom: 20 }}>Crea tu primera rutina personalizada</div>
              <button className="btn-primary" onClick={() => setShowFormRutina(true)} style={{ fontSize: 13, padding: "10px 24px" }}>+ Crear rutina</button>
            </div>
          )}

          {/* Lista de rutinas */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
            {rutinasCustom.map((r, idx) => (
              <div key={r.id} className="card" style={{ padding: 16, borderTop: `3px solid ${r.color || "#7C3AED"}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontSize: 28 }}>{r.emoji}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>{r.name}</div>
                      <span className="tag" style={{ background: r.tipo === "gym" ? "rgba(239,68,68,0.15)" : "rgba(124,58,237,0.15)", color: r.tipo === "gym" ? "#EF4444" : "#A78BFA", marginTop: 4, display: "inline-block" }}>
                        {r.tipo === "gym" ? "🏋️ Gym" : "💪 Calistenia"}
                      </span>
                    </div>
                  </div>
                  <button onClick={() => {
                    const nuevas = rutinasCustom.filter((_, i) => i !== idx);
                    setRutinasCustom(nuevas);
                    localStorage.setItem('lifehud_rutinas', JSON.stringify(nuevas));
                  }} style={{ background: "none", border: "none", color: "#4A5568", cursor: "pointer", fontSize: 16, padding: 4 }}>🗑️</button>
                </div>
                {(r.ejercicios || []).map((ej, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1A1A28", fontSize: 12 }}>
                    <span style={{ color: "#CBD5E1" }}>{ej.name}</span>
                    <span style={{ color: "#64748B" }}>{ej.sets}×{ej.repsTarget}{ej.weightTarget ? ` · ${ej.weightTarget}` : ""}</span>
                  </div>
                ))}
                {(r.ejercicios || []).length === 0 && (
                  <div style={{ fontSize: 12, color: "#4A5568", textAlign: "center", padding: "8px 0" }}>Sin ejercicios aún</div>
                )}
                <button onClick={() => iniciarEntrenamiento(r.tipo, r.name)} className="btn-primary" style={{ width: "100%", marginTop: 12, fontSize: 12 }}>▶ Iniciar</button>
              </div>
            ))}
          </div>

          {/* Modal crear rutina */}
          {showFormRutina && (
            <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowFormRutina(false)}>
              <div className="modal" style={{ width: 500, maxHeight: "85vh", overflowY: "auto" }}>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 20 }}>🏋️ Nueva Rutina</div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {/* Nombre y emoji */}
                  <div style={{ display: "flex", gap: 10 }}>
                    <input placeholder="Emoji" value={formRutina.emoji}
                      onChange={e => setFormRutina(f => ({ ...f, emoji: e.target.value }))}
                      style={{ width: 60, fontSize: 20, textAlign: "center", padding: "6px" }} />
                    <input placeholder="Nombre de la rutina" value={formRutina.name}
                      onChange={e => setFormRutina(f => ({ ...f, name: e.target.value }))}
                      style={{ flex: 1, fontSize: 13 }} />
                  </div>

                  {/* Tipo */}
                  <div>
                    <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>TIPO</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {[{ v: "gym", l: "🏋️ Gym" }, { v: "calistenia", l: "💪 Calistenia" }].map(t => (
                        <button key={t.v} onClick={() => setFormRutina(f => ({ ...f, tipo: t.v }))}
                          className={formRutina.tipo === t.v ? "btn-primary" : "btn-secondary"}
                          style={{ flex: 1, fontSize: 12 }}>{t.l}</button>
                      ))}
                    </div>
                  </div>

                  {/* Color */}
                  <div>
                    <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>COLOR</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      {["#7C3AED","#EF4444","#06B6D4","#10B981","#F59E0B","#EC4899"].map(c => (
                        <div key={c} onClick={() => setFormRutina(f => ({ ...f, color: c }))}
                          style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: formRutina.color === c ? "3px solid white" : "2px solid transparent", transition: "all 0.15s" }} />
                      ))}
                    </div>
                  </div>

                  {/* Ejercicios */}
                  <div>
                    <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>EJERCICIOS ({formRutina.ejercicios.length})</div>
                    {formRutina.ejercicios.map((ej, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", borderRadius: 7, background: "#0A0A12", marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: "#CBD5E1" }}>{ej.name}</span>
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <span style={{ fontSize: 11, color: "#64748B" }}>{ej.sets}×{ej.repsTarget}{ej.weightTarget ? ` · ${ej.weightTarget}` : ""}</span>
                          <button onClick={() => setFormRutina(f => ({ ...f, ejercicios: f.ejercicios.filter((_, j) => j !== i) }))}
                            style={{ background: "none", border: "none", color: "#4A5568", cursor: "pointer", fontSize: 13 }}>✕</button>
                        </div>
                      </div>
                    ))}

                    {/* Agregar ejercicio */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 50px 60px 70px auto", gap: 6, marginTop: 8 }}>
                      <input placeholder="Ejercicio" value={formEjercicio.name}
                        onChange={e => setFormEjercicio(f => ({ ...f, name: e.target.value }))}
                        style={{ fontSize: 12 }} />
                      <input type="number" placeholder="Sets" value={formEjercicio.sets}
                        onChange={e => setFormEjercicio(f => ({ ...f, sets: parseInt(e.target.value) || 3 }))}
                        style={{ fontSize: 12, textAlign: "center" }} />
                      <input placeholder="Reps" value={formEjercicio.repsTarget}
                        onChange={e => setFormEjercicio(f => ({ ...f, repsTarget: e.target.value }))}
                        style={{ fontSize: 12, textAlign: "center" }} />
                      <input placeholder="Peso" value={formEjercicio.weightTarget}
                        onChange={e => setFormEjercicio(f => ({ ...f, weightTarget: e.target.value }))}
                        style={{ fontSize: 12, textAlign: "center" }} />
                      <button className="btn-primary" style={{ fontSize: 12, padding: "0 10px" }}
                        onClick={() => {
                          if (!formEjercicio.name.trim()) return;
                          setFormRutina(f => ({ ...f, ejercicios: [...f.ejercicios, { ...formEjercicio, id: Date.now() }] }));
                          setFormEjercicio({ name: '', sets: 3, repsTarget: '10', weightTarget: '' });
                        }}>+</button>
                    </div>
                  </div>

                  {/* Botones */}
                  <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                    <button className="btn-secondary" style={{ flex: 1 }} onClick={() => { setShowFormRutina(false); setFormRutina({ name: '', emoji: '🏋️', tipo: 'gym', color: '#7C3AED', ejercicios: [] }); }}>Cancelar</button>
                    <button className="btn-primary" style={{ flex: 2 }} disabled={!formRutina.name.trim()}
                      onClick={() => {
                        const nueva = { ...formRutina, id: Date.now() };
                        const nuevas = [...rutinasCustom, nueva];
                        setRutinasCustom(nuevas);
                        localStorage.setItem('lifehud_rutinas', JSON.stringify(nuevas));
                        setShowFormRutina(false);
                        setFormRutina({ name: '', emoji: '🏋️', tipo: 'gym', color: '#7C3AED', ejercicios: [] });
                      }}>✅ Guardar rutina</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: SKILLS ── */}
      {tab === "skills" && (() => {
        // Combinar SKILL_TREE con progreso guardado y skills custom
        const allSkills = [
          ...SKILL_TREE.map(s => ({
            ...s,
            current: skillsProgress[s.id] ?? s.current,
          })),
          ...skillsCustom,
        ];
        const updateProgress = (id, val) => {
          const valNuevo = Math.max(0, val);
          const skill    = allSkills.find(s => s.id === id);
          const anterior = skillsProgress[id] ?? (skill?.current ?? 0);
          const nuevo    = { ...skillsProgress, [id]: valNuevo };
          setSkillsProgress(nuevo);
          localStorage.setItem("lifehud_skills_progress", JSON.stringify(nuevo));
          if (skill && valNuevo >= skill.goal && anterior < skill.goal && setGame) {
            const xpSkill = 100;
            setGame(g => ({ ...g, xp: g.xp + xpSkill }));
            setToast({ msg: `⚡ ${skill.emoji} ${skill.name} completado! +${xpSkill} XP 🏆`, color: skill.color || "#7C3AED" });
          }
          if (selectedSkill?.id === id) setSelectedSkill(sk => ({ ...sk, current: valNuevo }));
        };
        return (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
            {/* Árbol visual */}
            <div className="card" style={{ padding: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div className="section-title" style={{ margin: 0 }}>🌳 Skills & Árbol de Progresión</div>
                <button className="btn-primary" onClick={() => setShowFormSkillF(true)} style={{ fontSize: 11 }}>+ Nueva skill</button>
              </div>
              {["Base", "Intermedio", "Avanzado", "Élite"].map(nivel => {
                const skillsNivel = allSkills.filter(s => s.nivel === nivel);
                if (skillsNivel.length === 0) return null;
                return (
                  <div key={nivel} style={{ marginBottom: 20 }}>
                    <div style={{ fontSize: 10, color: NIVEL_COLORS[nivel], fontWeight: 700, fontFamily: "'Orbitron',monospace", letterSpacing: 2, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ flex: 1, height: 1, background: `${NIVEL_COLORS[nivel]}30` }} />
                      {nivel.toUpperCase()}
                      <div style={{ flex: 1, height: 1, background: `${NIVEL_COLORS[nivel]}30` }} />
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                      {skillsNivel.map(skill => {
                        const cur = skillsProgress[skill.id] ?? skill.current ?? 0;
                        const pct = Math.min(100, Math.round((cur / skill.goal) * 100));
                        const isSelected = selectedSkill?.id === skill.id;
                        const isCustom = !!skill.isCustom;
                        return (
                          <div key={skill.id}
                            onClick={() => setSelectedSkill({ ...skill, current: cur })}
                            style={{ padding: "12px 14px", borderRadius: 12, background: isSelected ? `${skill.color}15` : skill.desbloqueado !== false ? "#0F0F18" : "#09090F", border: `2px solid ${isSelected ? skill.color : skill.desbloqueado !== false ? skill.color + "40" : "#1A1A28"}`, cursor: skill.desbloqueado !== false ? "pointer" : "default", opacity: skill.desbloqueado !== false ? 1 : 0.45, transition: "all 0.15s", minWidth: 130, flex: 1, maxWidth: 180 }}>
                            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                              <span style={{ fontSize: 22 }}>{skill.emoji}</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: skill.desbloqueado !== false ? "#F1F5F9" : "#4A5568" }}>{skill.name}</div>
                                <div style={{ fontSize: 9, color: NIVEL_COLORS[skill.nivel] }}>{skill.nivel}{isCustom ? " · custom" : ""}</div>
                              </div>
                              {skill.desbloqueado === false && <span style={{ fontSize: 14 }}>🔒</span>}
                            </div>
                            {skill.desbloqueado !== false && (
                              <>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, marginBottom: 4 }}>
                                  <span style={{ color: "#64748B" }}>{cur}/{skill.goal} {skill.unit}</span>
                                  <span style={{ color: skill.color, fontWeight: 700 }}>{pct}%</span>
                                </div>
                                <ProgressBar value={cur} max={skill.goal} color={pct >= 100 ? "#10B981" : skill.color} height={4} />
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Panel detalle */}
            {selectedSkill ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="card" style={{ padding: 18, borderTop: `3px solid ${selectedSkill.color}` }}>
                  <div style={{ textAlign: "center", marginBottom: 16 }}>
                    <span style={{ fontSize: 56 }}>{selectedSkill.emoji}</span>
                    <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 15, fontWeight: 700, color: "#F1F5F9", marginTop: 8 }}>{selectedSkill.name}</div>
                    {selectedSkill.desc && <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 4 }}>{selectedSkill.desc}</div>}
                    <span className="tag" style={{ background: `${NIVEL_COLORS[selectedSkill.nivel]}15`, color: NIVEL_COLORS[selectedSkill.nivel], marginTop: 8, display: "inline-block" }}>{selectedSkill.nivel}</span>
                  </div>
                  {selectedSkill.desbloqueado !== false ? (
                    <>
                      <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 34, fontWeight: 900, color: selectedSkill.color, textAlign: "center", marginBottom: 4 }}>
                        {skillsProgress[selectedSkill.id] ?? selectedSkill.current}
                        <span style={{ fontSize: 16, color: "#4A5568" }}>/{selectedSkill.goal}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", textAlign: "center", marginBottom: 12 }}>{selectedSkill.unit}</div>
                      <ProgressBar value={skillsProgress[selectedSkill.id] ?? selectedSkill.current} max={selectedSkill.goal} color={selectedSkill.color} height={10} />
                      {/* Control actualizar progreso */}
                      <div style={{ marginTop: 14, display: "flex", gap: 8, alignItems: "center" }}>
                        <button className="btn-secondary" style={{ fontSize: 18, padding: "4px 14px" }}
                          onClick={() => updateProgress(selectedSkill.id, (skillsProgress[selectedSkill.id] ?? selectedSkill.current) - 1)}>−</button>
                        <input type="number"
                          value={skillsProgress[selectedSkill.id] ?? selectedSkill.current}
                          onChange={e => updateProgress(selectedSkill.id, parseInt(e.target.value) || 0)}
                          style={{ flex: 1, textAlign: "center", fontSize: 16, fontFamily: "'Orbitron',monospace", fontWeight: 700 }} />
                        <button className="btn-primary" style={{ fontSize: 18, padding: "4px 14px" }}
                          onClick={() => updateProgress(selectedSkill.id, (skillsProgress[selectedSkill.id] ?? selectedSkill.current) + 1)}>+</button>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginTop: 10 }}>
                        <span style={{ color: "#64748B" }}>Progreso: {Math.min(100, Math.round(((skillsProgress[selectedSkill.id] ?? selectedSkill.current)/selectedSkill.goal)*100))}%</span>
                        {selectedSkill.xp && <span style={{ color: "#F59E0B", fontWeight: 700 }}>⚡ {selectedSkill.xp} XP al completar</span>}
                      </div>
                      {/* Botón eliminar si es custom */}
                      {selectedSkill.isCustom && (
                        <button style={{ marginTop: 14, width: "100%", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, color: "#EF4444", padding: "8px", cursor: "pointer", fontSize: 12 }}
                          onClick={() => {
                            const nuevas = skillsCustom.filter(s => s.id !== selectedSkill.id);
                            setSkillsCustom(nuevas);
                            localStorage.setItem('lifehud_skills_fitness', JSON.stringify(nuevas));
                            setSelectedSkill(null);
                          }}>🗑️ Eliminar skill</button>
                      )}
                    </>
                  ) : (
                    <div style={{ padding: "14px", borderRadius: 8, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)", textAlign: "center", fontSize: 12, color: "#EF4444" }}>
                      🔒 Completa los skills anteriores para desbloquear
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card" style={{ padding: 24, textAlign: "center", color: "#4A5568" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>👆</div>
                <div style={{ fontSize: 12 }}>Selecciona una skill para ver su detalle y actualizar tu progreso</div>
              </div>
            )}

            {/* Modal nueva skill */}
            {showFormSkillF && (
              <div className="modal-bg" onClick={e => e.target === e.currentTarget && setShowFormSkillF(false)}>
                <div className="modal" style={{ width: 420 }}>
                  <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#F1F5F9", marginBottom: 20 }}>⚡ Nueva Skill</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <input placeholder="Emoji" value={formSkillF.emoji}
                        onChange={e => setFormSkillF(f => ({ ...f, emoji: e.target.value }))}
                        style={{ width: 60, fontSize: 20, textAlign: "center" }} />
                      <input placeholder="Nombre del skill" value={formSkillF.name}
                        onChange={e => setFormSkillF(f => ({ ...f, name: e.target.value }))}
                        style={{ flex: 1, fontSize: 13 }} />
                    </div>
                    <input placeholder="Descripción (opcional)" value={formSkillF.desc}
                      onChange={e => setFormSkillF(f => ({ ...f, desc: e.target.value }))}
                      style={{ fontSize: 12 }} />
                    <div>
                      <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>NIVEL</div>
                      <div style={{ display: "flex", gap: 6 }}>
                        {["Base","Intermedio","Avanzado","Élite"].map(n => (
                          <button key={n} onClick={() => setFormSkillF(f => ({ ...f, nivel: n }))}
                            className={formSkillF.nivel === n ? "btn-primary" : "btn-secondary"}
                            style={{ flex: 1, fontSize: 10, padding: "5px 4px" }}>{n}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>META</div>
                        <input type="number" placeholder="Ej: 60" value={formSkillF.goal}
                          onChange={e => setFormSkillF(f => ({ ...f, goal: parseInt(e.target.value) || 10 }))}
                          style={{ width: "100%", fontSize: 13 }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6 }}>UNIDAD</div>
                        <input placeholder="reps / seg / min" value={formSkillF.unit}
                          onChange={e => setFormSkillF(f => ({ ...f, unit: e.target.value }))}
                          style={{ width: "100%", fontSize: 13 }} />
                      </div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>COLOR</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        {["#7C3AED","#EF4444","#06B6D4","#10B981","#F59E0B","#EC4899","#A78BFA","#F97316"].map(c => (
                          <div key={c} onClick={() => setFormSkillF(f => ({ ...f, color: c }))}
                            style={{ width: 26, height: 26, borderRadius: "50%", background: c, cursor: "pointer", border: formSkillF.color === c ? "3px solid white" : "2px solid transparent" }} />
                        ))}
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                      <button className="btn-secondary" style={{ flex: 1 }} onClick={() => setShowFormSkillF(false)}>Cancelar</button>
                      <button className="btn-primary" style={{ flex: 2 }} disabled={!formSkillF.name.trim()}
                        onClick={() => {
                          const nueva = { ...formSkillF, id: `custom_${Date.now()}`, isCustom: true, current: 0, desbloqueado: true, unlocks: [], xp: 500 };
                          const nuevas = [...skillsCustom, nueva];
                          setSkillsCustom(nuevas);
                          localStorage.setItem('lifehud_skills_fitness', JSON.stringify(nuevas));
                          setShowFormSkillF(false);
                          setFormSkillF({ name: '', emoji: '⚡', nivel: 'Base', unit: 'reps', goal: 10, color: '#7C3AED', desc: '' });
                        }}>✅ Guardar skill</button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* ── TAB: MAPA CALOR ── */}
      {tab === "heatmap" && (() => {
        const hmData = calcularHeatmapSemana();
        const todosMuscs = [
          { k: "chest",      l: "Pecho",          v: hmData.front.chest },
          { k: "lats",       l: "Dorsales",        v: hmData.back.lats },
          { k: "quads",      l: "Cuádriceps",      v: hmData.front.quads },
          { k: "frontDelts", l: "Deltoides Ant.",  v: hmData.front.frontDelts },
          { k: "traps",      l: "Trapecio",        v: hmData.back.traps },
          { k: "biceps",     l: "Bíceps",          v: hmData.front.biceps },
          { k: "triceps",    l: "Tríceps",         v: hmData.back.triceps },
          { k: "abs",        l: "Abdomen",         v: hmData.front.abs },
          { k: "glutes",     l: "Glúteos",         v: hmData.back.glutes },
          { k: "hamstrings", l: "Isquios",         v: hmData.back.hamstrings },
          { k: "calves",     l: "Gemelos",         v: hmData.front.calves },
          { k: "lowerBack",  l: "Lumbar",          v: hmData.back.lowerBack },
        ].sort((a, b) => b.v - a.v);
        const colorBar = (v) => v >= 82 ? "#EF4444" : v >= 65 ? "#F59E0B" : v >= 40 ? "#6D28D9" : v >= 20 ? "#312E81" : "#1C2A4A";
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ padding: 24, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                <div className="section-title">💪 Activación Muscular — Esta semana</div>
                <div style={{ fontSize: 11, color: "#4A5568" }}>Últimos 7 días</div>
              </div>
              <BodyHeatMap data={hmData} />
            </div>
            {/* Resumen de músculos más trabajados */}
            <div className="card" style={{ padding: 20 }}>
              <div style={{ fontSize: 12, color: "#64748B", fontFamily: "'Orbitron',monospace", letterSpacing: 1, marginBottom: 14 }}>RANKING MUSCULAR — SEMANA</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {todosMuscs.map((m, i) => (
                  <div key={m.k} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 20, fontSize: 11, color: i < 3 ? "#F59E0B" : "#4A5568", fontWeight: 700, fontFamily: "'Orbitron',monospace" }}>{i + 1}</div>
                    <div style={{ width: 110, fontSize: 12, color: "#94A3B8" }}>{m.l}</div>
                    <div style={{ flex: 1, height: 8, borderRadius: 4, background: "#0A0A12", overflow: "hidden" }}>
                      <div style={{ width: `${m.v}%`, height: "100%", borderRadius: 4, background: colorBar(m.v), transition: "width 0.6s" }} />
                    </div>
                    <div style={{ width: 36, fontSize: 11, color: "#64748B", textAlign: "right", fontFamily: "'Orbitron',monospace" }}>{m.v}%</div>
                    {hmData.exercises[m.k]?.length > 0 && (
                      <div style={{ fontSize: 10, color: "#4A5568", width: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {hmData.exercises[m.k].join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              {todosMuscs.every(m => m.v === 0) && (
                <div style={{ textAlign: "center", color: "#2D2D45", padding: "20px 0", fontSize: 13 }}>
                  Completa un entrenamiento para ver tu activación muscular 💪
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* ── TAB: HISTORIAL ── */}
      {tab === "historial" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {historial.map(h => (
            <div key={h.id} className="card" style={{ padding: 16, borderLeft: `4px solid ${h.color}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <span style={{ fontSize: 30 }}>{h.emoji}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>{h.rutina}</div>
                    <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                      <span className="tag" style={{ background: `${h.color}15`, color: h.color }}>{h.tipo === "gym" ? "🏋️ Gym" : "💪 Calistenia"}</span>
                      <span className="tag" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>⏱ {h.duracion} min</span>
                      <span className="tag" style={{ background: "rgba(124,58,237,0.1)", color: "#A78BFA" }}>📊 {h.series} series</span>
                      {h.volumen > 0 && <span className="tag" style={{ background: "rgba(6,182,212,0.1)", color: "#06B6D4" }}>⚖️ {(h.volumen/1000).toFixed(1)}k kg</span>}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 12, color: "#64748B" }}>{h.fecha}</div>
                </div>
              </div>
              {h.log.length > 0 && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid #1A1A28" }}>
                  {h.log.map((ej, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div style={{ fontSize: 11, color: "#94A3B8", marginBottom: 4, fontWeight: 600 }}>{ej.name}</div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        {ej.series.map((s, j) => (
                          <span key={j} style={{ fontSize: 11, padding: "3px 8px", borderRadius: 6, background: `${h.color}15`, color: h.color, fontFamily: "'Orbitron',monospace", fontWeight: 700 }}>
                            {s.w ? `${s.w}kg×${s.r}` : `${s.r}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── TAB: RÉCORDS ── */}
      {tab === "records" && (
        <div className="card" style={{ padding: 18 }}>
          <div className="section-title">🏆 Récords Personales</div>
          {(records.length === 0 && recordsLocales.length === 0) && (
            <div style={{ textAlign: "center", color: "#4A5568", fontSize: 13, padding: "30px 0" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
              Completa entrenamientos para ver tus récords
            </div>
          )}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12 }}>
            {[...recordsLocales, ...records.filter(r => !recordsLocales.find(l => l.exercise === r.exercise))].map((r, i) => (
              <div key={i} style={{ padding: 16, borderRadius: 10, background: "#0A0A12", border: "1px solid #1E1E30" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>{r.exercise}</div>
                  <span style={{ fontSize: 16 }}>{r.trend === "up" ? "📈" : r.trend === "down" ? "📉" : "➡️"}</span>
                </div>
                <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 900, color: r.trend === "up" ? "#10B981" : r.trend === "down" ? "#EF4444" : "#F59E0B" }}>
                  {r.record}
                </div>
                <div style={{ fontSize: 10, color: "#64748B", marginTop: 4 }}>{r.reps} · {r.date}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ============================================================
// SHOP
// ============================================================
// ============================================================
// RUTINA DIARIA — Bloques de tiempo
// ============================================================
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

const RutinaPage = ({ setGame }) => {
  const hoyISO    = new Date().toISOString().split("T")[0];
  const storageKey = `lifehud_rutina_${hoyISO}`;
  const configKey  = "lifehud_rutina_config";

  const [bloques, setBloques] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || "[]"); }
    catch { return []; }
  });
  const [config, setConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem(configKey) || "null") || { horaInicio: 6, horaFin: 23 }; }
    catch { return { horaInicio: 6, horaFin: 23 }; }
  });
  const [showForm,   setShowForm]   = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [form, setForm] = useState({ nombre: "", categoria: "trabajo", duracionH: 1, duracionM: 0, notas: "" });
  const [toast,      setToast]      = useState(null);
  const [showConfig, setShowConfig] = useState(false);

  const horasDisponibles  = Math.max(1, config.horaFin - config.horaInicio);
  const minutosDisponibles = horasDisponibles * 60;
  const minutosUsados      = bloques.reduce((s, b) => s + b.duracion, 0);
  const minutosLibres      = Math.max(0, minutosDisponibles - minutosUsados);
  const pctUsado           = Math.min(100, Math.round((minutosUsados / minutosDisponibles) * 100));
  const completados        = bloques.filter(b => b.completado).length;
  const durFormTotal       = form.duracionH * 60 + form.duracionM;

  const guardarBloques = (nuevos) => {
    setBloques(nuevos);
    localStorage.setItem(storageKey, JSON.stringify(nuevos));
  };
  const guardarConfig = (nueva) => {
    setConfig(nueva);
    localStorage.setItem(configKey, JSON.stringify(nueva));
  };

  const resetForm = () => {
    setForm({ nombre: "", categoria: "trabajo", duracionH: 1, duracionM: 0, notas: "" });
    setEditandoId(null);
    setShowForm(false);
  };

  const abrirEdicion = (b) => {
    setForm({
      nombre: b.nombre, categoria: b.categoria,
      duracionH: Math.floor(b.duracion / 60), duracionM: b.duracion % 60,
      notas: b.notas || "",
    });
    setEditandoId(b.id);
    setShowForm(true);
  };

  const maxDisponible = editandoId
    ? minutosLibres + (bloques.find(b => b.id === editandoId)?.duracion || 0)
    : minutosLibres;

  const confirmarBloque = () => {
    if (!form.nombre.trim() || durFormTotal === 0) return;
    if (durFormTotal > maxDisponible) {
      setToast({ msg: `⚠️ Solo quedan ${fmtDur(maxDisponible)} libres`, color: "#F59E0B" });
      return;
    }
    const cat = BLOQUE_CATEGORIAS.find(c => c.key === form.categoria) || BLOQUE_CATEGORIAS[0];
    if (editandoId) {
      guardarBloques(bloques.map(b => b.id !== editandoId ? b : {
        ...b, nombre: form.nombre, categoria: form.categoria,
        duracion: durFormTotal, notas: form.notas,
        emoji: cat.emoji, color: cat.color,
      }));
    } else {
      const nuevo = {
        id: Date.now(), nombre: form.nombre, categoria: form.categoria,
        duracion: durFormTotal, notas: form.notas,
        emoji: cat.emoji, color: cat.color, completado: false,
      };
      guardarBloques([...bloques, nuevo]);
    }
    resetForm();
  };

  const toggleCompletado = (id) => {
    const nuevos = bloques.map(b => {
      if (b.id !== id) return b;
      const ahora = !b.completado;
      if (ahora && setGame) setGame(g => ({ ...g, xp: g.xp + 1, coins: g.coins + 1 }));
      return { ...b, completado: ahora };
    });
    guardarBloques(nuevos);
  };

  const eliminarBloque = (id) => guardarBloques(bloques.filter(b => b.id !== id));

  const mover = (idx, dir) => {
    const arr = [...bloques];
    const t = idx + dir;
    if (t < 0 || t >= arr.length) return;
    [arr[idx], arr[t]] = [arr[t], arr[idx]];
    guardarBloques(arr);
  };

  const fmtDur = (min) => {
    const h = Math.floor(min / 60), m = min % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
  };

  const calcHoras = (idx) => {
    const minAcum = bloques.slice(0, idx).reduce((s, b) => s + b.duracion, 0);
    const totalMin = config.horaInicio * 60 + minAcum;
    const h = Math.floor(totalMin / 60), m = totalMin % 60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
  };

  const calcHoraFin = (idx) => {
    const minAcum = bloques.slice(0, idx + 1).reduce((s, b) => s + b.duracion, 0);
    const totalMin = config.horaInicio * 60 + minAcum;
    const h = Math.floor(totalMin / 60), m = totalMin % 60;
    return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
  };

  return (
    <div className="page" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {toast && <Toast msg={toast.msg} color={toast.color} onDone={() => setToast(null)} />}

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 10 }}>
        {[
          { l: "Programado",  v: fmtDur(minutosUsados),            c: "#7C3AED", i: "⏱️" },
          { l: "Libre",       v: fmtDur(minutosLibres),            c: "#10B981", i: "🕊️" },
          { l: "Bloques",     v: bloques.length,                    c: "#06B6D4", i: "📦" },
          { l: "Completados", v: `${completados}/${bloques.length}`,c: "#F59E0B", i: "✅" },
        ].map((s,i) => (
          <div key={i} className="card" style={{ padding: "14px 18px", borderLeft: `3px solid ${s.c}` }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>{s.i}</div>
            <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 700, color: s.c }}>{s.v}</div>
            <div style={{ fontSize: 10, color: "#64748B" }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Barra visual del día */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, color: "#64748B", letterSpacing: 1 }}>
            {String(config.horaInicio).padStart(2,"0")}:00 → {String(config.horaFin).padStart(2,"0")}:00 · {horasDisponibles}h disponibles · {pctUsado}% ocupado
          </div>
          <button onClick={() => setShowConfig(p => !p)}
            style={{ padding: "3px 10px", borderRadius: 6, border: "1px solid #2D2D45", background: "transparent", color: "#64748B", cursor: "pointer", fontSize: 11, fontFamily: "'Rajdhani',sans-serif" }}>
            ⚙️ Ajustar horas
          </button>
        </div>

        {/* Barra segmentada */}
        <div style={{ height: 32, borderRadius: 8, background: "#0A0A12", display: "flex", overflow: "hidden", border: "1px solid #1A1A28" }}>
          {bloques.map(b => (
            <div key={b.id} title={`${b.emoji} ${b.nombre} — ${fmtDur(b.duracion)}`}
              style={{ width: `${(b.duracion / minutosDisponibles) * 100}%`, background: b.completado ? `${b.color}55` : b.color, borderRight: "2px solid #080810", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, overflow: "hidden", transition: "all 0.3s", flexShrink: 0 }}>
              {(b.duracion / minutosDisponibles) * 100 > 5 ? b.emoji : ""}
            </div>
          ))}
          {minutosLibres > 0 && (
            <div style={{ flex: 1, background: "repeating-linear-gradient(45deg,#0A0A12,#0A0A12 4px,#111120 4px,#111120 8px)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#2D2D45", minWidth: 0 }}>
              {pctUsado < 88 ? `${fmtDur(minutosLibres)} libres` : ""}
            </div>
          )}
        </div>

        {/* Config horas */}
        {showConfig && (
          <div style={{ marginTop: 12, padding: "12px 14px", borderRadius: 10, background: "#0A0A12", border: "1px solid #1A1A28", display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap" }}>
            {[
              { label: "Hora inicio", key: "horaInicio" },
              { label: "Hora fin",    key: "horaFin" },
            ].map(({ label, key }) => (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 11, color: "#64748B" }}>{label}:</span>
                <select value={config[key]}
                  onChange={e => guardarConfig({ ...config, [key]: parseInt(e.target.value) })}
                  style={{ width: 80, padding: "4px 8px", fontSize: 12 }}>
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i}>{String(i).padStart(2,"0")}:00</option>
                  ))}
                </select>
              </div>
            ))}
            <span style={{ fontSize: 10, color: "#4A5568" }}>= {horasDisponibles}h totales disponibles</span>
          </div>
        )}
      </div>

      {/* Acciones */}
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button className="btn-primary" style={{ fontSize: 13 }}
          onClick={() => { if (showForm && !editandoId) { resetForm(); } else { resetForm(); setShowForm(true); } }}
          disabled={minutosLibres === 0 && !showForm}>
          {showForm && !editandoId ? "✕ Cancelar" : "+ Nuevo bloque"}
        </button>
        {minutosLibres === 0 && !showForm && (
          <span style={{ fontSize: 11, color: "#F59E0B" }}>⚠️ Día completo — elimina un bloque para agregar más</span>
        )}
        {bloques.length > 0 && (
          <button className="btn-danger" style={{ fontSize: 12, marginLeft: "auto" }}
            onClick={() => { if (window.confirm("¿Limpiar todos los bloques de hoy?")) guardarBloques([]); }}>
            🗑️ Limpiar día
          </button>
        )}
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card" style={{ padding: 20, border: "1px solid rgba(124,58,237,0.35)" }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: "#A78BFA", letterSpacing: 1, marginBottom: 16 }}>
            {editandoId ? "✏️ EDITAR BLOQUE" : "+ NUEVO BLOQUE"}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 5 }}>Nombre de la actividad</div>
              <input placeholder="Ej: Trabajo profundo, Gym, Lectura..."
                value={form.nombre} onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                onKeyDown={e => e.key === "Enter" && confirmarBloque()} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 5 }}>Categoría</div>
              <select value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))}>
                {BLOQUE_CATEGORIAS.map(c => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
              </select>
            </div>
          </div>

          {/* Duración */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 8 }}>
              Duración — máximo disponible:
              <span style={{ color: "#7C3AED", fontWeight: 700, marginLeft: 4 }}>{fmtDur(maxDisponible)}</span>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <select value={form.duracionH}
                  onChange={e => setForm(p => ({ ...p, duracionH: parseInt(e.target.value) }))}
                  style={{ width: 75 }}>
                  {Array.from({ length: Math.floor(maxDisponible / 60) + 1 }, (_, i) => (
                    <option key={i} value={i}>{i}h</option>
                  ))}
                </select>
                <select value={form.duracionM}
                  onChange={e => setForm(p => ({ ...p, duracionM: parseInt(e.target.value) }))}
                  style={{ width: 75 }}>
                  {[0, 15, 30, 45].map(m => <option key={m} value={m}>{m}m</option>)}
                </select>
              </div>
              {durFormTotal > 0 && (
                <div style={{ padding: "5px 14px", borderRadius: 20, background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", fontSize: 12, color: "#A78BFA", fontWeight: 700 }}>
                  = {fmtDur(durFormTotal)}
                </div>
              )}
            </div>
          </div>

          {/* Notas */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, color: "#64748B", marginBottom: 5 }}>Notas (opcional)</div>
            <textarea placeholder="Detalles, objetivo, recordatorio..." rows={2}
              value={form.notas} onChange={e => setForm(p => ({ ...p, notas: e.target.value }))}
              style={{ resize: "none" }} />
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn-secondary" style={{ flex: 1 }} onClick={resetForm}>Cancelar</button>
            <button className="btn-primary" style={{ flex: 2 }} onClick={confirmarBloque}
              disabled={!form.nombre.trim() || durFormTotal === 0}>
              {editandoId ? "💾 Guardar cambios" : "➕ Agregar bloque"}
            </button>
          </div>
        </div>
      )}

      {/* Lista de bloques */}
      {bloques.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 14 }}>⏰</div>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, color: "#4A5568", marginBottom: 8 }}>Rutina vacía</div>
          <div style={{ fontSize: 12, color: "#2D2D45" }}>Crea tu primer bloque para estructurar el día</div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 10, color: "#4A5568", letterSpacing: 2, paddingLeft: 52 }}>
            BLOQUES DEL DÍA — {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}
          </div>

          {bloques.map((b, i) => (
            <div key={b.id} style={{ display: "flex", gap: 0, alignItems: "stretch" }}>
              {/* Línea de tiempo */}
              <div style={{ width: 52, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "flex-end", paddingRight: 10 }}>
                <div style={{ fontSize: 10, color: "#4A5568", fontFamily: "'Orbitron',monospace", lineHeight: 1 }}>{calcHoras(i)}</div>
                <div style={{ flex: 1, width: 2, background: `${b.color}40`, margin: "3px 6px", minHeight: 12 }} />
                <div style={{ fontSize: 10, color: "#2D2D45", fontFamily: "'Orbitron',monospace", lineHeight: 1 }}>{calcHoraFin(i)}</div>
              </div>

              {/* Card del bloque */}
              <div className="card" style={{ flex: 1, padding: "14px 16px", borderLeft: `4px solid ${b.color}`, opacity: b.completado ? 0.62 : 1, transition: "opacity 0.2s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  {/* Contenido */}
                  <div style={{ display: "flex", gap: 10, alignItems: "center", flex: 1, minWidth: 0 }}>
                    {/* Checkbox */}
                    <div onClick={() => toggleCompletado(b.id)}
                      style={{ width: 28, height: 28, borderRadius: 8, border: `2px solid ${b.completado ? b.color : "#2D2D45"}`, background: b.completado ? `${b.color}25` : "transparent", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 14, flexShrink: 0, transition: "all 0.15s" }}>
                      {b.completado ? <span style={{ color: b.color, fontWeight: 900 }}>✓</span> : ""}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: b.completado ? "#4A5568" : "#F1F5F9", textDecoration: b.completado ? "line-through" : "none", marginBottom: 4 }}>
                        {b.emoji} {b.nombre}
                      </div>
                      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                        <span className="tag" style={{ background: `${b.color}20`, color: b.color }}>
                          {BLOQUE_CATEGORIAS.find(c => c.key === b.categoria)?.label || b.categoria}
                        </span>
                        <span className="tag" style={{ background: "rgba(124,58,237,0.1)", color: "#A78BFA" }}>
                          ⏱ {fmtDur(b.duracion)}
                        </span>
                        {b.completado && (
                          <span className="tag" style={{ background: "rgba(16,185,129,0.1)", color: "#10B981" }}>✅ Listo</span>
                        )}
                      </div>
                      {b.notas && (
                        <div style={{ fontSize: 11, color: "#4A5568", marginTop: 6, fontStyle: "italic" }}>📌 {b.notas}</div>
                      )}
                    </div>
                  </div>

                  {/* Controles */}
                  <div style={{ display: "flex", gap: 4, flexShrink: 0, marginLeft: 10 }}>
                    <button onClick={() => mover(i, -1)} disabled={i === 0}
                      style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #2D2D45", background: "#0A0A12", color: "#64748B", cursor: i === 0 ? "default" : "pointer", fontSize: 12, opacity: i === 0 ? 0.3 : 1 }}>↑</button>
                    <button onClick={() => mover(i, 1)} disabled={i === bloques.length - 1}
                      style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #2D2D45", background: "#0A0A12", color: "#64748B", cursor: i === bloques.length - 1 ? "default" : "pointer", fontSize: 12, opacity: i === bloques.length - 1 ? 0.3 : 1 }}>↓</button>
                    <button onClick={() => abrirEdicion(b)}
                      style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #2D2D45", background: "#0A0A12", color: "#64748B", cursor: "pointer", fontSize: 12 }}>✏️</button>
                    <button onClick={() => eliminarBloque(b.id)}
                      style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", color: "#EF4444", cursor: "pointer", fontSize: 13, fontWeight: 700 }}>×</button>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Bloque tiempo libre */}
          {minutosLibres > 0 && (
            <div style={{ display: "flex", gap: 0, alignItems: "center", opacity: 0.4 }}>
              <div style={{ width: 52, flexShrink: 0, display: "flex", justifyContent: "flex-end", paddingRight: 10 }}>
                <div style={{ fontSize: 10, color: "#2D2D45", fontFamily: "'Orbitron',monospace" }}>{calcHoras(bloques.length)}</div>
              </div>
              <div style={{ flex: 1, padding: "10px 16px", borderRadius: 12, border: "1px dashed #1A1A28", display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 18 }}>🕊️</span>
                <div style={{ fontSize: 12, color: "#2D2D45", fontWeight: 600 }}>Tiempo libre — {fmtDur(minutosLibres)}</div>
              </div>
            </div>
          )}

          {/* Resumen final si hay bloques */}
          {completados === bloques.length && bloques.length > 0 && (
            <div style={{ padding: "16px 20px", borderRadius: 12, background: "linear-gradient(135deg,rgba(16,185,129,0.12),rgba(6,182,212,0.08))", border: "1px solid rgba(16,185,129,0.3)", textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>🏆</div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 14, fontWeight: 700, color: "#10B981" }}>¡RUTINA COMPLETADA!</div>
              <div style={{ fontSize: 12, color: "#64748B", marginTop: 4 }}>Completaste los {bloques.length} bloques del día</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


const ShopPage = ({ game, setGame }) => {
  const [activeTab, setActiveTab] = useState("guilty_pleasure");
  const [toast, setToast] = useState(null);
  const [allItems, setAllItems] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    api.shop.items()
      .then(data => setAllItems(data || []))
      .catch(() => {})
      .finally(() => setCargando(false));
  }, []);

  const handleBuy = async (item) => {
    if (item.cooldown) return;
    try {
      await api.shop.comprar(item.id, game.coins);
      if (item.category === "guilty_pleasure") {
        setGame(g => ({ ...g,
          disciplina: Math.max(0, g.disciplina - (item.discCost || 0)),
          xp:         Math.max(0, g.xp         - (item.xpCost  || 0)),
          coins:      Math.max(0, g.coins       - (item.coins   || item.cost || 0)),
        }));
        setToast({ msg: item.danger ? `🚬 FUMASTE — -${item.discCost} Disciplina` : `😈 ${item.name} — -${item.discCost} Disciplina`, color: item.danger ? "#EF4444" : "#F59E0B" });
      } else {
        setGame(g => ({ ...g, coins: Math.max(0, g.coins - (item.coins || item.cost || 0)) }));
        setToast({ msg: `${item.icon} ¡${item.name} activado!`, color: "#10B981" });
      }
    } catch (e) {
      setToast({ msg: `❌ ${e.message}`, color: "#EF4444" });
    }
  };

  const items = allItems
    .filter(i => (i.category || i.item_type) === activeTab)
    .map(i => ({
      id:       i.id,
      name:     i.name        || i.name,
      icon:     i.icon        || "🎁",
      category: i.category    || i.item_type,
      coins:    i.cost_coins  || i.coins || 0,
      discCost: i.discipline_cost || i.discCost || 0,
      xpCost:   i.xp_cost     || i.xpCost || 0,
      danger:   i.is_dangerous || i.danger || false,
      cooldown: i.cooldown_hours ? `${i.cooldown_hours}h` : (i.cooldown || null),
    }));
  return <div className="page" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
    {toast && <Toast msg={toast.msg} color={toast.color} onDone={() => setToast(null)} />}
    <div className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 16 }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 22 }}>🛡️</span><div><div style={{ fontFamily: "'Orbitron',monospace", fontSize: 11, color: "#64748B", letterSpacing: 1 }}>DISCIPLINA</div><div style={{ fontFamily: "'Orbitron',monospace", fontSize: 20, fontWeight: 900, color: game.disciplina > 60 ? "#06B6D4" : game.disciplina > 30 ? "#F59E0B" : "#EF4444" }}>{game.disciplina}/100</div></div></div><div style={{ flex: 1 }}><ProgressBar value={game.disciplina} max={100} color={game.disciplina > 60 ? "#06B6D4" : game.disciplina > 30 ? "#F59E0B" : "#EF4444"} height={10} /></div><div style={{ fontSize: 12, color: "#64748B" }}>{game.disciplina > 75 ? "🟢 Bien" : game.disciplina > 40 ? "🟡 Cuidado" : "🔴 Peligro"}</div></div>
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ display: "flex", gap: 8 }}>{[{ key: "guilty_pleasure", label: "😈 Malos Hábitos" }, { key: "power_up", label: "⚡ Power-Ups" }, { key: "reward", label: "🏆 Rewards" }].map(t => <button key={t.key} onClick={() => setActiveTab(t.key)} className={activeTab === t.key ? "btn-primary" : "btn-secondary"} style={{ fontSize: 13 }}>{t.label}</button>)}</div><div style={{ display: "flex", gap: 8 }}><div style={{ background: "linear-gradient(135deg,#F59E0B,#D97706)", borderRadius: 999, padding: "6px 14px", fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "#1A1A00" }}>🪙 {game.coins}</div><div style={{ background: "linear-gradient(135deg,#7C3AED,#5B21B6)", borderRadius: 999, padding: "6px 14px", fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "white" }}>⚡ {game.xp.toLocaleString()}</div></div></div>
    {activeTab === "guilty_pleasure" && <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 12, color: "#FCA5A5" }}>⚠️ Los malos hábitos te quitan Disciplina y XP. ¡Piénsalo dos veces!</div>}
    <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12 }}>{items.map(item => <div key={item.id} style={{ padding: 14, borderRadius: 10, border: `1px solid ${item.danger ? "rgba(239,68,68,0.3)" : item.cooldown ? "#1E1E30" : "rgba(124,58,237,0.2)"}`, background: item.danger ? "rgba(239,68,68,0.05)" : "#0F0F18", opacity: item.cooldown ? .55 : 1, display: "flex", flexDirection: "column", gap: 8 }}><div style={{ fontSize: 36, textAlign: "center" }}>{item.icon}</div><div style={{ fontSize: 14, fontWeight: 700, color: item.danger ? "#FCA5A5" : "#F1F5F9", textAlign: "center" }}>{item.name}</div>{item.cooldown && <div style={{ fontSize: 11, color: "#EF4444", textAlign: "center" }}>🕐 {item.cooldown}</div>}<div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontSize: 12 }}>{item.coins > 0 && <span style={{ color: "#F59E0B", fontWeight: 700 }}>🪙 {item.coins}</span>}{item.discCost > 0 && <span style={{ color: "#EF4444", fontWeight: 700 }}>🛡️ -{item.discCost}</span>}{item.xpCost > 0 && <span style={{ color: "#A78BFA", fontWeight: 700 }}>⚡ -{item.xpCost} XP</span>}</div><button onClick={() => handleBuy(item)} className={item.cooldown ? "btn-secondary" : item.danger ? "btn-danger" : "btn-primary"} style={{ width: "100%", fontSize: 12 }} disabled={!!item.cooldown}>{item.cooldown ? "No disponible" : item.danger ? "⚠️ Canjear" : "Canjear"}</button></div>)}</div>
  </div>;
};

const PlaceholderPage = ({ name, icon }) => (
  <div className="page" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
    <div style={{ textAlign: "center" }}><div style={{ fontSize: 64, marginBottom: 16 }}>{icon}</div><div style={{ fontFamily: "'Orbitron',monospace", fontSize: 22, fontWeight: 700, color: "#F1F5F9", marginBottom: 8 }}>{name}</div><div style={{ color: "#64748B", marginBottom: 24 }}>Próximamente</div><button className="btn-primary">En construcción</button></div>
  </div>
);

// ============================================================
// AUTENTICACIÓN — LoginPage + LifeHUD con sesión
// ============================================================
// INSTRUCCIONES DE INSTALACIÓN:
//
// 1. En App.js, busca:
//      export default function LifeHUD() {
//    Selecciona DESDE ESA LÍNEA hasta el final del archivo
//    y reemplaza con este archivo completo.
//
// 2. El resto del archivo (mockData, componentes, etc.) NO cambia.
// ============================================================

const API_BASE = `${API_URL}/api/v1`;

// ── Helpers de autenticación ─────────────────────────────────
const getToken  = () => localStorage.getItem("life_hud_token");
const getUser   = () => { try { return JSON.parse(localStorage.getItem("life_hud_user")); } catch { return null; } };
const saveAuth  = (token, user) => { localStorage.setItem("life_hud_token", token); localStorage.setItem("life_hud_user", JSON.stringify(user)); };
const clearAuth = () => { localStorage.removeItem("life_hud_token"); localStorage.removeItem("life_hud_user"); };

// ── Llamadas al backend ──────────────────────────────────────
const apiLogin = async (email, password) => {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username_or_email: email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Credenciales incorrectas");
  }
  return res.json(); // { access_token, token_type }
};

const apiRegister = async (name, email, password) => {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "No se pudo crear la cuenta");
  }
  return res.json();
};

const apiGetMe = async (token) => {
  const res = await fetch(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Sesión expirada");
  return res.json();
};

// ── LoginPage ────────────────────────────────────────────────
const LoginPage = ({ onLogin }) => {
  const [modo, setModo] = useState("login"); // "login" | "register"
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleLogin = async () => {
    if (!form.email || !form.password) { setError("Completa todos los campos"); return; }
    setLoading(true); setError("");
    try {
      const data = await apiLogin(form.email, form.password);
      const user = await apiGetMe(data.access_token);
      saveAuth(data.access_token, user);
      onLogin(user, data.access_token);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!form.name || !form.email || !form.password) { setError("Completa todos los campos"); return; }
    if (form.password !== form.confirm) { setError("Las contraseñas no coinciden"); return; }
    if (form.password.length < 6) { setError("La contraseña debe tener al menos 6 caracteres"); return; }
    setLoading(true); setError("");
    try {
      await apiRegister(form.name, form.email, form.password);
      setSuccessMsg("✅ Cuenta creada. Inicia sesión.");
      setModo("login");
      setForm(f => ({ ...f, name: "", password: "", confirm: "" }));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => { if (e.key === "Enter") modo === "login" ? handleLogin() : handleRegister(); };

  return (
    <div style={{ fontFamily: "'Rajdhani','Orbitron',monospace", background: "#080810", minHeight: "100vh", color: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden" }}>
      <style>{getGlobalStyles()}</style>
      <div className="scanline" />

      {/* Fondo decorativo */}
      <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: "10%", left: "5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(6,182,212,0.06) 0%, transparent 70%)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,58,237,0.04) 0%, transparent 70%)" }} />
      </div>

      {/* Card principal */}
      <div style={{ width: 420, position: "relative", zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 42, fontWeight: 900, color: "#7C3AED", textShadow: "0 0 30px rgba(124,58,237,0.6), 0 0 60px rgba(124,58,237,0.3)", letterSpacing: 4, marginBottom: 6 }}>
            LIFE HUD
          </div>
          <div style={{ fontSize: 13, color: "#4A5568", letterSpacing: 2 }}>SISTEMA DE VIDA GAMIFICADO</div>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 12 }}>
            {["🎯","💰","💪","📚","🔄"].map((e, i) => (
              <span key={i} style={{ fontSize: 18, opacity: 0.6 }}>{e}</span>
            ))}
          </div>
        </div>

        {/* Tabs Login / Registro */}
        <div style={{ display: "flex", marginBottom: 24, borderRadius: 12, overflow: "hidden", border: "1px solid #1E1E30", background: "#0A0A12" }}>
          {[{ key: "login", label: "🔑 Iniciar Sesión" }, { key: "register", label: "✨ Crear Cuenta" }].map(t => (
            <button key={t.key} onClick={() => { setModo(t.key); setError(""); setSuccessMsg(""); }}
              style={{ flex: 1, padding: "12px 0", border: "none", background: modo === t.key ? "#7C3AED" : "transparent", color: modo === t.key ? "white" : "#64748B", fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 14, cursor: "pointer", transition: "all 0.2s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Formulario */}
        <div style={{ background: "#0F0F1A", border: "1px solid #1E1E30", borderRadius: 16, padding: 28, boxShadow: "0 24px 60px rgba(0,0,0,0.5)" }}>

          {successMsg && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", color: "#10B981", fontSize: 13, marginBottom: 16, textAlign: "center" }}>
              {successMsg}
            </div>
          )}

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444", fontSize: 13, marginBottom: 16, textAlign: "center" }}>
              ⚠️ {error}
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {modo === "register" && (
              <div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6, letterSpacing: 1 }}>NOMBRE</div>
                <input
                  placeholder="Nombre de usuario (sin espacios)"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onKeyDown={handleKey}
                  style={{ width: "100%", background: "#080810", border: "1px solid #2D2D45", borderRadius: 8, padding: "11px 14px", color: "#F1F5F9", fontFamily: "'Rajdhani',sans-serif", fontSize: 14, boxSizing: "border-box", outline: "none" }}
                />
              </div>
            )}

            <div>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6, letterSpacing: 1 }}>EMAIL</div>
              <input
                type="email"
                placeholder="tu@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                onKeyDown={handleKey}
                style={{ width: "100%", background: "#080810", border: "1px solid #2D2D45", borderRadius: 8, padding: "11px 14px", color: "#F1F5F9", fontFamily: "'Rajdhani',sans-serif", fontSize: 14, boxSizing: "border-box", outline: "none" }}
              />
            </div>

            <div>
              <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6, letterSpacing: 1 }}>CONTRASEÑA</div>
              <input
                type="password"
                placeholder={modo === "login" ? "Tu contraseña" : "Mínimo 6 caracteres"}
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onKeyDown={handleKey}
                style={{ width: "100%", background: "#080810", border: "1px solid #2D2D45", borderRadius: 8, padding: "11px 14px", color: "#F1F5F9", fontFamily: "'Rajdhani',sans-serif", fontSize: 14, boxSizing: "border-box", outline: "none" }}
              />
            </div>

            {modo === "register" && (
              <div>
                <div style={{ fontSize: 11, color: "#64748B", marginBottom: 6, letterSpacing: 1 }}>CONFIRMAR CONTRASEÑA</div>
                <input
                  type="password"
                  placeholder="Repite la contraseña"
                  value={form.confirm}
                  onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                  onKeyDown={handleKey}
                  style={{ width: "100%", background: "#080810", border: "1px solid #2D2D45", borderRadius: 8, padding: "11px 14px", color: "#F1F5F9", fontFamily: "'Rajdhani',sans-serif", fontSize: 14, boxSizing: "border-box", outline: "none" }}
                />
              </div>
            )}

            <button
              onClick={modo === "login" ? handleLogin : handleRegister}
              disabled={loading}
              style={{ marginTop: 8, padding: "13px", borderRadius: 10, border: "none", background: loading ? "#4C1D95" : "linear-gradient(135deg, #7C3AED, #5B21B6)", color: "white", fontFamily: "'Orbitron',monospace", fontWeight: 700, fontSize: 13, cursor: loading ? "not-allowed" : "pointer", letterSpacing: 2, transition: "all 0.2s", boxShadow: loading ? "none" : "0 0 20px rgba(124,58,237,0.4)" }}>
              {loading ? "⏳ CARGANDO..." : modo === "login" ? "ENTRAR →" : "CREAR CUENTA →"}
            </button>
          </div>

          {/* Info */}
          {modo === "login" && (
            <div style={{ marginTop: 20, padding: "12px 14px", borderRadius: 8, background: "rgba(6,182,212,0.06)", border: "1px solid rgba(6,182,212,0.15)", fontSize: 11, color: "#67E8F9", lineHeight: 1.6 }}>
              🔒 Tu sesión se guarda en este dispositivo. No necesitas volver a ingresar cada vez que abras la app.
            </div>
          )}

          {modo === "register" && (
            <div style={{ marginTop: 20, padding: "12px 14px", borderRadius: 8, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", fontSize: 11, color: "#A78BFA", lineHeight: 1.6 }}>
              ✨ Al crear tu cuenta tendrás tu propio perfil: objetivos, finanzas, rutinas y hábitos guardados en el servidor.
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 20, fontSize: 11, color: "#2D2D45" }}>
          Life HUD v1.0 · Backend: {API_BASE}
        </div>
      </div>
    </div>
  );
};

// ============================================================
// APP PRINCIPAL — con manejo de sesión
// ============================================================
export default function LifeHUD() {
  // ── Auth ───────────────────────────────────────────────────
  const [authUser,  setAuthUser]  = useState(getUser);   // usuario logueado o null
  const [authToken, setAuthToken] = useState(getToken);  // JWT o null
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Verificar token al iniciar (puede haber caducado)
  useEffect(() => {
    const token = getToken();
    if (!token) { setCheckingAuth(false); return; }
    apiGetMe(token)
      .then(user => { setAuthUser(user); setAuthToken(token); })
      .catch(() => { clearAuth(); setAuthUser(null); setAuthToken(null); })
      .finally(() => setCheckingAuth(false));
  }, []);

  const handleLogin = (user, token) => {
    setAuthUser(user);
    setAuthToken(token);
  };

  const handleLogout = () => {
    clearAuth();
    setAuthUser(null);
    setAuthToken(null);
  };

  // ── App state ──────────────────────────────────────────────
  const [activeNav, setActiveNav] = useState(0);
  const [tasks,  setTasks]  = useState([]);
  const [habits, setHabits] = useState([]);
  const [game, setGame] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifehud_game') || 'null') || INITIAL_GAME; }
    catch { return INITIAL_GAME; }
  });
  const [time,   setTime]   = useState(new Date());
  const [showMealModal, setShowMealModal] = useState(false);
  const [toast, setToast] = useState(null);

  // ── Tema claro/oscuro ──────────────────────────────────
  const [temaClaro, setTemaClaro] = useState(() =>
    localStorage.getItem('lifehud_tema') === 'claro'
  );

  // ── Responsive móvil ───────────────────────────────────────
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);
  const toggleTema = () => setTemaClaro(prev => {
    const nuevo = !prev;
    localStorage.setItem('lifehud_tema', nuevo ? 'claro' : 'oscuro');
    return nuevo;
  });

  // ── Notificaciones ─────────────────────────────────────────
  const [notifConfig, setNotifConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lifehud_notif_config') || 'null') || DEFAULT_NOTIF_CONFIG; }
    catch { return DEFAULT_NOTIF_CONFIG; }
  });
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [notifPermiso, setNotifPermiso] = useState(() =>
    typeof Notification !== 'undefined' ? Notification.permission : 'default'
  );

  const pedirPermiso = async () => {
    if (typeof Notification === 'undefined') return;
    const result = await Notification.requestPermission();
    setNotifPermiso(result);
    if (result === 'granted') {
      const cfg = { ...notifConfig, enabled: true };
      setNotifConfig(cfg);
      localStorage.setItem('lifehud_notif_config', JSON.stringify(cfg));
      new Notification('🔔 Life HUD', { body: 'Notificaciones activadas. ¡Te mantendremos en el camino!', icon: '/favicon.ico' });
    }
  };

  const guardarNotifConfig = (nueva) => {
    setNotifConfig(nueva);
    localStorage.setItem('lifehud_notif_config', JSON.stringify(nueva));
  };

  // Revisar cada minuto si corresponde disparar alguna notificación
  useEffect(() => {
    if (!authUser) return;
    const check = () => {
      if (!notifConfig.enabled || notifPermiso !== 'granted') return;
      const ahora   = new Date();
      const horaMin = String(ahora.getHours()).padStart(2,'0') + ':' + String(ahora.getMinutes()).padStart(2,'0');
      const hoyKey  = 'lifehud_notif_fired_' + ahora.toISOString().split('T')[0];
      let disparadas = [];
      try { disparadas = JSON.parse(localStorage.getItem(hoyKey) || '[]'); } catch {}
      Object.entries(notifConfig).forEach(([key, cfg]) => {
        if (key === 'enabled' || !cfg?.enabled || !cfg?.hora) return;
        if (cfg.hora !== horaMin) return;
        if (disparadas.includes(key)) return;
        if (key === 'habitos') {
          const pendientes = habits.filter(h => !h.done).length;
          if (pendientes === 0) return;
        }
        if (key === 'fitness') {
          const hoyISO = ahora.toISOString().split('T')[0];
          let diasEntrenados = [];
          try { diasEntrenados = JSON.parse(localStorage.getItem('lifehud_dias_entrenados') || '[]'); } catch {}
          if (diasEntrenados.includes(hoyISO)) return;
        }
        new Notification(cfg.emoji + ' Life HUD — ' + cfg.label, {
          body: cfg.msg, icon: '/favicon.ico', tag: 'lifehud_' + key,
        });
        disparadas.push(key);
        localStorage.setItem(hoyKey, JSON.stringify(disparadas));
      });
    };
    check();
    const intervalo = setInterval(check, 60000);
    return () => clearInterval(intervalo);
  }, [authUser, notifConfig, notifPermiso, habits]);

  useEffect(() => {
    if (!authUser) return;
    // Cargar gamificación — fusionar con local (no perder XP ganado offline)
    api.game.perfil()
      .then(data => {
        const backendGame = mapGameProfile(data);
        setGame(prev => ({
          ...prev,
          xp:         Math.max(prev.xp,        backendGame.xp),
          coins:      Math.max(prev.coins,      backendGame.coins),
          level:      Math.max(prev.level,      backendGame.level),
          xpNext:     backendGame.xpNext     || prev.xpNext,
          disciplina: Math.max(prev.disciplina, backendGame.disciplina),
          streak:     Math.max(prev.streak,     backendGame.streak),
        }));
      })
      .catch(() => {});
    // Cargar tareas para el Dashboard
    api.tareas.listar()
      .then(data => {
        const mapeadas = (data || []).map(t => ({
          id:       t.id,
          titulo:   t.title,
          done:     t.status === "completed",
          prioridad: ({ high: "alta", medium: "media", low: "baja" }[t.priority]) || "media",
          categoria: t.category || "trabajo",
          estado:   t.status === "completed" ? "completado" : t.status === "in_progress" ? "progreso" : "pendiente",
          fecha:    t.due_date ? t.due_date.split("T")[0] : "",
          subtareas: [],
        }));
        setTasks(mapeadas);
      }).catch(() => {});
    // Cargar hábitos para el Dashboard
    const token8 = localStorage.getItem("life_hud_token");
    api.habitos.listar()
      .then(async data => {
        const activos = (data || []).filter(h => h.is_active !== false && !h.name?.startsWith("[MALO]"));
        const hoy = new Date().toISOString().split("T`)[0];
        const statsArr = await Promise.all(
          activos.map(h =>
            fetch(`${API_URL}/api/v1/habits/${h.id}/stats`, {
              headers: { `Authorization": `Bearer ${token8}` }
            }).then(r => r.ok ? r.json() : null).catch(() => null)
          )
        );
        const mapeados = activos.map((h, i) => {
          const calendar = statsArr[i]?.calendar || {};
          return {
            id:     h.id,
            name:   h.name,
            icon:   h.icon || "⭐",
            color:  "#7C3AED",
            streak: h.current_streak || 0,
            done:   !!calendar[hoy],
          };
        });
        setHabits(mapeados);
      }).catch(() => {});
  }, [authUser]);

  // Persistir game en localStorage cada vez que cambia
  useEffect(() => {
    localStorage.setItem('lifehud_game', JSON.stringify(game));
  }, [game]);

  // Subir de nivel automaticamente cuando se acumula suficiente XP
  useEffect(() => {
    if (game.xp >= game.xpNext) {
      const newLevel  = game.level + 1;
      const newXp     = game.xp - game.xpNext;
      const newXpNext = Math.round(game.xpNext * 1.5);
      setGame(g => ({ ...g, level: newLevel, xp: newXp, xpNext: newXpNext }));
      setToast({ msg: "\u{1F389} NIVEL " + (newLevel) + " ALCANZADO!", color: "#F59E0B" });
    }
  }, [game.xp, game.xpNext]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const handleSaveMealGlobal = (mealData) => {
    const mt = MEAL_TYPES.find(m => m.key === mealData.type);
    // Guardar en localStorage igual que NutricionPage
    const todayKey = `lifehud_meals_${new Date().toISOString().split('T')[0]}`;
    const nueva = {
      id: Date.now(), name: mt.label, type: mealData.type,
      time: mealData.time, calories: mealData.totalCal, icon: mt.icon,
      foods: mealData.foods.map(f => ({ name: f.name, cal: f.cal, p: f.p || 0, c: f.c || 0, f: f.f || 0, gramos: f.gramos || 100 })),
    };
    try {
      const prev = JSON.parse(localStorage.getItem(todayKey) || '[]');
      localStorage.setItem(todayKey, JSON.stringify([...prev, nueva]));
    } catch(_) {}
    setToast({ msg: `${mt.icon} ${mt.label} guardado — ${mealData.totalCal} kcal`, color: mt.color });
    setShowMealModal(false);
  };

  const renderPage = () => {
    switch (activeNav) {
      case 0: return <DashboardPage tasks={tasks} setTasks={setTasks} habits={habits} setHabits={setHabits} game={game} onLogMeal={() => setShowMealModal(true)} onNavigate={setActiveNav} />;
      case 1: return <TareasPage setGame={setGame} />;
      case 2: return <HabitosPage setGame={setGame} onHabitUpdate={(id, updates) => {
        setHabits(prev => prev.map(h => h.id === id ? { ...h, ...updates } : h));
      }} />;
      case 3: return <ObjetivosPage setGame={setGame} />;
      case 4: return <FinanzasPage />;
      case 5: return <LearningPage />;
      case 6: return <FitnessPage game={game} setGame={setGame} />;
      case 7: return <NutricionPage />;
      case 8: return <ShopPage game={game} setGame={setGame} />;
      case 9: return <RutinaPage setGame={setGame} />;
      default: return null;
    }
  };

  // Pantalla de carga mientras verifica el token
  if (checkingAuth) {
    return (
      <div style={{ fontFamily: "'Orbitron',monospace", background: "#080810", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
        <style>{getGlobalStyles()}</style>
        <div style={{ fontSize: 36, fontWeight: 900, color: "#7C3AED", textShadow: "0 0 30px rgba(124,58,237,0.6)" }}>LIFE HUD</div>
        <div style={{ width: 200 }}><div className="ai-thinking" style={{ height: 4, borderRadius: 999 }} /></div>
        <div style={{ fontSize: 11, color: "#4A5568", letterSpacing: 2 }}>INICIANDO...</div>
      </div>
    );
  }

  // Mostrar login si no hay sesión
  if (!authUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // ── App normal ─────────────────────────────────────────────
  const displayName = authUser.name || authUser.username || "Usuario";

  return (
    <div style={{ fontFamily: "'Rajdhani','Orbitron',monospace", background: temaClaro ? "#F0F4F8" : "#080810", minHeight: "100vh", color: temaClaro ? "#1E293B" : "#E2E8F0", display: "flex", flexDirection: isMobile ? "column" : "row", overflow: "hidden" }}>
      <style>{getGlobalStyles(temaClaro)}</style>
      <div className="scanline" />
      {showMealModal && <MealLogModal onClose={() => setShowMealModal(false)} onSave={handleSaveMealGlobal} />}
      {toast && <Toast msg={toast.msg} color={toast.color} onDone={() => setToast(null)} />}
      {/* ── Panel de Notificaciones ── */}
      {showNotifPanel && (
        <div style={{ position: "fixed", top: 60, right: isMobile ? 8 : 16, width: isMobile ? "calc(100vw - 16px)" : 340, background: "#0F0F18", border: "1px solid #2D2D45", borderRadius: 16, boxShadow: "0 8px 32px rgba(0,0,0,0.6)", zIndex: 9999, overflow: "hidden" }}>
          {/* Header */}
          <div style={{ padding: "14px 18px", background: "linear-gradient(135deg,rgba(245,158,11,0.1),rgba(124,58,237,0.08))", borderBottom: "1px solid #1A1A28", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 700, color: "#F1F5F9" }}>🔔 Recordatorios</div>
              <div style={{ fontSize: 10, color: "#4A5568", marginTop: 2 }}>
                {notifPermiso === "granted" ? "✅ Permiso del navegador concedido" : notifPermiso === "denied" ? "❌ Permiso denegado — actívalo en el navegador" : "⚠️ Permiso pendiente"}
              </div>
            </div>
            <button onClick={() => setShowNotifPanel(false)}
              style={{ background: "none", border: "none", color: "#4A5568", cursor: "pointer", fontSize: 20, lineHeight: 1, padding: 0 }}>×</button>
          </div>

          <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Botón activar permiso */}
            {notifPermiso !== "granted" ? (
              <button onClick={pedirPermiso}
                style={{ padding: "11px", borderRadius: 10, background: "linear-gradient(135deg,#F59E0B,#D97706)", border: "none", color: "#1A1A00", fontWeight: 700, cursor: "pointer", fontSize: 13, fontFamily: "'Rajdhani',sans-serif" }}>
                🔔 Activar notificaciones del navegador
              </button>
            ) : (
              /* Toggle global ON/OFF */
              <div onClick={() => guardarNotifConfig({ ...notifConfig, enabled: !notifConfig.enabled })}
                style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", borderRadius: 10, background: notifConfig.enabled ? "rgba(16,185,129,0.1)" : "#0A0A12", border: `1px solid ${notifConfig.enabled ? "#10B981" : "#2D2D45"}`, cursor: "pointer" }}>
                <span style={{ fontSize: 12, color: notifConfig.enabled ? "#10B981" : "#64748B", fontWeight: 700 }}>
                  {notifConfig.enabled ? "✅ Notificaciones activas" : "⭕ Notificaciones desactivadas"}
                </span>
                <div style={{ width: 38, height: 21, borderRadius: 999, background: notifConfig.enabled ? "#10B981" : "#1A1A28", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: 2.5, left: notifConfig.enabled ? 19 : 2.5, width: 16, height: 16, borderRadius: "50%", background: "white", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
                </div>
              </div>
            )}

            {/* Lista de recordatorios individuales */}
            {Object.entries(DEFAULT_NOTIF_CONFIG)
              .filter(([k]) => k !== "enabled")
              .map(([key, def]) => {
                const cfg    = notifConfig[key] || def;
                const activo = notifConfig.enabled && notifPermiso === "granted";
                return (
                  <div key={key} style={{ padding: "11px 14px", borderRadius: 12, background: "#0A0A12", border: `1px solid ${cfg.enabled && activo ? "#2D3748" : "#1A1A28"}`, opacity: activo ? 1 : 0.45, transition: "opacity 0.2s" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: cfg.enabled && activo ? 8 : 0 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <span style={{ fontSize: 17 }}>{cfg.emoji}</span>
                        <div>
                          <div style={{ fontSize: 12, color: cfg.enabled && activo ? "#F1F5F9" : "#4A5568", fontWeight: 600 }}>{cfg.label}</div>
                          {!cfg.enabled && <div style={{ fontSize: 9, color: "#2D2D45" }}>Desactivado</div>}
                        </div>
                      </div>
                      {/* Toggle individual */}
                      <div onClick={() => activo && guardarNotifConfig({ ...notifConfig, [key]: { ...cfg, enabled: !cfg.enabled } })}
                        style={{ width: 38, height: 21, borderRadius: 999, background: cfg.enabled && activo ? "#7C3AED" : "#1A1A28", cursor: activo ? "pointer" : "default", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                        <div style={{ position: "absolute", top: 2.5, left: cfg.enabled && activo ? 19 : 2.5, width: 16, height: 16, borderRadius: "50%", background: cfg.enabled && activo ? "white" : "#4A5568", transition: "left 0.2s" }} />
                      </div>
                    </div>
                    {/* Selector de hora */}
                    {cfg.enabled && activo && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 10, color: "#4A5568", flexShrink: 0 }}>⏰ Hora:</span>
                        <input type="time" value={cfg.hora}
                          onChange={e => guardarNotifConfig({ ...notifConfig, [key]: { ...cfg, hora: e.target.value } })}
                          style={{ flex: 1, padding: "4px 8px", fontSize: 12, borderRadius: 6, background: "#080810", border: "1px solid #2D2D45", color: "#F1F5F9" }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}

            <div style={{ fontSize: 10, color: "#2D2D45", textAlign: "center", lineHeight: 1.6, paddingTop: 2 }}>
              Hábitos y Fitness solo avisan si aún no los completaste ese día.
            </div>
          </div>
        </div>
      )}
      {/* Sidebar desktop / Bottom nav móvil */}
      {isMobile ? (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, height: 64, background: temaClaro ? "#FFFFFF" : "#0A0A14", borderTop: `1px solid ${temaClaro ? "#E2E8F0" : "#1A1A28"}`, display: "flex", alignItems: "center", justifyContent: "space-around", zIndex: 200, paddingBottom: "env(safe-area-inset-bottom)" }}>
          {NAV_ITEMS.map((item, i) => (
            <div key={i} onClick={() => setActiveNav(i)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 4px", borderRadius: 8, cursor: "pointer", flex: 1, transition: "all 0.15s", color: activeNav === i ? "#7C3AED" : temaClaro ? "#94A3B8" : "#4A5568" }}>
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span style={{ fontSize: 8, fontFamily: "'Rajdhani',sans-serif", fontWeight: activeNav === i ? 700 : 400, letterSpacing: 0.5 }}>{item.label}</span>
              {activeNav === i && <div style={{ width: 4, height: 4, borderRadius: "50%", background: "#7C3AED" }} />}
            </div>
          ))}
          <div onClick={handleLogout}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, padding: "6px 4px", borderRadius: 8, cursor: "pointer", flex: 1, color: temaClaro ? "#94A3B8" : "#4A5568" }}>
            <span style={{ fontSize: 20 }}>🚪</span>
            <span style={{ fontSize: 8, fontFamily: "'Rajdhani',sans-serif" }}>Salir</span>
          </div>
        </div>
      ) : (
        <div style={{ width: 72, background: temaClaro ? "linear-gradient(180deg,#FFFFFF,#F8FAFC)" : "linear-gradient(180deg,#0A0A14,#080810)", borderRight: `1px solid ${temaClaro ? "#E2E8F0" : "#1A1A28"}`, display: "flex", flexDirection: "column", alignItems: "center", padding: "16px 8px", gap: 4, flexShrink: 0 }}>
          <div style={{ fontFamily: "'Orbitron',monospace", fontSize: 13, fontWeight: 900, color: "#7C3AED", marginBottom: 16, textShadow: temaClaro ? "none" : "0 0 12px rgba(124,58,237,0.6)" }}>HUD</div>
          {NAV_ITEMS.map((item, i) => (
            <div key={i} className={`nav-item ${activeNav === i ? "active" : ""}`} onClick={() => setActiveNav(i)}>
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
          <div style={{ flex: 1 }} />
          <div className="nav-item" onClick={handleLogout} title="Cerrar sesión" style={{ cursor: "pointer" }}>
            <span style={{ fontSize: 18 }}>🚪</span>
            <span>Salir</span>
          </div>
        </div>
      )}

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", marginTop: isMobile ? 0 : 0 }}>
        {/* Header */}
        <div style={{ padding: isMobile ? "8px 14px" : "10px 24px", borderBottom: `1px solid ${temaClaro ? "#E2E8F0" : "#1A1A28"}`, background: temaClaro ? "linear-gradient(90deg,#FFFFFF,#F8FAFC)" : "linear-gradient(90deg,#0A0A14,#0D0D1A)", display: "flex", alignItems: "center", gap: isMobile ? 8 : 14 }}>
          {/* Avatar + nombre */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
            <div style={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#06B6D4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 13 : 16, fontWeight: 700, boxShadow: "0 0 12px rgba(124,58,237,0.5)", flexShrink: 0, color: "white" }}>
              {displayName[0].toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              {!isMobile && <div style={{ fontSize: 12, color: "#94A3B8" }}>{time.toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "short" })}</div>}
              <div style={{ fontFamily: "'Orbitron',monospace", fontSize: isMobile ? 11 : 14, fontWeight: 700, color: temaClaro ? "#1E293B" : "#F1F5F9", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{isMobile ? displayName : `Hola, ${displayName}`}</div>
            </div>
          </div>
          {/* Barra XP — solo desktop */}
          {!isMobile && (
            <div style={{ width: 220 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "#64748B", marginBottom: 4 }}>
                <span style={{ fontFamily: "'Orbitron',monospace" }}>NIVEL {game.level}</span>
                <span>{game.xp.toLocaleString()} / {game.xpNext.toLocaleString()}</span>
              </div>
              <ProgressBar value={game.xp} max={game.xpNext} color="#7C3AED" height={5} />
            </div>
          )}
          {/* Stats chips — desktop: 4, móvil: 2 compactos */}
          {isMobile ? (
            <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
              <span style={{ background: "linear-gradient(135deg,#7C3AED,#5B21B6)", borderRadius: 999, padding: "3px 8px", fontSize: 11, fontWeight: 700, color: "white" }}>⚡{game.xp}</span>
              <span style={{ background: "linear-gradient(135deg,#EF4444,#B91C1C)", borderRadius: 999, padding: "3px 8px", fontSize: 11, fontWeight: 700, color: "white" }}>🔥{game.streak}d</span>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 6 }}>
              {[
                { text: `⚡ ${game.xp.toLocaleString()}`,  bg: "linear-gradient(135deg,#7C3AED,#5B21B6)", color: "white" },
                { text: `🪙 ${game.coins}`,                bg: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#1A1A00" },
                { text: `🔥 ${game.streak}d`,              bg: "linear-gradient(135deg,#EF4444,#B91C1C)", color: "white" },
                { text: `🛡️ ${game.disciplina}`,           bg: game.disciplina > 60 ? "linear-gradient(135deg,#0891B2,#06B6D4)" : game.disciplina > 30 ? "linear-gradient(135deg,#D97706,#F59E0B)" : "linear-gradient(135deg,#B91C1C,#EF4444)", color: "white" },
              ].map((b, i) => (
                <span key={i} style={{ background: b.bg, borderRadius: 999, padding: "3px 10px", fontSize: 11, fontWeight: 700, color: b.color }}>{b.text}</span>
              ))}
            </div>
          )}
          {/* Mensaje IA — solo desktop */}
          {!isMobile && (
            <div style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: "#A78BFA", maxWidth: 200 }}>
              🤖 <em>Llevas {game.streak} días — ¡no pares!</em>
            </div>
          )}
          {/* Botón tema */}
          <button onClick={toggleTema} title={temaClaro ? "Modo oscuro" : "Modo claro"}
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${temaClaro ? "#CBD5E1" : "#2D2D45"}`, background: temaClaro ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.04)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            {temaClaro ? "🌙" : "☀️"}
          </button>
          <button onClick={() => setShowNotifPanel(p => !p)} title="Notificaciones"
            style={{ width: 32, height: 32, borderRadius: 8, border: `1px solid ${notifConfig.enabled && notifPermiso === "granted" ? "#F59E0B" : "#2D2D45"}`, background: notifConfig.enabled && notifPermiso === "granted" ? "rgba(245,158,11,0.15)" : "rgba(255,255,255,0.04)", cursor: "pointer", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, position: "relative" }}>
            🔔
            {notifConfig.enabled && notifPermiso === "granted" && (
              <div style={{ position: "absolute", top: 3, right: 3, width: 6, height: 6, borderRadius: "50%", background: "#F59E0B" }} />
            )}
          </button>
        </div>

        {/* Page title */}
        <div style={{ padding: isMobile ? "8px 14px 0" : "10px 24px 0", display: "flex", alignItems: "center", gap: 8, borderBottom: `1px solid ${temaClaro ? "#F1F5F9" : "transparent"}` }}>
          <span style={{ fontSize: 18 }}>{NAV_ITEMS[activeNav].icon}</span>
          <span style={{ fontFamily: "'Orbitron',monospace", fontSize: isMobile ? 11 : 13, fontWeight: 700, color: "#A78BFA", letterSpacing: 2 }}>{NAV_ITEMS[activeNav].label.toUpperCase()}</span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflow: "auto", padding: isMobile ? "10px 12px 80px" : "14px 24px 24px" }}>{renderPage()}</div>
      </div>

      {/* FAB global */}
      {activeNav !== 7 && (
        <button className="fab" onClick={() => setShowMealModal(true)} title="Registrar comida rápida"
          style={{ bottom: isMobile ? 76 : 28, right: isMobile ? 16 : 28 }}>🍽️</button>
      )}
    </div>
  );
}