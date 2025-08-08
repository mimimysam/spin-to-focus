'use client';

import { useState, useEffect, useRef } from 'react';

interface SpinnerWheelProps {
  tasks: string[];
  onSpinComplete?: (task: string) => void;
}

const defaultTasks = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];

const colors = [
  '#FF6B6B', // coral red
  '#FF9E7A', // peach
  '#FFCA80', // light orange
  '#FFE066', // yellow
  '#9EE09E', // light green
  '#67D5B5', // teal
  '#84D2F6', // light blue
  '#C792EA', // purple
];

export default function SpinnerWheel({ tasks = [], onSpinComplete }: SpinnerWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const animationRef = useRef<number | null>(null);
  
  const displayTasks = tasks.length > 0 ? tasks : defaultTasks;
  const taskCount = displayTasks.length;
  const hasUserTasks = tasks.length > 0;

  // Continuous animation for the wheel when no tasks
  useEffect(() => {
    // Only animate if no user tasks and not currently spinning
    if (hasUserTasks || isSpinning) {
      if (animationRef.current !== null && !isSpinning) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }
    
    // Use a constant rotation increment for steady speed
    // Much slower constant speed - one full rotation takes about 30 seconds
    const rotationIncrement = 0.00015;
    let lastTimestamp = 0;
    
    const animate = (timestamp: number) => {
      // For first frame, just store timestamp
      if (lastTimestamp === 0) {
        lastTimestamp = timestamp;
        animationRef.current = requestAnimationFrame(animate);
        return;
      }
      
      // Calculate delta time since last frame
      const deltaTime = timestamp - lastTimestamp;
      lastTimestamp = timestamp;
      
      // Apply constant rotation increment
      setRotation(prev => (prev + rotationIncrement * deltaTime) % (2 * Math.PI));
      
      // Continue animation
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [hasUserTasks, isSpinning]);

  // Draw the wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) * 0.9;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw segments
    const anglePerSegment = (2 * Math.PI) / taskCount;
    
    for (let i = 0; i < taskCount; i++) {
      const startAngle = i * anglePerSegment + rotation;
      const endAngle = (i + 1) * anglePerSegment + rotation;
      
      // Draw segment
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, endAngle);
      ctx.closePath();
      
      // Fill segment
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      
      // Add border
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.stroke();
      
      // Add text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = '14px var(--font-sans)';
      
      // Adjust text positioning and wrapping for better readability
      const maxTextLength = radius * 0.7;
      let text = displayTasks[i];
      
      // Truncate text if too long
      if (ctx.measureText(text).width > maxTextLength) {
        text = text.substring(0, 15) + '...';
      }
      
      ctx.fillText(text, radius * 0.75, 5);
      ctx.restore();
    }
    
    // Draw center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 0.1, 0, 2 * Math.PI);
    ctx.fillStyle = '#fff';
    ctx.fill();
    
    // Draw pointer at the top but with tip pointing down
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - radius + 10); // Pointy tip pointing down
    ctx.lineTo(centerX - 10, centerY - radius - 10); // Left corner at top
    ctx.lineTo(centerX + 10, centerY - radius - 10); // Right corner at top
    ctx.closePath();
    ctx.fillStyle = '#fff';
    ctx.fill();
    
  }, [rotation, taskCount, displayTasks]);
  
  // Handle spin with animation
  const spinWheel = () => {
    if (isSpinning || !hasUserTasks) return;
    
    setIsSpinning(true);
    setSelectedTask(null);
    
    // Calculate a random stopping point
    const spinDuration = 3000 + Math.random() * 2000; // Between 3-5 seconds
    const spinRevolutions = 2 + Math.random() * 3; // Between 2-5 full rotations
    const targetRotation = rotation + (Math.PI * 2 * spinRevolutions);
    
    // Random segment to land on
    const randomIndex = Math.floor(Math.random() * tasks.length);
    const segmentAngle = (Math.PI * 2) / tasks.length;
    const segmentOffset = segmentAngle * randomIndex + segmentAngle / 2;
    const finalRotation = targetRotation + segmentOffset;
    
    let startTime: number | null = null;
    
    const animateSpin = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / spinDuration, 1);
      
      // Easing function for smooth deceleration
      const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
      const currentRotation = rotation + (finalRotation - rotation) * easeOut(progress);
      
      setRotation(currentRotation);
      
      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animateSpin);
      } else {
        // Spin complete
        setIsSpinning(false);
        
        // Calculate which segment is selected
        const normalizedRotation = currentRotation % (2 * Math.PI);
        const selectedIndex = Math.floor(tasks.length - (normalizedRotation / (2 * Math.PI) * tasks.length)) % tasks.length;
        const selected = tasks[selectedIndex];
        
        setSelectedTask(selected);
        if (onSpinComplete) {
          onSpinComplete(selected);
        }
      }
    };
    
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(animateSpin);
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-6">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={300} 
        />
        {isSpinning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-xl font-bold bg-black/30 px-4 py-2 rounded-full">
              Spinning...
            </div>
          </div>
        )}
      </div>
      
      {hasUserTasks && (
        <button 
          onClick={spinWheel}
          disabled={isSpinning}
          className="btn btn-primary px-8 py-3 text-lg"
        >
          {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
        </button>
      )}
      
      {selectedTask && !isSpinning && hasUserTasks && (
        <div className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 text-center">
          <h3 className="text-xl font-medium text-white">Focus on:</h3>
          <p className="text-2xl font-bold text-white mt-2">{selectedTask}</p>
        </div>
      )}
    </div>
  );
}
