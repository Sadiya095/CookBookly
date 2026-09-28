import React from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <section className="hero">
      <div className="hero-text">
        <img src="logo.png" alt="CookBookly – Save Recipes. Share Flavors." className="brand-logo-hero" />
        <p className="hero-sub">Your personal recipe space to save, organize and discover delicious recipes.</p>
        <div className="hero-actions">
          <Link to="/register" className="btn btn-primary btn-lg">Get Started</Link>
          <Link to="/explore" className="btn btn-outline btn-lg">Explore Recipes</Link>
        </div>
      </div>

      <div className="hero-features">
        <div className="feature">
          <span className="feature-icon">📝</span>
          <h4>Save Your Recipes</h4>
          <p>Keep your favorite recipes in one place</p>
        </div>
        <div className="feature">
          <span className="feature-icon">✏️</span>
          <h4>Make it Your Way</h4>
          <p>Add links, images, or write a recipe</p>
        </div>
        <div className="feature">
          <span className="feature-icon">🌍</span>
          <h4>Share with the World</h4>
          <p>Make recipes public or keep them private</p>
        </div>
        <div className="feature">
          <span className="feature-icon">🔎</span>
          <h4>Discover New Flavors</h4>
          <p>Explore recipes from other food lovers</p>
        </div>
      </div>
    </section>
  );
}
