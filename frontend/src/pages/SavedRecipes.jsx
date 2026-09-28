import React, { useEffect, useState } from 'react';
import api from '../api/axiosConfig';
import RecipeCard from '../components/RecipeCard.jsx';

export default function SavedRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/saved-recipes', { params: { page: 0, size: 50 } });
        setRecipes(data.content);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section>
      <h2>Saved Recipes</h2>
      <p className="section-subtitle">Recipes you've bookmarked from the community ♡</p>

      {loading ? (
        <p>Loading...</p>
      ) : recipes.length === 0 ? (
        <p>You haven't saved any recipes yet.</p>
      ) : (
        <div className="recipe-grid">
          {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </section>
  );
}
