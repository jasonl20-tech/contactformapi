import { useAuth } from '../contexts/AuthContext';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { User, Key, Shield, Building2 } from 'lucide-react';
import { API_BASE } from '../lib/api';

export default function SettingsPage() {
  const { user } = useAuth();
  const { currentWorkspace, isPersonal, can } = useWorkspace();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">
          {isPersonal ? 'Manage your account settings' : `Settings for ${currentWorkspace?.teamName}`}
        </p>
      </div>

      <div className="space-y-6">
        {/* Account section - always visible */}
        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Account</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">User ID</label>
              <input
                type="text"
                value={user?.id || ''}
                disabled
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 font-mono text-sm"
              />
            </div>
          </div>
        </section>

        {/* Workspace section - only when a workspace is active */}
        {!isPersonal && currentWorkspace && (
          <section className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <Building2 className="h-5 w-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Workspace</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Workspace Name</label>
                <input
                  type="text"
                  value={currentWorkspace.teamName}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Workspace ID</label>
                <input
                  type="text"
                  value={currentWorkspace.teamId}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 font-mono text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Role</label>
                <input
                  type="text"
                  value={currentWorkspace.role}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 capitalize"
                />
              </div>
            </div>
          </section>
        )}

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Key className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">API Access</h2>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">API Endpoint</label>
            <input
              type="text"
              value={API_BASE}
              disabled
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 font-mono text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              Use this base URL for all API requests. Submit forms to <code className="bg-gray-100 px-1 rounded">{API_BASE}/f/YOUR_FORM_ID</code>
            </p>
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Security</h2>
          </div>
          <p className="text-sm text-gray-500 mb-4">
            Your account is secured by Supabase Authentication.
          </p>
          <button
            className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
            onClick={() => alert('Password reset email will be sent to your email address.')}
          >
            Change Password
          </button>
        </section>

        {/* Danger zone - only for workspace owners */}
        {!isPersonal && can('deleteWorkspace') && (
          <section className="bg-white rounded-xl border border-red-200 p-6">
            <h2 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h2>
            <p className="text-sm text-gray-500 mb-4">
              Deleting this workspace will permanently remove all forms, submissions, and member access.
            </p>
            <button
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition"
              onClick={() => alert('Workspace deletion is not yet implemented.')}
            >
              Delete Workspace
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
