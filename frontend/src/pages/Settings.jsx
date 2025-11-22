import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { User, Lock } from 'lucide-react';

const Settings = () => {
  const [profile, setProfile] = useState({ full_name: '', email: '' });
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get('/auth/me');
      setProfile({ full_name: response.data.full_name, email: response.data.email });
    } catch (error) {
      console.error("Failed to fetch profile", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const updateData = { full_name: profile.full_name };
      if (password) updateData.password = password;

      await api.put('/auth/me', updateData);
      setMessage('Profile updated successfully!');
      setPassword('');
    } catch (error) {
      console.error("Failed to update profile", error);
      setMessage('Failed to update profile.');
    }
  };

  if (loading) return <div>Loading Settings...</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-black uppercase mb-8">Settings</h2>

      <div className="neo-box p-8 bg-white">
        <h3 className="text-xl font-black mb-6 uppercase flex items-center gap-2 border-b-2 border-black pb-2">
          <User /> Profile Settings
        </h3>

        {message && (
          <div className={`p-4 mb-6 font-bold border-2 border-black ${message.includes('success') ? 'bg-green-200' : 'bg-red-200'}`}>
            {message}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="block font-bold mb-2">Email (Read-only)</label>
            <Input 
              value={profile.email} 
              disabled 
              className="bg-gray-100 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block font-bold mb-2">Full Name</label>
            <Input 
              value={profile.full_name} 
              onChange={(e) => setProfile({...profile, full_name: e.target.value})} 
              required
            />
          </div>

          <div>
            <label className="block font-bold mb-2 flex items-center gap-2">
              <Lock size={16} /> New Password (Optional)
            </label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Leave blank to keep current"
            />
          </div>

          <Button type="submit" className="w-full">
            Save Changes
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
