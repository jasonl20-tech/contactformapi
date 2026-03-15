import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, type Form } from '../lib/api';
import { Loader2, ArrowLeft, Save, Trash2 } from 'lucide-react';

export default function FormSettings() {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email_to: '',
    email_subject: '',
    email_from_name: '',
    redirect_url: '',
    error_redirect_url: '',
    allowed_origins: '',
    webhook_url: '',
    webhook_secret: '',
    honeypot_enabled: true,
    recaptcha_enabled: false,
    recaptcha_secret: '',
    is_active: true,
    append_params: true,
  });

  useEffect(() => {
    if (!formId) return;
    api.forms.get(formId).then(({ data }) => {
      setForm(data);
      setFormData({
        name: data.name,
        email_to: data.email_to || '',
        email_subject: data.email_subject || '',
        email_from_name: data.email_from_name || '',
        redirect_url: data.redirect_url || '',
        error_redirect_url: data.error_redirect_url || '',
        allowed_origins: data.allowed_origins || '',
        webhook_url: data.webhook_url || '',
        webhook_secret: data.webhook_secret || '',
        honeypot_enabled: !!data.honeypot_enabled,
        recaptcha_enabled: !!data.recaptcha_enabled,
        recaptcha_secret: data.recaptcha_secret || '',
        is_active: !!data.is_active,
        append_params: !!data.append_params,
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
      const { data } = await api.forms.update(formId, {
        name: formData.name,
        email_to: formData.email_to || null,
        email_subject: formData.email_subject || null,
        email_from_name: formData.email_from_name || null,
        redirect_url: formData.redirect_url || null,
        error_redirect_url: formData.error_redirect_url || null,
        allowed_origins: formData.allowed_origins || null,
        webhook_url: formData.webhook_url || null,
        webhook_secret: formData.webhook_secret || null,
        honeypot_enabled: formData.honeypot_enabled ? 1 : 0,
        recaptcha_enabled: formData.recaptcha_enabled ? 1 : 0,
        recaptcha_secret: formData.recaptcha_secret || null,
        is_active: formData.is_active ? 1 : 0,
        append_params: formData.append_params ? 1 : 0,
      });
      setForm(data);
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
            <div className="flex items-center gap-3">
              <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="h-4 w-4 text-primary-600 border-gray-300 rounded" />
              <label htmlFor="is_active" className="text-sm font-medium text-gray-700">Form is active (accepting submissions)</label>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Notifications</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Send notifications to</label>
              <input type="email" value={formData.email_to} onChange={(e) => setFormData({ ...formData, email_to: e.target.value })} className={inputClass} placeholder="notifications@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Subject</label>
              <input type="text" value={formData.email_subject} onChange={(e) => setFormData({ ...formData, email_subject: e.target.value })} className={inputClass} placeholder="New form submission" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">From Name</label>
              <input type="text" value={formData.email_from_name} onChange={(e) => setFormData({ ...formData, email_from_name: e.target.value })} className={inputClass} placeholder="ContactFormAPI" />
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Redirects</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Success Redirect URL</label>
              <input type="url" value={formData.redirect_url} onChange={(e) => setFormData({ ...formData, redirect_url: e.target.value })} className={inputClass} placeholder="https://yoursite.com/thank-you" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Error Redirect URL</label>
              <input type="url" value={formData.error_redirect_url} onChange={(e) => setFormData({ ...formData, error_redirect_url: e.target.value })} className={inputClass} placeholder="https://yoursite.com/error" />
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="append_params" checked={formData.append_params} onChange={(e) => setFormData({ ...formData, append_params: e.target.checked })} className="h-4 w-4 text-primary-600 border-gray-300 rounded" />
              <label htmlFor="append_params" className="text-sm font-medium text-gray-700">Append form data as query parameters to redirect URL</label>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Spam Protection</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <input type="checkbox" id="honeypot" checked={formData.honeypot_enabled} onChange={(e) => setFormData({ ...formData, honeypot_enabled: e.target.checked })} className="h-4 w-4 text-primary-600 border-gray-300 rounded" />
              <label htmlFor="honeypot" className="text-sm font-medium text-gray-700">Enable honeypot field</label>
            </div>
            <div className="flex items-center gap-3">
              <input type="checkbox" id="recaptcha" checked={formData.recaptcha_enabled} onChange={(e) => setFormData({ ...formData, recaptcha_enabled: e.target.checked })} className="h-4 w-4 text-primary-600 border-gray-300 rounded" />
              <label htmlFor="recaptcha" className="text-sm font-medium text-gray-700">Enable reCAPTCHA v2</label>
            </div>
            {formData.recaptcha_enabled && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">reCAPTCHA Secret Key</label>
                <input type="text" value={formData.recaptcha_secret} onChange={(e) => setFormData({ ...formData, recaptcha_secret: e.target.value })} className={inputClass} placeholder="6Le..." />
              </div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Webhook</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Webhook URL</label>
              <input type="url" value={formData.webhook_url} onChange={(e) => setFormData({ ...formData, webhook_url: e.target.value })} className={inputClass} placeholder="https://yourapi.com/webhook" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Webhook Secret</label>
              <input type="text" value={formData.webhook_secret} onChange={(e) => setFormData({ ...formData, webhook_secret: e.target.value })} className={inputClass} placeholder="whsec_..." />
              <p className="text-xs text-gray-400 mt-1">Sent as X-Webhook-Secret header</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Security</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Allowed Origins</label>
            <input type="text" value={formData.allowed_origins} onChange={(e) => setFormData({ ...formData, allowed_origins: e.target.value })} className={inputClass} placeholder="https://yoursite.com, https://other.com" />
            <p className="text-xs text-gray-400 mt-1">Comma-separated. Leave empty to allow all origins.</p>
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
