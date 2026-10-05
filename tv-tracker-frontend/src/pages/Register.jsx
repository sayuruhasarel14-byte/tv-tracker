import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:3001/register', { username, email, password });
      alert('Registration Successful! Please login.');
      navigate('/login'); // Register වුණාම ඉබේම Login පිටුවට යනවා
    } catch (err) {
      alert(err.response?.data?.error || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        <h2 className="text-3xl text-white font-bold mb-6 text-center tracking-wide">Join TV Tracker</h2>
        <form onSubmit={handleRegister} className="space-y-5">
          <input type="text" placeholder="Username" required
            className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            onChange={(e) => setUsername(e.target.value)} />
          <input type="email" placeholder="Email Address" required
            className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required
            className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" 
            className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 transition duration-300">
            Sign Up
          </button>
        </form>
        <p className="text-gray-400 mt-6 text-center">
          Already have an account? <Link to="/login" className="text-indigo-400 hover:text-indigo-300">Log in</Link>
        </p>
      </div>
    </div>
  );
}