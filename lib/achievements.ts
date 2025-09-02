import { StudySession, Task, Subject } from '../types';
import { differenceInCalendarDays, startOfDay } from 'date-fns';

export interface IAchievement {
    id: string;
    name: string;
    description: string;
    emoji: string;
    isUnlocked: (sessions: StudySession[], tasks: Task[], subjects: Subject[]) => boolean;
}

const ALL_ACHIEVEMENTS: IAchievement[] = [
    {
        id: 'first_session',
        name: 'First Step',
        description: 'Complete your first study session.',
        emoji: '🚀',
        isUnlocked: (sessions) => sessions.length >= 1,
    },
    {
        id: 'five_sessions',
        name: 'Study Bug',
        description: 'Complete 5 study sessions.',
        emoji: '🐞',
        isUnlocked: (sessions) => sessions.length >= 5,
    },
    {
        id: 'ten_tasks',
        name: 'Taskmaster',
        description: 'Complete 10 tasks.',
        emoji: '✅',
        isUnlocked: (sessions, tasks) => tasks.filter(t => t.completed).length >= 10,
    },
    {
        id: 'marathoner',
        name: 'Marathoner',
        description: 'Complete a study session longer than 1 hour.',
        emoji: '🏃',
        isUnlocked: (sessions) => sessions.some(s => s.duration >= 3600),
    },
    {
        id: 'specialist',
        name: 'Specialist',
        description: 'Study one subject for more than 5 hours in total.',
        emoji: '🎓',
        isUnlocked: (sessions, tasks, subjects) => {
            const timePerSubject: { [key: string]: number } = {};
            sessions.forEach(s => {
                timePerSubject[s.subjectId] = (timePerSubject[s.subjectId] || 0) + s.duration;
            });
            return Object.values(timePerSubject).some(totalTime => totalTime >= 18000); // 5 hours in seconds
        },
    },
    {
        id: 'well_rounded',
        name: 'Well-Rounded',
        description: 'Study at least 3 different subjects.',
        emoji: '🌍',
        isUnlocked: (sessions) => {
            const uniqueSubjects = new Set(sessions.map(s => s.subjectId));
            return uniqueSubjects.size >= 3;
        }
    },
    {
        id: 'streak_3_days',
        name: 'On Fire!',
        description: 'Maintain a 3-day study streak.',
        emoji: '🔥',
        isUnlocked: (sessions) => {
            const sessionDates = sessions.map(s => startOfDay(new Date(s.startTime)));
            const uniqueSessionDates = [...new Set(sessionDates.map(d => d.getTime()))]
                .map(t => new Date(t))
                .sort((a, b) => a.getTime() - b.getTime());

            if (uniqueSessionDates.length < 3) return false;

            let longestStreak = 0;
            let tempStreak = 1;

            for (let i = 1; i < uniqueSessionDates.length; i++) {
                const diff = differenceInCalendarDays(uniqueSessionDates[i], uniqueSessionDates[i - 1]);
                if (diff === 1) {
                    tempStreak++;
                } else {
                    tempStreak = 1;
                }
                if (tempStreak > longestStreak) {
                    longestStreak = tempStreak;
                }
            }
            return longestStreak >= 3;
        }
    },
];

export const checkAchievements = (
    sessions: StudySession[],
    tasks: Task[],
    subjects: Subject[]
): IAchievement[] => {
    return ALL_ACHIEVEMENTS.filter(achievement =>
        achievement.isUnlocked(sessions, tasks, subjects)
    );
};
