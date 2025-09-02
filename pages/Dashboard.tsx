import { format, formatDistanceToNow, parseISO, subDays } from 'date-fns';
import { useContext, useMemo } from 'react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AppContext } from '../App';
import { ClockIcon, TrophyIcon } from '../components/Icons';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Select } from '../components/ui';
import { CATEGORY_COLORS } from '../constants';
import { checkAchievements } from '../lib/achievements';
import { TimerMode } from '../types';

const StatCard = ({ title, value, description }: { title: string, value: string | number, description: string }) => (
    <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold font-display">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
        </CardContent>
    </Card>
);

const FocusScoreCard = ({ score }: { score: number }) => {
    const scoreColor = useMemo(() => {
        if (score >= 75) return 'bg-green-500';
        if (score >= 40) return 'bg-yellow-500';
        return 'bg-red-500';
    }, [score]);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Focus Score</CardTitle>
                 <div className={`w-3 h-3 rounded-full ${scoreColor}`} />
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold font-display">{score}%</div>
                <p className="text-xs text-muted-foreground">Based on task completion</p>
            </CardContent>
        </Card>
    );
};

const formatTime = (seconds: number, style: 'short' | 'long' = 'short') => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (style === 'long') {
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    if (mins === 0 && secs > 0) return `${secs}s`;
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins/60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
};

const StudyTimerCard = () => {
    const context = useContext(AppContext);
    if (!context) return null;

    const {
        subjects,
        timerMode, setTimerMode,
        isTimerRunning, currentTime,
        activeSubjectId, setActiveSubjectId,
        startTimer, stopAndSaveSession
    } = context;

    const activeSubjectName = subjects.find(s => s.id === activeSubjectId)?.name || 'Select Subject';

    // Check notification permission status
    const notificationStatus = 'Notification' in window ? Notification.permission : 'unsupported';

    const requestNotificationPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                // Test notification
                new Notification('🎉 Notifications Enabled!', {
                    body: 'You\'ll now get notified when your timer completes.',
                    icon: '/favicon.ico'
                });
            }
        }
    };

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    Study Timer
                    {notificationStatus === 'default' && (
                        <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={requestNotificationPermission}
                            className="text-xs"
                        >
                            Enable Notifications
                        </Button>
                    )}
                </CardTitle>
                {notificationStatus === 'denied' && (
                    <p className="text-xs text-muted-foreground">
                        Notifications blocked. Enable in browser settings for timer alerts.
                    </p>
                )}
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-6">
                 <div className="flex items-center gap-2">
                    <Button variant={timerMode === TimerMode.Stopwatch ? 'accent' : 'outline'} onClick={() => setTimerMode(TimerMode.Stopwatch)} size="sm" className="w-28" disabled={isTimerRunning}>Stopwatch</Button>
                    <Button variant={timerMode === TimerMode.Pomodoro ? 'accent' : 'outline'} onClick={() => setTimerMode(TimerMode.Pomodoro)} size="sm" className="w-28" disabled={isTimerRunning}>Pomodoro</Button>
                </div>
                <div className="relative w-48 h-48 flex items-center justify-center">
                    <svg className="absolute w-full h-full" viewBox="0 0 100 100">
                        <circle className="text-secondary" strokeWidth="7" cx="50" cy="50" r="45" fill="transparent"></circle>
                         {isTimerRunning && <circle className="text-accent/50" strokeWidth="7" cx="50" cy="50" r="45" fill="transparent" strokeDasharray="283" strokeDashoffset={timerMode === TimerMode.Pomodoro ? 283-((currentTime/(25*60))*283) : 0} transform="rotate(-90 50 50)"></circle>}
                    </svg>
                    <div className="text-center">
                        <p className="text-5xl font-mono font-bold">{formatTime(currentTime, 'long')}</p>
                        <p className="text-muted-foreground">{activeSubjectName}</p>
                    </div>
                </div>

                <div className="w-full space-y-4">
                    <Select value={activeSubjectId || ''} onChange={(e) => setActiveSubjectId(e.target.value)} disabled={isTimerRunning}>
                        <option value="" disabled>Select Subject</option>
                        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </Select>
                     <div className="flex items-center justify-center gap-4">
                        <Button variant="outline" onClick={startTimer} className="w-28">{isTimerRunning ? 'Pause' : 'Start'}</Button>
                        <Button variant="destructive" onClick={stopAndSaveSession} disabled={!isTimerRunning} className="w-28">Stop</Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

