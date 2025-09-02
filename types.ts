export interface Subject {
  id: string;
  name: string;
  color: string;
  category?: string;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  dueDate: string; // ISO string
  completed: boolean;
}

export interface StudySession {
  id:string;
  subjectId: string;
  startTime: number; // Unix timestamp
  endTime: number; // Unix timestamp
  duration: number; // in seconds
}

export enum TimerMode {
  Pomodoro = 'POMODORO',
  Stopwatch = 'STOPWATCH',
}

export interface UserProfile {
  name: string;
  title: string;
}

export interface AppContextType {
  subjects: Subject[];
  tasks: Task[];
  sessions: StudySession[];
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  updateSubject: (subject: Subject) => void;
  deleteSubject: (id: string) => void;
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  addSession: (session: Omit<StudySession, 'id'>) => void;
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Timer State
  timerMode: TimerMode;
  isTimerRunning: boolean;
  currentTime: number;
  activeSubjectId: string | null;
  setTimerMode: (mode: TimerMode) => void;
  setActiveSubjectId: (id: string | null) => void;
  startTimer: () => boolean;
  pauseTimer: () => void;
  stopAndSaveSession: () => void;

  // Global Dialog State
  isAddSubjectOpen: boolean;
  openAddSubject: () => void;
  closeAddSubject: () => void;
  isAddTaskOpen: boolean;
  openAddTask: () => void;
  closeAddTask: () => void;
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;

  // Sidebar State
  isSidebarOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  isSidebarCollapsed: boolean;
  toggleSidebarCollapse: () => void;

  // User Profile
  userProfile: UserProfile;
  updateUserProfile: (profile: UserProfile) => void;
}