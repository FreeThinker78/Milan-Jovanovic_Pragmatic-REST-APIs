import React, { useEffect, useState } from 'react';
import { useTags, type Tag } from './useTags';
import type { Link } from '../../types/api';

interface EditingTag {
  id: string;
  name: string;
  description: string | null;
  updateLink: Link;
}

export const TagsPage: React.FC = () => {
  const { getTags, createTag, updateTag, deleteTag, isLoading, error } = useTags();
  const [tags, setTags] = useState<Tag[]>([]);
  const [createLink, setCreateLink] = useState<Link | null>(null);
  const [editingTag, setEditingTag] = useState<EditingTag | null>(null);
  const [newTag, setNewTag] = useState({ name: '', description: '' });

  useEffect(() => {
    loadTags();
  }, []);

  const loadTags = async () => {
    const result = await getTags();
    if (result) {
      setTags(result.items);
      const link = result.links.find(l => l.rel === 'create');
      setCreateLink(link ?? null);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.name.trim()) return;

    const result = await createTag({
      name: newTag.name.trim(),
      description: newTag.description.trim() || null,
    });

    if (result) {
      setNewTag({ name: '', description: '' });
      await loadTags();
    }
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag) return;

    const result = await updateTag(editingTag.updateLink, {
      name: editingTag.name.trim(),
      description: editingTag.description?.trim() || null,
    });

    if (result) {
      setEditingTag(null);
      await loadTags();
    }
  };

  const handleDelete = async (tag: Tag) => {
    const deleteLink = tag.links.find(l => l.rel === 'delete');
    if (!deleteLink) return;

    const confirmed = window.confirm('Are you sure you want to delete this tag?');
    if (!confirmed) return;

    const success = await deleteTag(deleteLink);
    if (success) {
      await loadTags();
    }
  };

  const startEditing = (tag: Tag) => {
    const updateLink = tag.links.find(l => l.rel === 'update');
    if (!updateLink) return;

    setEditingTag({
      id: tag.id,
      name: tag.name,
      description: tag.description,
      updateLink,
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-6">Tags</h1>

      {createLink && (
        <form onSubmit={handleCreateSubmit} className="mb-8 p-4 bg-white rounded-lg shadow">
          <h2 className="text-lg font-medium mb-4">Create New Tag</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={newTag.name}
                onChange={e => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                required
                maxLength={50}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <input
                type="text"
                value={newTag.description}
                onChange={e => setNewTag(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md"
                maxLength={200}
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              {isLoading ? 'Creating...' : 'Create Tag'}
            </button>
          </div>
          {error && <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
        </form>
      )}

      <div className="space-y-4">
        {isLoading && tags.length === 0 ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : tags.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No tags created yet.</p>
          </div>
        ) : (
          tags.map(tag => (
            <div key={tag.id} className="bg-white rounded-lg shadow p-4">
              {editingTag?.id === tag.id ? (
                <form onSubmit={handleUpdateSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input
                      type="text"
                      value={editingTag.name}
                      onChange={e =>
                        setEditingTag(prev => prev && { ...prev, name: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      required
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <input
                      type="text"
                      value={editingTag.description || ''}
                      onChange={e =>
                        setEditingTag(prev => prev && { ...prev, description: e.target.value })
                      }
                      className="w-full px-3 py-2 border rounded-md"
                      maxLength={200}
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                      {isLoading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingTag(null)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-medium">{tag.name}</h3>
                    {tag.description && <p className="text-gray-600 mt-1">{tag.description}</p>}
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEditing(tag)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tag)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
