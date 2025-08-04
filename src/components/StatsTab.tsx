import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  BarChart3, 
  Calendar, 
  Clock, 
  Target, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Award,
  Zap,
  Timer
} from "lucide-react";
import { Workout, Exercise } from "../../shared/types";

interface StatsTabProps {
  workouts: Workout[];
  exercises: Exercise[];
}

export default function StatsTab({ workouts, exercises }: StatsTabProps) {
  const stats = useMemo(() => {
    const completedWorkouts = workouts.filter(w => w.completed);
    const now = new Date();
    
    // Statistiques générales
    const totalWorkouts = completedWorkouts.length;
    const totalSets = completedWorkouts.reduce((sum, w) => 
      sum + w.exercises.reduce((exerciseSum, ex) => 
        exerciseSum + ex.sets.filter(s => s.completed).length, 0
      ), 0
    );
    
    const totalVolume = completedWorkouts.reduce((sum, w) => 
      sum + w.exercises.reduce((exerciseSum, ex) => 
        exerciseSum + ex.sets
          .filter(s => s.completed)
          .reduce((setSum, s) => setSum + (s.weight * s.reps), 0), 0
      ), 0
    );
    
    const averageDuration = completedWorkouts.length > 0 
      ? completedWorkouts.reduce((sum, w) => sum + (w.duration || 0), 0) / completedWorkouts.length
      : 0;

    // Données mensuelles
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const thisMonthWorkouts = completedWorkouts.filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate.getMonth() === currentMonth && workoutDate.getFullYear() === currentYear;
    });
    
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    const lastMonthWorkouts = completedWorkouts.filter(w => {
      const workoutDate = new Date(w.date);
      return workoutDate.getMonth() === lastMonth && workoutDate.getFullYear() === lastMonthYear;
    });

    // Progression mensuelle
    const monthlyProgress = thisMonthWorkouts.length - lastMonthWorkouts.length;
    const monthlyProgressPercentage = lastMonthWorkouts.length > 0 
      ? ((thisMonthWorkouts.length - lastMonthWorkouts.length) / lastMonthWorkouts.length) * 100
      : thisMonthWorkouts.length > 0 ? 100 : 0;

    // Exercices les plus pratiqués
    const exerciseFrequency: Record<string, { count: number; name: string; category: string }> = {};
    
    completedWorkouts.forEach(workout => {
      workout.exercises.forEach(ex => {
        if (!exerciseFrequency[ex.exerciseId]) {
          exerciseFrequency[ex.exerciseId] = {
            count: 0,
            name: ex.exercise.name,
            category: ex.exercise.category
          };
        }
        exerciseFrequency[ex.exerciseId].count++;
      });
    });

    const topExercises = Object.values(exerciseFrequency)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Jours de la semaine préférés
    const dayFrequency = [0, 0, 0, 0, 0, 0, 0]; // Dimanche = 0, Lundi = 1, etc.
    const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    
    completedWorkouts.forEach(workout => {
      const day = new Date(workout.date).getDay();
      dayFrequency[day]++;
    });

    const preferredDay = dayFrequency.indexOf(Math.max(...dayFrequency));

    // Streak actuel
    let currentStreak = 0;
    const sortedWorkouts = completedWorkouts
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    if (sortedWorkouts.length > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      for (const workout of sortedWorkouts) {
        const workoutDate = new Date(workout.date);
        workoutDate.setHours(0, 0, 0, 0);
        
        const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff <= 1) { // Aujourd'hui ou hier
          currentStreak++;
        } else if (daysDiff <= currentStreak + 1) {
          continue;
        } else {
          break;
        }
      }
    }

    return {
      totalWorkouts,
      totalSets,
      totalVolume,
      averageDuration,
      thisMonthWorkouts: thisMonthWorkouts.length,
      monthlyProgress,
      monthlyProgressPercentage,
      topExercises,
      preferredDay: dayNames[preferredDay],
      currentStreak,
      dayFrequency: dayFrequency.map((count, index) => ({
        day: dayNames[index],
        count
      }))
    };
  }, [workouts]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(num));
  };

  const getProgressColor = (percentage: number) => {
    if (percentage > 0) return "text-green-600";
    if (percentage < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  const getProgressIcon = (percentage: number) => {
    if (percentage > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (percentage < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Activity className="h-4 w-4 text-muted-foreground" />;
  };

  if (workouts.filter(w => w.completed).length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold">Statistiques</h2>
          <p className="text-muted-foreground">
            Analysez vos performances et votre progression
          </p>
        </div>

        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">Aucune donnée disponible</h3>
              <p className="text-muted-foreground">
                Terminez quelques séances pour voir vos statistiques
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Statistiques</h2>
        <p className="text-muted-foreground">
          Analysez vos performances et votre progression
        </p>
      </div>

      {/* Statistiques principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Séances totales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWorkouts}</div>
            <p className="text-xs text-muted-foreground">
              Depuis le début
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Séries totales</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSets}</div>
            <p className="text-xs text-muted-foreground">
              Toutes séances confondues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume total</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalVolume)}</div>
            <p className="text-xs text-muted-foreground">
              kg soulevés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Durée moyenne</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.averageDuration)}</div>
            <p className="text-xs text-muted-foreground">
              minutes par séance
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Progression mensuelle */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Progression mensuelle
            </CardTitle>
            <CardDescription>
              Évolution de votre activité ce mois-ci
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Séances ce mois</span>
              <span className="text-lg font-bold">{stats.thisMonthWorkouts}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Évolution</span>
              <div className={`flex items-center gap-1 font-semibold ${getProgressColor(stats.monthlyProgressPercentage)}`}>
                {getProgressIcon(stats.monthlyProgressPercentage)}
                {stats.monthlyProgress > 0 ? '+' : ''}{stats.monthlyProgress} séances
              </div>
            </div>

            {stats.monthlyProgressPercentage !== 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span>Progression</span>
                  <span className={getProgressColor(stats.monthlyProgressPercentage)}>
                    {stats.monthlyProgressPercentage > 0 ? '+' : ''}{stats.monthlyProgressPercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress 
                  value={Math.min(Math.abs(stats.monthlyProgressPercentage), 100)} 
                  className="h-2"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Streak actuel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Série actuelle
            </CardTitle>
            <CardDescription>
              Votre régularité d'entraînement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary">{stats.currentStreak}</div>
              <p className="text-sm text-muted-foreground">
                {stats.currentStreak === 0 ? 'Aucune série en cours' : 
                 stats.currentStreak === 1 ? 'jour consécutif' : 'jours consécutifs'}
              </p>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Jour préféré</span>
                <Badge variant="outline">{stats.preferredDay}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exercices les plus pratiqués */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Exercices favoris
          </CardTitle>
          <CardDescription>
            Vos exercices les plus pratiqués
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.topExercises.map((exercise, index) => (
              <div key={exercise.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-xs font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{exercise.name}</p>
                    <p className="text-xs text-muted-foreground">{exercise.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{exercise.count}</p>
                  <p className="text-xs text-muted-foreground">séances</p>
                </div>
              </div>
            ))}
            
            {stats.topExercises.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                Aucun exercice trouvé
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Répartition par jour de la semaine */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Répartition hebdomadaire
          </CardTitle>
          <CardDescription>
            Fréquence d'entraînement par jour de la semaine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.dayFrequency.map((dayData) => {
              const percentage = stats.totalWorkouts > 0 ? (dayData.count / stats.totalWorkouts) * 100 : 0;
              
              return (
                <div key={dayData.day} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{dayData.day}</span>
                    <span className="text-muted-foreground">
                      {dayData.count} séances ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}