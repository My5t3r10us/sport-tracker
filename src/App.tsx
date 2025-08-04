import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Dumbbell, Calendar, BarChart3, Weight, User, Settings, Database } from "lucide-react";
import { Exercise, Workout } from "../shared/types";
import { StorageService } from "./lib/storage";
// import { createSampleData } from "./lib/sampleData";
import ExercisesTab from "./components/ExercisesTab";
import WeightsTab from "./components/WeightsTab";
import WorkoutsTab from "./components/WorkoutsTab";
import StatsTab from "./components/StatsTab";
import ProfileTab from "./components/ProfileTab";
import ActiveWorkoutView from "./components/ActiveWorkoutView";

export default function App() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark');
    }
    return false;
  });
  
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activeTab, setActiveTab] = useState("workouts");
  const [currentActiveWorkout, setCurrentActiveWorkout] = useState<Workout | null>(null);
  const [showActiveWorkoutView, setShowActiveWorkoutView] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setExercises(StorageService.getExercises());
    setWorkouts(StorageService.getWorkouts());
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  // const handleCreateSampleData = () => {
  //   createSampleData();
  //   loadData();
  //   setActiveTab("weights");
  // };

  const handleStartActiveWorkout = (workout: Workout) => {
    setCurrentActiveWorkout(workout);
    setShowActiveWorkoutView(true);
  };

  const handleBackFromActiveWorkout = () => {
    setShowActiveWorkoutView(false);
    setCurrentActiveWorkout(null);
    loadData(); // Recharger les données
  };

  const handleWorkoutComplete = () => {
    setShowActiveWorkoutView(false);
    setCurrentActiveWorkout(null);
    loadData();
    setActiveTab("workouts"); // Retourner à l'onglet séances
  };

  // Affichage de la vue séance active
  if (showActiveWorkoutView && currentActiveWorkout) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <ActiveWorkoutView
          workout={currentActiveWorkout}
          onBack={handleBackFromActiveWorkout}
          onWorkoutUpdate={loadData}
          onWorkoutComplete={handleWorkoutComplete}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Dumbbell className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold">Gym Tracker</h1>
            </div>
            
            <div className="flex items-center gap-2">
              {/* {workouts.length === 0 && (
                <Button variant="outline" size="sm" onClick={handleCreateSampleData}>
                  <Database className="h-4 w-4 mr-2" />
                  Créer données test
                </Button>
              )} */}
              <Button variant="ghost" size="icon" onClick={toggleTheme}>
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="workouts" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Séances</span>
            </TabsTrigger>
            <TabsTrigger value="exercises" className="flex items-center gap-2">
              <Dumbbell className="h-4 w-4" />
              <span className="hidden sm:inline">Exercices</span>
            </TabsTrigger>
            <TabsTrigger value="weights" className="flex items-center gap-2">
              <Weight className="h-4 w-4" />
              <span className="hidden sm:inline">Poids</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Stats</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Profil</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="workouts" className="mt-6">
            <WorkoutsTab 
              workouts={workouts}
              exercises={exercises}
              onDataChange={loadData}
              onStartActiveWorkout={handleStartActiveWorkout}
            />
          </TabsContent>
          
          <TabsContent value="exercises" className="mt-6">
            <ExercisesTab 
              exercises={exercises} 
              onDataChange={loadData} 
            />
          </TabsContent>
          
          <TabsContent value="weights" className="mt-6">
            <WeightsTab 
              workouts={workouts}
              exercises={exercises}
            />
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6">
            <StatsTab 
              workouts={workouts}
              exercises={exercises}
            />
          </TabsContent>
          
          <TabsContent value="profile" className="mt-6">
            <ProfileTab 
              onDataChange={loadData}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
