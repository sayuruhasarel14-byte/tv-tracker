const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');

// 1. මුලින්ම Express App එක Initialize කළ යුතුයි
const app = express();
app.use(cors());
app.use(express.json());

// 2. ඊළඟට Database Connection එක හදාගත යුතුයි
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed: ' + err.message);
    } else {
        console.log('Connected to the Local MySQL database!');
    }
});

// 3. ඊට පස්සේ Middleware Functions ලියන්න පුළුවන්
// Token Check Middleware
const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ error: "Access Denied! Please login." });

    try {
        const verified = jwt.verify(token.split(" ")[1], process.env.JWT_SECRET);
        req.user = verified; // දැන් req.user.id එකෙන් අපි දන්නවා කවුද Request එක කරන්නේ කියලා
        next();
    } catch (err) {
        res.status(400).json({ error: "Invalid Token!" });
    }
};

// 4. දැන් තමයි ඔක්කොම Routes (API Endpoints) ලියන්නේ

// Test Route
app.get('/', (req, res) => {
    res.send('TV Tracker Backend is running smoothly!');
});

// User Registration
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    try {
        // Password එක Encrypt කිරීම (Hash කිරීම)
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const sql = "INSERT INTO Users (Username, Email, PasswordHash) VALUES (?, ?, ?)";
        db.query(sql, [username, email, hashedPassword], (err, result) => {
            if (err) {
                if(err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "Username or Email already exists!" });
                return res.status(500).json({ error: err.message });
            }
            res.status(201).json({ message: "User registered successfully!" });
        });
    } catch (err) {
        res.status(500).json({ error: "Server Error" });
    }
});

// User Login
app.post('/login', (req, res) => {
    const { email, password } = req.body;
    
    const sql = "SELECT * FROM Users WHERE Email = ?";
    db.query(sql, [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        
        // User කෙනෙක් නැත්නම්
        if (results.length === 0) return res.status(404).json({ error: "User not found!" });

        const user = results[0];
        
        // Password එක හරියනවාද බැලීම
        const match = await bcrypt.compare(password, user.PasswordHash);
        if (!match) return res.status(401).json({ error: "Wrong password!" });

        // JWT Token එකක් සෑදීම
        const token = jwt.sign(
            { id: user.UserID, username: user.Username }, 
            process.env.JWT_SECRET, 
            { expiresIn: '7d' } // දවස් 7ක් යනකන් Login වෙලා ඉන්න පුළුවන්
        );
        
        res.json({ message: "Logged in successfully!", token, username: user.Username });
    });
});

// Search TV Series using TMDB API
app.get('/api/search/tv', async (req, res) => {
    const query = req.query.q; // Frontend එකෙන් එවන Search නම (උදා: Peaky Blinders)
    
    if (!query) {
        return res.status(400).json({ error: "Please provide a search term!" });
    }

    try {
        const tmdbUrl = `https://api.themoviedb.org/3/search/tv?api_key=${process.env.TMDB_API_KEY}&query=${encodeURIComponent(query)}`;
        const response = await axios.get(tmdbUrl);
        
        // TMDB එකෙන් එන Data කෙලින්ම Frontend එකට යවනවා
        res.json(response.data.results);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch data from TMDB" });
    }
});

