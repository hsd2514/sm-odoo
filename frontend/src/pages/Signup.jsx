import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import api from '../services/api';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/signup', { email, password, full_name: fullName, role: 'manager' });
      navigate('/login');
    } catch (err) {
      setError('Signup failed. Email might be taken.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-neo-bg)]">
      <div className="neo-box p-8 w-full max-w-md">
        <h1 className="text-4xl font-black mb-8 text-center uppercase">Join StockMaster</h1>
        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 p-2 mb-4 font-bold">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-bold mb-2">Full Name</label>
            <Input 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block font-bold mb-2">Email</label>
            <Input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block font-bold mb-2">Password</label>
            <Input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <Button type="submit" className="w-full text-lg">
            SIGN UP
          </Button>
        </form>
        <div className="mt-4 text-center">
            <a href="/login" className="font-bold hover:underline">Already have an account? Login</a>
        </div>
      </div>
    </div>
  );
};

export default Signup;
