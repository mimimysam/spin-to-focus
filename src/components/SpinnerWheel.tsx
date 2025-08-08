'use client';

import { useState, useEffect, useRef } from 'react';

interface SpinnerWheelProps {
  tasks: string[];
  onSpinComplete?: (task: string) => void;
}

const defaultTasks = ['Task 1', 'Task 2', 'Task 3', 'Task 4', 'Task 5', 'Task 6', 'Task 7', 'Task 8'];

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
  const animationRef = useRef<number | null>(null);
  
  const displayTasks = tasks.length > 0 ? tasks : defaultTasks;
  const taskCount = displayTasks.length;
  const hasUserTasks = tasks.length > 0;

  // Continuous animation for the wheel
  useEffect(() => {
    // Only animate if no user tasks
    if (hasUserTasks) {
      if (animationRef.current !== null) {
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
  }, [hasUserTasks]);

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
      ctx.fillText(displayTasks[i], radius * 0.85, 5);
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
  
  // Handle spin - just selects a random task without animation
  const spinWheel = () => {
    // Select a random task
    const randomIndex = Math.floor(Math.random() * tasks.length);
    const selected = tasks[randomIndex];
    
    if (onSpinComplete) {
      onSpinComplete(selected);
    }
  };
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-6">
        <canvas 
          ref={canvasRef} 
          width={300} 
          height={300} 
        />
      </div>
      
      {hasUserTasks && (
        <button 
          onClick={spinWheel}
          className="btn btn-primary"
        >
          Spin the Wheel
        </button>
      )}
    </div>
  );
}
