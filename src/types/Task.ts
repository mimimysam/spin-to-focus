export interface Task {
  id: string;
  text: string;
  isCompleted: boolean;
  timeTracked: number; // Time tracked in seconds
  color: string;
}

export const generateTaskId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

export const formatTimeTracked = (seconds: number): string => {
  if (seconds < 60) {
    return `${seconds} secs`;
  } else if (seconds < 3600) {
    return `${Math.floor(seconds / 60)} mins`;
  } else {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}hr ${minutes} mins`;
  }
};
