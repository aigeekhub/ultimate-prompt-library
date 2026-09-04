'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppLayout from '@/app/components/AppLayout';
import type { Prompt, Folder, Category } from '@/lib/prompt-library-core';

export default function PromptDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [notes, setNotes] = useState('');
  const [folderId, setFolderId] = useState('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [promptCategories, setPromptCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingLists, setLoadingLists] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const res = await fetch(`/api/prompts/${id}`);
        if (!res.ok) {
          if (!cancelled) setNotFound(true);
          return;
        }
        const data: Prompt = await res.json();
        if (!cancelled) {
          setPrompt(data);
          setTitle(data.title);
          setBody(data.body);
          setNotes(data.notes ?? '');
          setFolderId(data.folderId ?? '');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    async function loadLists() {
      try {
        const [foldersRes, categoriesRes, promptCatsRes] = await Promise.all([
          fetch('/api/folders'),
          fetch('/api/categories'),
          fetch(`/api/prompts/${id}/categories`),
        ]);

        if (foldersRes.ok) setFolders(await foldersRes.json());
        if (categoriesRes.ok) setCategories(await categoriesRes.json());
        if (promptCatsRes.ok) setPromptCategories(await promptCatsRes.json());
      } finally {
        setLoadingLists(false);
      }
    }

    if (!loading && id) {
      loadLists();
    }
  }, [id, loading]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch(`/api/prompts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          body,
          notes: notes || undefined,
          folderId: folderId || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to save prompt');
      }

      const updated = await res.json();
      setPrompt(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt');
    } finally {
      setSaving(false);
    }
  };

  const handleAddCategory = async (categoryId: string) => {
    setError('');
    try {
      const res = await fetch(`/api/prompts/${id}/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to add category');
      }

      const updated = await res.json();
      // Merge response with current state to avoid race conditions
      // Only include categories not already present to avoid duplicates
      setPromptCategories((prev) => {
        const updatedIds = new Set(updated.map((c: Category) => c.id));
        return [...updated, ...prev.filter((c) => !updatedIds.has(c.id))];
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
    }
  };

  const handleRemoveCategory = async (categoryId: string) => {
    setError('');
    try {
      const res = await fetch(`/api/prompts/${id}/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to remove category');
      }

      setPromptCategories((prev) => prev.filter((c) => c.id !== categoryId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to remove category');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this prompt? This cannot be undone.')) {
      return;
    }

    const res = await fetch(`/api/prompts/${id}`, { method: 'DELETE' });
    if (res.ok) {
      router.push('/library');
    } else {
      setError('Failed to delete prompt');
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(body);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="px-4 py-8">
          <p className="max-w-2xl mx-auto text-gray-500 dark:text-gray-400">Loading...</p>
        </div>
      </AppLayout>
    );
  }

  if (notFound || !prompt) {
    return (
      <AppLayout>
        <div className="px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <p className="text-gray-500 dark:text-gray-400">Prompt not found.</p>
            <Link href="/library" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
              Back to library
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 py-8">
        <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Prompt</h1>
          <Link href="/library" className="text-sm font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Back to library
          </Link>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Prompt
              </label>
              <button
                type="button"
                onClick={handleCopy}
                className="text-xs font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                Copy to clipboard
              </button>
            </div>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              rows={10}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white font-mono text-sm"
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
          </div>

          <div>
            <label htmlFor="folder" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Folder (optional)
            </label>
            <select
              id="folder"
              value={folderId}
              onChange={(e) => setFolderId(e.target.value)}
              disabled={loadingLists}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value="">-- No folder --</option>
              {folders.map((folder) => (
                <option key={folder.id} value={folder.id}>
                  {folder.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Categories
            </label>
            <div className="space-y-2">
              {promptCategories.length > 0 && (
                <div className="space-y-2">
                  {promptCategories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg"
                    >
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {cat.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCategory(cat.id)}
                        className="text-xs font-medium text-red-600 hover:text-red-500 dark:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleAddCategory(e.target.value);
                    e.target.value = '';
                  }
                }}
                disabled={loadingLists}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="">-- Add category --</option>
                {categories
                  .filter((c) => !promptCategories.some((pc) => pc.id === c.id))
                  .map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="py-2 px-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
            >
              Delete
            </button>
          </div>
        </form>
        </div>
      </div>
    </AppLayout>
  );
}
