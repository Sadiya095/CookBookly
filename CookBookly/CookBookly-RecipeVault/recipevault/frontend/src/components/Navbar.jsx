import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <Link to="/" className="navbar-brand"><img src="/logo-nav.png" alt="CookBookly" className="navbar-logo" /></Link>

      <nav className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/explore">Explore</Link>
        {isAuthenticated && <Link to="/my-recipes">My Recipes</Link>}
        {isAuthenticated && <Link to="/saved-recipes">Saved</Link>}
      </nav>

      <div className="navbar-actions">
        {isAuthenticated ? (
          <>
            <Link to="/create-recipe" className="btn btn-primary">+ Add Recipe</Link>
            <Link to={`/profile/${user.name}`} className="navbar-user">{user.name}</Link>
            <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn btn-ghost">Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </header>
  );
}
