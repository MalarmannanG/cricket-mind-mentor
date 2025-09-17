import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Camera, Play, Pause, RotateCcw, Palette } from "lucide-react";
import { toast } from "sonner";

export const DailyPlan = () => {
  const [breathingTime, setBreathingTime] = useState(180); // 3 minutes in seconds
  const [visualizationTime, setVisualizationTime] = useState(300); // 5 minutes in seconds
  const [breathingActive, setBreathingActive] = useState(false);
  const [visualizationActive, setVisualizationActive] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentColor, setCurrentColor] = useState("#22c55e");
  
  const colors = ["#22c55e", "#3b82f6", "#ef4444", "#f59e0b", "#8b5cf6", "#06b6d4"];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (breathingActive && breathingTime > 0) {
      interval = setInterval(() => {
        setBreathingTime(time => {
          if (time <= 1) {
            setBreathingActive(false);
            toast.success("Breathing exercise completed!");
            return 180; // Reset to 3 minutes
          }
          return time - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [breathingActive, breathingTime]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (visualizationActive && visualizationTime > 0) {
      interval = setInterval(() => {
        setVisualizationTime(time => {
          if (time <= 1) {
            setVisualizationActive(false);
            toast.success("Visualization exercise completed!");
            return 300; // Reset to 5 minutes
          }
          return time - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [visualizationActive, visualizationTime]);

  // Canvas drawing functionality
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Initial setup
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 3;
    ctx.strokeStyle = currentColor;
  }, [currentColor]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleBreathing = () => {
    setBreathingActive(!breathingActive);
    if (!breathingActive) {
      toast.info("Starting breathing exercise. Breathe deeply and slowly.");
    }
  };

  const resetBreathing = () => {
    setBreathingActive(false);
    setBreathingTime(180);
  };

  const toggleVisualization = () => {
    setVisualizationActive(!visualizationActive);
    if (!visualizationActive) {
      toast.info("Starting visualization. Picture yourself succeeding in cricket.");
    }
  };

  const resetVisualization = () => {
    setVisualizationActive(false);
    setVisualizationTime(300);
  };

  return (
    <div className="pb-20 p-4 space-y-6 min-h-screen bg-gradient-to-br from-background to-muted/30">
      {/* Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold bg-gradient-field bg-clip-text text-transparent">
          Daily Action Plan
        </h1>
        <p className="text-muted-foreground mt-2">Mental Training Activities</p>
      </div>

      {/* Handwriting Pad */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette size={20} />
            Handwriting Pad
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Write down your goals, affirmations, or thoughts
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Color Palette */}
          <div className="flex gap-2 justify-center">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => setCurrentColor(color)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  currentColor === color ? "border-foreground scale-110" : "border-border"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>

          {/* Canvas */}
          <div className="border-2 border-dashed border-muted-foreground/30 rounded-lg overflow-hidden bg-white">
            <canvas
              ref={canvasRef}
              className="w-full h-48 cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
            />
          </div>

          <Button 
            onClick={clearCanvas}
            variant="outline" 
            className="w-full"
          >
            Clear Canvas
          </Button>
        </CardContent>
      </Card>

      {/* Camera Mark Button */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera size={20} />
            Video Recording
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Record technique videos or motivational messages
          </p>
        </CardHeader>
        <CardContent>
          <Button 
            className="w-full bg-gradient-sky hover:opacity-90 transition-all"
            onClick={() => toast.info("Camera feature would open native camera in mobile app")}
          >
            <Camera size={16} className="mr-2" />
            Open Camera
          </Button>
        </CardContent>
      </Card>

      {/* Breathing Timer */}
      <Card className="shadow-success border-success/20 bg-success/5">
        <CardHeader>
          <CardTitle className="text-success">Breathing Exercise</CardTitle>
          <p className="text-sm text-muted-foreground">
            3-minute deep breathing session
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-success mb-2">
              {formatTime(breathingTime)}
            </div>
            <Badge 
              variant={breathingActive ? "default" : "secondary"}
              className={breathingActive ? "animate-pulse-success" : ""}
            >
              {breathingActive ? "Active" : "Ready"}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={toggleBreathing}
              className={`flex-1 ${breathingActive ? "bg-destructive hover:bg-destructive/90" : "bg-success hover:bg-success/90"}`}
            >
              {breathingActive ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
              {breathingActive ? "Pause" : "Start"}
            </Button>
            <Button 
              onClick={resetBreathing}
              variant="outline"
              size="icon"
            >
              <RotateCcw size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Visualization Timer */}
      <Card className="shadow-card border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-primary">Visualization Exercise</CardTitle>
          <p className="text-sm text-muted-foreground">
            5-minute success visualization session
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">
              {formatTime(visualizationTime)}
            </div>
            <Badge 
              variant={visualizationActive ? "default" : "secondary"}
              className={visualizationActive ? "animate-pulse-success" : ""}
            >
              {visualizationActive ? "Active" : "Ready"}
            </Badge>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={toggleVisualization}
              className={`flex-1 ${visualizationActive ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90"}`}
            >
              {visualizationActive ? <Pause size={16} className="mr-2" /> : <Play size={16} className="mr-2" />}
              {visualizationActive ? "Pause" : "Start"}
            </Button>
            <Button 
              onClick={resetVisualization}
              variant="outline"
              size="icon"
            >
              <RotateCcw size={16} />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};