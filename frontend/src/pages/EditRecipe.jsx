import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

const CATEGORIES = ['Breakfast', 'Lunch', 'Dinner', 'Desserts', 'Snacks', 'Drinks'];

export default function EditRecipe() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/recipes/${id}`);
        setForm({
          title: data.title,
          description: data.description || '',
          ingredients: data.ingredients,
          instructions: data.instructions,
          recipeUrl: data.recipeUrl || '',
          category: data.category || CATEGORIES[0],
          visibility: data.visibility,
          imageUrl: data.imageUrl || ''
        });
        setImagePreview(data.imageUrl || null);
      } catch (err) {
        setError('Could not load this recipe.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      let imageUrl = form.imageUrl;
      if (imageFile) {
        const formData = new FormData();
        formData.append('file', imageFile);
        const uploadRes = await api.post('/recipes/upload-image', formData);
        imageUrl = uploadRes.data.imageUrl;
      }

      await api.put(`/recipes/${id}`, { ...form, imageUrl });
      navigate(`/recipe/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update recipe');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!form) return <p>{error || 'Recipe not found.'}</p>;

  return (
    <div className="form-card">
      <h2>Edit Recipe</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <label>Recipe Title *</label>
        <input type="text" name="title" value={form.title} onChange={handleChange} required />

        <label>Description</label>
        <textarea name="description" rows={2} value={form.description} onChange={handleChange} />

        <label>Category</label>
        <select name="category" value={form.category} onChange={handleChange}>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <label>Ingredients *</label>
        <textarea name="ingredients" rows={5} value={form.ingredients} onChange={handleChange} required />

        <label>Instructions *</label>
        <textarea name="instructions" rows={6} value={form.instructions} onChange={handleChange} required />

        <label>Recipe Link (optional)</label>
        <input type="url" name="recipeUrl" value={form.recipeUrl} onChange={handleChange} />

        <label>Image</label>
        <input type="file" accept="image/png,image/jpeg" onChange={handleImageChange} />
        {imagePreview && <img src={imagePreview} alt="preview" className="image-preview" />}

        <label>Visibility</label>
        <div className="visibility-toggle">
          <label className={`visibility-option ${form.visibility === 'PUBLIC' ? 'selected' : ''}`}>
            <input type="radio" name="visibility" value="PUBLIC" checked={form.visibility === 'PUBLIC'} onChange={handleChange} />
            Public
          </label>
          <label className={`visibility-option ${form.visibility === 'PRIVATE' ? 'selected' : ''}`}>
            <input type="radio" name="visibility" value="PRIVATE" checked={form.visibility === 'PRIVATE'} onChange={handleChange} />
            Private
          </label>
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
