import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const [trending, setTrending] = useState([]);
  const [recentWatchlist, setRecentWatchlist] = useState([]);
  
  const navigate = useNavigate();

  useEffect(() => {
    const username = localStorage.getItem('username');
    if (!username) {
      navigate('/login');
      return;
    }

    // 1. Trending Series ටික ගේනවා
    axios.get('http://localhost:3001/api/trending/tv')
      .then(res => setTrending(res.data.slice(0, 10))) 
      .catch(err => console.error(err));

    // 2. ඔයාගේ Watchlist එක ගෙනල්ලා අලුත්ම ඒවයින් 8ක් ගන්නවා
    axios.get(`http://localhost:3001/api/watchlist/${username}`)
      .then(res => {
        setRecentWatchlist(res.data.reverse().slice(0, 8)); 
      })
      .catch(err => console.error(err));
  }, [navigate]);

  const searchSeries = async (e) => {
    e.preventDefault();
    if(!query.trim()) {
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await axios.get(`http://localhost:3001/api/search/tv?q=${query}`);
      setResults(res.data);
    } catch (err) {
      alert('Error searching TV series');
    }
  };

  const addToWatchlist = async (series) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/api/watchlist', {
        seriesId: series.id,
        title: series.name || series.Title,
        posterUrl: series.poster_path ? `https://image.tmdb.org/t/p/w500${series.poster_path}` : series.PosterURL,
        status: 'Plan to Watch', 
        rating: null,
        review: ''
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(`Added to your watchlist!`);
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add to watchlist');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500 selection:text-white p-4 md:p-8 pb-20">
      <div className="max-w-7xl mx-auto">
        
        {/* Header (Find Friends Button එක මෙතනට දැම්මා) */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-slate-800/50 backdrop-blur-md p-5 rounded-2xl border border-slate-700/50 shadow-lg gap-4 md:gap-0">
          <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
            <span className="text-indigo-500">📺</span> TV Tracker
          </h1>
          <div className="flex items-center gap-3 md:gap-4 flex-wrap justify-center">
            <span className="text-slate-300 font-medium hidden md:inline mr-2">Hello, {localStorage.getItem('username')}</span>
            
            {/* අලුතින් දාපු Find Friends Button එක */}
            <Link to="/friends" className="bg-slate-700/50 text-slate-300 border border-slate-600/50 px-4 md:px-5 py-2.5 rounded-xl font-bold hover:bg-slate-600 hover:text-white transition-all shadow-sm text-sm md:text-base">
              🔍 Find Friends
            </Link>

            <Link to="/profile" className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 px-4 md:px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-600 hover:text-white transition-all shadow-sm text-sm md:text-base">
              👤 My Profile
            </Link>
            
            <button onClick={handleLogout} className="bg-red-500/10 text-red-400 border border-red-500/20 px-4 md:px-5 py-2.5 rounded-xl font-bold hover:bg-red-500 hover:text-white transition-all text-sm md:text-base">
              Logout
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={searchSeries} className="flex flex-col md:flex-row gap-4 mb-12">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="text-slate-500 text-xl">🔍</span>
            </div>
            <input 
              type="text" 
              placeholder="Search for any TV series... (eg: Stranger Things)" 
              className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-800/50 text-white border border-slate-700/50 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-lg shadow-inner transition-all"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                if(e.target.value === '') setIsSearching(false);
              }}
            />
          </div>
          <button type="submit" className="bg-indigo-600 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] text-white">Search</button>
        </form>

        {/* Search කරද්දී එන Results Grid එක */}
        {isSearching ? (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-slate-700 pb-3">Search Results</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {results.map((series) => (
                <div key={series.id} className="bg-slate-800/40 rounded-2xl overflow-hidden shadow-lg border border-slate-700/50 flex flex-col group hover:border-indigo-500/50 transition-all hover:-translate-y-1">
                  <Link to={`/series/${series.id}`} className="relative overflow-hidden aspect-[2/3]">
                    {series.poster_path ? (
                      <img src={`https://image.tmdb.org/t/p/w500${series.poster_path}`} alt={series.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">No Image</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                  </Link>
                  <div className="p-5 flex flex-col flex-1 justify-between -mt-12 relative z-10">
                    <div className="mb-4">
                      <h3 className="font-bold text-lg text-white mb-1 line-clamp-1 drop-shadow-md">{series.name}</h3>
                      <p className="text-sm text-slate-400 font-medium">{series.first_air_date ? series.first_air_date.substring(0, 4) : 'N/A'}</p>
                    </div>
                    <button onClick={() => addToWatchlist(series)} className="w-full bg-slate-700/50 text-slate-200 border border-slate-600/50 py-2 rounded-xl font-bold hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30 transition-all">+ Add to Watchlist</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Search කරන්නේ නැති වෙලාවට පෙන්වන Recommendations */
          <div className="space-y-12">
            
            {/* 1. Recently Added to Watchlist Section */}
            {recentWatchlist.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700 pb-3">
                  <span className="text-indigo-400">🕒</span> Recently Activity
                </h2>
                {/* Horizontal Scroll Bar */}
                <div className="flex overflow-x-auto gap-6 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {recentWatchlist.map((item) => (
                    <div key={item.SeriesID} className="w-40 md:w-48 flex-shrink-0 bg-slate-800/40 rounded-2xl overflow-hidden shadow-lg border border-slate-700/50 group hover:border-indigo-500/50 transition-all hover:-translate-y-1">
                      <Link to={`/series/${item.SeriesID}`} className="relative overflow-hidden aspect-[2/3] block">
                        {item.PosterURL ? (
                          <img src={item.PosterURL} alt={item.Title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 text-sm">No Image</div>
                        )}
                        <div className="absolute top-2 right-2 px-2 py-1 text-[10px] font-bold rounded-md bg-slate-900/80 text-white backdrop-blur-md border border-slate-700/50">
                          {item.Status}
                        </div>
                      </Link>
                      <div className="p-3">
                        <h3 className="font-bold text-sm text-white line-clamp-1">{item.Title}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Trending This Week Section */}
            <div>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 border-b border-slate-700 pb-3">
                <span className="text-red-500">🔥</span> Trending This Week
              </h2>
              <div className="flex overflow-x-auto gap-6 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {trending.map((series) => (
                  <div key={series.id} className="w-40 md:w-48 flex-shrink-0 bg-slate-800/40 rounded-2xl overflow-hidden shadow-lg border border-slate-700/50 flex flex-col group hover:border-indigo-500/50 transition-all hover:-translate-y-1">
                    <Link to={`/series/${series.id}`} className="relative overflow-hidden aspect-[2/3]">
                      {series.poster_path ? (
                        <img src={`https://image.tmdb.org/t/p/w500${series.poster_path}`} alt={series.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500">No Image</div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent opacity-80"></div>
                    </Link>
                    <div className="p-3 flex flex-col flex-1 justify-between -mt-8 relative z-10">
                      <h3 className="font-bold text-sm text-white mb-2 line-clamp-1 drop-shadow-md">{series.name}</h3>
                      <button onClick={() => addToWatchlist(series)} className="w-full bg-slate-700/50 text-slate-200 border border-slate-600/50 py-1.5 rounded-lg text-xs font-bold hover:bg-green-500/20 hover:text-green-400 hover:border-green-500/30 transition-all">+ Add</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}