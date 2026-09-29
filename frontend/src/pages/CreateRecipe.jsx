import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import { Bow, Face, Heart, Lavender, Bunny, Mug } from '../components/CuteArt';
import '../styles/create-recipe.css';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Snacks', 'Drinks'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const TABS = [
  { key: 'description', label: 'Write Recipe', icon: '✎', ph: 'Write your recipe here or use the Ingredients & Instructions tabs above.' },
  { key: 'ingredients', label: 'Add Ingredients', icon: '☰', ph: '200g pasta\n2 tbsp butter\n3 garlic cloves (minced)' },
  { key: 'instructions', label: 'Add Instructions', icon: '▤', ph: '1. Cook pasta...\n2. Melt butter...' }
];

export default function CreateRecipe() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', ingredients: '', instructions: '', recipeUrl: '',
    category: '', cookingTime: '', servings: '', difficulty: '', visibility: 'PUBLIC'
  });
  const [tab, setTab] = useState('description');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (name, value) => setForm((f) => ({ ...f, [name]: value }));
  const handleChange = (e) => set(e.target.name, e.target.value);

  const pickImage = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError('Image must be 5MB or smaller');
    setError('');
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.ingredients.trim() || !form.instructions.trim()) {
      setError('Please fill in the Ingredients and Instructions tabs.');
      setTab(!form.ingredients.trim() ? 'ingredients' : 'instructions');
      return;
    }
    setSaving(true);
    try {
      let imageUrl = '';
      if (imageFile) {
        const fd = new FormData();
        fd.append('file', imageFile);
        const up = await api.post('/recipes/upload-image', fd);
        imageUrl = up.data.imageUrl;
      }
      const { data } = await api.post('/recipes', { ...form, imageUrl });
      navigate(`/recipe/${data.id}`);
    } catch (err) {
  console.error('Recipe save error:', err);
  console.error('Response:', err.response);
  console.error('Request:', err.request);

  setError(
    err.response?.data?.message ||
    err.message ||
    'Could not save recipe'
  );
}finally {
      setSaving(false);
    }
  };

  const active = TABS.find((t) => t.key === tab);

  return (
    <form className="cr-page" onSubmit={handleSubmit}>
      <Lavender style={{ position: 'absolute', right: 6, top: -30, width: 44, opacity: 0.8 }} />
      <section className="cr-left">
        <h2 className="cr-title">Create a New Recipe <Heart size={22} fill="#f6b8d6" /></h2>
        <p className="cr-sub">Save your favorite recipe and share it with the CookBookly community! ♡</p>
        {error && <div className="cr-error">{error}</div>}

        <label className="cr-label">Recipe Title <b>*</b></label>
        <div className="cr-field"><span>🍴</span><input name="title" required placeholder="e.g. Creamy Garlic Pasta" value={form.title} onChange={handleChange} /></div>

        <div className="cr-row">
          <div>
            <label className="cr-label">Category <b>*</b></label>
            <div className="cr-field"><span>▦</span>
              <select name="category" required value={form.category} onChange={handleChange}>
                <option value="" disabled>Select category</option>
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select></div>
          </div>
          <div>
            <label className="cr-label">Cooking Time</label>
            <div className="cr-field"><span>◷</span><input name="cookingTime" placeholder="e.g. 30 mins" value={form.cookingTime} onChange={handleChange} /></div>
          </div>
        </div>

        <div className="cr-row">
          <div>
            <label className="cr-label">Servings</label>
            <div className="cr-field"><span>👥</span><input name="servings" placeholder="e.g. 2-4" value={form.servings} onChange={handleChange} /></div>
          </div>
          <div>
            <label className="cr-label">Difficulty</label>
            <div className="cr-field"><span>▮▮</span>
              <select name="difficulty" value={form.difficulty} onChange={handleChange}>
                <option value="">Select difficulty</option>
                {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
              </select></div>
          </div>
        </div>

        <label className="cr-label">Recipe Link <em>(Optional)</em></label>
        <div className="cr-field"><span>🔗</span><input type="url" name="recipeUrl" placeholder="e.g. https://www.youtube.com/watch?v=..." value={form.recipeUrl} onChange={handleChange} /></div>

        <label className="cr-label">Image <em>(Optional)</em></label>
        <label className="cr-drop" onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); pickImage(e.dataTransfer.files[0]); }}>
          <input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => pickImage(e.target.files[0])} />
          {imagePreview ? <img src={imagePreview} alt="preview" className="cr-preview" /> : (
            <div className="cr-drop-text"><div className="cr-drop-icon">🖼</div>Click to upload or drag and drop<small>JPG, PNG, WEBP (Max 5MB)</small></div>
          )}
          <Bunny hat style={{ position: 'absolute', right: 10, bottom: 0, width: 82 }} />
        </label>

        <label className="cr-label">Visibility</label>
        <div className="cr-row">
          <button type="button" className={`cr-vis ${form.visibility === 'PUBLIC' ? 'on' : ''}`} onClick={() => set('visibility', 'PUBLIC')}>
            <span>🌐</span><div><b>Public</b><small>Anyone can view this recipe</small></div></button>
          <button type="button" className={`cr-vis ${form.visibility === 'PRIVATE' ? 'on' : ''}`} onClick={() => set('visibility', 'PRIVATE')}>
            <span>🔒</span><div><b>Private</b><small>Only you can view this recipe</small></div></button>
        </div>

        <div className="cr-row cr-actions">
          <button type="button" className="cr-cancel" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="cr-save" disabled={saving}>➤ {saving ? 'Saving...' : 'Save Recipe'}</button>
        </div>
      </section>

      <aside className="cr-right">
        <div className="cr-tabs">
          {TABS.map((t) => (
            <button type="button" key={t.key} className={tab === t.key ? 'on' : ''} onClick={() => setTab(t.key)}><span>{t.icon}</span> {t.label}</button>
          ))}
        </div>
        <div className="cr-note">
          <div className="cr-note-inner">
            <Bow />
            <Lavender style={{ position: 'absolute', left: 18, top: 60, width: 60 }} />
            <Heart size={44} style={{ position: 'absolute', right: 26, top: 56 }} />
            <Face />
            <textarea key={tab} className="cr-lines" value={form[active.key]} placeholder={active.ph} onChange={(e) => set(active.key, e.target.value)} />
            <Bunny style={{ position: 'absolute', left: 8, bottom: 6, width: 92 }} />
            <Mug style={{ position: 'absolute', right: 6, bottom: 6, width: 100 }} />
          </div>
        </div>
        <p className="cr-hint">Write your recipe here or use the Ingredients &amp; Instructions tabs above.</p>
      </aside>
    </form>
  );
}
