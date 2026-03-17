import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, type Form } from '../lib/api';
import { Loader2, ArrowLeft, Save, Trash2 } from 'lucide-react';

export default function FormSettings() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<(Form & { canWrite: boolean }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    redirectUrl: '',
    emailNotifications: true,
  });

  useEffect(() => {
    if (!formId) return;
    api.forms.get(formId).then((data) => {
      setForm(data);
      setFormData({
        name: data.name,
        redirectUrl: data.redirectUrl || '',
        emailNotifications: !!data.emailNotifications,
      });
    }).finally(() => setLoading(false));
  }, [formId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formId) return;
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await api.forms.update(formId, {
        name: formData.name,
        redirectUrl: formData.redirectUrl || null,
        emailNotifications: formData.emailNotifications,
      });
      setSuccess('Settings saved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!formId || !confirm('Are you sure? This will permanently delete this form and all its submissions.')) return;
    await api.forms.delete(formId);
    navigate('/forms');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!form) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-gray-500">Form not found</p>
      </div>
    );
  }

  if (!form.canWrite) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-gray-500">You don't have permission to edit this form's settings.</p>
        <Link to={`/forms/${formId}`} className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block">Back to form</Link>
      </div>
    );
  }

  const inputClass = 'w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition';

  return (
    <div className="max-w-2xl mx-auto">
      <Link to={`/forms/${formId}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to form
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mb-6">Form Settings</h1>

      {error && <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}
      {success && <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{success}</div>}

      <form onSubmit={handleSave} className="space-y-6">
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">General</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Form Name</label>
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className={inputClass} required />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h2>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="emailNotifications" checked={formData.emailNotifications} onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })} className="h-4 w-4 text-primary-600 border-gray-300 rounded" />
            <label htmlFor="emailNotifications" className="text-sm font-medium text-gray-700">Enable email notifications for new submissions</label>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Redirect</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Success Redirect URL</label>
            <input type="url" value={formData.redirectUrl} onChange={(e) => setFormData({ ...formData, redirectUrl: e.target.value })} className={inputClass} placeholder="https://yoursite.com/thank-you" />
          </div>
        </section>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2.5 rounded-lg text-sm font-medium transition"
          >
            <Trash2 className="h-4 w-4" /> Delete Form
          </button>
        </div>
      </form>
    </div>
  );
}
