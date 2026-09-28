import { assetUrl } from '../api/assetUrl';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import { useAuth } from '../context/AuthContext.jsx';

export default function RecipeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const { data } = await api.get(`/recipes/${id}`);
      setRecipe(data);
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isOwner = isAuthenticated && recipe && recipe.userId === user.id;

  const handleSaveToggle = async () => {
    setSaving(true);
    try {
      if (recipe.savedByCurrentUser) {
        await api.delete(`/saved-recipes/${recipe.id}`);
      } else {
        await api.post(`/saved-recipes/${recipe.id}`);
      }
      setRecipe({ ...recipe, savedByCurrentUser: !recipe.savedByCurrentUser });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this recipe? This cannot be undone.')) return;
    await api.delete(`/recipes/${recipe.id}`);
    navigate('/my-recipes');
  };

  if (loading) return <p>Loading...</p>;
  if (notFound || !recipe) return <p>This recipe doesn't exist, is private, or has been removed.</p>;

  const ingredientLines = recipe.ingredients.split('\n').filter(Boolean);
  const instructionLines = recipe.instructions.split('\n').filter(Boolean);

  return (
    <div className="recipe-detail">
      <div className="recipe-detail-media">
        {recipe.imageUrl ? (
          <img src={assetUrl(recipe.imageUrl)} alt={recipe.title} />
        ) : (
          <div className="recipe-card-placeholder large">🍲</div>
        )}
      </div>

      <div className="recipe-detail-main">
        <div className="recipe-detail-header">
          <div>
            <h2>{recipe.title}</h2>
            <p className="recipe-card-author">
              ♡ <Link to={`/profile/${recipe.authorName}`}>{recipe.authorName}</Link>
              {' · '}{new Date(recipe.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="recipe-detail-actions">
            {isOwner ? (
              <>
                <Link to={`/edit-recipe/${recipe.id}`} className="btn btn-outline">Edit</Link>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </>
            ) : isAuthenticated ? (
              <button className="btn btn-primary" onClick={handleSaveToggle} disabled={saving}>
                {recipe.savedByCurrentUser ? '♥ Saved' : '♡ Save Recipe'}
              </button>
            ) : (
              <Link to="/login" className="btn btn-primary">Login to save</Link>
            )}
          </div>
        </div>

        {recipe.category && <span className="badge badge-category">{recipe.category}</span>}
        {recipe.visibility === 'PRIVATE' && <span className="badge badge-private">Private</span>}

        {recipe.description && <p className="recipe-description">{recipe.description}</p>}

        {recipe.recipeUrl && (
          <p><a href={recipe.recipeUrl} target="_blank" rel="noreferrer">🔗 Original recipe link</a></p>
        )}

        <div className="recipe-detail-columns">
          <div className="ingredients-card">
            <h3>Ingredients</h3>
            <ul>
              {ingredientLines.map((line, i) => <li key={i}>{line}</li>)}
            </ul>
          </div>

          <div className="instructions-card">
            <h3>Instructions</h3>
            <ol>
              {instructionLines.map((line, i) => <li key={i}>{line}</li>)}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