// Add or Update Series in Watchlist
app.post('/api/watchlist', verifyToken, (req, res) => {
    const { seriesId, title, posterUrl, status, rating, review } = req.body;
    const userId = req.user.id; // මේක එන්නේ verifyToken middleware එකෙන්

    // 1. මුලින්ම TV_Series table එකේ මේ Series එක තියෙනවද බලනවා
    const checkSeriesSql = `SELECT * FROM TV_Series WHERE SeriesID = ?`;
    
    db.query(checkSeriesSql, [seriesId], (err, seriesResults) => {
        if (err) {
            console.error("Database error checking series:", err);
            return res.status(500).json({ error: "Database error" });
        }

        // Series එක නැත්නම් එකතු කරනවා
        if (seriesResults.length === 0) {
            const insertSeriesSql = `INSERT INTO TV_Series (SeriesID, Title, PosterURL) VALUES (?, ?, ?)`;
            db.query(insertSeriesSql, [seriesId, title, posterUrl], (err) => {
                if (err) {
                    console.error("Error saving series details:", err);
                    return res.status(500).json({ error: "Error saving series details" });
                }
                addToUserWatchlist(); // Series එක දැම්මට පස්සේ Watchlist එකට දානවා
            });
        } else {
            addToUserWatchlist(); // Series එක දැනටමත් තියෙනවා නම් කෙලින්ම Watchlist එකට දානවා
        }
    });

    // 2. Watchlist Table එකට දාන Function එක
    function addToUserWatchlist() {
        const checkWatchlistSql = `SELECT * FROM Watchlist WHERE UserID = ? AND SeriesID = ?`;
        
        db.query(checkWatchlistSql, [userId, seriesId], (err, results) => {
            if (err) {
                console.error("Database error checking watchlist:", err);
                return res.status(500).json({ error: "Database error" });
            }

            if (results.length > 0) {
                // කලින් Add කරලා නම් Update කරනවා
                const updateSql = `UPDATE Watchlist SET Status=?, Rating=?, Review=? WHERE UserID=? AND SeriesID=?`;
                db.query(updateSql, [status, rating, review, userId, seriesId], (err) => {
                    if (err) {
                        console.error("Error updating watchlist:", err);
                        return res.status(500).json({ error: "Error updating watchlist" });
                    }
                    res.json({ message: "Watchlist updated!" });
                });
            } else {
                // අලුතින්ම Add කරනවා
                const insertSql = `INSERT INTO Watchlist (UserID, SeriesID, Status, Rating, Review) VALUES (?, ?, ?, ?, ?)`;
                db.query(insertSql, [userId, seriesId, status, rating, review], (err) => {
                    if (err) {
                        console.error("Error adding to watchlist:", err);
                        return res.status(500).json({ error: "Error adding to watchlist" });
                    }
                    res.json({ message: "Added to watchlist successfully!" });
                });
            }
        });
    }
});

// Get User's Watchlist
app.get('/api/watchlist/:username', (req, res) => {
    const username = req.params.username;

    // Database එකෙන් අදාළ User ව හොයාගෙන එයාගේ Watchlist එක ගන්නවා
    const sql = `
        SELECT w.Status, w.Rating, w.Review, w.UpdatedAt, t.SeriesID, t.Title, t.PosterURL 
        FROM Watchlist w
        JOIN Users u ON w.UserID = u.UserID
        JOIN TV_Series t ON w.SeriesID = t.SeriesID
        WHERE u.Username = ?
        ORDER BY w.UpdatedAt DESC
    `;

    db.query(sql, [username], (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// Get Series Details from TMDB (with Cast & Wallpapers)
app.get('/api/series/:id', async (req, res) => {
    const seriesId = req.params.id;
    try {
        // append_to_response=credits,images මගින් අමතර විස්තර එකපාර ගන්නවා
        const tmdbUrl = `https://api.themoviedb.org/3/tv/${seriesId}?api_key=${process.env.TMDB_API_KEY}&append_to_response=credits,images`;
        const response = await axios.get(tmdbUrl);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch series details" });
    }
});

// Get Trending/Popular TV Series
app.get('/api/trending/tv', async (req, res) => {
    try {
        const tmdbUrl = `https://api.themoviedb.org/3/trending/tv/week?api_key=${process.env.TMDB_API_KEY}`;
        const response = await axios.get(tmdbUrl);
        res.json(response.data.results);
    } catch (error) {
        console.error("Trending fetch error:", error);
        res.status(500).json({ error: "Failed to fetch trending series" });
    }
});

// Get IMDb & Rotten Tomatoes Ratings using OMDb API
app.get('/api/omdb/:title', async (req, res) => {
    try {
        const omdbUrl = `http://www.omdbapi.com/?t=${encodeURIComponent(req.params.title)}&apikey=${process.env.OMDB_API_KEY}`;
        const response = await axios.get(omdbUrl);
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to fetch OMDb data" });
    }
});

// Search for other users
app.get('/api/users/search', (req, res) => {
    const searchQuery = req.query.q;
    // අකුරු වලට ගැලපෙන නම් තියෙන අයව හොයනවා
    const sql = `SELECT UserID, Username, Email FROM Users WHERE Username LIKE ? LIMIT 10`;
    
    db.query(sql, [`%${searchQuery}%`], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error searching users" });
        res.json(results);
    });
});

// Get a specific user's public watchlist
app.get('/api/users/:username/watchlist', (req, res) => {
    const username = req.params.username;
    const sql = `
        SELECT w.*, t.Title, t.PosterURL 
        FROM Watchlist w
        JOIN Users u ON w.UserID = u.UserID
        JOIN TV_Series t ON w.SeriesID = t.SeriesID
        WHERE u.Username = ?
        ORDER BY w.UpdatedAt DESC
    `;
    
    db.query(sql, [username], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error fetching friend's watchlist" });
        res.json(results);
    });
});

// 5. අන්තිමටම Server එක Start කරනවා
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});