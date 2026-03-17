import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Loader2, ArrowLeft } from 'lucide-react';

export default function FormCreate() {
  const navigate = useNavigate();
  const { account, isPersonal } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    redirectUrl: '',
    emailNotifications: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await api.forms.create({
        name: formData.name || 'Untitled Form',
        teamId: isPersonal ? null : account,
        redirectUrl: formData.redirectUrl || null,
        emailNotifications: formData.emailNotifications,
      });
      navigate(`/forms/${result.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create form');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/forms" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to forms
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Form</h1>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Form Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              placeholder="e.g. Contact Form"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Redirect URL</label>
            <input
              type="url"
              value={formData.redirectUrl}
              onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              placeholder="https://yoursite.com/thank-you"
            />
            <p className="text-xs text-gray-400 mt-1">Where to redirect after submission (HTML forms only)</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="emailNotifications"
              checked={formData.emailNotifications}
              onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">
              Enable email notifications
            </label>
          </div>

          {!isPersonal && (
            <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-sm text-primary-700">
                This form will be created in the current workspace. All workspace members will have access based on their role.
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white py-2.5 px-4 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Create Form'}
            </button>
            <Link
              to="/forms"
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
