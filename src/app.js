import React, { useState, useEffect, useRef } from "react";

const GENRES = ["All", "Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance", "Thriller", "Animation", "Documentary"];

const SAMPLE_MOVIES = [
  { id: "movie_1", title: "Dune: Part Two", year: 2024, genre: "Sci-Fi", poster: "🏜️", addedBy: "CinemaFan", description: "The epic continuation of Paul Atreides' journey on Arrakis.", avgRating: 4.7, reviews: [{ user: "StargazerX", rating: 5, text: "Absolutely breathtaking visuals and an unforgettable score. Denis Villeneuve at his peak.", date: "2024-03-10" }] },
  { id: "movie_2", title: "Oppenheimer", year: 2023, genre: "Drama", poster: "☢️", addedBy: "FilmBuff99", description: "The story of J. Robert Oppenheimer and the creation of the atomic bomb.", avgRating: 4.8, reviews: [{ user: "MovieNerd", rating: 5, text: "Cillian Murphy delivers a career-defining performance. A masterpiece of cinema.", date: "2023-08-20" }] },
  { id: "movie_3", title: "Everything Everywhere All at Once", year: 2022, genre: "Sci-Fi", poster: "🌌", addedBy: "QuantumDream", description: "A middle-aged Chinese immigrant discovers she can access parallel universe versions of herself.", avgRating: 4.9, reviews: [{ user: "CinephileRose", rating: 5, text: "The most creative and emotionally resonant film I've seen in years. Pure genius.", date: "2022-11-05" }] },
];

function StarRating({ value, onChange, size = "md" }) {
  const [hover, setHover] = useState(0);
  const s = size === "sm" ? "text-lg" : "text-2xl";
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(star => (
        <button key={star} type="button"
          className={`${s} transition-transform hover:scale-125 ${onChange ? "cursor-pointer" : "cursor-default"}`}
          style={{ color: star <= (hover || value) ? "#f59e0b" : "#374151", textShadow: star <= (hover || value) ? "0 0 8px #f59e0b88" : "none" }}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          onClick={() => onChange && onChange(star)}>★</button>
      ))}
    </div>
  );
}

