import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Form, type UsageData } from '../lib/api';
import { Plus, FileText, Loader2, Copy, Check, MoreVertical, Trash2, Settings, Zap } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://contactformapi.contactformapi.workers.dev';

export default function Forms() {
  const [forms, setForms] = useState<Form[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.forms.list(1, 100),
      api.usage(),
    ]).then(([formsRes, usageData]) => {
      setForms(formsRes.data);
      setUsage(usageData);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const copyEndpoint = (formId: string) => {
    navigator.clipboard.writeText(`${API_BASE}/f/${formId}`);
    setCopiedId(formId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (formId: string) => {
    if (!confirm('Are you sure? This will delete all submissions too.')) return;
    setDeleting(formId);
    try {
      await api.forms.delete(formId);
      setForms(forms.filter(f => f.id !== formId));
    } finally {
      setDeleting(null);
      setMenuOpen(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
          <p className="text-gray-500 mt-1">
            Manage your form endpoints
            {usage && <span className="ml-2 text-gray-400">({usage.usage.forms}/{usage.usage.forms_limit === -1 ? '∞' : usage.usage.forms_limit} used)</span>}
          </p>
        </div>
        {usage && usage.usage.forms_remaining !== 0 ? (
          <Link
            to="/forms/new"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition"
          >
            <Plus className="h-4 w-4" /> New Form
          </Link>
        ) : (
          <Link
            to="/billing"
            className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-amber-600 transition"
          >
            <Zap className="h-4 w-4" /> Upgrade to add more
          </Link>
        )}
      </div>

      {forms.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No forms yet</h3>
          <p className="text-gray-500 mb-4">Create your first form to get an endpoint URL.</p>
          <Link
            to="/forms/new"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition"
          >
            <Plus className="h-4 w-4" /> Create Form
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {forms.map((form) => (
            <div key={form.id} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Link to={`/forms/${form.id}`} className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition truncate">
                      {form.name}
                    </Link>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${form.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {form.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <code className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-md font-mono truncate">
                      {API_BASE}/f/{form.id}
                    </code>
                    <button
                      onClick={() => copyEndpoint(form.id)}
                      className="shrink-0 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                      title="Copy endpoint"
                    >
                      {copiedId === form.id ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{form.submission_count} submissions</span>
                    <span>Created {new Date(form.created_at).toLocaleDateString()}</span>
                    {form.webhook_url && <span className="text-primary-600">Webhook active</span>}
                  </div>
                </div>

                <div className="relative ml-4">
                  <button
                    onClick={() => setMenuOpen(menuOpen === form.id ? null : form.id)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
                  >
                    <MoreVertical className="h-5 w-5" />
                  </button>

                  {menuOpen === form.id && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(null)} />
                      <div className="absolute right-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
                        <Link
                          to={`/forms/${form.id}`}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                          onClick={() => setMenuOpen(null)}
                        >
                          <FileText className="h-4 w-4" /> View Submissions
                        </Link>
                        <Link
                          to={`/forms/${form.id}/settings`}
                          className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition"
                          onClick={() => setMenuOpen(null)}
                        >
                          <Settings className="h-4 w-4" /> Settings
                        </Link>
                        <button
                          onClick={() => handleDelete(form.id)}
                          disabled={deleting === form.id}
                          className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition"
                        >
                          {deleting === form.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
