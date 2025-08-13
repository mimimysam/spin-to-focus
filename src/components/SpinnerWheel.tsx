'use client';

import { useState, useEffect, useRef } from 'react';
import TaskModal from './TaskModal';

import { Task } from '@/types/Task';

interface SpinnerWheelProps {
  tasks: Task[];
  onSpinComplete?: (task: Task) => void;
  onTaskTimeUpdate?: (taskId: string, seconds: number) => void;
}

const defaultTasks = [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '];

const colors = [
  '#D32F2F', // darker red
  '#E64A19', // darker orange-red
  '#F57C00', // darker orange
  '#FFA000', // darker amber
  '#689F38', // darker light green
  '#00796B', // darker teal
  '#0288D1', // darker light blue
  '#7B1FA2', // darker purple
];

export default function SpinnerWheel({ tasks = [], onSpinComplete, onTaskTimeUpdate }: SpinnerWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const animationRef = useRef<number | null>(null);
  
  // Create display tasks - either user tasks or default placeholders
  const displayTasks = tasks.length > 0 
    ? tasks.map(task => task.text) 
    : defaultTasks;
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

  // State to track the selected segment index
  const [selectedSegmentIndex, setSelectedSegmentIndex] = useState<number | null>(null);

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
      
      // Fill segment with color
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();
      
      // Add subtle border (same for all segments)
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.stroke();
      
      // Add text
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(startAngle + anglePerSegment / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#fff';
      ctx.font = hasUserTasks 
        ? 'bold 80px var(--font-sans)' // Extremely large for user tasks
        : 'bold 28px var(--font-sans)'; // Larger for default tasks
      
      // Add text shadow for better readability
      ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
      ctx.shadowBlur = hasUserTasks ? 8 : 5;
      ctx.shadowOffsetX = hasUserTasks ? 2 : 1;
      ctx.shadowOffsetY = hasUserTasks ? 2 : 1;
      
      // Adjust text positioning and wrapping for better readability
      const maxTextLength = hasUserTasks ? radius * 0.7 : radius * 0.6;
      let text = displayTasks[i];
      
      // Truncate text if too long
      if (ctx.measureText(text).width > maxTextLength) {
        // Adjust truncation length based on font size
        const truncateLength = hasUserTasks ? 10 : 10;
        text = text.substring(0, truncateLength) + '...';
      }
      
      // Position text - adjust for larger font when tasks are added
      const textDistance = hasUserTasks ? radius * 0.8 : radius * 0.65;
      const verticalOffset = hasUserTasks ? 25 : 8;
      ctx.fillText(text, textDistance, verticalOffset);
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
    
  }, [rotation, taskCount, displayTasks, hasUserTasks]);
  
  // Handle spin with animation
  const spinWheel = () => {
    if (isSpinning || !hasUserTasks) return;
    
    // First, choose a random segment to land on
    const randomSegmentIndex = Math.floor(Math.random() * tasks.length);
    
    // Clear any previously selected task
    setSelectedTask(null);
    setSelectedSegmentIndex(null);
    setIsSpinning(true);
    
    // Animation parameters
    const spinDuration = 3000 + Math.random() * 2000; // Between 3-5 seconds
    const spinRevolutions = 2 + Math.random() * 3; // Between 2-5 full rotations
    
    // Calculate the segment angle
    const segmentAngle = (2 * Math.PI) / tasks.length;
    
    // Calculate the exact rotation needed to land on the selected segment
    // We want the pointer (at top, 0 radians) to point to the middle of the segment
    const segmentMiddleAngle = randomSegmentIndex * segmentAngle + segmentAngle / 2;
    
    // Calculate the final rotation
    // We need to rotate clockwise, so we subtract the segment angle from 2π
    // Then add the base rotation (full revolutions)
    const finalRotation = rotation + (2 * Math.PI * spinRevolutions) + (2 * Math.PI - segmentMiddleAngle);
    
    // Animation
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
        // Spin complete - set the selected segment and task
        setIsSpinning(false);
        setSelectedSegmentIndex(randomSegmentIndex);
        
        const selectedTaskValue = tasks[randomSegmentIndex];
        setSelectedTask(selectedTaskValue);
        
        if (onSpinComplete) {
          onSpinComplete(selectedTaskValue);
        }
      }
    };
    
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
    
    animationRef.current = requestAnimationFrame(animateSpin);
  };
  
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  // Handle respin from modal
  const handleRespin = () => {
    setIsModalOpen(false);
    spinWheel();
  };

  // Show modal when task is selected
  useEffect(() => {
    if (selectedTask && !isSpinning && hasUserTasks) {
      setIsModalOpen(true);
    }
  }, [selectedTask, isSpinning, hasUserTasks]);

  return (
    <div className="flex flex-col items-center">
      <div className="relative mb-6">
        <canvas 
          ref={canvasRef} 
          width={hasUserTasks ? 600 : 300} 
          height={hasUserTasks ? 600 : 300}
          className={`${hasUserTasks ? 'w-[600px] h-[600px]' : 'w-[300px] h-[300px]'} transition-all duration-500`}
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
      
      {/* Task Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onRespin={handleRespin}
          onTimeUpdate={onTaskTimeUpdate}
        />
      )}
    </div>
  );
}
