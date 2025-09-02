import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { Task, Subject } from '../types';
import { Button, Card, CardHeader, CardTitle, Dialog, Input, Label, Select } from '../components/ui';
import { PlusIcon, ClipboardCheckIcon } from '../components/Icons';
import { format, isPast, isToday, parseISO } from 'date-fns';

const TaskForm = ({ task, subjects, onSave, onCancel }: { task?: Task | null; subjects: Subject[]; onSave: (task: Omit<Task, 'id' | 'completed'> | Task) => void; onCancel: () => void; }) => {
    const [title, setTitle] = useState(task?.title || '');
    const [subjectId, setSubjectId] = useState(task?.subjectId || subjects[0]?.id || '');
    const [dueDate, setDueDate] = useState(task?.dueDate ? format(parseISO(task.dueDate), "yyyy-MM-dd") : '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title || !subjectId || !dueDate) return;
        const taskData = { title, subjectId, dueDate: new Date(dueDate).toISOString() };
        onSave(task ? { ...task, ...taskData } : taskData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="title">Task Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Read Chapter 3" />
            </div>
            <div>
                <Label htmlFor="subject">Subject</Label>
                <Select id="subject" value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
                    {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </Select>
            </div>
            <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input id="dueDate" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" variant="accent">{task ? 'Save Changes' : 'Add Task'}</Button>
            </div>
        </form>
    );
};


const TaskItem = ({ task, subject, onToggle, onEdit, onDelete }: { task: Task; subject?: Subject; onToggle: (id: string) => void; onEdit: (task: Task) => void; onDelete: (id: string) => void; }) => {
    const dueDate = parseISO(task.dueDate);
    const isOverdue = !task.completed && isPast(dueDate) && !isToday(dueDate);
    
    const dueDateText = () => {
        if (isToday(dueDate)) return 'Due Today';
        if (isOverdue) return 'Overdue';
        return `Due ${format(dueDate, 'MMM d')}`;
    };

    return (
        <div className={`flex items-center p-4 transition-colors duration-200 ${isOverdue ? 'bg-destructive/10' : ''}`}>
            <input type="checkbox" checked={task.completed} onChange={() => onToggle(task.id)} className="w-5 h-5 mr-4 rounded border-border text-accent focus:ring-accent" />
            <div className="flex-grow">
                <p className={`${task.completed ? 'line-through text-muted-foreground' : 'text-card-foreground'}`}>{task.title}</p>
                <div className="flex items-center text-sm text-muted-foreground mt-1">
                    {subject && <span className="w-2.5 h-2.5 rounded-full mr-2" style={{backgroundColor: subject.color}}></span>}
                    <span>{subject?.name || 'Uncategorized'}</span>
                    <span className="mx-2">·</span>
                    <span className={isOverdue ? 'text-destructive font-semibold' : ''}>
                        {dueDateText()}
                    </span>
                </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button size="sm" variant="ghost" onClick={() => onEdit(task)}>Edit</Button>
                <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDelete(task.id)}>Delete</Button>
            </div>
        </div>
    );
}

const Tasks = () => {
    const { tasks, subjects, addTask, updateTask, deleteTask, toggleTaskCompletion, isAddTaskOpen, openAddTask, closeAddTask } = useContext(AppContext)!;
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    const subjectMap = new Map(subjects.map(s => [s.id, s]));

    const handleOpenAddDialog = () => {
        setEditingTask(null);
        openAddTask();
    };

    const openEditDialog = (task: Task) => {
        setEditingTask(task);
        openAddTask();
    };

    const handleSave = (taskData: Omit<Task, 'id'|'completed'> | Task) => {
        if ('id' in taskData) {
            updateTask(taskData);
        } else {
            addTask(taskData);
        }
        closeAddTask();
    };

    const sortedTasks = [...tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()).sort((a, b) => (a.completed === b.completed) ? 0 : a.completed ? 1 : -1);

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-display">Tasks</h1>
                <Button onClick={handleOpenAddDialog} disabled={subjects.length === 0} variant="accent">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    New Task
                </Button>
            </div>

            {subjects.length === 0 && (
                 <div className="text-center py-24 border-2 border-dashed border-border rounded-xl">
                    <p className="text-muted-foreground">Please add a subject before creating tasks.</p>
                </div>
            )}
            
            {subjects.length > 0 && tasks.length === 0 && (
                <div className="text-center py-24 border-2 border-dashed border-border rounded-xl">
                    <ClipboardCheckIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-display font-semibold">All tasks completed!</h3>
                    <p className="text-muted-foreground mt-2 mb-4">You're all caught up. Add a new task to plan your next objective.</p>
                    <Button onClick={handleOpenAddDialog} variant="default">Create a Task</Button>
                </div>
            )}

            {tasks.length > 0 && (
                <Card>
                    <div className="divide-y divide-border">
                    {sortedTasks.map(task => (
                        <div key={task.id} className="group">
                            <TaskItem
                                task={task}
                                subject={subjectMap.get(task.subjectId)}
                                onToggle={toggleTaskCompletion}
                                onEdit={openEditDialog}
                                onDelete={deleteTask}
                            />
                        </div>
                    ))}
                    </div>
                </Card>
            )}

            <Dialog isOpen={isAddTaskOpen} onClose={closeAddTask} title={editingTask ? 'Edit Task' : 'Add New Task'}>
                <TaskForm
                    task={editingTask}
                    subjects={subjects}
                    onSave={handleSave}
                    onCancel={closeAddTask}
                />
            </Dialog>
        </div>
    );
};

export default Tasks;