const AchievementsCard = () => {
    const { sessions, tasks, subjects, openAddTask, openAddSubject } = useContext(AppContext)!;
    const unlockedAchievements = checkAchievements(sessions, tasks, subjects);
    
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Complete study sessions to unlock!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {unlockedAchievements.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                        <TrophyIcon className="w-12 h-12 mx-auto mb-2" />
                        <p>No achievements yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {unlockedAchievements.map(ach => (
                            <div key={ach.id} className="p-3 rounded-md bg-secondary text-center" title={ach.description}>
                                <span className="text-2xl">{ach.emoji}</span>
                                <p className="text-xs font-semibold mt-1">{ach.name}</p>
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex flex-col gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" onClick={openAddTask}>Add Task</Button>
                    <Button variant="outline" size="sm" onClick={openAddSubject}>New Subject</Button>
                </div>
            </CardContent>
        </Card>
    );
};

const StudyTimeBySubjectCard = ({ data }: { data: { name: string, time: number, fill: string }[] }) => (
    <Card>
        <CardHeader>
            <CardTitle>Study Time by Subject</CardTitle>
            <CardDescription>Last 7 days</CardDescription>
        </CardHeader>
        <CardContent>
             {data.length === 0 ? (
                <div className="flex items-center justify-center h-60 text-muted-foreground text-sm">No study sessions recorded recently.</div>
            ) : (
            <ResponsiveContainer width="100%" height={240}>
                <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}m`} />
                    <Tooltip cursor={{fill: 'hsl(var(--secondary))'}} contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem'}}/>
                    <Bar dataKey="time" radius={[4, 4, 0, 0]}>
                        {data.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.fill} />)}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
             )}
        </CardContent>
    </Card>
);

const CategoryDistributionCard = ({ data }: { data: { name: string, value: number }[] }) => {
    const totalTime = data.reduce((sum, entry) => sum + entry.value, 0);
    return (
        <Card>
            <CardHeader>
                <CardTitle>Category Distribution</CardTitle>
                 <CardDescription>All time</CardDescription>
            </CardHeader>
            <CardContent>
                {data.length === 0 ? (
                    <div className="flex items-center justify-center h-60 text-muted-foreground text-sm">No data to display.</div>
                ) : (
                    <div className="flex flex-col items-center">
                    <ResponsiveContainer width="100%" height={180}>
                        <PieChart>
                            <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                                {data.map((entry, index) => <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#ccc'} />)}
                            </Pie>
                            <Tooltip contentStyle={{backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '0.5rem'}}/>
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4">
                        {data.map(entry => (
                            <div key={entry.name} className="flex items-center text-xs">
                                <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: CATEGORY_COLORS[entry.name] }}></span>
                                {entry.name}
                            </div>
                        ))}
                    </div>
                    <p className="font-bold text-xl mt-4">{formatTime(totalTime * 60)}</p>
                    <p className="text-xs text-muted-foreground">Total Study Time</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const RecentSessionsCard = () => {
    const { sessions, subjects } = useContext(AppContext)!;
    const subjectMap = new Map(subjects.map(s => [s.id, s]));
    const recentSessions = [...sessions].sort((a,b) => b.startTime - a.startTime).slice(0, 5);
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
                {recentSessions.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground text-sm py-16">
                         <ClockIcon className="w-8 h-8 mr-2" />
                        No sessions yet.
                    </div>
                ) : (
                    <div className="space-y-4">
                        {recentSessions.map(session => {
                            const subject = subjectMap.get(session.subjectId);
                            return (
                                <div key={session.id} className="flex items-center">
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: subject?.color || '#ccc' }}>
                                        <span className="text-primary-foreground font-bold">{subject?.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div className="flex-grow">
                                        <p className="font-semibold">{subject?.name || 'Unknown'}</p>
                                        <p className="text-sm text-muted-foreground">{formatTime(session.duration)}</p>
                                    </div>
                                    <p className="text-sm text-muted-foreground">{formatDistanceToNow(new Date(session.startTime), { addSuffix: true })}</p>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const UpcomingTasksCard = () => {
    const { tasks, subjects } = useContext(AppContext)!;
    const subjectMap = new Map(subjects.map(s => [s.id, s]));
    const upcomingTasks = tasks.filter(t => !t.completed).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).slice(0, 5);
    return (
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
                 {upcomingTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground text-sm py-12">
                        <TrophyIcon className="w-8 h-8 mb-2" />
                        <p>No upcoming tasks.</p>
                        <p>You're all caught up!</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {upcomingTasks.map(task => {
                            const subject = subjectMap.get(task.subjectId);
                            const dueDate = parseISO(task.dueDate);
                            return (
                                <div key={task.id} className="flex items-start">
                                    <span className="w-2.5 h-2.5 rounded-full mr-3 mt-1.5 flex-shrink-0" style={{ backgroundColor: subject?.color || '#ccc' }}></span>
                                    <div>
                                        <p className="font-medium leading-tight">{task.title}</p>
                                        <p className="text-xs text-muted-foreground">Due: {format(dueDate, 'MMM d, yyyy')}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const Dashboard = () => {
    const { subjects, tasks, sessions } = useContext(AppContext)!;

    const dashboardData = useMemo(() => {
        const today = new Date();
        const todaysSessions = sessions.filter(s => format(new Date(s.startTime), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd'));
        const totalStudyTimeToday = todaysSessions.reduce((acc, s) => acc + s.duration, 0);
        
        const pendingTasks = tasks.filter(t => !t.completed).length;
        const completedTasks = tasks.filter(t => t.completed).length;
        const focusScore = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;
        
        const subjectMap = new Map(subjects.map(s => [s.id, { name: s.name, color: s.color, category: s.category || 'Other' }]));
        
        // Data for last 7 days bar chart
        const sevenDaysAgo = subDays(today, 7);
        const recentSessions = sessions.filter(s => new Date(s.startTime) >= sevenDaysAgo);
        const timeDataMap: { [key: string]: { time: number, color: string } } = {};

        recentSessions.forEach(session => {
            const subject = subjectMap.get(session.subjectId);
            if (subject) {
                if (!timeDataMap[subject.name]) {
                    timeDataMap[subject.name] = { time: 0, color: subject.color };
                }
                timeDataMap[subject.name].time += session.duration;
            }
        });
        const subjectTimeData = Object.entries(timeDataMap).map(([name, data]) => ({ name, time: Math.round(data.time / 60), fill: data.color }));

        // Data for category distribution pie chart
        const categoryTimeMap: { [key: string]: number } = {};
        sessions.forEach(session => {
             const subject = subjectMap.get(session.subjectId);
             if (subject) {
                 const category = subject.category;
                 categoryTimeMap[category] = (categoryTimeMap[category] || 0) + session.duration;
             }
        });
        const categoryDistributionData = Object.entries(categoryTimeMap).map(([name, time]) => ({ name, value: Math.round(time / 60) }));
        
        return {
            totalStudyTimeToday,
            sessionsToday: todaysSessions.length,
            pendingTasks,
            focusScore,
            subjectTimeData,
            categoryDistributionData,
        };
    }, [sessions, tasks, subjects]);

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <h1 className="text-3xl font-bold font-display">Dashboard</h1>
            
            {/* Stats Cards - 2 columns on mobile, 4 on desktop */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
                <StatCard title="Total Study Time" value={formatTime(dashboardData.totalStudyTimeToday)} description="Time spent today" />
                <StatCard title="Sessions" value={dashboardData.sessionsToday} description="Completed today" />
                <StatCard title="Pending Tasks" value={dashboardData.pendingTasks} description="Stay organized" />
                <FocusScoreCard score={dashboardData.focusScore} />
            </div>

            {/* Timer and Achievements - Timer spans 2 columns on medium+ screens */}
            <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
                <StudyTimerCard />
                <AchievementsCard />
            </div>

            {/* ALL Charts in consistent 2-column grid */}
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
                <StudyTimeBySubjectCard data={dashboardData.subjectTimeData} />
                <CategoryDistributionCard data={dashboardData.categoryDistributionData} />
                <RecentSessionsCard />
                <UpcomingTasksCard />
            </div>
        </div>
    );
};

export default Dashboard;