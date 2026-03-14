import { useState, useEffect, useRef } from "react";
import { useGetUserDataQuery, useGetUserReposQuery } from "./githubapi.js";
import "./githubapi.js";
import "./github.css"

const REPOS_PER_PAGE = 5;

function ProfileView({ search, onClear, darkMode }) {
  const [currentPage, setCurrentPage] = useState(1);

  const { data: user, isFetching: userLoading, isError } = useGetUserDataQuery(search);
  const { data: repos, isFetching: reposLoading } = useGetUserReposQuery(search);

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric", month: "short", day: "numeric",
    });

  const totalPages = repos ? Math.ceil(repos.length / REPOS_PER_PAGE) : 0;
  const paginatedRepos = repos
    ? repos.slice((currentPage - 1) * REPOS_PER_PAGE, currentPage * REPOS_PER_PAGE)
    : [];

  if (userLoading || reposLoading) return <p className="msg">⏳ Loading...</p>;
  if (isError) return <p className="msg error">❌ User not found</p>;
  if (!user) return null;

  return (
    <>
      <div className="card">
        <div className="profile-row">
          <img src={user.avatar_url} alt="avatar" className="avatar" />
          <div className="profile-info">
            <h2>{user.name || user.login}</h2>
            <p className="muted">@{user.login}</p>
            {user.bio && <p className="bio">{user.bio}</p>}
            {user.location && <p className="muted">📍 {user.location}</p>}
            {user.blog && (
              <p className="muted">🔗 <a href={user.blog} target="_blank" rel="noreferrer">{user.blog}</a></p>
            )}
            <p className="muted">📅 Joined {formatDate(user.created_at)}</p>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat"><strong>{user.public_repos}</strong><span>Repos</span></div>
          <div className="stat"><strong>{user.followers}</strong><span>Followers</span></div>
          <div className="stat"><strong>{user.following}</strong><span>Following</span></div>
        </div>

        <button className="delete-btn" onClick={onClear}>🗑️ Clear</button>
      </div>

      {repos && (
        <div className="card">
          <h3>📁 Repositories ({repos.length})</h3>
          <div className="repo-list">
            {paginatedRepos.map((repo) => (
              <a key={repo.id} href={repo.html_url} target="_blank" rel="noreferrer" className="repo-item">
                <div className="repo-top">
                  <span className="repo-name">{repo.name}</span>
                  {repo.language && <span className="badge">{repo.language}</span>}
                </div>
                {repo.description && <p className="repo-desc">{repo.description}</p>}
                <p className="repo-meta">⭐ {repo.stargazers_count} · 🍴 {repo.forks_count} · {formatDate(repo.updated_at)}</p>
              </a>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="pagination">
              <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>← Prev</button>
              <span>{currentPage} / {totalPages}</span>
              <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next →</button>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function App() {
  const [inputVal, setInputVal] = useState("");
  const [search, setSearch] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const timerRef = useRef(null);

  const handleSearch = () => {
    const val = inputVal.trim();
    if (!val) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    setNotFound(false);
    setSearch(val);
  };

  const handleClear = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setSearch("");
    setInputVal("");
    setNotFound(false);
  };

  // Auto-hide after 3 seconds (function same rakha hai)
  const handleNotFound = () => {
    setNotFound(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setNotFound(false);
      setSearch("");
      setInputVal("");
    }, 3000);
  };

  return (
    <div className={darkMode ? "app dark" : "app light"}>
      <div className="topbar">
        <h1> GitHub Finder</h1>
        <button className="mode-btn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀️" : "🌙"}
        </button>
      </div>

      <div className="search-row">
        <input
          type="text"
          placeholder="Enter GitHub username..."
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button className="search-btn" onClick={handleSearch}>Search</button>
      </div>

      {notFound && (
        <p className="msg error">❌ User not found</p>
      )}

      {search && !notFound && (
        <NotFoundWrapper search={search} onNotFound={handleNotFound} onClear={handleClear} darkMode={darkMode} />
      )}
    </div>
  );
}

function NotFoundWrapper({ search, onNotFound, onClear, darkMode }) {
  const { isError, isFetching } = useGetUserDataQuery(search);

  useEffect(() => {
    if (isError && !isFetching) {
      onNotFound();
    }
  }, [isError, isFetching]);

  if (isError) return null;

  return <ProfileView search={search} onClear={onClear} darkMode={darkMode} />;
}

export default App;