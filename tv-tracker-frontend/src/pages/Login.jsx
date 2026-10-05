import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/login', { email, password });
      // ලැබෙන Token එක සහ Username එක Browser එකේ Save කරගන්නවා
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('username', response.data.username);
      alert('Logged in successfully!');
      navigate('/'); // Login වුණාම Home එකට යනවා
    } catch (err) {
      alert(err.response?.data?.error || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700">
        <h2 className="text-3xl text-white font-bold mb-6 text-center tracking-wide">Welcome Back</h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <input type="email" placeholder="Email Address" required
            className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required
            className="w-full p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500" 
            onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" 
            className="w-full bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 transition duration-300">
            Log In
          </button>
        </form>
        <p className="text-gray-400 mt-6 text-center">
          New here? <Link to="/register" className="text-indigo-400 hover:text-indigo-300">Create an account</Link>
        </p>
      </div>
    </div>
  );
}