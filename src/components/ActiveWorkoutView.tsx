import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Edit3, 
  Save, 
  X,
  Play,
  Pause,
  RotateCcw,
  Timer,
  Target
} from "lucide-react";
import { Workout } from "../../shared/types";
import { StorageService } from "../lib/storage";
import RestTimer from "./RestTimer";

interface ActiveWorkoutViewProps {
  workout: Workout;
  onBack: () => void;
  onWorkoutUpdate: () => void;
  onWorkoutComplete: () => void;
}

export default function ActiveWorkoutView({ 
  workout, 
  onBack, 
  onWorkoutUpdate,
  onWorkoutComplete 
}: ActiveWorkoutViewProps) {
  const [currentWorkout, setCurrentWorkout] = useState(workout);
  const [editingSet, setEditingSet] = useState<{ exerciseId: string; setId: string } | null>(null);
  const [tempWeight, setTempWeight] = useState("");
  const [tempReps, setTempReps] = useState("");
  const [startTime] = useState(new Date());
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restTimerData, setRestTimerData] = useState<{
    duration: number;
    exerciseName: string;
    setNumber: number;
  } | null>(null);

  // Mettre à jour le temps toutes les secondes
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Mettre à jour le workout quand il change
  useEffect(() => {
    setCurrentWorkout(workout);
  }, [workout]);

  const totalSets = currentWorkout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = currentWorkout.exercises.reduce((sum, ex) => 
    sum + ex.sets.filter(set => set.completed).length, 0
  );
  const progressPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  const formatDuration = () => {
    const diff = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000 / 60);
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    return hours > 0 ? `${hours}h${minutes.toString().padStart(2, '0')}` : `${minutes}min`;
  };

  const toggleSetCompletion = (exerciseId: string, setId: string) => {
    const updatedWorkout = { ...currentWorkout };
    const exercise = updatedWorkout.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    const set = exercise.sets.find(s => s.id === setId);
    if (!set) return;

    const wasCompleted = set.completed;
    set.completed = !set.completed;
    setCurrentWorkout(updatedWorkout);

    StorageService.updateWorkout(workout.id, updatedWorkout);
    onWorkoutUpdate();

    // Si la série vient d'être validée et qu'il y a un temps de repos
    if (!wasCompleted && set.completed) {
      const setIndex = exercise.sets.findIndex(s => s.id === setId);
      const isLastSet = setIndex === exercise.sets.length - 1;
      
      // On lance le timer de repos seulement si ce n'est pas la dernière série
      if (!isLastSet && exercise.targetWeight > 0) { // targetWeight utilisé comme proxy pour restTime
        setRestTimerData({
          duration: 90, // Par défaut 90 secondes, à terme on pourra récupérer depuis exercise.restTime
          exerciseName: exercise.exercise.name,
          setNumber: setIndex + 1
        });
        setShowRestTimer(true);
      }
    }
  };

  const startEditingSet = (exerciseId: string, setId: string) => {
    const exercise = currentWorkout.exercises.find(ex => ex.id === exerciseId);
    const set = exercise?.sets.find(s => s.id === setId);
    
    if (set) {
      setTempWeight(set.weight.toString());
      setTempReps(set.reps.toString());
      setEditingSet({ exerciseId, setId });
    }
  };

  const saveSetEdit = () => {
    if (!editingSet) return;

    const updatedWorkout = { ...currentWorkout };
    const exercise = updatedWorkout.exercises.find(ex => ex.id === editingSet.exerciseId);
    if (!exercise) return;

    const set = exercise.sets.find(s => s.id === editingSet.setId);
    if (!set) return;

    const newWeight = parseFloat(tempWeight);
    const newReps = parseInt(tempReps);

    if (!isNaN(newWeight) && !isNaN(newReps) && newWeight > 0 && newReps > 0) {
      set.weight = newWeight;
      set.reps = newReps;
      
      setCurrentWorkout(updatedWorkout);
      StorageService.updateWorkout(workout.id, updatedWorkout);
      onWorkoutUpdate();
    }

    setEditingSet(null);
    setTempWeight("");
    setTempReps("");
  };

  const cancelEdit = () => {
    setEditingSet(null);
    setTempWeight("");
    setTempReps("");
  };

  const resetSet = (exerciseId: string, setId: string) => {
    const exercise = currentWorkout.exercises.find(ex => ex.id === exerciseId);
    const set = exercise?.sets.find(s => s.id === setId);
    
    if (set && exercise) {
      const updatedWorkout = { ...currentWorkout };
      const updatedExercise = updatedWorkout.exercises.find(ex => ex.id === exerciseId);
      const updatedSet = updatedExercise?.sets.find(s => s.id === setId);
      
      if (updatedSet) {
        updatedSet.weight = exercise.targetWeight;
        updatedSet.reps = exercise.targetReps;
        updatedSet.completed = false;
        
        setCurrentWorkout(updatedWorkout);
        StorageService.updateWorkout(workout.id, updatedWorkout);
        onWorkoutUpdate();
      }
    }
  };

  const handleCompleteWorkout = () => {
    const duration = Math.floor((currentTime.getTime() - startTime.getTime()) / 1000 / 60);
    StorageService.updateWorkout(workout.id, { 
      completed: true, 
      duration: duration 
    });
    onWorkoutComplete();
  };

  const handleRestTimerComplete = () => {
    setShowRestTimer(false);
    setRestTimerData(null);
  };

  const handleRestTimerSkip = () => {
    setShowRestTimer(false);
    setRestTimerData(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header sticky */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          
          <div className="text-center flex-1 mx-4">
            <h1 className="font-bold text-lg truncate">{currentWorkout.name}</h1>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Timer className="h-3 w-3" />
                <span>{formatDuration()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                <span>{completedSets}/{totalSets}</span>
              </div>
            </div>
          </div>

          <Button variant="ghost" size="sm" onClick={onBack}>
            <Pause className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Barre de progression */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between text-xs mb-2">
            <span>Progression</span>
            <span>{progressPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </div>

      {/* Contenu principal */}
      <div className="p-4 space-y-4 pb-24">
        {currentWorkout.exercises.map((exercise, exerciseIndex) => {
          const exerciseCompletedSets = exercise.sets.filter(s => s.completed).length;
          const exerciseProgress = exercise.sets.length > 0 ? 
            (exerciseCompletedSets / exercise.sets.length) * 100 : 0;

          return (
            <Card key={exercise.id} className="border-0 shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base font-semibold">
                      {exercise.exercise.name}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground mt-1">
                      Objectif: {exercise.targetSets} séries × {exercise.targetReps} reps @ {exercise.targetWeight}kg
                    </div>
                  </div>
                  <Badge 
                    variant={exerciseProgress === 100 ? "default" : "secondary"}
                    className={`ml-2 ${exerciseProgress === 100 ? "bg-green-500" : ""}`}
                  >
                    {exerciseCompletedSets}/{exercise.sets.length}
                  </Badge>
                </div>
                <Progress value={exerciseProgress} className="h-1 mt-2" />
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {exercise.sets.map((set, setIndex) => {
                    const isEditing = editingSet?.exerciseId === exercise.id && 
                                     editingSet?.setId === set.id;

                    return (
                      <div 
                        key={set.id}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          set.completed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-card border-border'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm border-2 ${
                              set.completed 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'bg-background border-border'
                            }`}>
                              {setIndex + 1}
                            </div>
                            
                            {isEditing ? (
                              <div className="flex items-center gap-2 flex-1">
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    value={tempWeight}
                                    onChange={(e) => setTempWeight(e.target.value)}
                                    className="w-16 h-8 text-sm"
                                    step="0.5"
                                    min="0"
                                    placeholder="kg"
                                  />
                                </div>
                                
                                <span className="text-muted-foreground">×</span>
                                
                                <div className="flex items-center gap-1">
                                  <Input
                                    type="number"
                                    value={tempReps}
                                    onChange={(e) => setTempReps(e.target.value)}
                                    className="w-16 h-8 text-sm"
                                    min="1"
                                    placeholder="reps"
                                  />
                                </div>
                              </div>
                            ) : (
                              <div className="flex-1">
                                <div className="font-semibold">
                                  {set.weight}kg × {set.reps}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  Volume: {(set.weight * set.reps)}kg
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {isEditing ? (
                              <>
                                <Button size="sm" variant="outline" onClick={saveSetEdit}>
                                  <Save className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEdit}>
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => startEditingSet(exercise.id, set.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Edit3 className="h-3 w-3" />
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => resetSet(exercise.id, set.id)}
                                  className="h-8 w-8 p-0"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Bouton de validation en pleine largeur */}
                        {!isEditing && (
                          <div className="mt-3 pt-3 border-t">
                            <Button
                              variant={set.completed ? "default" : "outline"}
                              onClick={() => toggleSetCompletion(exercise.id, set.id)}
                              className={`w-full ${set.completed ? "bg-green-600 hover:bg-green-700" : ""}`}
                            >
                              {set.completed ? (
                                <>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Série terminée
                                </>
                              ) : (
                                <>
                                  <Target className="h-4 w-4 mr-2" />
                                  Valider la série
                                </>
                              )}
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Footer sticky */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedSets}/{totalSets} séries terminées
            </span>
            <span className="font-medium">
              {progressPercentage.toFixed(1)}%
            </span>
          </div>
          
          <div className="flex gap-3">
            <Button variant="outline" onClick={onBack} className="flex-1">
              <Pause className="h-4 w-4 mr-2" />
              Mettre en pause
            </Button>
            
            {progressPercentage === 100 ? (
              <Button 
                onClick={handleCompleteWorkout}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Terminer
              </Button>
            ) : (
              <Button variant="outline" className="flex-1" disabled>
                <Clock className="h-4 w-4 mr-2" />
                En cours...
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Timer de repos */}
      {showRestTimer && restTimerData && (
        <RestTimer
          duration={restTimerData.duration}
          exerciseName={restTimerData.exerciseName}
          setNumber={restTimerData.setNumber}
          onComplete={handleRestTimerComplete}
          onSkip={handleRestTimerSkip}
        />
      )}
    </div>
  );
}