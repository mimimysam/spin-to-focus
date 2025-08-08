'use client';

import { useState, FormEvent } from 'react';

interface TaskInputProps {
  onAddTask: (task: string) => void;
}

export default function TaskInput({ onAddTask }: TaskInputProps) {
  const [taskText, setTaskText] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    if (taskText.trim()) {
      onAddTask(taskText.trim());
      setTaskText('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full flex flex-col sm:flex-row gap-3">
      <input
        type="text"
        value={taskText}
        onChange={(e) => setTaskText(e.target.value)}
        placeholder="Add your tasks..."
        className="input flex-grow w-full"
      />
      <button 
        type="submit" 
        className="btn btn-primary whitespace-nowrap"
        disabled={!taskText.trim()}
      >
        Add Task
      </button>
    </form>
  );
}
