import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Timer, 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw 
} from "lucide-react";

interface RestTimerProps {
  duration: number; // en secondes
  onComplete: () => void;
  onSkip: () => void;
  exerciseName: string;
  setNumber: number;
}

export default function RestTimer({ 
  duration, 
  onComplete, 
  onSkip, 
  exerciseName,
  setNumber 
}: RestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isRunning, setIsRunning] = useState(true);
  const [initialDuration] = useState(duration);

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          onComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = ((initialDuration - timeLeft) / initialDuration) * 100;

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTimeLeft(initialDuration);
    setIsRunning(true);
  };

  const addTime = (seconds: number) => {
    setTimeLeft(prev => prev + seconds);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardContent className="p-6 text-center space-y-6">
          {/* Header */}
          <div>
            <h3 className="font-bold text-lg">Temps de repos</h3>
            <p className="text-sm text-muted-foreground">
              {exerciseName} - Série {setNumber}
            </p>
          </div>

          {/* Timer principal */}
          <div className="space-y-4">
            <div className="relative">
              <div className={`text-6xl font-bold transition-colors ${
                timeLeft <= 10 ? 'text-red-500' : 'text-primary'
              }`}>
                {formatTime(timeLeft)}
              </div>
              
              {timeLeft <= 5 && timeLeft > 0 && (
                <div className="absolute inset-0 animate-pulse">
                  <div className="text-6xl font-bold text-red-500">
                    {formatTime(timeLeft)}
                  </div>
                </div>
              )}
            </div>
            
            <Progress value={progressPercentage} className="h-3" />
            
            <div className="text-sm text-muted-foreground">
              {isRunning ? 'Repos en cours...' : 'En pause'}
            </div>
          </div>

          {/* Contrôles rapides */}
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTime(-15)}
              disabled={timeLeft <= 15}
            >
              -15s
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTime(15)}
            >
              +15s
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addTime(30)}
            >
              +30s
            </Button>
          </div>

          {/* Contrôles principaux */}
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetTimer} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            
            <Button variant="outline" onClick={toggleTimer} className="flex-1">
              {isRunning ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Reprendre
                </>
              )}
            </Button>
            
            <Button onClick={onSkip} className="flex-1">
              <SkipForward className="h-4 w-4 mr-2" />
              Passer
            </Button>
          </div>

          {timeLeft === 0 && (
            <div className="p-3 bg-green-100 text-green-800 rounded-lg font-medium animate-pulse">
              🎉 Temps de repos terminé !
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}