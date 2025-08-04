// Types partagés pour l'application Gym Tracker

export interface Exercise {
  id: string;
  name: string;
  category: string;
  muscleGroups: string[];
  description?: string;
  instructions?: string;
  equipment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Set {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
  restTime?: number; // en secondes
  notes?: string;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exercise: Exercise;
  sets: Set[];
  targetSets: number;
  targetReps: number;
  targetWeight: number;
  restTime?: number; // temps de repos en secondes pour cet exercice
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  date: Date;
  exercises: WorkoutExercise[];
  completed: boolean;
  started?: boolean; // Nouvelle propriété pour savoir si la séance a vraiment commencé
  duration?: number; // en minutes
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: Array<{
    exerciseId: string;
    targetSets: number;
    targetReps: number;
    targetWeight?: number;
    restTime?: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface BodyWeight {
  id: string;
  weight: number;
  date: Date;
  notes?: string;
}

export interface UserProfile {
  name: string;
  age?: number;
  height?: number; // en cm
  currentWeight?: number; // en kg
  goalWeight?: number; // en kg (renommé de targetWeight)
  targetWeight?: number; // garde pour compatibilité
  fitnessLevel?: 'Débutant' | 'Intermédiaire' | 'Avancé';
  goals?: string; // objectifs en texte libre
  fitnessGoals?: string[]; // garde pour compatibilité
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PerformanceRecord {
  exerciseId: string;
  weight: number;
  reps: number;
  date: Date;
  workoutId: string;
}