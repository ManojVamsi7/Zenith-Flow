import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AppContext } from '../App';
import { TimerMode } from '../types';
import { PauseIcon, PlayIcon, StopCircleIcon } from './Icons';
import { Button, Select } from './ui';

const formatTime = (seconds: number | null | undefined) => {
  if (seconds == null || isNaN(seconds) || seconds < 0) return "00:00"; // fallback

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const TimerBar: React.FC = () => {
  const context = useContext(AppContext);
  const location = useLocation();

  if (!context) return null;

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

  if (subjects.length === 0) {
    return (
      <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-lg z-50 bg-card border p-4 rounded-lg flex items-center justify-center shadow-lg">
        <p className="text-muted-foreground text-sm">
          Add a subject to unlock the study timer.
        </p>
      </div>
    );
  }

  return (
    <div className="fixed bottom-20 md:bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-xl z-50 bg-card p-2 rounded-lg border shadow-lg">
      <div className="flex items-center justify-between px-2">
        {/* Left controls */}
        <div className="flex items-center gap-2 w-1/3">
          <Select
            value={timerMode}
            onChange={(e) => setTimerMode(e.target.value as TimerMode)}
            disabled={isTimerRunning}
            className="w-full sm:w-32"
          >
            <option value={TimerMode.Pomodoro}>Pomodoro</option>
            <option value={TimerMode.Stopwatch}>Stopwatch</option>
          </Select>

          <Select
            value={activeSubjectId || ''}
            onChange={(e) => setActiveSubjectId(e.target.value)}
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

        {/* Timer display */}
        <div className="flex items-center space-x-2 w-1/3 justify-center">
          <span className="text-3xl font-mono font-semibold text-primary">
            {formatTime(currentTime)}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 w-1/3 justify-end">
          <Button
            onClick={startTimer}
            size="icon"
            variant="accent"
            className="rounded-full"
          >
            {isTimerRunning ? (
              <PauseIcon className="w-5 h-5" />
            ) : (
              <PlayIcon className="w-5 h-5 pl-0.5" />
            )}
          </Button>
          <Button
            onClick={stopAndSaveSession}
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
