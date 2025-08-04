import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle, 
  Clock, 
  Target, 
  Edit, 
  Save, 
  X,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { Workout } from "../../shared/types";
import { StorageService } from "../lib/storage";

interface WorkoutExecutionDialogProps {
  workout: Workout | null;
  isOpen: boolean;
  onClose: () => void;
  onWorkoutUpdate: () => void;
}

export default function WorkoutExecutionDialog({ 
  workout, 
  isOpen, 
  onClose, 
  onWorkoutUpdate 
}: WorkoutExecutionDialogProps) {
  const [editingSet, setEditingSet] = useState<{ exerciseId: string; setId: string } | null>(null);
  const [tempWeight, setTempWeight] = useState("");
  const [tempReps, setTempReps] = useState("");

  if (!workout) return null;

  const totalSets = workout.exercises.reduce((sum, ex) => sum + ex.sets.length, 0);
  const completedSets = workout.exercises.reduce((sum, ex) => 
    sum + ex.sets.filter(set => set.completed).length, 0
  );
  const progressPercentage = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  const toggleSetCompletion = (exerciseId: string, setId: string) => {
    const updatedWorkout = { ...workout };
    const exercise = updatedWorkout.exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    const set = exercise.sets.find(s => s.id === setId);
    if (!set) return;

    set.completed = !set.completed;

    StorageService.updateWorkout(workout.id, updatedWorkout);
    onWorkoutUpdate();
  };

  const startEditingSet = (exerciseId: string, setId: string) => {
    const exercise = workout.exercises.find(ex => ex.id === exerciseId);
    const set = exercise?.sets.find(s => s.id === setId);
    
    if (set) {
      setTempWeight(set.weight.toString());
      setTempReps(set.reps.toString());
      setEditingSet({ exerciseId, setId });
    }
  };

  const saveSetEdit = () => {
    if (!editingSet) return;

    const updatedWorkout = { ...workout };
    const exercise = updatedWorkout.exercises.find(ex => ex.id === editingSet.exerciseId);
    if (!exercise) return;

    const set = exercise.sets.find(s => s.id === editingSet.setId);
    if (!set) return;

    const newWeight = parseFloat(tempWeight);
    const newReps = parseInt(tempReps);

    if (!isNaN(newWeight) && !isNaN(newReps) && newWeight > 0 && newReps > 0) {
      set.weight = newWeight;
      set.reps = newReps;
      
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
    const exercise = workout.exercises.find(ex => ex.id === exerciseId);
    const set = exercise?.sets.find(s => s.id === setId);
    
    if (set && exercise) {
      const updatedWorkout = { ...workout };
      const updatedExercise = updatedWorkout.exercises.find(ex => ex.id === exerciseId);
      const updatedSet = updatedExercise?.sets.find(s => s.id === setId);
      
      if (updatedSet) {
        updatedSet.weight = exercise.targetWeight;
        updatedSet.reps = exercise.targetReps;
        updatedSet.completed = false;
        
        StorageService.updateWorkout(workout.id, updatedWorkout);
        onWorkoutUpdate();
      }
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h${mins.toString().padStart(2, '0')}` : `${mins}min`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">{workout.name}</DialogTitle>
              <DialogDescription>
                Progression: {completedSets}/{totalSets} séries terminées
              </DialogDescription>
            </div>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              <Clock className="h-3 w-3 mr-1" />
              En cours
            </Badge>
          </div>
          
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span>Progression globale</span>
              <span>{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {workout.exercises.map((exercise, exerciseIndex) => {
            const exerciseCompletedSets = exercise.sets.filter(s => s.completed).length;
            const exerciseProgress = exercise.sets.length > 0 ? 
              (exerciseCompletedSets / exercise.sets.length) * 100 : 0;

            return (
              <Card key={exercise.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {exerciseIndex + 1}. {exercise.exercise.name}
                      </CardTitle>
                      <CardDescription>
                        {exerciseCompletedSets}/{exercise.sets.length} séries • 
                        Objectif: {exercise.targetSets} × {exercise.targetReps} @ {exercise.targetWeight}kg
                      </CardDescription>
                    </div>
                    <Badge 
                      variant={exerciseProgress === 100 ? "default" : "secondary"}
                      className={exerciseProgress === 100 ? "bg-green-100 text-green-800" : ""}
                    >
                      {exerciseProgress.toFixed(0)}%
                    </Badge>
                  </div>
                  
                  <Progress value={exerciseProgress} className="h-1" />
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    {exercise.sets.map((set, setIndex) => {
                      const isEditing = editingSet?.exerciseId === exercise.id && 
                                       editingSet?.setId === set.id;

                      return (
                        <div 
                          key={set.id}
                          className={`flex items-center justify-between p-3 rounded border transition-colors ${
                            set.completed 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-muted/30 border-border'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border font-medium text-sm">
                              {setIndex + 1}
                            </div>
                            
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1">
                                  <Label className="text-xs">Poids:</Label>
                                  <Input
                                    type="number"
                                    value={tempWeight}
                                    onChange={(e) => setTempWeight(e.target.value)}
                                    className="w-16 h-8 text-sm"
                                    step="0.5"
                                    min="0"
                                  />
                                  <span className="text-xs text-muted-foreground">kg</span>
                                </div>
                                
                                <div className="flex items-center gap-1">
                                  <Label className="text-xs">Reps:</Label>
                                  <Input
                                    type="number"
                                    value={tempReps}
                                    onChange={(e) => setTempReps(e.target.value)}
                                    className="w-16 h-8 text-sm"
                                    min="1"
                                  />
                                </div>
                                
                                <div className="flex gap-1">
                                  <Button size="sm" variant="outline" onClick={saveSetEdit}>
                                    <Save className="h-3 w-3" />
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={cancelEdit}>
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center gap-4">
                                <div className="font-medium">
                                  {set.weight}kg × {set.reps} reps
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Volume: {(set.weight * set.reps).toFixed(0)}kg
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {!isEditing && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => startEditingSet(exercise.id, set.id)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => resetSet(exercise.id, set.id)}
                                  title="Remettre aux valeurs cibles"
                                >
                                  <RotateCcw className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                            
                            <Button
                              size="sm"
                              variant={set.completed ? "default" : "outline"}
                              onClick={() => toggleSetCompletion(exercise.id, set.id)}
                              className={set.completed ? "bg-green-600 hover:bg-green-700" : ""}
                            >
                              {set.completed ? (
                                <>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Terminée
                                </>
                              ) : (
                                <>
                                  <Target className="h-3 w-3 mr-1" />
                                  Valider
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Separator className="my-6" />

        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Progression: {completedSets}/{totalSets} séries ({progressPercentage.toFixed(1)}%)
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              <Pause className="h-4 w-4 mr-2" />
              Mettre en pause
            </Button>
            
            {progressPercentage === 100 && (
              <Button 
                onClick={() => {
                  // Cette fonction sera gérée par le parent
                  onClose();
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Terminer la séance
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}