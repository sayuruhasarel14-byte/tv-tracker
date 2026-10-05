import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import Profile from './pages/Profile';
import SeriesDetails from './pages/SeriesDetails';
import Friends from './pages/Friends'; // මේක අලුතින් දාන්න

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} /> 
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/series/:id" element={<SeriesDetails />} />
        <Route path="/friends" element={<Friends />} /> {/* මේක අලුතින් දාන්න */}
      </Routes>
    </Router>
  );
}

export default App;