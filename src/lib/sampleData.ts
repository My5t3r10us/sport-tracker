// Script pour créer des données d'exemple
import { StorageService } from "./storage";

export function createSampleData() {
  // Obtenir les exercices existants
  const exercises = StorageService.getExercises();
  
  if (exercises.length === 0) {
    console.log("Aucun exercice trouvé. Assurez-vous d'avoir initialisé les exercices par défaut.");
    return;
  }

  // Créer quelques séances terminées avec des données de progression
  const now = new Date();
  
  // Séance d'il y a 2 mois
  const twoMonthsAgo = new Date();
  twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
  
  // Séance d'il y a 1 mois
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  
  // Séances récentes dans le mois actuel
  const twoWeeksAgo = new Date();
  twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
  
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const developeCouche = exercises.find(ex => ex.name === "Développé couché");
  const squat = exercises.find(ex => ex.name === "Squat");
  const souleve = exercises.find(ex => ex.name === "Soulevé de terre");

  if (!developeCouche || !squat || !souleve) {
    console.log("Exercices de base non trouvés");
    return;
  }

  // Séance 1 - Il y a 2 mois (poids plus faibles)
  const workout1 = StorageService.addWorkout({
    name: "Push Day - Début",
    date: twoMonthsAgo,
    completed: true,
    duration: 90,
    notes: "Séance de début, charges modérées",
    exercises: [
      {
        id: "1",
        exerciseId: developeCouche.id,
        exercise: developeCouche,
        targetSets: 4,
        targetReps: 8,
        targetWeight: 50,
        sets: [
          { id: "1", reps: 8, weight: 50, completed: true },
          { id: "2", reps: 8, weight: 50, completed: true },
          { id: "3", reps: 7, weight: 50, completed: true },
          { id: "4", reps: 6, weight: 50, completed: true }
        ]
      }
    ]
  });

  // Séance 2 - Il y a 1 mois (progression)
  const workout2 = StorageService.addWorkout({
    name: "Push Day - Progression",
    date: oneMonthAgo,
    completed: true,
    duration: 85,
    notes: "Augmentation de charge réussie",
    exercises: [
      {
        id: "1",
        exerciseId: developeCouche.id,
        exercise: developeCouche,
        targetSets: 4,
        targetReps: 8,
        targetWeight: 60,
        sets: [
          { id: "1", reps: 8, weight: 60, completed: true },
          { id: "2", reps: 8, weight: 60, completed: true },
          { id: "3", reps: 8, weight: 60, completed: true },
          { id: "4", reps: 7, weight: 60, completed: true }
        ]
      }
    ]
  });

  // Séance 3 - Il y a 2 semaines (mois actuel)
  const workout3 = StorageService.addWorkout({
    name: "Push Day - Mois actuel",
    date: twoWeeksAgo,
    completed: true,
    duration: 80,
    notes: "Bonne progression ce mois",
    exercises: [
      {
        id: "1",
        exerciseId: developeCouche.id,
        exercise: developeCouche,
        targetSets: 4,
        targetReps: 8,
        targetWeight: 65,
        sets: [
          { id: "1", reps: 8, weight: 65, completed: true },
          { id: "2", reps: 8, weight: 65, completed: true },
          { id: "3", reps: 8, weight: 65, completed: true },
          { id: "4", reps: 8, weight: 65, completed: true }
        ]
      }
    ]
  });

  // Séance 4 - Il y a 1 semaine (mois actuel)
  const workout4 = StorageService.addWorkout({
    name: "Push Day - Semaine passée",
    date: oneWeekAgo,
    completed: true,
    duration: 75,
    notes: "Excellent entraînement",
    exercises: [
      {
        id: "1",
        exerciseId: developeCouche.id,
        exercise: developeCouche,
        targetSets: 4,
        targetReps: 8,
        targetWeight: 67.5,
        sets: [
          { id: "1", reps: 8, weight: 67.5, completed: true },
          { id: "2", reps: 8, weight: 67.5, completed: true },
          { id: "3", reps: 8, weight: 67.5, completed: true },
          { id: "4", reps: 7, weight: 67.5, completed: true }
        ]
      }
    ]
  });

  // Séance 5 - Il y a 3 jours (mois actuel)
  const workout5 = StorageService.addWorkout({
    name: "Push Day - Récent",
    date: threeDaysAgo,
    completed: true,
    duration: 78,
    notes: "Nouvelle charge maîtrisée !",
    exercises: [
      {
        id: "1",
        exerciseId: developeCouche.id,
        exercise: developeCouche,
        targetSets: 4,
        targetReps: 8,
        targetWeight: 70,
        sets: [
          { id: "1", reps: 8, weight: 70, completed: true },
          { id: "2", reps: 8, weight: 70, completed: true },
          { id: "3", reps: 8, weight: 70, completed: true },
          { id: "4", reps: 8, weight: 70, completed: true }
        ]
      }
    ]
  });

  // Séance 6 - Leg Day il y a 1 mois
  const workout6 = StorageService.addWorkout({
    name: "Leg Day - Mois passé",
    date: oneMonthAgo,
    completed: true,
    duration: 95,
    exercises: [
      {
        id: "1",
        exerciseId: squat.id,
        exercise: squat,
        targetSets: 4,
        targetReps: 10,
        targetWeight: 80,
        sets: [
          { id: "1", reps: 10, weight: 80, completed: true },
          { id: "2", reps: 10, weight: 80, completed: true },
          { id: "3", reps: 9, weight: 80, completed: true },
          { id: "4", reps: 8, weight: 80, completed: true }
        ]
      }
    ]
  });

  // Séance 7 - Leg Day récent (mois actuel)
  const workout7 = StorageService.addWorkout({
    name: "Leg Day - Mois actuel",
    date: oneWeekAgo,
    completed: true,
    duration: 90,
    exercises: [
      {
        id: "1",
        exerciseId: squat.id,
        exercise: squat,
        targetSets: 4,
        targetReps: 10,
        targetWeight: 85,
        sets: [
          { id: "1", reps: 10, weight: 85, completed: true },
          { id: "2", reps: 10, weight: 85, completed: true },
          { id: "3", reps: 10, weight: 85, completed: true },
          { id: "4", reps: 9, weight: 85, completed: true }
        ]
      }
    ]
  });

  console.log("Données d'exemple créées avec succès !");
  console.log("Séances créées:", [workout1, workout2, workout3, workout4, workout5, workout6, workout7].map(w => `${w.name} (${w.date.toLocaleDateString()})`));
}