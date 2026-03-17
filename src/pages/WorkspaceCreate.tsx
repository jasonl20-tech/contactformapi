import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Loader2, ArrowLeft, Building2 } from 'lucide-react';

export default function WorkspaceCreate() {
  const navigate = useNavigate();
  const { switchWorkspace, refreshWorkspaces } = useWorkspace();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError('');
    setLoading(true);
    try {
      const result = await api.workspaces.create(name.trim());
      await refreshWorkspaces();
      switchWorkspace(result.id);
      navigate('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Create Workspace</h1>
            <p className="text-sm text-gray-500">Workspaces let you organize forms and invite team members.</p>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Workspace Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              placeholder="e.g. My Company"
              required
              minLength={2}
            />
            <p className="text-xs text-gray-400 mt-1">At least 2 characters</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Workspace'}
            </button>
            <Link
              to="/"
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
