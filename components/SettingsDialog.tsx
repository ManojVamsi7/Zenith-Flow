import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../App';
import { Dialog, Button, Input, Label } from './ui';

export const SettingsDialog = () => {
    const context = useContext(AppContext);
    
    if (!context) return null;

    const { isSettingsOpen, closeSettings, userProfile, updateUserProfile } = context;
    
    const [name, setName] = useState(userProfile.name);
    const [title, setTitle] = useState(userProfile.title);

    useEffect(() => {
        if (isSettingsOpen) {
            setName(userProfile.name);
            setTitle(userProfile.title);
        }
    }, [isSettingsOpen, userProfile]);

    const handleSave = () => {
        updateUserProfile({ name, title });
        closeSettings();
    };

    return (
        <Dialog isOpen={isSettingsOpen} onClose={closeSettings} title="Profile Settings">
            <div className="space-y-4">
                <div>
                    <Label htmlFor="profile-name">Name</Label>
                    <Input id="profile-name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div>
                    <Label htmlFor="profile-title">Title</Label>
                    <Input id="profile-title" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g., Pro Member" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" onClick={closeSettings}>Cancel</Button>
                    <Button type="submit" variant="accent" onClick={handleSave}>Save Changes</Button>
                </div>
            </div>
        </Dialog>
    );
};