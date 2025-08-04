import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Edit, Trash2, Dumbbell } from "lucide-react";
import { Exercise } from "../../shared/types";
import { StorageService } from "../lib/storage";

interface ExercisesTabProps {
  exercises: Exercise[];
  onDataChange: () => void;
}

export default function ExercisesTab({ exercises, onDataChange }: ExercisesTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isNewExerciseDialogOpen, setIsNewExerciseDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [newExercise, setNewExercise] = useState({
    name: "",
    category: "",
    muscleGroups: [] as string[],
    description: "",
    instructions: "",
    equipment: ""
  });

  const categories = Array.from(new Set(exercises.map(ex => ex.category))).sort();
  const allMuscleGroups = [
    "Pectoraux", "Deltoïdes", "Triceps", "Biceps", "Dorsaux", "Trapèzes", "Rhomboïdes",
    "Quadriceps", "Ischio-jambiers", "Fessiers", "Mollets", "Abdominaux", "Obliques"
  ];

  const filteredExercises = exercises.filter(exercise => {
    const matchesSearch = exercise.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exercise.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || exercise.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCreateExercise = () => {
    if (!newExercise.name.trim() || !newExercise.category.trim()) return;

    StorageService.addExercise(newExercise);
    resetForm();
    onDataChange();
  };

  const handleUpdateExercise = () => {
    if (!editingExercise || !newExercise.name.trim() || !newExercise.category.trim()) return;

    StorageService.updateExercise(editingExercise.id, newExercise);
    resetForm();
    onDataChange();
  };

  const handleDeleteExercise = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cet exercice ?")) {
      StorageService.deleteExercise(id);
      onDataChange();
    }
  };

  const startEditing = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setNewExercise({
      name: exercise.name,
      category: exercise.category,
      muscleGroups: [...exercise.muscleGroups],
      description: exercise.description || "",
      instructions: exercise.instructions || "",
      equipment: exercise.equipment || ""
    });
    setIsNewExerciseDialogOpen(true);
  };

  const resetForm = () => {
    setNewExercise({
      name: "",
      category: "",
      muscleGroups: [],
      description: "",
      instructions: "",
      equipment: ""
    });
    setEditingExercise(null);
    setIsNewExerciseDialogOpen(false);
  };

  const toggleMuscleGroup = (muscle: string) => {
    setNewExercise(prev => ({
      ...prev,
      muscleGroups: prev.muscleGroups.includes(muscle)
        ? prev.muscleGroups.filter(m => m !== muscle)
        : [...prev.muscleGroups, muscle]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Base d'exercices</h2>
          <p className="text-muted-foreground">
            Gérez votre bibliothèque d'exercices personnalisée
          </p>
        </div>
        
        <Dialog open={isNewExerciseDialogOpen} onOpenChange={(open) => {
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsNewExerciseDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvel exercice
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingExercise ? "Modifier l'exercice" : "Créer un nouvel exercice"}
              </DialogTitle>
              <DialogDescription>
                {editingExercise ? "Modifiez les informations de l'exercice" : "Ajoutez un nouvel exercice à votre base"}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="exerciseName">Nom de l'exercice *</Label>
                  <Input
                    id="exerciseName"
                    value={newExercise.name}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="ex: Développé couché"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exerciseCategory">Catégorie *</Label>
                  <Input
                    id="exerciseCategory"
                    value={newExercise.category}
                    onChange={(e) => setNewExercise(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="ex: Pectoraux"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Groupes musculaires *</Label>
                <div className="grid grid-cols-3 gap-2">
                  {allMuscleGroups.map(muscle => (
                    <div
                      key={muscle}
                      onClick={() => toggleMuscleGroup(muscle)}
                      className={`p-2 border rounded cursor-pointer text-center text-sm transition-colors ${
                        newExercise.muscleGroups.includes(muscle)
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-muted'
                      }`}
                    >
                      {muscle}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exerciseDescription">Description</Label>
                <Input
                  id="exerciseDescription"
                  value={newExercise.description}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description courte de l'exercice"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="exerciseEquipment">Équipement</Label>
                <Input
                  id="exerciseEquipment"
                  value={newExercise.equipment}
                  onChange={(e) => setNewExercise(prev => ({ ...prev, equipment: e.target.value }))}
                  placeholder="ex: Barre, haltères, machine"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={resetForm}>
                Annuler
              </Button>
              <Button 
                onClick={editingExercise ? handleUpdateExercise : handleCreateExercise}
                disabled={!newExercise.name.trim() || !newExercise.category.trim() || newExercise.muscleGroups.length === 0}
              >
                {editingExercise ? "Modifier" : "Créer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtres */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher un exercice..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Liste des exercices */}
      {filteredExercises.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <Dumbbell className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">
                {searchTerm || selectedCategory !== "all" ? "Aucun exercice trouvé" : "Aucun exercice"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== "all" 
                  ? "Essayez de modifier vos critères de recherche"
                  : "Créez votre premier exercice pour commencer"
                }
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredExercises.map((exercise) => (
            <Card key={exercise.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {exercise.name}
                      <Badge variant="secondary">{exercise.category}</Badge>
                    </CardTitle>
                    <CardDescription>
                      {exercise.description || "Aucune description"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => startEditing(exercise)}
                      className="h-8 w-8"
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteExercise(exercise.id)}
                      className="h-8 w-8 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium mb-2">Groupes musculaires</p>
                    <div className="flex flex-wrap gap-1">
                      {exercise.muscleGroups.map((muscle, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {muscle}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {exercise.equipment && (
                    <div>
                      <p className="text-sm font-medium">Équipement</p>
                      <p className="text-sm text-muted-foreground">{exercise.equipment}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}