import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import Explore from './pages/Explore.jsx';
import MyRecipes from './pages/MyRecipes.jsx';
import SavedRecipes from './pages/SavedRecipes.jsx';
import CreateRecipe from './pages/CreateRecipe.jsx';
import EditRecipe from './pages/EditRecipe.jsx';
import RecipeDetail from './pages/RecipeDetail.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <div className="app-shell">
      <Navbar />
      <main className="page-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/recipe/:id" element={<RecipeDetail />} />
          <Route path="/profile/:username" element={<Profile />} />

          <Route path="/my-recipes" element={<ProtectedRoute><MyRecipes /></ProtectedRoute>} />
          <Route path="/saved-recipes" element={<ProtectedRoute><SavedRecipes /></ProtectedRoute>} />
          <Route path="/create-recipe" element={<ProtectedRoute><CreateRecipe /></ProtectedRoute>} />
          <Route path="/edit-recipe/:id" element={<ProtectedRoute><EditRecipe /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
}
