import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import { SettingsDialog } from './components/SettingsDialog';
import Sidebar from './components/Sidebar';
import TimerBar from './components/TimerBar';
import Dashboard from './pages/Dashboard';
import Subjects from './pages/Subjects';
import Tasks from './pages/Tasks';
import { AppContextType, StudySession, Subject, Task, TimerMode, UserProfile } from './types';

export const AppContext = createContext<AppContextType | null>(null);

function useLocalStorage<T>(key: string, initialValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue: React.Dispatch<React.SetStateAction<T>> = (value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };
  return [storedValue, setValue];
}

const App: React.FC = () => {
    const [subjects, setSubjects] = useLocalStorage<Subject[]>('subjects', []);
    const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', []);
    const [sessions, setSessions] = useLocalStorage<StudySession[]>('sessions', []);
    const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('theme', 'light');
    const [userProfile, setUserProfile] = useLocalStorage<UserProfile>('userProfile', { name: 'Alex Starr', title: 'Pro Member'});

    // Sidebar State
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useLocalStorage<boolean>('sidebarCollapsed', false);

    // Timer State
    const [timerMode, setTimerMode] = useState<TimerMode>(TimerMode.Pomodoro);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [currentTime, setCurrentTime] = useState(25 * 60);
    const [activeSubjectId, setActiveSubjectId] = useState<string | null>(subjects[0]?.id || null);
    const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
    const timerIntervalRef = useRef<number | null>(null);

    // Global Dialog State
    const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
    const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Request notification permission when the app loads
    useEffect(() => {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    }, []);

    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.remove('light', 'dark');
        root.classList.add(theme);
    }, [theme]);
    
    useEffect(() => {
        if(subjects.length > 0 && !activeSubjectId) {
            setActiveSubjectId(subjects[0].id)
        }
    }, [subjects, activeSubjectId]);
    
    // Timer Logic
    const stopTimerInterval = () => {
        if (timerIntervalRef.current) {
            clearInterval(timerIntervalRef.current);
            timerIntervalRef.current = null;
        }
    };

    // Function to show notification with system sound
    const showTimerNotification = (timerMode: TimerMode, activeSubjectName: string, currentTime: number) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const title = timerMode === TimerMode.Pomodoro 
                ? '🍅 Pomodoro Complete!' 
                : '⏱️ Study Session Complete!';
            
            const formatTime = (seconds: number) => {
                const mins = Math.floor(seconds / 60);
                const secs = seconds % 60;
                if (mins === 0 && secs > 0) return `${secs}s`;
                if (mins < 60) return `${mins}m`;
                const hours = Math.floor(mins/60);
                const remMins = mins % 60;
                return `${hours}h ${remMins}m`;
            };
            
            const body = timerMode === TimerMode.Pomodoro 
                ? `Great work on ${activeSubjectName}! Time for a 5-minute break.`
                : `You studied ${activeSubjectName} for ${formatTime(currentTime)}. Well done!`;

            const notification = new Notification(title, {
                body: body,
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                requireInteraction: true,
                tag: 'timer-complete'
            });

            // Auto-close notification after 10 seconds
            setTimeout(() => {
                notification.close();
            }, 10000);

            // Handle notification click
            notification.onclick = () => {
                window.focus();
                notification.close();
            };
        } else if (Notification.permission === 'denied') {
            // Fallback: show an alert if notifications are blocked
            alert('Timer Complete! 🍅');
        }
    };
    
    const stopAndSaveSession = useCallback(() => {
        if (!isTimerRunning || !sessionStartTime || !activeSubjectId) return;

        const endTime = Date.now();
        const duration = Math.round((endTime - sessionStartTime) / 1000);

        if (duration > 0) {
            setSessions(prev => [...prev, { id: Date.now().toString(), subjectId: activeSubjectId, startTime: sessionStartTime, endTime, duration }]);
        }

        setIsTimerRunning(false);
        setSessionStartTime(null);
        if (timerMode === TimerMode.Pomodoro) {
            setCurrentTime(25 * 60);
        } else {
            setCurrentTime(0);
        }
    }, [isTimerRunning, sessionStartTime, activeSubjectId, timerMode, setSessions]);

    useEffect(() => {
        if (isTimerRunning) {
            timerIntervalRef.current = window.setInterval(() => {
                if (timerMode === TimerMode.Pomodoro) {
                    setCurrentTime(prev => {
                        if (prev > 0) return prev - 1;
                        
                        // Timer completed - show notification
                        const activeSubjectName = subjects.find(s => s.id === activeSubjectId)?.name || 'Unknown Subject';
                        showTimerNotification(timerMode, activeSubjectName, currentTime);
                        
                        stopAndSaveSession();
                        return 0;
                    });
                } else {
                    setCurrentTime(prev => prev + 1);
                }
            }, 1000);
        } else {
            stopTimerInterval();
        }
        return stopTimerInterval;
    }, [isTimerRunning, timerMode, stopAndSaveSession, subjects, activeSubjectId, currentTime]);

    const startTimer = () => {
        if (!activeSubjectId && subjects.length > 0) {
            alert('Please select a subject first!');
            return false;
        }
        if (subjects.length === 0) {
            alert('Please add a subject to start studying!');
            return false;
        }

        if (!isTimerRunning) {
            setSessionStartTime(Date.now());
        }
        setIsTimerRunning(!isTimerRunning);
        return true;
    };
    
    const pauseTimer = () => setIsTimerRunning(false);

    const handleSetTimerMode = (mode: TimerMode) => {
        if (isTimerRunning) return;
        setTimerMode(mode);
        setCurrentTime(mode === TimerMode.Pomodoro ? 25*60 : 0);
    }
    
    const toggleTheme = () => setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');

    const addSubject = useCallback((subject: Omit<Subject, 'id'>) => {
        const newSubject = { ...subject, id: Date.now().toString() };
        setSubjects(prev => [...prev, newSubject]);
        if (!activeSubjectId) {
            setActiveSubjectId(newSubject.id);
        }
    }, [setSubjects, activeSubjectId]);

    const updateSubject = useCallback((updatedSubject: Subject) => {
        setSubjects(prev => prev.map(s => s.id === updatedSubject.id ? updatedSubject : s));
    }, [setSubjects]);

    const deleteSubject = useCallback((id: string) => {
        setSubjects(prev => prev.filter(s => s.id !== id));
        setTasks(prev => prev.filter(t => t.subjectId !== id));
        setSessions(prev => prev.filter(s => s.subjectId !== id));
        if (activeSubjectId === id) {
             setActiveSubjectId(subjects[0]?.id || null);
        }
    }, [setSubjects, setTasks, setSessions, activeSubjectId, subjects]);

    const addTask = useCallback((task: Omit<Task, 'id' | 'completed'>) => {
        setTasks(prev => [...prev, { ...task, id: Date.now().toString(), completed: false }]);
    }, [setTasks]);

    const updateTask = useCallback((updatedTask: Task) => {
        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    }, [setTasks]);

    const deleteTask = useCallback((id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    }, [setTasks]);

    const toggleTaskCompletion = useCallback((id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    }, [setTasks]);
    
    const contextValue: AppContextType = {
        subjects, tasks, sessions,
        addSubject, updateSubject, deleteSubject,
        addTask, updateTask, deleteTask, toggleTaskCompletion,
        addSession: (session) => setSessions(prev => [...prev, { ...session, id: Date.now().toString() }]),
        theme, toggleTheme,
        // Timer context
        timerMode, isTimerRunning, currentTime, activeSubjectId,
        setTimerMode: handleSetTimerMode, setActiveSubjectId, startTimer, pauseTimer, stopAndSaveSession,
        // Dialog context
        isAddSubjectOpen, openAddSubject: () => setIsAddSubjectOpen(true), closeAddSubject: () => setIsAddSubjectOpen(false),
        isAddTaskOpen, openAddTask: () => setIsAddTaskOpen(true), closeAddTask: () => setIsAddTaskOpen(false),
        isSettingsOpen, openSettings: () => setIsSettingsOpen(true), closeSettings: () => setIsSettingsOpen(false),
        // Sidebar context
        isSidebarOpen, openSidebar: () => setIsSidebarOpen(true), closeSidebar: () => setIsSidebarOpen(false),
        isSidebarCollapsed, toggleSidebarCollapse: () => setIsSidebarCollapsed(prev => !prev),
        // User Profile
        userProfile, updateUserProfile: setUserProfile,
    };

    return (
        <AppContext.Provider value={contextValue}>
            <div className="min-h-screen bg-secondary text-foreground">
                <Header />
                <Sidebar />
                <main className={`transition-all duration-300 pb-24 md:pb-28 pt-16 md:pt-0 ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/subjects" element={<Subjects />} />
                        <Route path="/tasks"element={<Tasks />} />
                    </Routes>
                </main>
                <TimerBar />
                <SettingsDialog />
            </div>
        </AppContext.Provider>
    );
};

export default App;