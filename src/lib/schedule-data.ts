export type CourseType = "lecture" | "td" | "tp" | "exam" | "meeting"

export interface ScheduleEvent {
  id: string
  title: string
  type: CourseType
  professor: string
  room: string
  startTime: string
  endTime: string
  day: number // 0 = Monday, 4 = Friday
  description?: string
}

export interface FilterState {
  types: CourseType[]
  professors: string[]
  rooms: string[]
}

// Sample data for demonstration
export const sampleEvents: ScheduleEvent[] = [
  {
    id: "1",
    title: "Algorithmique Avancée",
    type: "lecture",
    professor: "Dr. Martin Dupont",
    room: "Amphi A",
    startTime: "08:00",
    endTime: "10:00",
    day: 0,
    description: "Introduction aux algorithmes de tri avancés"
  },
  {
    id: "2",
    title: "Base de Données",
    type: "td",
    professor: "Prof. Sophie Laurent",
    room: "Salle 204",
    startTime: "10:15",
    endTime: "12:15",
    day: 0,
    description: "TD sur les requêtes SQL complexes"
  },
  {
    id: "3",
    title: "Programmation Web",
    type: "tp",
    professor: "M. Thomas Bernard",
    room: "Labo Info 3",
    startTime: "14:00",
    endTime: "17:00",
    day: 0,
    description: "TP React et Node.js"
  },
  {
    id: "4",
    title: "Mathématiques Discrètes",
    type: "lecture",
    professor: "Dr. Claire Morel",
    room: "Amphi B",
    startTime: "08:00",
    endTime: "10:00",
    day: 1,
    description: "Théorie des graphes"
  },
  {
    id: "5",
    title: "Réseaux Informatiques",
    type: "td",
    professor: "Prof. Jean Petit",
    room: "Salle 301",
    startTime: "10:15",
    endTime: "12:15",
    day: 1,
    description: "Configuration réseau TCP/IP"
  },
  {
    id: "6",
    title: "Intelligence Artificielle",
    type: "lecture",
    professor: "Dr. Marie Leroy",
    room: "Amphi C",
    startTime: "14:00",
    endTime: "16:00",
    day: 1,
    description: "Machine Learning fondamentaux"
  },
  {
    id: "7",
    title: "Algorithmique Avancée",
    type: "tp",
    professor: "Dr. Martin Dupont",
    room: "Labo Info 1",
    startTime: "08:00",
    endTime: "11:00",
    day: 2,
    description: "Implémentation d'algorithmes"
  },
  {
    id: "8",
    title: "Projet Tuteuré",
    type: "meeting",
    professor: "Prof. Sophie Laurent",
    room: "Salle Réunion 2",
    startTime: "14:00",
    endTime: "16:00",
    day: 2,
    description: "Point d'avancement projet"
  },
  {
    id: "9",
    title: "Base de Données",
    type: "lecture",
    professor: "Prof. Sophie Laurent",
    room: "Amphi A",
    startTime: "08:00",
    endTime: "10:00",
    day: 3,
    description: "Optimisation des bases de données"
  },
  {
    id: "10",
    title: "Sécurité Informatique",
    type: "td",
    professor: "M. Lucas Girard",
    room: "Salle 205",
    startTime: "10:15",
    endTime: "12:15",
    day: 3,
    description: "Cryptographie appliquée"
  },
  {
    id: "11",
    title: "Intelligence Artificielle",
    type: "tp",
    professor: "Dr. Marie Leroy",
    room: "Labo Info 2",
    startTime: "14:00",
    endTime: "17:00",
    day: 3,
    description: "TP sur les réseaux de neurones"
  },
  {
    id: "12",
    title: "Examen Partiel",
    type: "exam",
    professor: "Dr. Martin Dupont",
    room: "Amphi A",
    startTime: "09:00",
    endTime: "12:00",
    day: 4,
    description: "Examen Algorithmique Avancée"
  },
  {
    id: "13",
    title: "Programmation Web",
    type: "lecture",
    professor: "M. Thomas Bernard",
    room: "Amphi B",
    startTime: "14:00",
    endTime: "16:00",
    day: 4,
    description: "Architecture microservices"
  },
]

export const courseTypeLabels: Record<CourseType, string> = {
  lecture: "Cours Magistral",
  td: "Travaux Dirigés",
  tp: "Travaux Pratiques",
  exam: "Examen",
  meeting: "Réunion"
}

export const courseTypeColors: Record<CourseType, { bg: string; border: string; text: string }> = {
  lecture: { 
    bg: "bg-blue-500/20", 
    border: "border-l-blue-500", 
    text: "text-blue-400" 
  },
  td: { 
    bg: "bg-emerald-500/20", 
    border: "border-l-emerald-500", 
    text: "text-emerald-400" 
  },
  tp: { 
    bg: "bg-amber-500/20", 
    border: "border-l-amber-500", 
    text: "text-amber-400" 
  },
  exam: { 
    bg: "bg-rose-500/20", 
    border: "border-l-rose-500", 
    text: "text-rose-400" 
  },
  meeting: { 
    bg: "bg-violet-500/20", 
    border: "border-l-violet-500", 
    text: "text-violet-400" 
  },
}

export const timeSlots = [
  "08:00", "09:00", "10:00", "11:00", "12:00",
  "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"
]

export const weekDays = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi"]
