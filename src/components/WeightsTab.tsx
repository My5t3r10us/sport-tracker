import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { TrendingUp, TrendingDown, Minus, Weight, Calendar, Target, BarChart3 } from "lucide-react";
import { Workout, Exercise } from "../../shared/types";

interface WeightStats {
  exerciseId: string;
  exerciseName: string;
  maxWeight: number;
  currentMonthAverage: number;
  evolutionPercentage: number;
  lastSixtyDaysData: Array<{
    date: Date;
    weight: number;
    reps: number;
    volume: number;
  }>;
  totalSessions: number;
  lastSessionDate?: Date;
}

interface WeightsTabProps {
  workouts: Workout[];
  exercises: Exercise[];
}

export default function WeightsTab({ workouts, exercises }: WeightsTabProps) {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);

  // Calculer les statistiques de poids pour chaque exercice
  const weightStats = useMemo(() => {
    const completedWorkouts = workouts.filter(w => w.completed);
    const exerciseData: Record<string, WeightStats> = {};

    // Date d'il y a 60 jours
    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    // Date d'il y a 30 jours
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    completedWorkouts.forEach(workout => {
      const workoutDate = new Date(workout.date);
      
      workout.exercises.forEach(exercise => {
        if (!exerciseData[exercise.exerciseId]) {
          exerciseData[exercise.exerciseId] = {
            exerciseId: exercise.exerciseId,
            exerciseName: exercise.exercise.name,
            maxWeight: 0,
            currentMonthAverage: 0,
            evolutionPercentage: 0,
            lastSixtyDaysData: [],
            totalSessions: 0,
            lastSessionDate: workoutDate
          };
        }

        const stats = exerciseData[exercise.exerciseId];
        stats.totalSessions++;
        
        if (!stats.lastSessionDate || workoutDate > stats.lastSessionDate) {
          stats.lastSessionDate = workoutDate;
        }

        // Analyser chaque série
        exercise.sets.filter(set => set.completed).forEach(set => {
          // Mettre à jour le poids max
          if (set.weight > stats.maxWeight) {
            stats.maxWeight = set.weight;
          }

          // Ajouter aux données des 60 derniers jours
          if (workoutDate >= sixtyDaysAgo) {
            stats.lastSixtyDaysData.push({
              date: workoutDate,
              weight: set.weight,
              reps: set.reps,
              volume: set.weight * set.reps
            });
          }
        });
      });
    });

    // Calculer les moyennes et évolutions
    Object.values(exerciseData).forEach(stats => {
      // Calculer la moyenne des 30 derniers jours
      const last30DaysData = stats.lastSixtyDaysData.filter(
        data => data.date >= thirtyDaysAgo
      );
      
      if (last30DaysData.length > 0) {
        stats.currentMonthAverage = last30DaysData.reduce(
          (sum, data) => sum + data.weight, 0
        ) / last30DaysData.length;
      }

      // Calculer l'évolution entre les 60 derniers jours
      const firstPeriodData = stats.lastSixtyDaysData.filter(
        data => data.date >= sixtyDaysAgo && data.date < thirtyDaysAgo
      );
      
      const secondPeriodData = stats.lastSixtyDaysData.filter(
        data => data.date >= thirtyDaysAgo
      );

      if (firstPeriodData.length > 0 && secondPeriodData.length > 0) {
        const firstPeriodAvg = firstPeriodData.reduce(
          (sum, data) => sum + data.weight, 0
        ) / firstPeriodData.length;
        
        const secondPeriodAvg = secondPeriodData.reduce(
          (sum, data) => sum + data.weight, 0
        ) / secondPeriodData.length;

        stats.evolutionPercentage = ((secondPeriodAvg - firstPeriodAvg) / firstPeriodAvg) * 100;
      }

      // Trier les données par date
      stats.lastSixtyDaysData.sort((a, b) => a.date.getTime() - b.date.getTime());
    });

    return Object.values(exerciseData).filter(stats => stats.totalSessions > 0);
  }, [workouts]);

  const sortedStats = weightStats.sort((a, b) => b.maxWeight - a.maxWeight);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    }).format(date);
  };

  const getEvolutionIcon = (percentage: number) => {
    if (percentage > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (percentage < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-muted-foreground" />;
  };

  const getEvolutionColor = (percentage: number) => {
    if (percentage > 0) return "text-green-600";
    if (percentage < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  if (weightStats.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Suivi des charges</h2>
          <p className="text-muted-foreground">
            Suivez l'évolution de vos charges pour chaque exercice
          </p>
        </div>

        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Weight className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucune donnée de poids</h3>
              <p className="text-muted-foreground">
                Terminez quelques séances pour voir l'évolution de vos charges
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedStats = selectedExercise 
    ? weightStats.find(s => s.exerciseId === selectedExercise)
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Suivi des charges</h2>
        <p className="text-muted-foreground">
          Suivez l'évolution de vos charges pour chaque exercice
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Liste des exercices */}
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Mes exercices ({sortedStats.length})</h3>
            
            <div className="grid gap-4">
              {sortedStats.map((stats) => {
                const exercise = exercises.find(e => e.id === stats.exerciseId);
                
                return (
                  <Card 
                    key={stats.exerciseId} 
                    className={`hover:shadow-md transition-shadow cursor-pointer ${
                      selectedExercise === stats.exerciseId ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedExercise(
                      selectedExercise === stats.exerciseId ? null : stats.exerciseId
                    )}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{stats.exerciseName}</CardTitle>
                          <CardDescription>
                            {stats.totalSessions} séance(s) • Dernière: {stats.lastSessionDate ? formatDate(stats.lastSessionDate) : 'N/A'}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className="ml-2">
                          {exercise?.category || 'Exercice'}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-3 gap-4 text-center">
                        {/* Poids max */}
                        <div>
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Target className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Max</span>
                          </div>
                          <p className="font-bold text-lg">{stats.maxWeight}kg</p>
                        </div>
                        
                        {/* Moyenne 30 derniers jours */}
                        <div>
                          <div className="flex items-center justify-center gap-1 mb-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Moy. 30j</span>
                          </div>
                          <p className="font-semibold">
                            {stats.currentMonthAverage > 0 
                              ? `${stats.currentMonthAverage.toFixed(1)}kg`
                              : 'N/A'
                            }
                          </p>
                        </div>
                        
                        {/* Évolution */}
                        <div>
                          <div className="flex items-center justify-center gap-1 mb-1">
                            {getEvolutionIcon(stats.evolutionPercentage)}
                            <span className="text-xs text-muted-foreground">Évolution 60j</span>
                          </div>
                          <p className={`font-semibold ${getEvolutionColor(stats.evolutionPercentage)}`}>
                            {stats.evolutionPercentage !== 0 
                              ? `${stats.evolutionPercentage > 0 ? '+' : ''}${stats.evolutionPercentage.toFixed(1)}%`
                              : 'N/A'
                            }
                          </p>
                        </div>
                      </div>
                      
                      {/* Barre de progression visuelle */}
                      {stats.evolutionPercentage !== 0 && (
                        <div className="mt-3">
                          <Progress 
                            value={Math.min(Math.abs(stats.evolutionPercentage) * 2, 100)} 
                            className="h-2"
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>

        {/* Détails de l'exercice sélectionné */}
        <div className="lg:col-span-1">
          {selectedStats ? (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  {selectedStats.exerciseName}
                </CardTitle>
                <CardDescription>
                  Historique détaillé des charges
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Statistiques générales */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Poids maximum</span>
                    <span className="font-semibold">{selectedStats.maxWeight}kg</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Moyenne 30 derniers jours</span>
                    <span className="font-semibold">
                      {selectedStats.currentMonthAverage > 0 
                        ? `${selectedStats.currentMonthAverage.toFixed(1)}kg`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Évolution 60 jours</span>
                    <span className={`font-semibold flex items-center gap-1 ${getEvolutionColor(selectedStats.evolutionPercentage)}`}>
                      {getEvolutionIcon(selectedStats.evolutionPercentage)}
                      {selectedStats.evolutionPercentage !== 0 
                        ? `${selectedStats.evolutionPercentage > 0 ? '+' : ''}${selectedStats.evolutionPercentage.toFixed(1)}%`
                        : 'N/A'
                      }
                    </span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Séances totales</span>
                    <span className="font-semibold">{selectedStats.totalSessions}</span>
                  </div>
                </div>

                <Separator />

                {/* Historique récent */}
                <div className="space-y-3">
                  <h4 className="font-medium text-sm">Historique récent</h4>
                  
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {selectedStats.lastSixtyDaysData
                      .slice(-10) // Dernières 10 entrées
                      .reverse() // Plus récent en premier
                      .map((data, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-muted/30 rounded">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(data.date)}
                          </p>
                          <p className="text-sm font-medium">
                            {data.weight}kg × {data.reps}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Volume</p>
                          <p className="text-sm font-medium">{data.volume}kg</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {selectedStats.lastSixtyDaysData.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Aucune donnée récente
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-4">
              <CardContent className="py-8">
                <div className="text-center">
                  <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">Détails des charges</h3>
                  <p className="text-muted-foreground">
                    Cliquez sur un exercice pour voir son historique détaillé
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}