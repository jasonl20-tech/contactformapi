import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FormCreate() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email_to: '',
    redirect_url: '',
    webhook_url: '',
    allowed_origins: '',
    honeypot_enabled: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.forms.create({
        name: formData.name || 'Untitled Form',
        email_to: formData.email_to || null,
        redirect_url: formData.redirect_url || null,
        webhook_url: formData.webhook_url || null,
        allowed_origins: formData.allowed_origins || null,
        honeypot_enabled: formData.honeypot_enabled ? 1 : 0,
      });
      navigate(`/forms/${data.id}`);
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
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Notification Email</label>
            <input
              type="email"
              value={formData.email_to}
              onChange={(e) => setFormData({ ...formData, email_to: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              placeholder="notifications@example.com"
            />
            <p className="text-xs text-gray-400 mt-1">Receive an email for each submission</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Redirect URL</label>
            <input
              type="url"
              value={formData.redirect_url}
              onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              placeholder="https://yoursite.com/thank-you"
            />
            <p className="text-xs text-gray-400 mt-1">Where to redirect after submission (HTML forms only)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Webhook URL</label>
            <input
              type="url"
              value={formData.webhook_url}
              onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              placeholder="https://yourapi.com/webhook"
            />
            <p className="text-xs text-gray-400 mt-1">Receive a POST request for each submission</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Allowed Origins</label>
            <input
              type="text"
              value={formData.allowed_origins}
              onChange={(e) => setFormData({ ...formData, allowed_origins: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
              placeholder="https://yoursite.com, https://other.com"
            />
            <p className="text-xs text-gray-400 mt-1">Comma-separated list of allowed origins. Leave empty to allow all.</p>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="honeypot"
              checked={formData.honeypot_enabled}
              onChange={(e) => setFormData({ ...formData, honeypot_enabled: e.target.checked })}
              className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <label htmlFor="honeypot" className="text-sm font-medium text-gray-700">
              Enable honeypot spam protection
            </label>
          </div>

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
