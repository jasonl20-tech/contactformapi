import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { api, type Workspace, type WorkspaceRole, ROLE_PERMISSIONS } from '../lib/api';
import { useAuth } from './AuthContext';

interface WorkspaceContextType {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  loading: boolean;
  switchWorkspace: (workspaceId: string) => void;
  refreshWorkspaces: () => Promise<void>;
  currentRole: WorkspaceRole;
  can: (permission: keyof typeof ROLE_PERMISSIONS.owner) => boolean;
  isPersonal: boolean;
  setPersonalMode: () => void;
  account: string; // 'personal' or workspace ID
}

const WorkspaceContext = createContext<WorkspaceContextType | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<string>(
    () => localStorage.getItem('workspace_id') || 'personal'
  );

  const refreshWorkspaces = useCallback(async () => {
    if (!user) {
      setWorkspaces([]);
      setLoading(false);
      return;
    }
    try {
      const data = await api.workspaces.list();
      setWorkspaces(data);
    } catch {
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refreshWorkspaces();
  }, [refreshWorkspaces]);

  const switchWorkspace = useCallback((workspaceId: string) => {
    setAccount(workspaceId);
    if (workspaceId === 'personal') {
      localStorage.removeItem('workspace_id');
    } else {
      localStorage.setItem('workspace_id', workspaceId);
    }
  }, []);

  const setPersonalMode = useCallback(() => {
    switchWorkspace('personal');
  }, [switchWorkspace]);

  const isPersonal = account === 'personal';
  const currentWorkspace = isPersonal ? null : workspaces.find(w => w.teamId === account) || null;
  const currentRole: WorkspaceRole = currentWorkspace
    ? (currentWorkspace.role as WorkspaceRole)
    : 'owner';

  const can = useCallback(
    (permission: keyof typeof ROLE_PERMISSIONS.owner) => {
      return ROLE_PERMISSIONS[currentRole]?.[permission] ?? false;
    },
    [currentRole]
  );

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        currentWorkspace,
        loading,
        switchWorkspace,
        refreshWorkspaces,
        currentRole,
        can,
        isPersonal,
        setPersonalMode,
        account,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
