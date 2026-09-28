import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import RecipeCard from '../components/RecipeCard.jsx';

const CATEGORIES = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Snacks', 'Drinks'];

export default function Explore() {
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const loadFeed = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/recipes/explore', { params: { page: 0, size: 24 } });
      setRecipes(data.content);
    } finally {
      setLoading(false);
    }
  };

  const runSearch = async (q) => {
    setLoading(true);
    try {
      const { data } = await api.get('/recipes/search', { params: { query: q, page: 0, size: 24 } });
      setRecipes(data.content);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeed();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      runSearch(query.trim());
    } else {
      loadFeed();
    }
  };

  const visibleRecipes = category === 'All'
    ? recipes
    : recipes.filter((r) => (r.category || '').toLowerCase() === category.toLowerCase());

  return (
    <section>
      <h2>Explore Recipes</h2>
      <p className="section-subtitle">Discover delicious recipes from our community ♡</p>

      <form onSubmit={handleSearchSubmit} className="search-bar">
        <input
          type="text"
          placeholder="Search recipes, ingredients or category..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Search</button>
      </form>

      <div className="category-pills">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={`pill ${category === c ? 'pill-active' : ''}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading recipes...</p>
      ) : visibleRecipes.length === 0 ? (
        <p>No recipes found.</p>
      ) : (
        <div className="recipe-grid">
          {visibleRecipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </section>
  );
}
