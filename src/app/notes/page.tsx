'use client';

import { useState, useEffect } from 'react';
import { INote } from '@/models/Note';

export default function NotesPage() {
    const [notes, setNotes] = useState<INote[]>([]);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const res = await fetch('/api/notes');
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            if (data.success) {
                setNotes(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch notes', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            if (data.success) {
                setTitle('');
                setContent('');
                fetchNotes();
            }
        } catch (error) {
            console.error('Failed to create note', error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const res = await fetch(`/api/notes/${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            const data = await res.json();
            if (data.success) {
                fetchNotes();
            }
        } catch (error) {
            console.error('Failed to delete note', error);
        }
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="card p-6 bg-card/50 backdrop-blur-sm">
                <h2 className="text-2xl font-bold tracking-tight text-foreground mb-6">Create New Note</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-muted-foreground mb-1.5">
                            Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            placeholder="Enter note title..."
                            className="input-premium"
                        />
                    </div>
                    <div>
                        <label htmlFor="content" className="block text-sm font-medium text-muted-foreground mb-1.5">
                            Content
                        </label>
                        <textarea
                            name="content"
                            id="content"
                            rows={4}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            required
                            placeholder="Write your thoughts here..."
                            className="input-premium resize-none"
                        />
                    </div>
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="btn-primary"
                        >
                            Add Note
                        </button>
                    </div>
                </form>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {loading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="card h-48 animate-pulse bg-muted/50" />
                    ))
                ) : (
                    notes.map((note) => (
                        <div key={note._id as unknown as string} className="card group relative overflow-hidden transition-all hover:shadow-md hover:border-primary/50">
                            <div className="p-5">
                                <h3 className="text-lg font-semibold text-foreground pr-8 truncate">{note.title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">{note.content}</p>
                                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground/70">
                                    <span>{new Date(note.createdAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                                </div>
                                <button
                                    onClick={() => handleDelete(note._id as unknown as string)}
                                    className="absolute top-4 right-4 p-1.5 rounded-md text-muted-foreground/50 hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                                    title="Delete note"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
