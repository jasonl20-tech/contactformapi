import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Form } from '../lib/api';
import { FileText, Inbox, Plus, ArrowRight, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSubmissions, setTotalSubmissions] = useState(0);

  useEffect(() => {
    api.forms.list(1, 100).then(({ data }) => {
      setForms(data);
      setTotalSubmissions(data.reduce((sum, f) => sum + f.submission_count, 0));
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your forms and submissions</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-primary-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Forms</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{forms.length}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Inbox className="h-5 w-5 text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Total Submissions</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{totalSubmissions}</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Active Forms</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{forms.filter(f => f.is_active).length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Forms</h2>
          <Link
            to="/forms/new"
            className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition"
          >
            <Plus className="h-4 w-4" /> New Form
          </Link>
        </div>

        {forms.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No forms yet</h3>
            <p className="text-gray-500 mb-4">Create your first form to start collecting submissions.</p>
            <Link
              to="/forms/new"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition"
            >
              <Plus className="h-4 w-4" /> Create Form
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {forms.slice(0, 5).map((form) => (
              <Link
                key={form.id}
                to={`/forms/${form.id}`}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`h-3 w-3 rounded-full ${form.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{form.name}</p>
                    <p className="text-sm text-gray-500">{form.submission_count} submissions</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400 shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
