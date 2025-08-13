'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TaskInput from '@/components/TaskInput';
import SpinnerWheel from '@/components/SpinnerWheel';
import { Task, generateTaskId, formatTimeTracked } from '@/types/Task';

// Colors for tasks and spinner segments
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

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [focusedTask, setFocusedTask] = useState<Task | null>(null);

  // Add a new task
  const handleAddTask = (taskText: string) => {
    const newTask: Task = {
      id: generateTaskId(),
      text: taskText,
      isCompleted: false,
      timeTracked: 0,
      color: colors[tasks.length % colors.length]
    };
    setTasks([...tasks, newTask]);
  };

  // Remove a task
  const handleRemoveTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
    
    // If the removed task was focused, clear the focus
    if (focusedTask && focusedTask.id === taskId) {
      setFocusedTask(null);
    }
  };

  // Toggle task completion status
  const handleToggleComplete = (taskId: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, isCompleted: !task.isCompleted };
      }
      return task;
    }));
  };

  // Handle when a spin completes
  const handleSpinComplete = (task: Task) => {
    // Set the new focused task
    setFocusedTask(task);
  };

  // Update time for a task (used when modal is open)
  const handleTaskTimeUpdate = (taskId: string, secondsToAdd: number) => {
    setTasks(currentTasks => 
      currentTasks.map(task => 
        task.id === taskId 
          ? { ...task, timeTracked: task.timeTracked + secondsToAdd } 
          : task
      )
    );
  };

  // No cleanup needed

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1 flex flex-col items-center px-4 py-8">
        {/* Title and Input - Always visible */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            Spin to Focus
          </h1>
          <p className="text-xl text-white/80">
            Focus starts with a spin.
          </p>
        </div>
        
        <div className="w-full max-w-md mx-auto mb-8">
          <TaskInput onAddTask={handleAddTask} />
        </div>
        
        {/* Two-column layout when tasks exist, otherwise just show spinner */}
        {tasks.length === 0 ? (
          <div className="mt-8">
            <SpinnerWheel 
              tasks={[]} 
              onSpinComplete={handleSpinComplete}
              onTaskTimeUpdate={handleTaskTimeUpdate}
            />
          </div>
        ) : (
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column - Task Lists */}
            <div className="w-full">
              {/* Active Tasks */}
              <h2 className="text-2xl font-semibold text-white mb-6">Your Tasks</h2>
              <div className="max-h-[300px] overflow-y-auto pr-2 mb-8">
                <ul className="space-y-3">
                  {tasks.filter(task => !task.isCompleted).map((task) => (
                    <li 
                      key={task.id} 
                      className="flex items-center p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                    >
                      {/* Task color indicator */}
                      <div 
                        className="w-4 h-4 rounded-full mr-3" 
                        style={{ backgroundColor: task.color }}
                      ></div>
                      
                      {/* Checkbox for completion */}
                      <button
                        onClick={() => handleToggleComplete(task.id)}
                        className="w-6 h-6 rounded border border-white/40 mr-3 flex items-center justify-center hover:bg-white/10"
                        aria-label="Mark as completed"
                      >
                        {task.isCompleted && <span className="text-white">✓</span>}
                      </button>
                      
                      {/* Task text */}
                      <span className="text-white flex-grow">{task.text}</span>
                      
                      {/* Time tracked (if any) */}
                      {task.timeTracked > 0 && (
                        <span className="text-white/70 text-sm mr-3">
                          Time Tracked: {formatTimeTracked(task.timeTracked)}
                        </span>
                      )}
                      
                      {/* Delete button */}
                      <button 
                        onClick={() => handleRemoveTask(task.id)}
                        className="text-white/60 hover:text-white transition-colors ml-2"
                        aria-label="Remove task"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Completed Tasks */}
              {tasks.some(task => task.isCompleted) && (
                <>
                  <h2 className="text-2xl font-semibold text-white mb-6">Completed Tasks</h2>
                  <div className="max-h-[200px] overflow-y-auto pr-2">
                    <ul className="space-y-3">
                      {tasks.filter(task => task.isCompleted).map((task) => (
                        <li 
                          key={task.id} 
                          className="flex items-center p-3 bg-white/5 backdrop-blur-sm rounded-lg border border-white/10"
                        >
                          {/* Task color indicator */}
                          <div className="w-6 h-6 rounded-full mr-3 flex items-center justify-center bg-white/20">
                            <span className="text-white">✓</span>
                          </div>
                          
                          {/* Task text */}
                          <span className="text-white/70 flex-grow">{task.text}</span>
                          
                          {/* Time tracked (if any) */}
                          {task.timeTracked > 0 && (
                            <span className="text-white/50 text-sm mr-3">
                              Time Tracked: {formatTimeTracked(task.timeTracked)}
                            </span>
                          )}
                          
                          {/* Unmark as completed button */}
                          <button
                            onClick={() => handleToggleComplete(task.id)}
                            className="text-white/40 hover:text-white transition-colors mr-2"
                            aria-label="Mark as not completed"
                          >
                            ↩
                          </button>
                          
                          {/* Delete button */}
                          <button 
                            onClick={() => handleRemoveTask(task.id)}
                            className="text-white/40 hover:text-white transition-colors"
                            aria-label="Remove task"
                          >
                            ✕
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
            
            {/* Right column - Spinner */}
            <div className="w-full flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-white mb-6">Task Spinner</h2>
              <SpinnerWheel 
                tasks={tasks.filter(task => !task.isCompleted).map(task => ({ ...task }))} 
                onSpinComplete={handleSpinComplete}
                onTaskTimeUpdate={handleTaskTimeUpdate}
              />
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
