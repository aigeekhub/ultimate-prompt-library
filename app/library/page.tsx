'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/app/components/AppLayout';
import type { Prompt, Folder, Category } from '@/lib/prompt-library-core';

export default function LibraryPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load folders and categories
  useEffect(() => {
    async function loadLists() {
      try {
        const [foldersRes, categoriesRes] = await Promise.all([
          fetch('/api/folders'),
          fetch('/api/categories'),
        ]);
        if (foldersRes.ok) setFolders(await foldersRes.json());
        if (categoriesRes.ok) setCategories(await categoriesRes.json());
      } catch (err) {
        console.error('Failed to load filters:', err);
      }
    }
    loadLists();
  }, []);

  // Load prompts based on filters
  useEffect(() => {
    let active = true;

    async function loadPrompts() {
      setLoading(true);
      setError('');
      try {
        const params = new URLSearchParams();
        if (query) params.append('q', query);
        if (selectedFolderId) params.append('folderId', selectedFolderId);
        if (selectedCategoryId) params.append('categoryId', selectedCategoryId);

        const res = await fetch(`/api/prompts?${params.toString()}`);
        if (!res.ok) {
          throw new Error('Failed to load prompts');
        }
        const data = await res.json();
        if (active) {
          setPrompts(data);
        }
      } catch {
        if (active) {
          setError('Failed to load prompts. Please try again.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadPrompts();
    return () => {
      active = false;
    };
  }, [query, selectedFolderId, selectedCategoryId]);

  return (
    <AppLayout>
      <div className="px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Prompt Library</h1>
            <p className="text-gray-600 dark:text-gray-400">Organize, search, and manage your prompts</p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4 mb-6">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search prompts..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />

            <div className="grid grid-cols-2 gap-3">
              <select
                value={selectedFolderId}
                onChange={(e) => setSelectedFolderId(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
              >
                <option value="">All Folders</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>
                    📁 {folder.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategoryId}
                onChange={(e) => setSelectedCategoryId(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white text-sm"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    🏷️ {category.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error and Loading States */}
          {error && (
            <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-4">
              <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading prompts...</p>
          ) : prompts.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {query || selectedFolderId || selectedCategoryId
                  ? 'No prompts match your filters.'
                  : 'No prompts yet.'}
              </p>
              <Link
                href="/library/new"
                className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create your first prompt
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {prompts.map((prompt) => (
                <li key={prompt.id}>
                  <Link
                    href={`/library/${prompt.id}`}
                    className="block p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <h2 className="font-medium text-gray-900 dark:text-white truncate">
                          {prompt.title}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                          {prompt.body}
                        </p>
                      </div>
                      {prompt.folderId && (
                        <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded whitespace-nowrap">
                          {folders.find((f) => f.id === prompt.folderId)?.name || 'Folder'}
                        </span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