function MovieCard({ movie, onClick }) {
  return (
    <div onClick={onClick} className="cursor-pointer group" style={{
      background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      border: "1px solid #e9456022",
      borderRadius: "16px",
      padding: "20px",
      transition: "all 0.3s ease",
      position: "relative",
      overflow: "hidden",
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = "#e9456066"; e.currentTarget.style.boxShadow = "0 20px 40px #e9456022"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = "#e94560222"; e.currentTarget.style.boxShadow = ""; }}>
      <div style={{ fontSize: "56px", marginBottom: "12px", lineHeight: 1 }}>{movie.poster}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", color: "#f0e6d3", fontWeight: 700, lineHeight: 1.2, flex: 1, marginRight: "8px" }}>{movie.title}</h3>
        <span style={{ fontSize: "0.75rem", color: "#e94560", background: "#e9456022", padding: "2px 8px", borderRadius: "20px", whiteSpace: "nowrap", border: "1px solid #e9456044" }}>{movie.genre}</span>
      </div>
      <p style={{ color: "#8892a4", fontSize: "0.8rem", marginBottom: "12px" }}>{movie.year} · by {movie.addedBy}</p>
      <p style={{ color: "#a0aabb", fontSize: "0.85rem", lineHeight: 1.5, marginBottom: "14px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{movie.description}</p>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <StarRating value={Math.round(movie.avgRating)} size="sm" />
        <span style={{ color: "#e94560", fontFamily: "'Playfair Display', serif", fontSize: "1.1rem", fontWeight: 700 }}>{movie.avgRating.toFixed(1)}</span>
      </div>
      <div style={{ color: "#566476", fontSize: "0.75rem", marginTop: "6px" }}>{movie.reviews.length} review{movie.reviews.length !== 1 ? "s" : ""}</div>
    </div>
  );
}

export default function App() {
  const [movies, setMovies] = useState([]);
  const [view, setView] = useState("home"); // home | detail | add
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [genre, setGenre] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("rating");
  const [loaded, setLoaded] = useState(false);
  const [reviewForm, setReviewForm] = useState({ user: "", rating: 0, text: "" });
  const [newMovie, setNewMovie] = useState({ title: "", year: new Date().getFullYear(), genre: "Drama", poster: "🎬", addedBy: "", description: "" });
  const [toast, setToast] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  const POSTERS = ["🎬","🎭","🎪","🌟","🔥","💫","🌌","🏔️","🌊","🎠","🦋","⚡","🌙","🎯","💎","🗡️","🌸","🏜️","☢️","🧬"];

  useEffect(() => {
    loadMovies();
  }, []);

  async function loadMovies() {
    try {
      const result = await window.storage.get("cinemaclub_movies");
      if (result && result.value) {
        setMovies(JSON.parse(result.value));
      } else {
        setMovies(SAMPLE_MOVIES);
        await window.storage.set("cinemaclub_movies", JSON.stringify(SAMPLE_MOVIES), true);
      }
    } catch {
      setMovies(SAMPLE_MOVIES);
    }
    setLoaded(true);
  }

  async function saveMovies(updated) {
    setMovies(updated);
    try {
      await window.storage.set("cinemaclub_movies", JSON.stringify(updated), true);
    } catch {}
  }

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  async function submitReview() {
    if (!reviewForm.user.trim() || !reviewForm.rating || !reviewForm.text.trim()) {
      showToast("Please fill all fields and add a star rating", "error"); return;
    }
    setReviewSubmitting(true);
    const newReview = { user: reviewForm.user.trim(), rating: reviewForm.rating, text: reviewForm.text.trim(), date: new Date().toISOString().split("T")[0] };
    const updated = movies.map(m => {
      if (m.id !== selectedMovie.id) return m;
      const reviews = [...m.reviews, newReview];
      const avgRating = Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10;
      return { ...m, reviews, avgRating };
    });
    await saveMovies(updated);
    const refreshed = updated.find(m => m.id === selectedMovie.id);
    setSelectedMovie(refreshed);
    setReviewForm({ user: "", rating: 0, text: "" });
    setReviewSubmitting(false);
    showToast("Review posted! 🎉");
  }

  async function submitMovie() {
    if (!newMovie.title.trim() || !newMovie.addedBy.trim() || !newMovie.description.trim()) {
      showToast("Please fill all required fields", "error"); return;
    }
    const movie = { ...newMovie, id: "movie_" + Date.now(), title: newMovie.title.trim(), addedBy: newMovie.addedBy.trim(), description: newMovie.description.trim(), year: parseInt(newMovie.year), avgRating: 0, reviews: [] };
    const updated = [movie, ...movies];
    await saveMovies(updated);
    setNewMovie({ title: "", year: new Date().getFullYear(), genre: "Drama", poster: "🎬", addedBy: "", description: "" });
    setView("home");
    showToast("Movie recommended! 🎬");
  }

  const filtered = movies.filter(m => {
    const matchGenre = genre === "All" || m.genre === genre;
    const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || m.description.toLowerCase().includes(search.toLowerCase());
    return matchGenre && matchSearch;
  }).sort((a, b) => {
    if (sortBy === "rating") return b.avgRating - a.avgRating;
    if (sortBy === "newest") return b.year - a.year;
    if (sortBy === "reviews") return b.reviews.length - a.reviews.length;
    return 0;
  });

  const styles = {
    app: { minHeight: "100vh", background: "#080c14", color: "#f0e6d3", fontFamily: "'EB Garamond', serif" },
    header: { background: "linear-gradient(180deg, #0d1117 0%, transparent 100%)", borderBottom: "1px solid #e9456022", padding: "0 24px", position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(20px)" },
    headerInner: { maxWidth: "1100px", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: "64px" },
    logo: { fontFamily: "'Playfair Display', serif", fontSize: "1.5rem", fontWeight: 900, background: "linear-gradient(135deg, #e94560, #f0c27f)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    main: { maxWidth: "1100px", margin: "0 auto", padding: "32px 24px" },
    btn: (variant = "primary") => ({
      padding: variant === "sm" ? "6px 16px" : "10px 24px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontFamily: "'EB Garamond', serif",
      fontSize: variant === "sm" ? "0.85rem" : "1rem",
      fontWeight: 600,
      transition: "all 0.2s",
      ...(variant === "primary" ? { background: "linear-gradient(135deg, #e94560, #c73652)", color: "#fff", boxShadow: "0 4px 15px #e9456044" } :
         variant === "ghost" ? { background: "transparent", color: "#8892a4", border: "1px solid #ffffff11" } :
         { background: "#1a1a2e", color: "#f0e6d3", border: "1px solid #e9456033" })
    }),
    input: { background: "#0d1117", border: "1px solid #e9456033", borderRadius: "8px", padding: "10px 14px", color: "#f0e6d3", fontFamily: "'EB Garamond', serif", fontSize: "1rem", outline: "none", width: "100%" },
    label: { display: "block", color: "#8892a4", fontSize: "0.85rem", marginBottom: "6px", fontFamily: "'EB Garamond', serif" },
  };

  if (!loaded) return (
    <div style={{ ...styles.app, display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "4rem", marginBottom: "16px", animation: "pulse 1.5s infinite" }}>🎬</div>
        <p style={{ color: "#8892a4", fontFamily: "'Playfair Display', serif" }}>Loading CinemaClub...</p>
      </div>
    </div>
  );

  return (
    <div style={styles.app}>
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700;900&family=EB+Garamond:wght@400;500;600&display=swap" rel="stylesheet" />

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: "80px", right: "24px", zIndex: 1000, background: toast.type === "error" ? "#c73652" : "#1a5c3a", color: "#fff", padding: "12px 20px", borderRadius: "10px", fontFamily: "'EB Garamond', serif", boxShadow: "0 8px 30px #00000066", border: "1px solid #ffffff22", animation: "slideIn 0.3s ease" }}>
          {toast.msg}
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        input:focus, textarea:focus, select:focus { border-color: #e94560 !important; box-shadow: 0 0 0 3px #e9456022 !important; }
        ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #080c14; } ::-webkit-scrollbar-thumb { background: #e9456044; border-radius: 3px; }
        .movie-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 20px; }
      `}</style>

      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <button onClick={() => setView("home")} style={{ background: "none", border: "none", cursor: "pointer" }}>
            <span style={styles.logo}>🎬 CinemaClub</span>
          </button>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            {view !== "home" && <button style={styles.btn("ghost")} onClick={() => setView("home")}>← Back</button>}
            <button style={styles.btn("primary")} onClick={() => setView("add")}>+ Recommend</button>
          </div>
        </div>
      </header>

      <main style={styles.main}>
        {/* HOME VIEW */}
        {view === "home" && (
          <div style={{ animation: "fadeUp 0.4s ease" }}>
            <div style={{ textAlign: "center", marginBottom: "40px" }}>
              <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "12px", background: "linear-gradient(135deg, #f0e6d3 30%, #e94560)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                The Films Worth Watching
              </h1>
              <p style={{ color: "#8892a4", fontSize: "1.1rem" }}>Curated recommendations from fellow cinephiles</p>
            </div>

            {/* Search & Filters */}
            <div style={{ display: "flex", gap: "12px", marginBottom: "20px", flexWrap: "wrap" }}>
              <input style={{ ...styles.input, flex: "1", minWidth: "200px" }} placeholder="🔍  Search movies..." value={search} onChange={e => setSearch(e.target.value)} />
              <select style={{ ...styles.input, width: "auto" }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
                <option value="rating">Top Rated</option>
                <option value="newest">Newest</option>
                <option value="reviews">Most Reviewed</option>
              </select>
            </div>

            {/* Genre pills */}
            <div style={{ display: "flex", gap: "8px", marginBottom: "28px", flexWrap: "wrap" }}>
              {GENRES.map(g => (
                <button key={g} onClick={() => setGenre(g)} style={{ padding: "6px 16px", borderRadius: "20px", border: "1px solid", borderColor: genre === g ? "#e94560" : "#ffffff11", background: genre === g ? "#e9456022" : "transparent", color: genre === g ? "#e94560" : "#566476", cursor: "pointer", fontFamily: "'EB Garamond', serif", fontSize: "0.9rem", transition: "all 0.2s" }}>
                  {g}
                </button>
              ))}
            </div>

            {/* Stats bar */}
            <div style={{ display: "flex", gap: "24px", marginBottom: "28px", padding: "16px 20px", background: "#0d1117", borderRadius: "12px", border: "1px solid #e9456011" }}>
              {[["🎬", movies.length, "Movies"], ["⭐", movies.filter(m => m.avgRating > 0).length, "Rated"], ["📝", movies.reduce((s, m) => s + m.reviews.length, 0), "Reviews"]].map(([icon, count, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.2rem" }}>{icon}</span>
                  <div>
                    <div style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: "#e94560" }}>{count}</div>
                    <div style={{ fontSize: "0.75rem", color: "#566476" }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px", color: "#566476" }}>
                <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🎞️</div>
                <p>No movies found. Be the first to recommend one!</p>
              </div>
            ) : (
              <div className="movie-grid">
                {filtered.map(movie => <MovieCard key={movie.id} movie={movie} onClick={() => { setSelectedMovie(movie); setView("detail"); }} />)}
              </div>
            )}
          </div>
        )}

        {/* DETAIL VIEW */}
        {view === "detail" && selectedMovie && (
          <div style={{ animation: "fadeUp 0.4s ease", maxWidth: "760px", margin: "0 auto" }}>
            <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: "20px", padding: "32px", marginBottom: "28px", border: "1px solid #e9456022" }}>
              <div style={{ display: "flex", gap: "24px", alignItems: "flex-start", flexWrap: "wrap" }}>
                <div style={{ fontSize: "80px", lineHeight: 1 }}>{selectedMovie.poster}</div>
                <div style={{ flex: 1, minWidth: "200px" }}>
                  <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "0.8rem", color: "#e94560", background: "#e9456022", padding: "3px 10px", borderRadius: "20px", border: "1px solid #e9456044" }}>{selectedMovie.genre}</span>
                    <span style={{ color: "#566476", fontSize: "0.85rem" }}>{selectedMovie.year}</span>
                  </div>
                  <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem, 4vw, 2.2rem)", fontWeight: 900, color: "#f0e6d3", marginBottom: "8px", lineHeight: 1.2 }}>{selectedMovie.title}</h1>
                  <p style={{ color: "#566476", fontSize: "0.9rem", marginBottom: "14px" }}>Recommended by <span style={{ color: "#e94560" }}>{selectedMovie.addedBy}</span></p>
                  <p style={{ color: "#a0aabb", lineHeight: 1.7, marginBottom: "16px" }}>{selectedMovie.description}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <StarRating value={Math.round(selectedMovie.avgRating)} />
                    <span style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.8rem", fontWeight: 700, color: "#e94560" }}>{selectedMovie.avgRating > 0 ? selectedMovie.avgRating.toFixed(1) : "—"}</span>
                    <span style={{ color: "#566476", fontSize: "0.9rem" }}>({selectedMovie.reviews.length} reviews)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.4rem", fontWeight: 700, color: "#f0e6d3", marginBottom: "20px" }}>Reviews</h2>
            {selectedMovie.reviews.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px", color: "#566476", background: "#0d1117", borderRadius: "12px", marginBottom: "24px" }}>
                <p>No reviews yet. Be the first!</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "28px" }}>
                {selectedMovie.reviews.map((r, i) => (
                  <div key={i} style={{ background: "#0d1117", borderRadius: "12px", padding: "20px", border: "1px solid #ffffff08" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: `hsl(${r.user.charCodeAt(0) * 7}, 60%, 40%)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.85rem", fontWeight: 700, color: "#fff" }}>{r.user[0].toUpperCase()}</div>
                        <span style={{ fontWeight: 600, color: "#f0e6d3" }}>{r.user}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <StarRating value={r.rating} size="sm" />
                        <span style={{ color: "#566476", fontSize: "0.8rem" }}>{r.date}</span>
                      </div>
                    </div>
                    <p style={{ color: "#a0aabb", lineHeight: 1.7, fontStyle: "italic" }}>"{r.text}"</p>
                  </div>
                ))}
              </div>
            )}

            {/* Write Review */}
            <div style={{ background: "#0d1117", borderRadius: "16px", padding: "24px", border: "1px solid #e9456022" }}>
              <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: "1.2rem", fontWeight: 700, color: "#f0e6d3", marginBottom: "20px" }}>Write a Review</h3>
              <div style={{ marginBottom: "16px" }}>
                <label style={styles.label}>Your Name *</label>
                <input style={styles.input} placeholder="CinemaLover42" value={reviewForm.user} onChange={e => setReviewForm({ ...reviewForm, user: e.target.value })} />
              </div>
              <div style={{ marginBottom: "16px" }}>
                <label style={styles.label}>Your Rating *</label>
                <StarRating value={reviewForm.rating} onChange={r => setReviewForm({ ...reviewForm, rating: r })} />
              </div>
              <div style={{ marginBottom: "20px" }}>
                <label style={styles.label}>Your Review *</label>
                <textarea style={{ ...styles.input, minHeight: "100px", resize: "vertical" }} placeholder="Share your thoughts on this film..." value={reviewForm.text} onChange={e => setReviewForm({ ...reviewForm, text: e.target.value })} />
              </div>
              <button style={styles.btn("primary")} onClick={submitReview} disabled={reviewSubmitting}>
                {reviewSubmitting ? "Posting..." : "Post Review →"}
              </button>
            </div>
          </div>
        )}

        {/* ADD MOVIE VIEW */}
        {view === "add" && (
          <div style={{ animation: "fadeUp 0.4s ease", maxWidth: "600px", margin: "0 auto" }}>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "2rem", fontWeight: 900, color: "#f0e6d3", marginBottom: "8px" }}>Recommend a Film</h1>
            <p style={{ color: "#8892a4", marginBottom: "32px" }}>Share a movie you think everyone should watch</p>

            <div style={{ background: "#0d1117", borderRadius: "16px", padding: "28px", border: "1px solid #e9456022", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div>
                <label style={styles.label}>Movie Title *</label>
                <input style={styles.input} placeholder="Enter the title..." value={newMovie.title} onChange={e => setNewMovie({ ...newMovie, title: e.target.value })} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                <div>
                  <label style={styles.label}>Year *</label>
                  <input style={styles.input} type="number" min="1900" max="2030" value={newMovie.year} onChange={e => setNewMovie({ ...newMovie, year: e.target.value })} />
                </div>
                <div>
                  <label style={styles.label}>Genre *</label>
                  <select style={styles.input} value={newMovie.genre} onChange={e => setNewMovie({ ...newMovie, genre: e.target.value })}>
                    {GENRES.filter(g => g !== "All").map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={styles.label}>Pick an Emoji Poster</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {POSTERS.map(p => (
                    <button key={p} type="button" onClick={() => setNewMovie({ ...newMovie, poster: p })} style={{ fontSize: "1.5rem", padding: "6px 8px", borderRadius: "8px", border: "2px solid", borderColor: newMovie.poster === p ? "#e94560" : "transparent", background: newMovie.poster === p ? "#e9456022" : "#1a1a2e", cursor: "pointer", transition: "all 0.15s" }}>{p}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={styles.label}>Description *</label>
                <textarea style={{ ...styles.input, minHeight: "90px", resize: "vertical" }} placeholder="What's this film about? Why should others watch it?" value={newMovie.description} onChange={e => setNewMovie({ ...newMovie, description: e.target.value })} />
              </div>
              <div>
                <label style={styles.label}>Your Name *</label>
                <input style={styles.input} placeholder="How should we credit you?" value={newMovie.addedBy} onChange={e => setNewMovie({ ...newMovie, addedBy: e.target.value })} />
              </div>
              <div style={{ display: "flex", gap: "12px", paddingTop: "4px" }}>
                <button style={styles.btn("primary")} onClick={submitMovie}>Add to CinemaClub →</button>
                <button style={styles.btn("ghost")} onClick={() => setView("home")}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
