import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

export default function SeriesDetails() {
  const { id } = useParams();
  const [series, setSeries] = useState(null);
  const [omdb, setOmdb] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/series/${id}`);
        setSeries(res.data);

        // OMDb API එකට කතා කිරීම (Error ආවොත් App එක Crash වෙන්නෙ නැති වෙන්න හදලා තියෙන්නේ)
        try {
          const omdbRes = await axios.get(`http://localhost:3001/api/omdb/${res.data.name}`);
          if(omdbRes.data && omdbRes.data.Response !== "False") {
            setOmdb(omdbRes.data);
          }
        } catch (omdbErr) {
          console.error("OMDb fetch failed", omdbErr);
        }

      } catch (err) {
        console.error(err);
      }
    };
    fetchDetails();
  }, [id]);

  // Loading Animation එක
  if (!series) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
    </div>
  );

  const backdrop = series.backdrop_path ? `https://image.tmdb.org/t/p/original${series.backdrop_path}` : '';
  const poster = series.poster_path ? `https://image.tmdb.org/t/p/w500${series.poster_path}` : '';

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-indigo-500 selection:text-white pb-12">
      
      {/* 1. Backdrop Section - ලස්සන Gradient Fade එකක් සහිතව */}
      <div 
        className="w-full h-[60vh] lg:h-[70vh] bg-cover bg-center relative"
        style={{ backgroundImage: `url(${backdrop})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f172a] via-[#0f172a]/50 to-transparent"></div>
        
        <button onClick={() => window.history.back()} className="absolute top-8 left-8 lg:left-12 flex items-center gap-2 text-slate-300 hover:text-white transition font-semibold z-50 group">
          <span className="group-hover:-translate-x-1 transition-transform">←</span> Back
        </button>
      </div>

      {/* 2. Main Content Section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-48 lg:-mt-64 relative z-10 flex flex-col lg:flex-row gap-10">
        
        {/* Poster - ලස්සන Shadow එකක් එක්ක */}
        <div className="w-64 lg:w-80 flex-shrink-0 mx-auto lg:mx-0">
          {poster ? (
            <img src={poster} alt={series.name} className="w-full rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-slate-700/50" />
          ) : (
            <div className="w-full aspect-[2/3] bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl flex items-center justify-center text-slate-500">No Poster</div>
          )}
        </div>

        {/* Details */}
        <div className="flex-1 mt-4 lg:mt-12">
          <h1 className="text-4xl lg:text-6xl font-black text-white tracking-tight mb-3 drop-shadow-md">
            {series.name}
          </h1>
          
          {/* Tags (Year, Seasons, Status) */}
          <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-400 mb-8">
            <span>{series.first_air_date?.substring(0, 4)}</span>
            <span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span>
            <span>{series.number_of_seasons} Seasons</span>
            <span className="w-1.5 h-1.5 bg-slate-600 rounded-full"></span>
            <span className={`px-2.5 py-0.5 rounded-md border ${series.status === 'Ended' ? 'border-red-500/30 text-red-400' : 'border-green-500/30 text-green-400'}`}>
              {series.status}
            </span>
          </div>

          {/* 3. Premium Ratings Display (Glassmorphism effect) */}
          <div className="flex flex-wrap items-center gap-4 mb-10">
            {/* TMDB Rating (මේක අනිවාර්යයෙන්ම පෙන්වනවා) */}
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50 shadow-sm">
              <span className="text-yellow-400 text-xl">★</span>
              <span className="text-white font-bold text-lg">{series.vote_average?.toFixed(1)}</span>
              <span className="text-slate-400 text-sm">/10 TMDB</span>
            </div>

            {/* OMDb Ratings (IMDb, Rotten Tomatoes ආවොත් විතරක් පෙන්වයි) */}
            {omdb && omdb.Ratings && omdb.Ratings.map(rating => (
              <div key={rating.Source} className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50 shadow-sm">
                <span className="text-white font-bold text-lg">{rating.Value}</span>
                <span className="text-slate-400 text-sm">{rating.Source === "Internet Movie Database" ? "IMDb" : rating.Source}</span>
              </div>
            ))}
          </div>

          <div className="mb-12">
            <h3 className="text-xl font-bold text-white mb-4">Overview</h3>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl opacity-90">
              {series.overview}
            </p>
          </div>

          {/* 4. Professional Cast Section (Circular Avatars) */}
          <div>
            <h3 className="text-xl font-bold text-white mb-6">Top Cast</h3>
            <div className="flex overflow-x-auto gap-6 pb-6 scrollbar-hide">
              {series.credits?.cast?.slice(0, 8).map(actor => (
                <div key={actor.id} className="flex flex-col items-center w-28 flex-shrink-0 group cursor-pointer">
                  <div className="w-24 h-24 rounded-full overflow-hidden mb-3 border-2 border-transparent group-hover:border-indigo-500 transition-all duration-300 shadow-lg">
                    {actor.profile_path ? (
                      <img src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`} alt={actor.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-500 text-xs">No Pic</div>
                    )}
                  </div>
                  <p className="font-bold text-sm text-slate-200 text-center line-clamp-1 w-full">{actor.name}</p>
                  <p className="text-xs text-slate-400 text-center line-clamp-1 w-full">{actor.character}</p>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}