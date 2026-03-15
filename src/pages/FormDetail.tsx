import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, type Form, type Submission, type Pagination } from '../lib/api';
import {
  Loader2, ArrowLeft, Copy, Check, ChevronLeft, ChevronRight,
  Inbox, Trash2, Settings, Code
} from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://contactformapi.contactformapi.workers.dev';

export default function FormDetail() {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [copied, setCopied] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    if (!formId) return;
    try {
      const [formRes, subRes] = await Promise.all([
        api.forms.get(formId),
        api.submissions.list(formId, page),
      ]);
      setForm(formRes.data);
      setSubmissions(subRes.data);
      setPagination(subRes.pagination);
    } finally {
      setLoading(false);
    }
  }, [formId, page]);

  useEffect(() => { load(); }, [load]);

  const copyEndpoint = () => {
    navigator.clipboard.writeText(`${API_BASE}/f/${formId}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteSubmission = async (subId: string) => {
    if (!formId || !confirm('Delete this submission?')) return;
    await api.submissions.delete(formId, subId);
    setSubmissions(submissions.filter(s => s.id !== subId));
    if (selectedSubmission?.id === subId) setSelectedSubmission(null);
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
      <div className="max-w-4xl mx-auto text-center py-20">
        <p className="text-gray-500">Form not found</p>
        <Link to="/forms" className="text-primary-600 hover:text-primary-700 text-sm mt-2 inline-block">Back to forms</Link>
      </div>
    );
  }

  const endpoint = `${API_BASE}/f/${form.id}`;
  const htmlSnippet = `<form action="${endpoint}" method="POST">
  <input type="text" name="name" placeholder="Your name" required />
  <input type="email" name="email" placeholder="Your email" required />
  <textarea name="message" placeholder="Your message" required></textarea>${form.honeypot_enabled ? `\n  <input type="text" name="_honeypot" style="display:none" />` : ''}
  <button type="submit">Send</button>
</form>`;

  const jsSnippet = `fetch("${endpoint}", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json"
  },
  body: JSON.stringify({
    name: "John Doe",
    email: "john@example.com",
    message: "Hello!"
  })
})
.then(res => res.json())
.then(data => console.log(data));`;

  return (
    <div className="max-w-6xl mx-auto">
      <Link to="/forms" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to forms
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{form.name}</h1>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${form.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
              {form.is_active ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <code className="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-md font-mono">{endpoint}</code>
            <button onClick={copyEndpoint} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition" title="Copy">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSetup(!showSetup)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            <Code className="h-4 w-4" /> Setup
          </button>
          <Link
            to={`/forms/${form.id}/settings`}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
          >
            <Settings className="h-4 w-4" /> Settings
          </Link>
        </div>
      </div>

      {showSetup && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Setup</h3>
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">HTML Form</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">{htmlSnippet}</pre>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">JavaScript (Fetch)</h4>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">{jsSnippet}</pre>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`${selectedSubmission ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                Submissions <span className="text-gray-400 font-normal">({pagination?.total || 0})</span>
              </h2>
            </div>

            {submissions.length === 0 ? (
              <div className="p-12 text-center">
                <Inbox className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-1">No submissions yet</h3>
                <p className="text-gray-500">Submissions will appear here once your form receives data.</p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-gray-200">
                  {submissions.map((sub) => {
                    const keys = Object.keys(sub.data);
                    const preview = keys.slice(0, 3).map(k => `${k}: ${String(sub.data[k]).slice(0, 30)}`).join(' · ');
                    return (
                      <div
                        key={sub.id}
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition ${selectedSubmission?.id === sub.id ? 'bg-primary-50' : ''}`}
                        onClick={() => setSelectedSubmission(sub)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-gray-900 truncate">{preview}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(sub.created_at).toLocaleString()} · {sub.ip_address}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 ml-4">
                            {!sub.is_read && <div className="h-2 w-2 rounded-full bg-primary-500" />}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {pagination && pagination.total_pages > 1 && (
                  <div className="flex items-center justify-between p-4 border-t border-gray-200">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page <= 1}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" /> Previous
                    </button>
                    <span className="text-sm text-gray-500">
                      Page {page} of {pagination.total_pages}
                    </span>
                    <button
                      onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
                      disabled={page >= pagination.total_pages}
                      className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 disabled:opacity-40"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {selectedSubmission && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 sticky top-24">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900">Submission Detail</h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteSubmission(selectedSubmission.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setSelectedSubmission(null)}
                    className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition"
                  >
                    ×
                  </button>
                </div>
              </div>

              <div className="p-4 space-y-3">
                {Object.entries(selectedSubmission.data).map(([key, value]) => (
                  <div key={key}>
                    <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-0.5">
                      {key}
                    </label>
                    <p className="text-sm text-gray-900 break-words">{String(value)}</p>
                  </div>
                ))}

                <hr className="border-gray-200" />

                <div className="space-y-2 text-xs text-gray-400">
                  <p><span className="font-medium">ID:</span> {selectedSubmission.id}</p>
                  <p><span className="font-medium">IP:</span> {selectedSubmission.ip_address}</p>
                  <p><span className="font-medium">Date:</span> {new Date(selectedSubmission.created_at).toLocaleString()}</p>
                  <p><span className="font-medium">Origin:</span> {selectedSubmission.origin || '—'}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
