import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  User, 
  Settings, 
  Download, 
  Upload, 
  Trash2, 
  Save,
  Calendar,
  Target,
  Activity,
  Info
} from "lucide-react";
import { UserProfile } from "../../shared/types";
import { StorageService } from "../lib/storage";

interface ProfileTabProps {
  onDataChange: () => void;
}

export default function ProfileTab({ onDataChange }: ProfileTabProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    height: '',
    currentWeight: '',
    goalWeight: '',
    fitnessLevel: 'Débutant' as 'Débutant' | 'Intermédiaire' | 'Avancé',
    goals: '',
    notes: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const userProfile = StorageService.getUserProfile();
    setProfile(userProfile);
    
    if (userProfile) {
      setFormData({
        name: userProfile.name || '',
        age: userProfile.age?.toString() || '',
        height: userProfile.height?.toString() || '',
        currentWeight: userProfile.currentWeight?.toString() || '',
        goalWeight: userProfile.goalWeight?.toString() || '',
        fitnessLevel: userProfile.fitnessLevel || 'Débutant',
        goals: userProfile.goals || '',
        notes: userProfile.notes || ''
      });
    }
  };

  const handleSave = () => {
    const updatedProfile: Partial<UserProfile> = {
      name: formData.name.trim() || 'Utilisateur',
      age: formData.age ? parseInt(formData.age) : undefined,
      height: formData.height ? parseFloat(formData.height) : undefined,
      currentWeight: formData.currentWeight ? parseFloat(formData.currentWeight) : undefined,
      goalWeight: formData.goalWeight ? parseFloat(formData.goalWeight) : undefined,
      fitnessLevel: formData.fitnessLevel,
      goals: formData.goals.trim() || undefined,
      notes: formData.notes.trim() || undefined
    };

    StorageService.updateUserProfile(updatedProfile);
    loadProfile();
    setIsEditing(false);
    onDataChange();
  };

  const handleExportData = () => {
    const data = StorageService.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gym-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        StorageService.importData(data);
        loadProfile();
        onDataChange();
        alert('Données importées avec succès !');
      } catch (error) {
        alert('Erreur lors de l\'importation des données');
        console.error('Import error:', error);
      }
    };
    reader.readAsText(file);

    // Reset input
    event.target.value = '';
  };

  const handleDeleteAllData = () => {
    localStorage.clear();
    setProfile(null);
    setFormData({
      name: '',
      age: '',
      height: '',
      currentWeight: '',
      goalWeight: '',
      fitnessLevel: 'Débutant',
      goals: '',
      notes: ''
    });
    setShowDeleteDialog(false);
    onDataChange();
    alert('Toutes les données ont été supprimées !');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date);
  };

  const getBMI = () => {
    if (profile?.height && profile?.currentWeight) {
      const heightInMeters = profile.height / 100;
      return (profile.currentWeight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { label: 'Insuffisance pondérale', color: 'bg-blue-100 text-blue-800' };
    if (bmi < 25) return { label: 'Poids normal', color: 'bg-green-100 text-green-800' };
    if (bmi < 30) return { label: 'Surpoids', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Obésité', color: 'bg-red-100 text-red-800' };
  };

  const getWeightProgress = () => {
    if (profile?.currentWeight && profile?.goalWeight) {
      const diff = profile.goalWeight - profile.currentWeight;
      return {
        remaining: Math.abs(diff),
        direction: diff > 0 ? 'gain' : 'perte',
        isGoalReached: Math.abs(diff) < 0.5
      };
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Mon profil</h2>
          <p className="text-muted-foreground">
            Gérez vos informations personnelles et objectifs
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
          
          <Button variant="outline" asChild>
            <label className="cursor-pointer">
              <Upload className="h-4 w-4 mr-2" />
              Importer
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Informations personnelles */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informations personnelles
                  </CardTitle>
                  <CardDescription>
                    Vos données personnelles et objectifs de fitness
                  </CardDescription>
                </div>
                
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    <Settings className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => {
                      setIsEditing(false);
                      loadProfile();
                    }}>
                      Annuler
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="h-4 w-4 mr-2" />
                      Sauvegarder
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {!isEditing ? (
                // Mode affichage
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Nom</Label>
                      <p className="font-medium">{profile?.name || 'Non renseigné'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Âge</Label>
                      <p className="font-medium">{profile?.age ? `${profile.age} ans` : 'Non renseigné'}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Taille</Label>
                      <p className="font-medium">{profile?.height ? `${profile.height} cm` : 'Non renseigné'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Niveau</Label>
                      <Badge variant="outline" className="w-fit">
                        {profile?.fitnessLevel || 'Débutant'}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm text-muted-foreground">Poids actuel</Label>
                      <p className="font-medium">{profile?.currentWeight ? `${profile.currentWeight} kg` : 'Non renseigné'}</p>
                    </div>
                    <div>
                      <Label className="text-sm text-muted-foreground">Poids objectif</Label>
                      <p className="font-medium">{profile?.goalWeight ? `${profile.goalWeight} kg` : 'Non renseigné'}</p>
                    </div>
                  </div>

                  {profile?.goals && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Objectifs</Label>
                      <p className="mt-1">{profile.goals}</p>
                    </div>
                  )}

                  {profile?.notes && (
                    <div>
                      <Label className="text-sm text-muted-foreground">Notes</Label>
                      <p className="mt-1 text-sm text-muted-foreground">{profile.notes}</p>
                    </div>
                  )}

                  {!profile && (
                    <div className="text-center py-8">
                      <User className="mx-auto h-12 w-12 text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-semibold">Profil non configuré</h3>
                      <p className="text-muted-foreground mb-4">
                        Cliquez sur "Modifier" pour renseigner vos informations
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                // Mode édition
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Votre nom"
                      />
                    </div>
                    <div>
                      <Label htmlFor="age">Âge</Label>
                      <Input
                        id="age"
                        type="number"
                        min="1"
                        max="120"
                        value={formData.age}
                        onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                        placeholder="25"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="height">Taille (cm)</Label>
                      <Input
                        id="height"
                        type="number"
                        min="100"
                        max="250"
                        value={formData.height}
                        onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                        placeholder="170"
                      />
                    </div>
                    <div>
                      <Label htmlFor="fitnessLevel">Niveau de fitness</Label>
                      <select
                        id="fitnessLevel"
                        value={formData.fitnessLevel}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          fitnessLevel: e.target.value as 'Débutant' | 'Intermédiaire' | 'Avancé'
                        })}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="Débutant">Débutant</option>
                        <option value="Intermédiaire">Intermédiaire</option>
                        <option value="Avancé">Avancé</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="currentWeight">Poids actuel (kg)</Label>
                      <Input
                        id="currentWeight"
                        type="number"
                        min="30"
                        max="300"
                        step="0.1"
                        value={formData.currentWeight}
                        onChange={(e) => setFormData({ ...formData, currentWeight: e.target.value })}
                        placeholder="70"
                      />
                    </div>
                    <div>
                      <Label htmlFor="goalWeight">Poids objectif (kg)</Label>
                      <Input
                        id="goalWeight"
                        type="number"
                        min="30"
                        max="300"
                        step="0.1"
                        value={formData.goalWeight}
                        onChange={(e) => setFormData({ ...formData, goalWeight: e.target.value })}
                        placeholder="75"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="goals">Objectifs</Label>
                    <Textarea
                      id="goals"
                      value={formData.goals}
                      onChange={(e) => setFormData({ ...formData, goals: e.target.value })}
                      placeholder="Ex: Prendre 5kg de muscle, améliorer ma force au développé couché..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="notes">Notes personnelles</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Notes, préférences d'entraînement, restrictions médicales..."
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Résumé et statistiques */}
        <div className="space-y-6">
          {/* Métriques santé */}
          {profile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Métriques santé
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {getBMI() && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">IMC</span>
                      <span className="font-bold text-lg">{getBMI()}</span>
                    </div>
                    <Badge className={getBMICategory(parseFloat(getBMI()!)).color}>
                      {getBMICategory(parseFloat(getBMI()!)).label}
                    </Badge>
                  </div>
                )}

                {getWeightProgress() && (
                  <div>
                    <Separator className="my-3" />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Objectif poids</span>
                        <Target className="h-4 w-4 text-muted-foreground" />
                      </div>
                      
                      {getWeightProgress()!.isGoalReached ? (
                        <Badge className="bg-green-100 text-green-800 w-full justify-center">
                          🎉 Objectif atteint !
                        </Badge>
                      ) : (
                        <div className="text-center">
                          <div className="text-lg font-bold">
                            {getWeightProgress()!.remaining.toFixed(1)} kg
                          </div>
                          <div className="text-xs text-muted-foreground">
                            à {getWeightProgress()!.direction === 'gain' ? 'prendre' : 'perdre'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Informations du compte */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-5 w-5" />
                Informations du compte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Profil créé</span>
                <span>{profile?.createdAt ? formatDate(profile.createdAt) : 'Aujourd\'hui'}</span>
              </div>
              
              {profile?.updatedAt && profile.createdAt && 
               profile.updatedAt.getTime() !== profile.createdAt.getTime() && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Dernière modif.</span>
                  <span>{formatDate(profile.updatedAt)}</span>
                </div>
              )}

              <Separator />

              <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer toutes les données
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Supprimer toutes les données</DialogTitle>
                    <DialogDescription>
                      Cette action est irréversible. Toutes vos données (profil, séances, exercices, etc.) seront définitivement supprimées.
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="flex justify-end gap-2 pt-4">
                    <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                      Annuler
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteAllData}>
                      Supprimer définitivement
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}