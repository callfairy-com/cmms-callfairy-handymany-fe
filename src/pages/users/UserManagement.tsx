import { useState, ChangeEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { Roles } from '@/types/rbac';
import { userManagementApi } from '@/features/organization/api/userManagement';

// Simple UI components – you can replace with your design system components later
const Input = ({ label, type = 'text', value, onChange }: any) => (
    <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        <input
            type={type}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={value}
            onChange={onChange}
        />
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

export default function UserManagement() {
    const { user } = useAuth();
    const { showToast } = useNotifications();
    const allowedRoles = [Roles.SUPERADMIN, Roles.ORGADMIN, Roles.MANAGER];
    const hasAccess = user && allowedRoles.includes(user.role as any);

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

    if (!hasAccess) {
        return (
            <div className="p-8">
                <h2 className="text-xl font-semibold text-red-600">Access denied</h2>
                <p className="mt-2 text-gray-600">You do not have permission to manage users.</p>
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
        <div className="p-8 max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">User Management</h1>

            {/* Invite Existing User */}
            <section className="mb-12">
                <h2 className="text-xl font-semibold mb-4">Invite Existing User</h2>
                <Input label="User Email" value={inviteEmail} onChange={(e: ChangeEvent<HTMLInputElement>) => setInviteEmail(e.target.value)} />
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
            </section>

            {/* Create New User */}
            <section>
                <h2 className="text-xl font-semibold mb-4">Create New User Account</h2>
                <Input label="Email" value={newEmail} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewEmail(e.target.value)} />
                <Input label="Name" value={newName} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewName(e.target.value)} />
                <Input label="Password" type="password" value={newPassword} onChange={(e: ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)} />
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <label htmlFor="send-invitation" className="ml-2 block text-sm text-gray-900">
                        Send invitation email
                    </label>
                </div>
                <Button onClick={handleCreate} disabled={createLoading || !newEmail || !newName || !newPassword}>
                    {createLoading ? 'Creating…' : 'Create User'}
                </Button>
            </section>
        </div>
    );
}
