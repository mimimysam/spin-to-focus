'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TaskInput from '@/components/TaskInput';
import SpinnerWheel from '@/components/SpinnerWheel';

// Colors for tasks and spinner segments
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

export default function Home() {
  const [tasks, setTasks] = useState<string[]>([]);
  const [focusedTask, setFocusedTask] = useState<string | null>(null);

  const handleAddTask = (task: string) => {
    setTasks([...tasks, task]);
  };

  const handleRemoveTask = (index: number) => {
    const newTasks = [...tasks];
    newTasks.splice(index, 1);
    setTasks(newTasks);
  };

  const handleSpinComplete = (task: string) => {
    setFocusedTask(task);
  };

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
              tasks={tasks} 
              onSpinComplete={handleSpinComplete} 
            />
          </div>
        ) : (
          <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left column - Task List */}
            <div className="w-full">
              <h2 className="text-2xl font-semibold text-white mb-6">Your Tasks</h2>
              <div className="max-h-[500px] overflow-y-auto pr-2">
                <ul className="space-y-3">
                  {tasks.map((task, index) => (
                    <li 
                      key={index} 
                      className="flex items-center p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
                    >
                      <div 
                        className="w-4 h-4 rounded-full mr-3" 
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></div>
                      <span className="text-white flex-grow">{task}</span>
                      <button 
                        onClick={() => handleRemoveTask(index)}
                        className="text-white/60 hover:text-white transition-colors ml-2"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            {/* Right column - Spinner */}
            <div className="w-full flex flex-col items-center">
              <h2 className="text-2xl font-semibold text-white mb-6">Task Spinner</h2>
              <SpinnerWheel 
                tasks={tasks} 
                onSpinComplete={handleSpinComplete} 
              />
            </div>
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}
