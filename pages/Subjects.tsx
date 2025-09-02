import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { ClipboardCheckIcon, PencilIcon, PlusIcon, Trash2Icon } from '../components/Icons';
import { Button, Card, CardHeader, CardTitle, Dialog, Input, Label, Select } from '../components/ui';
import { SUBJECT_CATEGORIES, SUBJECT_COLORS } from '../constants';
import { Subject } from '../types';

const SubjectForm = ({ subject, onSave, onCancel }: { subject?: Subject | null; onSave: (subject: Omit<Subject, 'id'> | Subject) => void; onCancel: () => void; }) => {
    const [name, setName] = useState(subject?.name || '');
    const [color, setColor] = useState(subject?.color || SUBJECT_COLORS[0]);
    const [category, setCategory] = useState(subject?.category || SUBJECT_CATEGORIES[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name) return;
        onSave(subject ? { ...subject, name, color, category } : { name, color, category });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name">Subject Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Quantum Physics" />
            </div>
            <div>
                <Label htmlFor="category">Category</Label>
                <Select id="category" value={category} onChange={(e) => setCategory(e.target.value)}>
                    {SUBJECT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </Select>
            </div>
            <div>
                <Label>Color</Label>
                <div className="grid grid-cols-8 gap-2 mt-2 p-2 bg-secondary/30 rounded-lg">
                    {SUBJECT_COLORS.map(c => (
                        <button type="button" key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full transition-transform transform hover:scale-110 focus:outline-none ${color === c ? 'ring-2 ring-offset-2 ring-offset-background ring-accent' : ''}`} style={{ backgroundColor: c }} />
                    ))}
                </div>
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                <Button type="submit" variant="accent">{subject ? 'Save Changes' : 'Add Subject'}</Button>
            </div>
        </form>
    );
};


const Subjects = () => {
    const { subjects, addSubject, updateSubject, deleteSubject, openAddSubject, isAddSubjectOpen, closeAddSubject } = useContext(AppContext)!;
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

    const openEditDialog = (subject: Subject) => {
        setEditingSubject(subject);
        openAddSubject();
    };
    
    const handleOpenAddDialog = () => {
        setEditingSubject(null);
        openAddSubject();
    }

    const handleSave = (subjectData: Omit<Subject, 'id'> | Subject) => {
        if ('id' in subjectData) {
            updateSubject(subjectData);
        } else {
            addSubject(subjectData);
        }
        closeAddSubject();
    };

    return (
        <div className="p-4 md:p-6 space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-display">Subjects</h1>
                <Button onClick={handleOpenAddDialog} variant="accent">
                    <PlusIcon className="w-4 h-4 mr-2" />
                    New Subject
                </Button>
            </div>

            {subjects.length === 0 ? (
                <div className="text-center py-24 border-2 border-dashed border-border rounded-xl">
                    <ClipboardCheckIcon className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-xl font-display font-semibold">No subjects yet</h3>
                    <p className="text-muted-foreground mt-2 mb-4">Add your first subject to begin tracking your studies.</p>
                    <Button onClick={handleOpenAddDialog} variant="default">Create a Subject</Button>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {subjects.map(subject => (
                        <Card key={subject.id} className="flex flex-col justify-between transition-all hover:shadow-md">
                             <div className="w-full h-1.5" style={{ backgroundColor: subject.color }} />
                            <CardHeader>
                                <CardTitle className="truncate">{subject.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{subject.category || 'Uncategorized'}</p>
                            </CardHeader>
                             <div className="p-4 pt-0 flex justify-end gap-2">
                                <Button size="icon" variant="ghost" onClick={() => openEditDialog(subject)}>
                                    <PencilIcon className="w-4 h-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => deleteSubject(subject.id)}>
                                    <Trash2Icon className="w-4 h-4" />
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
            
            <Dialog isOpen={isAddSubjectOpen} onClose={closeAddSubject} title={editingSubject ? 'Edit Subject' : 'Add New Subject'}>
                <SubjectForm
                    subject={editingSubject}
                    onSave={handleSave}
                    onCancel={closeAddSubject}
                />
            </Dialog>
        </div>
    );
};

export default Subjects;