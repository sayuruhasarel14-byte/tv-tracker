import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

export default function Friends() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [friendWatchlist, setFriendWatchlist] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const searchUsers = async (e) => {
    e.preventDefault();
    if(!searchQuery.trim()) return;
    setHasSearched(true);
    setSelectedUser(null);
    try {
      const res = await axios.get(`http://localhost:3001/api/users/search?q=${searchQuery}`);
      setUsers(res.data);
    } catch (err) {
      alert('Error searching for users');
    }
  };

  const viewWatchlist = async (username) => {
    try {
      const res = await axios.get(`http://localhost:3001/api/users/${username}/watchlist`);
      setFriendWatchlist(res.data);
      setSelectedUser(username);
    } catch (err) {
      alert("Error fetching user's watchlist");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500 selection:text-white pb-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10 bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 shadow-lg">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <span className="bg-indigo-500/20 text-indigo-400 p-2 rounded-xl">🤝</span> 
            Find Friends
          </h1>
          <Link to="/" className="bg-slate-700/50 text-slate-300 border border-slate-600/50 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-600 hover:text-white transition-all">
            ← Home
          </Link>
        </div>

        {/* Search Bar for Users */}
        <form onSubmit={searchUsers} className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-500 text-xl">🔍</span>
            </div>
            <input 
              type="text" 
              placeholder="Search users by username..." 
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-800/50 text-white border border-slate-700/50 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-lg shadow-inner transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className="bg-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] text-white">Find Users</button>
        </form>

        {/* User Search Results */}
        {!selectedUser && hasSearched && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-3">Users Found</h2>
            {users.length === 0 ? (
              <p className="text-slate-400 text-lg">No users found with that name.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(user => (
                  <div key={user.UserID} className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50 flex justify-between items-center shadow-lg hover:border-indigo-500/50 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center font-bold text-xl uppercase">
                        {user.Username.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{user.Username}</h3>
                      </div>
                    </div>
                    <button 
                      onClick={() => viewWatchlist(user.Username)}
                      className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 px-4 py-2 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all"
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Friend's Watchlist */}
        {selectedUser && (
          <div className="mt-8 animate-fade-in">
            <div className="flex items-center justify-between mb-8 border-b border-slate-700 pb-4">
              <h2 className="text-3xl font-black text-white">
                <span className="text-indigo-400">{selectedUser}'s</span> Watchlist
              </h2>
              <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-white font-bold underline underline-offset-4">
                Close Profile
              </button>
            </div>

            {friendWatchlist.length === 0 ? (
              <p className="text-slate-400 text-lg">{selectedUser} hasn't added any series yet.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {friendWatchlist.map((item) => (
                  <div key={item.SeriesID} className="bg-slate-800/40 rounded-2xl overflow-hidden shadow-lg border border-slate-700/50 flex flex-col group hover:border-indigo-500/50 transition-all hover:-translate-y-1">
                    <Link to={`/series/${item.SeriesID}`} className="relative overflow-hidden aspect-[2/3]">
                      {item.PosterURL ? (
                        <img src={item.PosterURL} alt={item.Title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">No Image</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent opacity-90"></div>
                      
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 text-xs font-bold rounded-lg backdrop-blur-md border shadow-sm
                          ${item.Status === 'Completed' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 
                            item.Status === 'Watching' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' : 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'}`}>
                          {item.Status}
                        </span>
                      </div>
                    </Link>
                    <div className="p-4 flex flex-col flex-1 justify-between -mt-16 relative z-10">
                      <div>
                        <h3 className="font-bold text-lg text-white mb-1 line-clamp-1 drop-shadow-md">{item.Title}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-yellow-400 font-bold bg-slate-900/50 w-fit px-2 py-1 rounded-md border border-slate-700/50">
                          <span>★</span> {item.Rating > 0 ? `${item.Rating}/5` : <span className="text-slate-400 font-normal">Unrated</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}