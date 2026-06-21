'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import type { Prompt } from '@/lib/prompt-library-core';

export default function LibraryPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function loadPrompts() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/prompts?q=${encodeURIComponent(query)}`);
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
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Prompt Library</h1>
          <div className="flex items-center gap-3">
            <Link
              href="/library/new"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Prompt
            </Link>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/auth/signin' })}
              className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              Sign out
            </button>
          </div>
        </div>

        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search prompts..."
          className="w-full px-4 py-2 mb-6 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:border-gray-700 dark:text-white"
        />

        {error && (
          <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4 mb-4">
            <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {loading ? (
          <p className="text-gray-500 dark:text-gray-400">Loading...</p>
        ) : prompts.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400">
            {query ? 'No prompts match your search.' : 'No prompts yet. Create your first one!'}
          </p>
        ) : (
          <ul className="space-y-3">
            {prompts.map((prompt) => (
              <li key={prompt.id}>
                <Link
                  href={`/library/${prompt.id}`}
                  className="block p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg hover:border-blue-400 dark:hover:border-blue-600 transition-colors"
                >
                  <h2 className="font-medium text-gray-900 dark:text-white">{prompt.title}</h2>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{prompt.body}</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
