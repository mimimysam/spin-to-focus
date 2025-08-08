'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import TaskInput from '@/components/TaskInput';
import TaskList from '@/components/TaskList';
import SpinnerWheel from '@/components/SpinnerWheel';

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
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
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
        
        <div className="mt-8">
          <SpinnerWheel 
            tasks={tasks} 
            onSpinComplete={handleSpinComplete} 
          />
        </div>
        
        <TaskList 
          tasks={tasks} 
          onRemoveTask={handleRemoveTask} 
        />
      </main>
      
      <Footer />
    </div>
  );
}
