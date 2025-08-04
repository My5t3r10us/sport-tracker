import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar, 
  Plus, 
  Play, 
  CheckCircle, 
  Clock, 
  Dumbbell, 
  Target,
  History,
  Bookmark,
  Trash2,
  Edit,
  RotateCcw
} from "lucide-react";
import { Workout, Exercise, WorkoutTemplate } from "../../shared/types";
import { StorageService } from "../lib/storage";

interface WorkoutsTabProps {
  workouts: Workout[];
  exercises: Exercise[];
  onDataChange: () => void;
  onStartActiveWorkout: (workout: Workout) => void;
}

export default function WorkoutsTab({ workouts, exercises, onDataChange, onStartActiveWorkout }: WorkoutsTabProps) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showCreateTemplateDialog, setShowCreateTemplateDialog] = useState(false);
  const [workoutToTemplate, setWorkoutToTemplate] = useState<Workout | null>(null);
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [templateNameInput, setTemplateNameInput] = useState("");
  
  // État pour le formulaire de création
  const [newWorkoutName, setNewWorkoutName] = useState("");
  const [newWorkoutExercises, setNewWorkoutExercises] = useState<Array<{
    exerciseId: string;
    sets: number;
    reps: number;
    weight: number;
    restTime: number; // en secondes
  }>>([]);

  useEffect(() => {
    setTemplates(StorageService.getTemplates());
  }, []);

  const activeWorkouts = workouts.filter(w => !w.completed);
  const createdWorkouts = activeWorkouts.filter(w => !w.started); // Séances créées mais pas commencées
  const startedWorkouts = activeWorkouts.filter(w => w.started); // Séances vraiment en cours
  const completedWorkouts = workouts.filter(w => w.completed).sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const handleCreateWorkout = () => {
    if (!newWorkoutName.trim()) return;

    const workout = StorageService.addWorkout({
      name: newWorkoutName,
      date: new Date(),
      completed: false,
      exercises: newWorkoutExercises.map((ex, index) => {
        const exercise = exercises.find(e => e.id === ex.exerciseId)!;
        return {
          id: (index + 1).toString(),
          exerciseId: ex.exerciseId,
          exercise,
          targetSets: ex.sets,
          targetReps: ex.reps,
          targetWeight: ex.weight,
          restTime: ex.restTime || 90, // Ajouter le temps de repos
          sets: Array.from({ length: ex.sets }, (_, i) => ({
            id: (i + 1).toString(),
            reps: ex.reps,
            weight: ex.weight,
            completed: false
          }))
        };
      })
    });

    setNewWorkoutName("");
    setNewWorkoutExercises([]);
    setShowCreateDialog(false);
    onDataChange();
  };

  const handleStartWorkout = (workout: Workout) => {
    // Marquer la séance comme commencée
    StorageService.updateWorkout(workout.id, { started: true });
    onDataChange();
    onStartActiveWorkout({ ...workout, started: true });
  };

  const handleCompleteWorkout = (workout: Workout) => {
    const duration = Math.floor(Math.random() * 30) + 60; // Durée simulée entre 60-90 min
    
    StorageService.updateWorkout(workout.id, { completed: true, duration });
    onDataChange();
  };

  const handleDeleteWorkout = (workoutId: string) => {
    StorageService.deleteWorkout(workoutId);
    onDataChange();
  };

  const handleCreateTemplate = (workout: Workout) => {
    setWorkoutToTemplate(workout);
    setTemplateNameInput(`Template ${workout.name}`);
    setShowCreateTemplateDialog(true);
  };

  const confirmCreateTemplate = () => {
    if (!workoutToTemplate || !templateNameInput.trim()) return;
    
    const template = {
      name: templateNameInput,
      exercises: workoutToTemplate.exercises.map(ex => ({
        exerciseId: ex.exerciseId,
        targetSets: ex.targetSets,
        targetReps: ex.targetReps,
        targetWeight: ex.targetWeight,
        restTime: ex.restTime || 90
      }))
    };
    
    StorageService.addTemplate(template);
    setTemplates(StorageService.getTemplates());
    setShowCreateTemplateDialog(false);
    setWorkoutToTemplate(null);
    setTemplateNameInput("");
  };

  const handleDeleteTemplate = (templateId: string) => {
    StorageService.deleteTemplate(templateId);
    setTemplates(StorageService.getTemplates());
  };

  const handleUseTemplate = (template: WorkoutTemplate) => {
    setNewWorkoutName(`Séance ${template.name}`);
    setNewWorkoutExercises(template.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      sets: ex.targetSets,
      reps: ex.targetReps,
      weight: ex.targetWeight || 0,
      restTime: ex.restTime || 90 // 1min30 par défaut si pas défini
    })));
    setShowTemplateDialog(false);
    setShowCreateDialog(true);
  };

  const addExerciseToWorkout = () => {
    if (exercises.length === 0) return;
    
    setNewWorkoutExercises([...newWorkoutExercises, {
      exerciseId: exercises[0].id,
      sets: 3,
      reps: 10,
      weight: 20,
      restTime: 90 // 1min30 par défaut
    }]);
  };

  const updateExerciseInWorkout = (index: number, field: string, value: any) => {
    const updated = [...newWorkoutExercises];
    updated[index] = { ...updated[index], [field]: value };
    setNewWorkoutExercises(updated);
  };

  const removeExerciseFromWorkout = (index: number) => {
    setNewWorkoutExercises(newWorkoutExercises.filter((_, i) => i !== index));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getTotalSets = (workout: Workout) => {
    return workout.exercises.reduce((total, ex) => total + ex.sets.length, 0);
  };

  const getCompletedSets = (workout: Workout) => {
    return workout.exercises.reduce((total, ex) => 
      total + ex.sets.filter(set => set.completed).length, 0
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mes séances</h2>
          <p className="text-muted-foreground">
            Créez et suivez vos séances de musculation
          </p>
        </div>
        
        <div className="flex gap-2">
          {templates.length > 0 && (
            <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Bookmark className="h-4 w-4 mr-2" />
                  Templates
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mes templates</DialogTitle>
                  <DialogDescription>
                    Choisissez un template pour créer une nouvelle séance
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  {templates.map(template => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            <CardDescription>
                              {template.exercises.length} exercice(s)
                            </CardDescription>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              size="sm" 
                              onClick={() => handleUseTemplate(template)}
                            >
                              Utiliser
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          {/* Dialog de confirmation de création de template */}
          <Dialog open={showCreateTemplateDialog} onOpenChange={setShowCreateTemplateDialog}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un template</DialogTitle>
                <DialogDescription>
                  Créer un template à partir de la séance "{workoutToTemplate?.name}"
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Nom du template</Label>
                  <Input
                    id="template-name"
                    value={templateNameInput}
                    onChange={(e) => setTemplateNameInput(e.target.value)}
                    placeholder="Ex: Template Push Day..."
                    className="mt-2"
                  />
                </div>
                
                {workoutToTemplate && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Aperçu du template</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Exercices:</span>
                        <span className="font-medium">{workoutToTemplate.exercises.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Séries totales:</span>
                        <span className="font-medium">{workoutToTemplate.exercises.reduce((sum, ex) => sum + ex.targetSets, 0)}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xs text-gray-600">Exercices inclus:</p>
                      <div className="text-xs text-gray-500 mt-1">
                        {workoutToTemplate.exercises.map(ex => ex.exercise.name).join(", ")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowCreateTemplateDialog(false)}
                >
                  Annuler
                </Button>
                <Button 
                  onClick={confirmCreateTemplate}
                  disabled={!templateNameInput.trim()}
                >
                  <Bookmark className="h-4 w-4 mr-2" />
                  Créer le template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle séance
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0 border-b pb-4">
                <DialogTitle className="text-2xl">Créer une nouvelle séance</DialogTitle>
                <DialogDescription className="text-base">
                  Configurez vos exercices et paramètres d'entraînement
                </DialogDescription>
              </DialogHeader>
              
              <div className="flex-1 overflow-y-auto py-6 space-y-6">
                {/* Nom de la séance */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg border">
                  <Label htmlFor="workout-name" className="text-sm font-semibold uppercase tracking-wider text-gray-600">
                    Nom de la séance
                  </Label>
                  <Input
                    id="workout-name"
                    value={newWorkoutName}
                    onChange={(e) => setNewWorkoutName(e.target.value)}
                    placeholder="Ex: Push Day, Leg Day, Séance Haut du Corps..."
                    className="mt-2 text-lg font-medium bg-white"
                  />
                </div>

                {/* Section exercices */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-lg font-semibold">Exercices de la séance</Label>
                      <p className="text-sm text-muted-foreground mt-1">
                        {newWorkoutExercises.length > 0 ? `${newWorkoutExercises.length} exercice(s) configuré(s)` : 'Aucun exercice ajouté'}
                      </p>
                    </div>
                    <Button type="button" onClick={addExerciseToWorkout} className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un exercice
                    </Button>
                  </div>

                  {newWorkoutExercises.map((ex, index) => {
                    const exercise = exercises.find(e => e.id === ex.exerciseId);
                    return (
                      <Card key={index} className="border-l-4 border-l-blue-500">
                        <CardHeader className="pb-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                                {index + 1}
                              </div>
                              <Label className="text-sm font-semibold uppercase tracking-wider text-gray-600">
                                Exercice {index + 1}
                              </Label>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeExerciseFromWorkout(index)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="space-y-4">
                          {/* Sélection de l'exercice */}
                          <div>
                            <Label className="text-sm font-medium">Nom de l'exercice</Label>
                            <Select
                              value={ex.exerciseId}
                              onValueChange={(value) => updateExerciseInWorkout(index, 'exerciseId', value)}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Choisir un exercice..." />
                              </SelectTrigger>
                              <SelectContent>
                                {exercises.map(exercise => (
                                  <SelectItem key={exercise.id} value={exercise.id}>
                                    {exercise.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Paramètres d'entraînement */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <Label className="text-sm font-medium">Séries</Label>
                              <Input
                                type="number"
                                min="1"
                                max="10"
                                value={ex.sets}
                                onChange={(e) => updateExerciseInWorkout(index, 'sets', parseInt(e.target.value) || 1)}
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Répétitions</Label>
                              <Input
                                type="number"
                                min="1"
                                max="50"
                                value={ex.reps}
                                onChange={(e) => updateExerciseInWorkout(index, 'reps', parseInt(e.target.value) || 1)}
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Poids (kg)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="0.5"
                                value={ex.weight}
                                onChange={(e) => updateExerciseInWorkout(index, 'weight', parseFloat(e.target.value) || 0)}
                                className="mt-1"
                              />
                            </div>
                            
                            <div>
                              <Label className="text-sm font-medium">Repos (sec)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="15"
                                value={ex.restTime || 60}
                                onChange={(e) => updateExerciseInWorkout(index, 'restTime', parseInt(e.target.value) || 60)}
                                className="mt-1"
                              />
                            </div>
                          </div>
                          
                          {/* Raccourcis temps de repos */}
                          <div>
                            <Label className="text-sm font-medium mb-2 block">Raccourcis temps de repos</Label>
                            <div className="flex gap-2 flex-wrap">
                              {[30, 60, 90, 120, 180].map(seconds => (
                                <Button
                                  key={seconds}
                                  type="button"
                                  variant={ex.restTime === seconds ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => updateExerciseInWorkout(index, 'restTime', seconds)}
                                  className="text-xs"
                                >
                                  {seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}min${seconds % 60 ? ` ${seconds % 60}s` : ''}`}
                                </Button>
                              ))}
                            </div>
                          </div>
                          
                          {/* Preview de l'exercice */}
                          {exercise && (
                            <div className="bg-gray-50 p-3 rounded-lg">
                              <p className="text-sm text-gray-600">
                                <strong>{exercise.name}</strong> • {ex.sets} série(s) de {ex.reps} répétition(s) 
                                {ex.weight > 0 && ` à ${ex.weight}kg`} • Repos: {ex.restTime || 60}s
                              </p>
                              {exercise.description && (
                                <p className="text-xs text-gray-500 mt-1">{exercise.description}</p>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}

                  {newWorkoutExercises.length === 0 && (
                    <Card className="border-dashed border-2">
                      <CardContent className="flex flex-col items-center justify-center py-12">
                        <Dumbbell className="h-16 w-16 text-gray-300 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-600 mb-2">Aucun exercice ajouté</h3>
                        <p className="text-sm text-gray-500 text-center mb-4">
                          Commencez par ajouter des exercices à votre séance d'entraînement
                        </p>
                        <Button onClick={addExerciseToWorkout} className="bg-blue-600 hover:bg-blue-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter votre premier exercice
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
              
              {/* Footer avec statistiques et actions */}
              <div className="flex-shrink-0 border-t pt-4 bg-gray-50 -mx-6 -mb-6 px-6 pb-6">
                {newWorkoutExercises.length > 0 && (
                  <div className="mb-4 p-4 bg-white rounded-lg border">
                    <h4 className="font-semibold mb-2">Aperçu de la séance</h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Total exercices:</span>
                        <span className="ml-2 font-semibold">{newWorkoutExercises.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Total séries:</span>
                        <span className="ml-2 font-semibold">{newWorkoutExercises.reduce((sum, ex) => sum + ex.sets, 0)}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Durée estimée:</span>
                        <span className="ml-2 font-semibold">
                          {Math.round((newWorkoutExercises.reduce((sum, ex) => sum + (ex.sets * (ex.restTime || 60)), 0) / 60))} min
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setShowCreateDialog(false)} size="lg">
                    Annuler
                  </Button>
                  <Button 
                    onClick={handleCreateWorkout}
                    disabled={!newWorkoutName.trim() || newWorkoutExercises.length === 0}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 min-w-[140px]"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Créer la séance
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Séances créées (pas encore commencées) */}
      {createdWorkouts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Séances créées ({createdWorkouts.length})
          </h3>
          
          <div className="grid gap-4">
            {createdWorkouts.map(workout => (
              <Card key={workout.id} className="border-orange-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{workout.name}</CardTitle>
                      <CardDescription>
                        Créée le {formatDate(workout.date)}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                      <Calendar className="h-3 w-3 mr-1" />
                      Créée
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>{getTotalSets(workout)} séries</span>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleStartWorkout(workout)}>
                          <Play className="h-4 w-4 mr-1" />
                          Lancer
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteWorkout(workout.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      {workout.exercises.map(exercise => (
                        <div key={exercise.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <span className="font-medium">{exercise.exercise.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {exercise.sets.length} séries
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Séances en cours (vraiment commencées) */}
      {startedWorkouts.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Play className="h-5 w-5" />
            Séances en cours ({startedWorkouts.length})
          </h3>
          
          <div className="grid gap-4">
            {startedWorkouts.map(workout => (
              <Card key={workout.id} className="border-primary/20">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{workout.name}</CardTitle>
                      <CardDescription>
                        Commencée le {formatDate(workout.date)}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                      <Clock className="h-3 w-3 mr-1" />
                      En cours
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>{getCompletedSets(workout)}/{getTotalSets(workout)} séries</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleStartWorkout(workout)}>
                          <Play className="h-4 w-4 mr-1" />
                          Continuer
                        </Button>
                        <Button size="sm" onClick={() => handleCompleteWorkout(workout)}>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Terminer
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleDeleteWorkout(workout.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="grid gap-2">
                      {workout.exercises.map(exercise => (
                        <div key={exercise.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <span className="font-medium">{exercise.exercise.name}</span>
                          <span className="text-sm text-muted-foreground">
                            {exercise.sets.filter(s => s.completed).length}/{exercise.sets.length} séries
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Historique */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <History className="h-5 w-5" />
          Historique ({completedWorkouts.length})
        </h3>
        
        {completedWorkouts.length === 0 && createdWorkouts.length === 0 && startedWorkouts.length === 0 ? (
          <Card>
            <CardContent className="py-8">
              <div className="text-center">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Aucune séance terminée</h3>
                <p className="text-muted-foreground">
                  Vos séances terminées apparaîtront ici
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {completedWorkouts.slice(0, 10).map(workout => (
              <Card key={workout.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{workout.name}</CardTitle>
                      <CardDescription>
                        {formatDate(workout.date)} • {workout.duration}min
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Terminée
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleCreateTemplate(workout)}
                      >
                        <Bookmark className="h-4 w-4 mr-1" />
                        Template
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleDeleteWorkout(workout.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-2">
                    {workout.exercises.map(exercise => {
                      const completedSets = exercise.sets.filter(s => s.completed);
                      const totalVolume = completedSets.reduce((sum, set) => sum + (set.weight * set.reps), 0);
                      
                      return (
                        <div key={exercise.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                          <div>
                            <span className="font-medium">{exercise.exercise.name}</span>
                            <p className="text-xs text-muted-foreground">
                              {completedSets.length} série(s) • Volume: {totalVolume}kg
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <div className="font-medium">
                              {completedSets.length > 0 && `${Math.max(...completedSets.map(s => s.weight))}kg max`}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {workout.notes && (
                    <>
                      <Separator className="my-3" />
                      <div className="text-sm">
                        <span className="font-medium">Notes: </span>
                        <span className="text-muted-foreground">{workout.notes}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}