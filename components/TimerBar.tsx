import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '../App';
import { TimerMode } from '../types';
import { PauseIcon, PlayIcon, StopCircleIcon } from './Icons';
import { Button, Select } from './ui';

const formatTime = (seconds: number | null | undefined): string => {
  // More robust error handling
  if (seconds == null || isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  
  // Ensure we're working with a valid integer
  const validSeconds = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(validSeconds / 60);
  const secs = validSeconds % 60;
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TimerBar: React.FC = () => {
  const context = useContext(AppContext);
  const location = useLocation();

  // Early return with error boundary
  if (!context) {
    console.warn('TimerBar: AppContext is null');
    return null;
  }

  const {
    subjects,
    isTimerRunning,
    currentTime,
    activeSubjectId,
    setActiveSubjectId,
    startTimer,
    stopAndSaveSession,
    timerMode,
    setTimerMode,
  } = context;

  // Hide on dashboard
  if (location.pathname === '/') {
    return null;
  }

  // Safe check for subjects
  if (!subjects || subjects.length === 0) {
    return (
      <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-lg z-50 bg-card border p-4 rounded-lg flex items-center justify-center shadow-lg">
        <p className="text-muted-foreground text-sm">
          Add a subject to unlock the study timer.
        </p>
      </div>
    );
  }

  // Safe timer mode handling
  const handleTimerModeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const newMode = e.target.value as TimerMode;
      if (Object.values(TimerMode).includes(newMode)) {
        setTimerMode(newMode);
      }
    } catch (error) {
      console.error('Error changing timer mode:', error);
    }
  };

  // Safe subject selection
  const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    try {
      const subjectId = e.target.value;
      if (subjectId && subjects.some(s => s.id === subjectId)) {
        setActiveSubjectId(subjectId);
      }
    } catch (error) {
      console.error('Error changing subject:', error);
    }
  };

  // Safe timer actions with error handling
  const handleStartTimer = () => {
    try {
      if (!activeSubjectId) {
        // Show user feedback instead of crashing
        alert('Please select a subject first');
        return;
      }
      startTimer();
    } catch (error) {
      console.error('Error starting timer:', error);
    }
  };

  const handleStopTimer = () => {
    try {
      stopAndSaveSession();
    } catch (error) {
      console.error('Error stopping timer:', error);
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-xl z-50 bg-card p-2 rounded-lg border shadow-lg">
      <div className="flex items-center justify-between px-2">
        {/* Left controls */}
        <div className="flex items-center gap-2 w-1/3">
          <Select
            value={timerMode || TimerMode.Pomodoro}
            onChange={handleTimerModeChange}
            disabled={isTimerRunning}
            className="w-full sm:w-32"
          >
            <option value={TimerMode.Pomodoro}>Pomodoro</option>
            <option value={TimerMode.Stopwatch}>Stopwatch</option>
          </Select>

          <Select
            value={activeSubjectId || ''}
            onChange={handleSubjectChange}
            disabled={isTimerRunning}
            className="w-36 hidden md:block"
          >
            <option value="" disabled>
              Subject
            </option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Timer display with error boundary */}
        <div className="flex items-center space-x-2 w-1/3 justify-center">
          <span className="text-3xl font-mono font-semibold text-primary">
            {formatTime(currentTime)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 w-1/3 justify-end">
          <Button
            onClick={handleStartTimer}
            size="icon"
            variant="accent"
            className="rounded-full"
            disabled={!activeSubjectId}
          >
            {isTimerRunning ? (
              <PauseIcon className="w-5 h-5" />
            ) : (
              <PlayIcon className="w-5 h-5 pl-0.5" />
            )}
          </Button>
          <Button
            onClick={handleStopTimer}
            disabled={!isTimerRunning}
            size="icon"
            variant="secondary"
            className="rounded-full"
          >
            <StopCircleIcon className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TimerBar;
