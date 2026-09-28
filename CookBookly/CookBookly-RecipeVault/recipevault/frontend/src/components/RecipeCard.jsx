import React from 'react';
import { Link } from 'react-router-dom';
import { assetUrl } from '../api/assetUrl';

export default function RecipeCard({ recipe }) {
  return (
    <Link to={`/recipe/${recipe.id}`} className="recipe-card">
      <div className="recipe-card-image">
        {recipe.imageUrl ? (
          <img src={assetUrl(recipe.imageUrl)} alt={recipe.title} />
        ) : (
          <div className="recipe-card-placeholder">🍲</div>
        )}
        {recipe.visibility === 'PRIVATE' && <span className="badge badge-private">Private</span>}
      </div>
      <div className="recipe-card-body">
        <h3>{recipe.title}</h3>
        <p className="recipe-card-author">♡ {recipe.authorName}</p>
        {recipe.category && <span className="badge badge-category">{recipe.category}</span>}
      </div>
    </Link>
  );
}
