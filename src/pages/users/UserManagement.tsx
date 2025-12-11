import { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Roles } from '@/types/rbac';
import { userManagementApi, type OrganizationMember } from '@/features/organization/api/userManagement';

const fieldBaseClasses =
    'block w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm text-slate-900 shadow-sm transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-0 placeholder:text-slate-400 disabled:cursor-not-allowed disabled:bg-slate-100 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    hint?: string;
}

const Input = ({ label, hint, type = 'text', className, ...rest }: InputProps) => (
    <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</label>
        <input
            type={type}
            className={`mt-1 ${fieldBaseClasses} ${className ?? ''}`.trim()}
            {...rest}
        />
        {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
);

const Button = ({ children, onClick, type = 'button', disabled }: any) => (
    <button
        type={type}
        disabled={disabled}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        onClick={onClick}
    >
        {children}
    </button>
);

function UserManagement() {
    const { user } = useAuth();
    const { showToast } = useNotifications();
    const allowedRoles = [Roles.SUPERADMIN, Roles.ORGADMIN, Roles.MANAGER];
    const hasAccess = user && allowedRoles.includes(user.role as any);

    const [members, setMembers] = useState<OrganizationMember[]>([]);
    const [membersLoading, setMembersLoading] = useState(false);

    // Invite Existing User state
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('staff_employee');
    const [inviteLoading, setInviteLoading] = useState(false);
    // Create New User state
    const [newEmail, setNewEmail] = useState('');
    const [newName, setNewName] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newRole, setNewRole] = useState('staff_employee');
    const [sendInvitation, setSendInvitation] = useState(true);
    const [createLoading, setCreateLoading] = useState(false);
    const [showManagementPanel, setShowManagementPanel] = useState(false);

    useEffect(() => {
        console.log('[UserManagement] user:', user);
        console.log('[UserManagement] hasAccess:', hasAccess);
        // Only attempt to load members if user has access and a valid organization_id
        if (!hasAccess || !user || !user.organization_id) {
            console.log('[UserManagement] Skipping load: no access or no org_id');
            return;
        }

        const loadMembers = async () => {
            console.log('[UserManagement] Loading members for org:', user.organization_id);
            setMembersLoading(true);
            try {
                const data = await userManagementApi.listMembers(user.organization_id as string);
                console.log('[UserManagement] Loaded members:', data);
                // Ensure data is an array before setting it
                if (Array.isArray(data)) {
                    setMembers(data);
                } else if (data && typeof data === 'object' && Array.isArray((data as any).results)) {
                    // Handle paginated response
                    setMembers((data as any).results);
                } else {
                    console.error('[UserManagement] Invalid members data:', data);
                    setMembers([]);
                }
            } catch (err: any) {
                console.error('[UserManagement] Failed to load members:', err);
                showToast('error', 'Failed to load users', err?.message || 'Unable to load organization members');
                setMembers([]); // Set empty array on error
            } finally {
                setMembersLoading(false);
            }
        };

        void loadMembers();
    }, [hasAccess, user, showToast]);

    if (!hasAccess) {
        return (
            <div className="p-8">
                <h2 className="text-xl font-semibold text-red-600">Access denied</h2>
                <p className="mt-2 text-muted-foreground">You do not have permission to manage users.</p>
            </div>
        );
    }

    const handleInvite = async () => {
        setInviteLoading(true);
        try {
            const payload = { user_email: inviteEmail, role: inviteRole };
            const resp = await userManagementApi.inviteUser(user?.organization_id ?? '', payload);
            showToast('success', 'Invitation Sent', resp.message || 'Invitation sent successfully');
            setInviteEmail('');
        } catch (err: any) {
            showToast('error', 'Invitation Failed', err?.message || 'Failed to send invitation');
        } finally {
            setInviteLoading(false);
        }
    };

    const handleCreate = async () => {
        setCreateLoading(true);
        try {
            const payload = {
                email: newEmail,
                name: newName,
                password: newPassword,
                role: newRole,
                send_invitation_email: sendInvitation,
            };
            const resp = await userManagementApi.createMember(user?.organization_id ?? '', payload);
            showToast('success', 'User Created', resp.message || 'User created successfully');
            setNewEmail('');
            setNewName('');
            setNewPassword('');
        } catch (err: any) {
            showToast('error', 'Creation Failed', err?.message || 'Failed to create user');
        } finally {
            setCreateLoading(false);
        }
    };

    return (
        <div className="relative p-8 max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">User Management</h1>
                <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-700"
                    onClick={() => setShowManagementPanel(true)}
                >
                    Manage Users
                </button>
            </div>

            <section className="mb-12">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Organization Users</h2>
                    <span className="text-sm text-muted-foreground">{members.length} total</span>
                </div>
                {membersLoading ? (
                    <div className="rounded-lg border border-dashed border-slate-300 p-6 text-sm text-muted-foreground">
                        Loading users...
                    </div>
                ) : !Array.isArray(members) || members.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-muted-foreground">
                        No users found for this organization.
                    </div>
                ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                        {members.map((member) => {
                            const displayName = member.name || member.user_name || '-';
                            const displayEmail = member.email || member.user_email || '-';
                            const roleLabel = member.role ? member.role.replace('_', ' ') : 'Unknown';
                            const isActive = member.is_active ?? true;
                            const joinedDate = member.created_at ? new Date(member.created_at).toLocaleDateString() : '—';
                            const initials = displayName
                                .split(' ')
                                .map((part) => part.charAt(0))
                                .join('')
                                .slice(0, 2)
                                .toUpperCase();

                            return (
                                <div
                                    key={member.id}
                                    className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-indigo-200 hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
                                >
                                    <div className="flex items-start gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-semibold">
                                            {initials || '—'}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <p className="text-base font-semibold text-foreground">{displayName}</p>
                                                <span
                                                    className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${isActive
                                                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200'
                                                        : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                                        }`}
                                                >
                                                    {isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground">{displayEmail}</p>
                                            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-0.5 text-xs font-medium uppercase tracking-wide text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300">
                                                    {roleLabel}
                                                </span>
                                                <span className="text-xs text-slate-500">Joined {joinedDate}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            {/* Slide-over management panel */}
            {showManagementPanel && (
                <div className="fixed inset-0 z-50 flex justify-end">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setShowManagementPanel(false)} />
                    <div className="relative h-full w-full max-w-md bg-white shadow-xl dark:bg-slate-900 p-6 overflow-y-auto">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-semibold">Manage Users</h2>
                                <p className="text-sm text-muted-foreground">Invite existing accounts or create new organization members.</p>
                            </div>
                            <button
                                type="button"
                                className="text-slate-500 hover:text-slate-700"
                                onClick={() => setShowManagementPanel(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-10">
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Invite Existing User</h3>
                                <Input label="User Email" value={inviteEmail} onChange={(e: ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)} />
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                                    <select
                                        className={fieldBaseClasses}
                                        value={inviteRole}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setInviteRole(e.target.value)}
                                    >
                                        <option value="superadmin">Super Admin</option>
                                        <option value="orgadmin">Organization Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="staff_employee">Staff Employee</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </div>
                                <Button onClick={handleInvite} disabled={inviteLoading || !inviteEmail}>
                                    {inviteLoading ? 'Inviting…' : 'Send Invitation'}
                                </Button>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-4">Create New User Account</h3>
                                <Input label="Email" value={newEmail} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewEmail(e.target.value)} />
                                <Input label="Name" value={newName} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)} />
                                <Input label="Password" type="password" value={newPassword} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)} />
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-foreground mb-1">Role</label>
                                    <select
                                        className={`mt-1 ${fieldBaseClasses}`}
                                        value={newRole}
                                        onChange={(e: ChangeEvent<HTMLSelectElement>) => setNewRole(e.target.value)}
                                    >
                                        <option value="superadmin">Super Admin</option>
                                        <option value="orgadmin">Organization Admin</option>
                                        <option value="manager">Manager</option>
                                        <option value="staff_employee">Staff Employee</option>
                                        <option value="viewer">Viewer</option>
                                    </select>
                                </div>
                                <div className="flex items-center mb-4">
                                    <input
                                        id="send-invitation"
                                        type="checkbox"
                                        checked={sendInvitation}
                                        onChange={(e: ChangeEvent<HTMLInputElement>) => setSendInvitation(e.target.checked)}
                                        className="h-4 w-4 rounded border-border text-indigo-600 focus:ring-indigo-500"
                                    />
                                    <label htmlFor="send-invitation" className="ml-2 block text-sm text-foreground">
                                        Send invitation email
                                    </label>
                                </div>
                                <Button onClick={handleCreate} disabled={createLoading || !newEmail || !newName || !newPassword}>
                                    {createLoading ? 'Creating…' : 'Create User'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserManagement;