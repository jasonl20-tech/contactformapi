import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, type Form, type UsageData } from '../lib/api';
import { FileText, Inbox, Plus, ArrowRight, Loader2, Zap, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const [forms, setForms] = useState<Form[]>([]);
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.forms.list(1, 100),
      api.usage(),
    ]).then(([formsRes, usageData]) => {
      setForms(formsRes.data);
      setUsage(usageData);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  const totalSubmissions = forms.reduce((sum, f) => sum + f.submission_count, 0);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of your forms and submissions</p>
      </div>

      {usage && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-primary-100 text-sm">Current Plan</p>
              <p className="text-2xl font-bold">{usage.plan.name}</p>
            </div>
            {usage.user.plan === 'free' && (
              <Link
                to="/billing"
                className="inline-flex items-center gap-2 bg-white text-primary-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-50 transition"
              >
                <Zap className="h-4 w-4" /> Upgrade
              </Link>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-primary-200 text-xs mb-1">Submissions this month</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-primary-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${Math.min(100, usage.usage.submissions_percentage)}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {usage.usage.submissions_this_month.toLocaleString()}/{usage.usage.submissions_limit.toLocaleString()}
                </span>
              </div>
            </div>
            <div>
              <p className="text-primary-200 text-xs mb-1">Forms</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-primary-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${usage.usage.forms_limit === -1 ? 0 : Math.min(100, Math.round((usage.usage.forms / usage.usage.forms_limit) * 100))}%` }}
                  />
                </div>
                <span className="text-sm font-medium">
                  {usage.usage.forms}/{usage.usage.forms_limit === -1 ? '∞' : usage.usage.forms_limit}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

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
              <TrendingUp className="h-5 w-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">This Month</span>
          </div>
          <p className="text-3xl font-bold text-gray-900">{usage?.usage.submissions_this_month ?? 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Forms</h2>
          {usage && usage.usage.forms_remaining !== 0 ? (
            <Link
              to="/forms/new"
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition"
            >
              <Plus className="h-4 w-4" /> New Form
            </Link>
          ) : (
            <Link
              to="/billing"
              className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 transition"
            >
              <Zap className="h-4 w-4" /> Upgrade to add more
            </Link>
          )}
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
