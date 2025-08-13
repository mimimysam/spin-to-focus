'use client';

import { useState, useEffect, useRef } from 'react';
import { Task } from '@/types/Task';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onRespin: () => void;
  onTimeUpdate?: (taskId: string, seconds: number) => void;
}

type TimerType = 'pomodoro' | 'shortBreak' | 'longBreak';

const TIMER_DURATIONS = {
  pomodoro: 25 * 60, // 25 minutes in seconds
  shortBreak: 5 * 60, // 5 minutes in seconds
  longBreak: 15 * 60, // 15 minutes in seconds
};

export default function TaskModal({ task, isOpen, onClose, onRespin, onTimeUpdate }: TaskModalProps) {
  const [timerType, setTimerType] = useState<TimerType>('pomodoro');
  const [timeRemaining, setTimeRemaining] = useState(TIMER_DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const taskTimeTrackingRef = useRef<NodeJS.Timeout | null>(null);
  const taskTimeElapsedRef = useRef<number>(0);

  // Reset timer when timer type changes
  useEffect(() => {
    setTimeRemaining(TIMER_DURATIONS[timerType]);
    setIsRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [timerType]);

  // Handle timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Timer complete
            setIsRunning(false);
            if (timerRef.current) {
              clearInterval(timerRef.current);
              timerRef.current = null;
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isRunning]);

  // Format time as MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle start/pause button for both Pomodoro timer and task time tracking
  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
    // Note: The task time tracking will automatically start/stop based on isRunning state
    // via the useEffect that depends on isRunning
  };

  // Handle timer type change
  const changeTimerType = (type: TimerType) => {
    setTimerType(type);
  };

  // No fullscreen toggle

  // Start/stop task time tracking when modal opens/closes or timer is paused
  useEffect(() => {
    // Only track time when modal is open AND timer is running
    if (isOpen && task && isRunning) {
      // Start time tracking
      taskTimeTrackingRef.current = setInterval(() => {
        taskTimeElapsedRef.current += 1;
        
        // Update the task's time every second
        if (onTimeUpdate) {
          onTimeUpdate(task.id, 1); // Add 1 second
        }
      }, 1000);
    } else {
      // Stop time tracking when modal closes or timer is paused
      if (taskTimeTrackingRef.current) {
        clearInterval(taskTimeTrackingRef.current);
        taskTimeTrackingRef.current = null;
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (taskTimeTrackingRef.current) {
        clearInterval(taskTimeTrackingRef.current);
      }
    };
  }, [isOpen, task, onTimeUpdate, isRunning]);

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={`fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div 
        ref={modalRef}
        className="
          relative overflow-hidden
          w-full max-w-lg mx-4 rounded-3xl
          bg-gradient-to-br from-indigo-900/90 via-purple-800/90 to-blue-800/90
          backdrop-blur-lg shadow-xl border border-white/10
          transition-all duration-300 ease-in-out
          p-8
        "
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        {/* Modal content */}
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold text-white mb-2">Selected Task:</h2>
          <p className="text-2xl font-bold text-white mb-8 text-center">{task.text}</p>
          
          {/* Timer type toggle */}
          <div className="flex space-x-2 mb-8">
            <button 
              onClick={() => changeTimerType('pomodoro')}
              className={`btn ${timerType === 'pomodoro' ? 'bg-white text-purple-700' : 'bg-white/20 text-white'} px-4 py-2 rounded-full transition-colors`}
            >
              Pomodoro
            </button>
            <button 
              onClick={() => changeTimerType('shortBreak')}
              className={`btn ${timerType === 'shortBreak' ? 'bg-white text-purple-700' : 'bg-white/20 text-white'} px-4 py-2 rounded-full transition-colors`}
            >
              Short Break
            </button>
            <button 
              onClick={() => changeTimerType('longBreak')}
              className={`btn ${timerType === 'longBreak' ? 'bg-white text-purple-700' : 'bg-white/20 text-white'} px-4 py-2 rounded-full transition-colors`}
            >
              Long Break
            </button>
          </div>
          
          {/* Timer display */}
          <h3 className="text-xl font-medium text-white/80 mb-2">
            {timerType === 'pomodoro' ? 'Pomodoro Timer:' : timerType === 'shortBreak' ? 'Short Break:' : 'Long Break:'}
          </h3>
          <div className="text-7xl font-bold text-white mb-8">
            {formatTime(timeRemaining)}
          </div>
          
          {/* Timer controls */}
          <div className="flex space-x-4">
            <button 
              onClick={toggleTimer}
              className="bg-blue-200 hover:bg-blue-300 text-blue-800 font-medium py-3 px-8 rounded-full transition-colors"
            >
              {isRunning ? 'Pause' : 'Start'}
            </button>
            <button 
              onClick={() => {
                setIsRunning(false);
                setTimeRemaining(TIMER_DURATIONS[timerType]);
              }}
              className="bg-white/20 hover:bg-white/30 text-white font-medium py-3 px-8 rounded-full transition-colors"
              disabled={!isRunning && timeRemaining === TIMER_DURATIONS[timerType]}
            >
              Reset
            </button>
            <button 
              onClick={() => {
                setIsRunning(false);
                onRespin();
              }}
              className="bg-teal-500 hover:bg-teal-600 text-white font-medium py-3 px-8 rounded-full transition-colors"
            >
              Respin
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
