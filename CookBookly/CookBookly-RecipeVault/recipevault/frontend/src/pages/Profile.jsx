import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axiosConfig';
import RecipeCard from '../components/RecipeCard.jsx';

export default function Profile() {
  const { username } = useParams();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await api.get(`/users/${username}/recipes`, { params: { page: 0, size: 50 } });
        setRecipes(data.content);
      } catch (err) {
        setError('User not found.');
      } finally {
        setLoading(false);
      }
    })();
  }, [username]);

  return (
    <section>
      <h2>{username}'s Recipes</h2>
      <p className="section-subtitle">Public recipes shared by {username} ♡</p>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>{error}</p>
      ) : recipes.length === 0 ? (
        <p>No public recipes yet.</p>
      ) : (
        <div className="recipe-grid">
          {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </section>
  );
}
