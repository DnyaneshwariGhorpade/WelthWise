import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, KeyRound, Clock, ShieldAlert } from 'lucide-react';
import { getMe, updateMe, changePassword, logoutUser, Me } from '../../services/app.service';
import { apiErr } from '../../services/app.service';
import { useAuth } from '../../context/AuthContext';
import { Card, PageHeader, Button, ErrorNotice, fmtDateTime } from '../../components/ui';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [me, setMe] = useState<Me | null>(null);
  const [profile, setProfile] = useState({ full_name: '', email: '' });
  const [password, setPassword] = useState({ current_password: '', new_password: '', confirm: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    getMe()
      .then((m) => {
        setMe(m);
        setProfile({ full_name: m.fullName, email: m.email });
      })
      .catch((err) => setError(apiErr(err, 'Failed to load profile')));
  }, []);

  const saveProfile = async () => {
    setSavingProfile(true);
    setError('');
    setNotice('');
    try {
      const updated = await updateMe(profile);
      setMe(updated);
      setNotice('Profile updated.');
    } catch (err) {
      setError(apiErr(err, 'Failed to update profile'));
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    if (password.new_password !== password.confirm) {
      setError('New passwords do not match');
      return;
    }
    if (password.new_password.length < 8) {
      setError('New password must be at least 8 characters');
      return;
    }
    setSavingPwd(true);
    setError('');
    setNotice('');
    try {
      const msg = await changePassword(password.current_password, password.new_password);
      setNotice(msg);
      setPassword({ current_password: '', new_password: '', confirm: '' });
    } catch (err) {
      setError(apiErr(err, 'Failed to change password'));
    } finally {
      setSavingPwd(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore — clear locally regardless
    }
    logout();
    navigate('/login');
  };

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your profile, password, and session." />
      <ErrorNotice message={error} />
      {notice && <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700 mb-4">{notice}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-5">
            <User className="h-4 w-4 text-emerald-600" />
            Profile
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full name</label>
              <input
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <Button onClick={saveProfile} disabled={savingProfile}>
              {savingProfile ? 'Saving…' : 'Save profile'}
            </Button>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-5">
            <KeyRound className="h-4 w-4 text-emerald-600" />
            Change Password
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Current password</label>
              <input
                type="password"
                value={password.current_password}
                onChange={(e) => setPassword({ ...password, current_password: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">New password</label>
              <input
                type="password"
                value={password.new_password}
                onChange={(e) => setPassword({ ...password, new_password: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm new password</label>
              <input
                type="password"
                value={password.confirm}
                onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <Button onClick={savePassword} disabled={savingPwd}>
              {savingPwd ? 'Changing…' : 'Change password'}
            </Button>
          </div>
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div className="flex gap-3">
            <div className="h-10 w-10 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Session</h3>
              <p className="text-sm text-slate-500">
                Signed in as <span className="font-medium text-slate-700">{user?.email}</span>
                {me?.lastLoginAt && <> · last login {fmtDateTime(me.lastLoginAt)}</>}
              </p>
              <p className="mt-1 text-xs text-slate-400 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Sessions auto-expire after 15 minutes of inactivity. You'll be asked to sign in again.
              </p>
            </div>
          </div>
          <Button variant="danger" onClick={handleLogout}>
            Log out
          </Button>
        </div>
      </Card>
    </div>
  );
}