import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import RecipeCard from '../components/RecipeCard.jsx';

export default function MyRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/recipes/my', { params: { page: 0, size: 50 } });
        setRecipes(data.content);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section>
      <div className="section-header">
        <div>
          <h2>My Recipes</h2>
          <p className="section-subtitle">All your saved recipes in one place ♡</p>
        </div>
        <Link to="/create-recipe" className="btn btn-primary">+ Add Recipe</Link>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : recipes.length === 0 ? (
        <p>You haven't created any recipes yet. <Link to="/create-recipe">Create your first one</Link>.</p>
      ) : (
        <div className="recipe-grid">
          {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </section>
  );
}
