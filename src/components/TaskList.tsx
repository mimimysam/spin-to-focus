'use client';

import { useState } from 'react';

interface TaskListProps {
  tasks: string[];
  onRemoveTask: (index: number) => void;
}

export default function TaskList({ tasks, onRemoveTask }: TaskListProps) {
  if (tasks.length === 0) {
    return null;
  }
  
  return (
    <div className="w-full max-w-md mx-auto mt-8">
      <h2 className="text-xl font-semibold text-white mb-4">Your Tasks</h2>
      <ul className="space-y-2">
        {tasks.map((task, index) => (
          <li 
            key={index} 
            className="flex justify-between items-center p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20"
          >
            <span className="text-white">{task}</span>
            <button 
              onClick={() => onRemoveTask(index)}
              className="text-white/60 hover:text-white transition-colors"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
