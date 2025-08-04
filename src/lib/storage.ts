import { Exercise, Workout, WorkoutTemplate, BodyWeight, UserProfile } from '../../shared/types';

const STORAGE_KEYS = {
  exercises: 'gym-tracker-exercises',
  workouts: 'gym-tracker-workouts',
  templates: 'gym-tracker-templates',
  bodyWeights: 'gym-tracker-body-weights',
  userProfile: 'gym-tracker-user-profile'
};

export class StorageService {
  // Exercices
  static getExercises(): Exercise[] {
    const data = localStorage.getItem(STORAGE_KEYS.exercises);
    if (!data) {
      // Initialiser avec des exercices par défaut
      const defaultExercises = this.getDefaultExercises();
      this.setExercises(defaultExercises);
      return defaultExercises;
    }
    return JSON.parse(data).map((ex: any) => ({
      ...ex,
      createdAt: new Date(ex.createdAt),
      updatedAt: new Date(ex.updatedAt)
    }));
  }

  static setExercises(exercises: Exercise[]): void {
    localStorage.setItem(STORAGE_KEYS.exercises, JSON.stringify(exercises));
  }

  static addExercise(exercise: Omit<Exercise, 'id' | 'createdAt' | 'updatedAt'>): Exercise {
    const exercises = this.getExercises();
    const newExercise: Exercise = {
      ...exercise,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    exercises.push(newExercise);
    this.setExercises(exercises);
    return newExercise;
  }

  static updateExercise(id: string, updates: Partial<Exercise>): Exercise | null {
    const exercises = this.getExercises();
    const index = exercises.findIndex(ex => ex.id === id);
    if (index === -1) return null;
    
    exercises[index] = {
      ...exercises[index],
      ...updates,
      updatedAt: new Date()
    };
    this.setExercises(exercises);
    return exercises[index];
  }

  static deleteExercise(id: string): boolean {
    const exercises = this.getExercises();
    const filtered = exercises.filter(ex => ex.id !== id);
    if (filtered.length === exercises.length) return false;
    this.setExercises(filtered);
    return true;
  }

  // Séances
  static getWorkouts(): Workout[] {
    const data = localStorage.getItem(STORAGE_KEYS.workouts);
    if (!data) return [];
    return JSON.parse(data).map((workout: any) => ({
      ...workout,
      date: new Date(workout.date),
      createdAt: new Date(workout.createdAt),
      updatedAt: new Date(workout.updatedAt)
    }));
  }

  static setWorkouts(workouts: Workout[]): void {
    localStorage.setItem(STORAGE_KEYS.workouts, JSON.stringify(workouts));
  }

  static addWorkout(workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>): Workout {
    const workouts = this.getWorkouts();
    const newWorkout: Workout = {
      ...workout,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    workouts.push(newWorkout);
    this.setWorkouts(workouts);
    return newWorkout;
  }

  static updateWorkout(id: string, updates: Partial<Workout>): Workout | null {
    const workouts = this.getWorkouts();
    const index = workouts.findIndex(w => w.id === id);
    if (index === -1) return null;
    
    workouts[index] = {
      ...workouts[index],
      ...updates,
      updatedAt: new Date()
    };
    this.setWorkouts(workouts);
    return workouts[index];
  }

  static deleteWorkout(id: string): boolean {
    const workouts = this.getWorkouts();
    const filtered = workouts.filter(w => w.id !== id);
    if (filtered.length === workouts.length) return false;
    this.setWorkouts(filtered);
    return true;
  }

  // Templates
  static getTemplates(): WorkoutTemplate[] {
    const data = localStorage.getItem(STORAGE_KEYS.templates);
    if (!data) return [];
    return JSON.parse(data).map((template: any) => ({
      ...template,
      createdAt: new Date(template.createdAt),
      updatedAt: new Date(template.updatedAt)
    }));
  }

  static setTemplates(templates: WorkoutTemplate[]): void {
    localStorage.setItem(STORAGE_KEYS.templates, JSON.stringify(templates));
  }

  static addTemplate(template: Omit<WorkoutTemplate, 'id' | 'createdAt' | 'updatedAt'>): WorkoutTemplate {
    const templates = this.getTemplates();
    const newTemplate: WorkoutTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    templates.push(newTemplate);
    this.setTemplates(templates);
    return newTemplate;
  }

  static deleteTemplate(id: string): boolean {
    const templates = this.getTemplates();
    const filtered = templates.filter(t => t.id !== id);
    if (filtered.length === templates.length) return false;
    this.setTemplates(filtered);
    return true;
  }

  // Poids corporel
  static getBodyWeights(): BodyWeight[] {
    const data = localStorage.getItem(STORAGE_KEYS.bodyWeights);
    if (!data) return [];
    return JSON.parse(data).map((weight: any) => ({
      ...weight,
      date: new Date(weight.date)
    }));
  }

  static setBodyWeights(weights: BodyWeight[]): void {
    localStorage.setItem(STORAGE_KEYS.bodyWeights, JSON.stringify(weights));
  }

  static addBodyWeight(weight: Omit<BodyWeight, 'id'>): BodyWeight {
    const weights = this.getBodyWeights();
    const newWeight: BodyWeight = {
      ...weight,
      id: Date.now().toString()
    };
    weights.push(newWeight);
    this.setBodyWeights(weights);
    return newWeight;
  }

  // Profil utilisateur
  static getUserProfile(): UserProfile | null {
    const data = localStorage.getItem(STORAGE_KEYS.userProfile);
    if (!data) return null;
    const profile = JSON.parse(data);
    return {
      ...profile,
      createdAt: new Date(profile.createdAt),
      updatedAt: new Date(profile.updatedAt)
    };
  }

  static setUserProfile(profile: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.userProfile, JSON.stringify(profile));
  }

  static updateUserProfile(updates: Partial<UserProfile>): UserProfile {
    const currentProfile = this.getUserProfile();
    const newProfile: UserProfile = {
      name: '',
      ...currentProfile,
      ...updates,
      updatedAt: new Date(),
      createdAt: currentProfile?.createdAt || new Date()
    };
    this.setUserProfile(newProfile);
    return newProfile;
  }

  // Export/Import
  static exportData() {
    return {
      exercises: this.getExercises(),
      workouts: this.getWorkouts(),
      templates: this.getTemplates(),
      bodyWeights: this.getBodyWeights(),
      userProfile: this.getUserProfile(),
      exportDate: new Date()
    };
  }

  static importData(data: any) {
    if (data.exercises) this.setExercises(data.exercises);
    if (data.workouts) this.setWorkouts(data.workouts);
    if (data.templates) this.setTemplates(data.templates);
    if (data.bodyWeights) this.setBodyWeights(data.bodyWeights);
    if (data.userProfile) this.setUserProfile(data.userProfile);
  }

  // Exercices par défaut
  static getDefaultExercises(): Exercise[] {
    const now = new Date();
    return [
      {
        id: '1',
        name: 'Développé couché',
        category: 'Pectoraux',
        muscleGroups: ['Pectoraux', 'Triceps', 'Deltoïdes'],
        description: 'Exercice de base pour développer les pectoraux',
        createdAt: now,
        updatedAt: now
      },
      {
        id: '2',
        name: 'Squat',
        category: 'Jambes',
        muscleGroups: ['Quadriceps', 'Fessiers', 'Mollets'],
        description: 'Exercice fondamental pour les jambes',
        createdAt: now,
        updatedAt: now
      },
      {
        id: '3',
        name: 'Soulevé de terre',
        category: 'Dos',
        muscleGroups: ['Dorsaux', 'Trapèzes', 'Fessiers', 'Ischio-jambiers'],
        description: 'Exercice complet pour la chaîne postérieure',
        createdAt: now,
        updatedAt: now
      },
      {
        id: '4',
        name: 'Développé militaire',
        category: 'Épaules',
        muscleGroups: ['Deltoïdes', 'Triceps'],
        description: 'Développement des épaules',
        createdAt: now,
        updatedAt: now
      },
      {
        id: '5',
        name: 'Tractions',
        category: 'Dos',
        muscleGroups: ['Dorsaux', 'Biceps', 'Rhomboïdes'],
        description: 'Exercice au poids du corps pour le dos',
        createdAt: now,
        updatedAt: now
      },
      {
        id: '6',
        name: 'Dips',
        category: 'Pectoraux',
        muscleGroups: ['Pectoraux', 'Triceps', 'Deltoïdes'],
        description: 'Exercice au poids du corps pour les pectoraux',
        createdAt: now,
        updatedAt: now
      },
      {
        id: '7',
        name: 'Curl biceps',
        category: 'Bras',
        muscleGroups: ['Biceps'],
        description: 'Isolation des biceps',
        createdAt: now,
        updatedAt: now
      },
      {
        id: '8',
        name: 'Extension triceps',
        category: 'Bras',
        muscleGroups: ['Triceps'],
        description: 'Isolation des triceps',
        createdAt: now,
        updatedAt: now
      },
      {
        id: '9',
        name: 'Rowing barre',
        category: 'Dos',
        muscleGroups: ['Dorsaux', 'Rhomboïdes', 'Biceps'],
        description: 'Exercice pour l\'épaisseur du dos',
        createdAt: now,
        updatedAt: now
      },
      {
        id: '10',
        name: 'Leg press',
        category: 'Jambes',
        muscleGroups: ['Quadriceps', 'Fessiers'],
        description: 'Alternative au squat à la machine',
        createdAt: now,
        updatedAt: now
      }
    ];
  }
}