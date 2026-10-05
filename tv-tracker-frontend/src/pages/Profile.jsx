import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function Profile() {
  const [watchlist, setWatchlist] = useState([]);
  const username = localStorage.getItem('username');
  const navigate = useNavigate();
  
  const [editingSeries, setEditingSeries] = useState(null);
  const [editStatus, setEditStatus] = useState('Plan to Watch');
  const [editRating, setEditRating] = useState('');

  const fetchWatchlist = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/watchlist/${username}`);
      setWatchlist(res.data);
    } catch (err) {
      console.error("Error fetching watchlist", err);
    }
  };

  useEffect(() => {
    if (!username) {
      navigate('/login');
      return;
    }
    fetchWatchlist();
  }, [username, navigate]);

  const openEditModal = (item) => {
    setEditingSeries(item);
    setEditStatus(item.Status);
    setEditRating(item.Rating || '');
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/api/watchlist', {
        seriesId: editingSeries.SeriesID,
        title: editingSeries.Title,
        posterUrl: editingSeries.PosterURL,
        status: editStatus,
        rating: editRating === '' ? null : parseFloat(editRating),
        review: editingSeries.Review || ''
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEditingSeries(null);
      fetchWatchlist();
    } catch (err) {
      alert('Error updating watchlist');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 shadow-lg">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="bg-indigo-500/20 text-indigo-400 p-2 rounded-xl">👤</span> 
            {username}'s Watchlist
          </h1>
          <Link to="/" className="bg-slate-700/50 text-slate-300 border border-slate-600/50 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-600 hover:text-white transition-all">
            ← Home
          </Link>
        </div>

        {/* Grid */}
        {watchlist.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-20 p-10 bg-slate-800/30 rounded-3xl border border-slate-700/50 border-dashed">
            <span className="text-6xl mb-4">🎬</span>
            <p className="text-slate-400 text-xl font-medium">Your watchlist is empty.</p>
            <Link to="/" className="mt-6 text-indigo-400 hover:text-indigo-300 font-bold underline underline-offset-4">Find series to watch</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {watchlist.map((item) => (
              <div key={item.SeriesID} className="bg-slate-800/40 rounded-2xl overflow-hidden shadow-lg border border-slate-700/50 flex flex-col group hover:border-indigo-500/50 transition-all hover:-translate-y-1">
                
                <Link to={`/series/${item.SeriesID}`} className="relative overflow-hidden aspect-[2/3]">
                  {item.PosterURL ? (
                    <img src={item.PosterURL} alt={item.Title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">No Image</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent opacity-90"></div>
                  
                  {/* Status Badge Positioned over image */}
                  <div className="absolute top-3 right-3">
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg backdrop-blur-md border shadow-sm
                      ${item.Status === 'Completed' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 
                        item.Status === 'Watching' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}`}>
                      {item.Status}
                    </span>
                  </div>
                </Link>

                <div className="p-5 flex flex-col flex-1 justify-between -mt-16 relative z-10">
                  <div>
                    <h3 className="font-bold text-lg text-white mb-1 line-clamp-1 drop-shadow-md" title={item.Title}>{item.Title}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-yellow-400 font-bold mb-4 bg-slate-900/50 w-fit px-2 py-1 rounded-md border border-slate-700/50">
                      <span>★</span> {item.Rating > 0 ? `${item.Rating}/5` : <span className="text-slate-400 font-normal">Unrated</span>}
                    </div>
                  </div>
                  <button 
                    onClick={() => openEditModal(item)}
                    className="w-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 py-2.5 rounded-xl font-bold hover:bg-indigo-600 hover:text-white hover:border-indigo-500 transition-all flex items-center justify-center gap-2"
                  >
                    ✏️ Edit 
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Glassmorphism Modal */}
      {editingSeries && (
        <div className="fixed inset-0 bg-[#0f172a]/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 p-8 rounded-3xl w-full max-w-md border border-slate-700 shadow-2xl">
            <h2 className="text-2xl font-black mb-6 text-white border-b border-slate-700 pb-4">Edit <span className="text-indigo-400">{editingSeries.Title}</span></h2>
            <form onSubmit={handleUpdate} className="space-y-5">
              <div>
                <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wider">Status</label>
                <select 
                  value={editStatus} 
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full p-3.5 rounded-xl bg-slate-900/50 text-white border border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
                >
                  <option value="Plan to Watch">Plan to Watch</option>
                  <option value="Watching">Watching</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-400 text-sm font-bold mb-2 uppercase tracking-wider">Rating (1 to 5)</label>
                <input 
                  type="number" 
                  min="1" max="5" step="0.5"
                  value={editRating} 
                  onChange={(e) => setEditRating(e.target.value)}
                  placeholder="e.g. 4.5"
                  className="w-full p-3.5 rounded-xl bg-slate-900/50 text-white border border-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
              <div className="flex space-x-4 mt-8 pt-4 border-t border-slate-700">
                <button type="button" onClick={() => setEditingSeries(null)} className="flex-1 bg-slate-700 text-white py-3.5 rounded-xl font-bold hover:bg-slate-600 transition-all">Cancel</button>
                <button type="submit" className="flex-1 bg-indigo-600 text-white py-3.5 rounded-xl font-bold hover:bg-indigo-500 shadow-lg shadow-indigo-500/30 transition-all">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}