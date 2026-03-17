import { useEffect, useState } from 'react';
import { api, type WorkspaceMember, type WorkspaceInvite, type WorkspaceRole } from '../lib/api';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { Navigate } from 'react-router-dom';
import {
  Loader2, Users, UserPlus, Mail, Trash2, Shield,
  Crown, Pencil, Eye, X,
} from 'lucide-react';

const ROLE_ICONS: Record<string, typeof Crown> = {
  owner: Crown,
  admin: Shield,
  editor: Pencil,
  viewer: Eye,
};

const ROLE_LABELS: Record<string, string> = {
  owner: 'Owner',
  admin: 'Admin',
  editor: 'Editor',
  viewer: 'Viewer',
  member: 'Member',
};

const ASSIGNABLE_ROLES: { id: WorkspaceRole; label: string }[] = [
  { id: 'admin', label: 'Admin' },
  { id: 'editor', label: 'Editor' },
  { id: 'viewer', label: 'Viewer' },
];

export default function Members() {
  const { currentWorkspace, isPersonal, can } = useWorkspace();
  const [members, setMembers] = useState<WorkspaceMember[]>([]);
  const [invites, setInvites] = useState<WorkspaceInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<string>('editor');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  const workspaceId = currentWorkspace?.teamId;
  const canInvite = can('inviteMembers');

  useEffect(() => {
    if (!workspaceId) return;
    setLoading(true);
    Promise.all([
      api.members.list(workspaceId),
      canInvite ? api.invites.list(workspaceId) : Promise.resolve([]),
    ]).then(([m, i]) => {
      setMembers(m);
      setInvites(i);
    }).finally(() => setLoading(false));
  }, [workspaceId, canInvite]);

  if (isPersonal) return <Navigate to="/" replace />;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceId || !inviteEmail.trim()) return;
    setInviteError('');
    setInviteSuccess('');
    setInviting(true);
    try {
      const result = await api.invites.send(workspaceId, inviteEmail.trim(), inviteRole);
      setInviteSuccess(result.message);
      setInviteEmail('');
      if (result.directAdd) {
        const updated = await api.members.list(workspaceId);
        setMembers(updated);
      } else {
        const updated = await api.invites.list(workspaceId);
        setInvites(updated);
      }
      setTimeout(() => setInviteSuccess(''), 4000);
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to invite');
    } finally {
      setInviting(false);
    }
  };

  const handleRemoveMember = async (userId: string, name: string) => {
    if (!workspaceId || !confirm(`Remove ${name} from the workspace?`)) return;
    await api.members.remove(workspaceId, userId);
    setMembers(members.filter(m => m.userId !== userId));
  };

  const handleRevokeInvite = async (inviteId: string) => {
    if (!workspaceId) return;
    await api.invites.revoke(workspaceId, inviteId);
    setInvites(invites.filter(i => i.id !== inviteId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Members</h1>
        <p className="text-gray-500 mt-1">
          Manage who has access to <span className="font-medium text-gray-700">{currentWorkspace?.teamName}</span>
        </p>
      </div>

      {/* Invite form */}
      {canInvite && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <UserPlus className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">Invite Member</h2>
          </div>

          {inviteError && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{inviteError}</div>
          )}
          {inviteSuccess && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm">{inviteSuccess}</div>
          )}

          <form onSubmit={handleInvite} className="flex items-end gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition"
                placeholder="colleague@example.com"
                required
              />
            </div>
            <div className="w-36">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition bg-white"
              >
                {ASSIGNABLE_ROLES.map((r) => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={inviting}
              className="inline-flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700 transition disabled:opacity-50"
            >
              {inviting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Invite
            </button>
          </form>
        </div>
      )}

      {/* Members list */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200">
          <Users className="h-5 w-5 text-gray-400" />
          <h2 className="text-lg font-semibold text-gray-900">
            Team Members <span className="text-gray-400 font-normal">({members.length})</span>
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {members.map((member) => {
            const RoleIcon = ROLE_ICONS[member.role] || Users;
            const isOwner = member.role === 'owner';
            return (
              <div key={member.memberId} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-4 min-w-0">
                  {member.userImage ? (
                    <img src={member.userImage} alt="" className="h-10 w-10 rounded-full" />
                  ) : (
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-500">
                        {member.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-medium text-gray-900 truncate">{member.userName}</p>
                    <p className="text-sm text-gray-500 truncate">{member.userEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    <RoleIcon className="h-3 w-3" />
                    {ROLE_LABELS[member.role] || member.role}
                  </span>
                  {canInvite && !isOwner && (
                    <button
                      onClick={() => handleRemoveMember(member.userId, member.userName)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                      title="Remove"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending invites */}
      {canInvite && invites.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 mt-6">
          <div className="flex items-center gap-3 p-4 border-b border-gray-200">
            <Mail className="h-5 w-5 text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900">
              Pending Invitations <span className="text-gray-400 font-normal">({invites.length})</span>
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {invites.map((invite) => (
              <div key={invite.id} className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{invite.email}</p>
                  <p className="text-sm text-gray-500">
                    Invited as <span className="capitalize">{invite.role}</span>
                    {invite.createdAt && <> · {new Date(invite.createdAt).toLocaleDateString()}</>}
                  </p>
                </div>
                <button
                  onClick={() => handleRevokeInvite(invite.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition ml-4"
                  title="Revoke invitation"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
