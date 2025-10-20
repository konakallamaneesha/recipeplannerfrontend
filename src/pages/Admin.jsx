import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Admin() {
  const [authOk, setAuthOk] = useState(false);
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');

  const [ingredients, setIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);

  const [freeIngName, setFreeIngName] = useState('');
  const [freeIngQty, setFreeIngQty] = useState('');
  const [freeNutName, setFreeNutName] = useState('');
  const [freeNutInfo, setFreeNutInfo] = useState('');

  const [recipeTitle, setRecipeTitle] = useState('');
  const [recipeIngredients, setRecipeIngredients] = useState([]);
  const [recipeNutrients, setRecipeNutrients] = useState([]);
  const [category, setCategory] = useState('breakfast');

  const cardRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => { fetchIngredients(); fetchRecipes(); checkAuth(); }, []);

  const checkAuth = () => {
    const a = sessionStorage.getItem('adminAuth');
    setAuthOk(a === '1');
  };

  const fetchIngredients = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/ingredients');
      setIngredients(res.data || []);
    } catch (e) { console.error(e); }
  };

  const fetchRecipes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/recipes');
      setRecipes(res.data || []);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (authOk && cardRef.current) {
      try { cardRef.current.scrollTop = 0; } catch (e) {}
    }
  }, [authOk]);

  const handleLogin = () => {
    if (user === 'admin' && pass === 'password') {
      sessionStorage.setItem('adminAuth', '1');
      setAuthOk(true);
    } else alert('invalid admin credentials');
  };

  const addIngredientToRecipe = () => {
    const name = (freeIngName || '').trim();
    const qty = (freeIngQty || '').trim();
    if (!name) return alert('enter ingredient name');
    if (!qty) return alert('enter quantity');
    setRecipeIngredients(prev => [...prev, { name, quantityPerPerson: qty }]);
    setFreeIngName(''); setFreeIngQty('');
  };

  const addNutrientToRecipe = () => {
    const name = (freeNutName || '').trim();
    const info = (freeNutInfo || '').trim();
    if (!name) return alert('enter nutrient name');
    if (!info) return alert('enter nutrient info');
    setRecipeNutrients(prev => [...prev, { name, info }]);
    setFreeNutName(''); setFreeNutInfo('');
  };

  const addRecipe = async () => {
    if (!recipeTitle) return alert('enter recipe title');
    if (!recipeIngredients.length) return alert('add at least one ingredient');

    try {
      // ensure ingredients exist in master list
      for (const ing of recipeIngredients) {
        const exists = ingredients.find(i => i.name.toLowerCase() === (ing.name || '').toLowerCase());
        if (!exists) await axios.post('http://localhost:5000/api/ingredients', { name: ing.name });
      }
      await fetchIngredients();

      await axios.post('http://localhost:5000/api/recipes', { title: recipeTitle, ingredients: recipeIngredients, category, nutrients: recipeNutrients });

      // clear form
      setRecipeTitle(''); setCategory('breakfast'); setRecipeIngredients([]); setRecipeNutrients([]);
      await fetchRecipes();
      alert('recipe added');
    } catch (e) { console.error(e); alert('failed to add recipe'); }
  };

  if (!authOk) return (
    <div className="modal-overlay page-enter" onClick={() => navigate('/') }>
      <div className="modal-card admin-modal card-entrance" onClick={e => e.stopPropagation()}>
        <div className="login-hero">
          <h1 className="signup-title heading-animate" style={{
            animation: 'heading-in 700ms cubic-bezier(.2,.9,.25,1) both, glow-cyan-soft 1.8s ease-in-out infinite alternate',
            color: '#6bd6ff',
            textShadow: '0 0 3px #6bd6ff, 0 0 6px #1e5eff, 0 0 9px #6bd6ff'
          }}>Admin Login</h1>
          <p className="small-muted">Enter admin credentials to manage recipes</p>
        </div>

        <div className="login-form" style={{ marginTop: '1rem' }}>
          <input className="input large" placeholder="Username" value={user} onChange={e => setUser(e.target.value)} />
          <input className="input large" placeholder="Password" type="password" value={pass} onChange={e => setPass(e.target.value)} />
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'center' }}>
            <button className="btn btn-primary btn-shiny focus-ring" onClick={handleLogin}>Login</button>
            <button className="btn" onClick={() => navigate('/')}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="modal-overlay" onClick={() => navigate('/') } style={{
      minHeight: '100vh',
      minWidth: '100vw',
      height: '100vh',
      width: '100vw',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(20,24,40,0.98)',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 1000
    }}>
      <div className="modal-card admin-modal admin-panel-modal" onClick={e => e.stopPropagation()} ref={cardRef} style={{
        width: '100vw',
        height: '100vh',
        minWidth: '100vw',
        minHeight: '100vh',
        maxWidth: '100vw',
        maxHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        boxShadow: 'none',
        borderRadius: 0,
        background: 'rgba(30,34,54,0.98)',
        marginTop: '48px',
        paddingTop: '32px'
      }}>
        <div className="admin-panel-grid">
          <div className="admin-panel-left">
            <div className="login-hero admin-hero">
              <h1 className="signup-title heading-animate">Admin Panel</h1>
              <p className="small-muted">Add recipes, ingredients and nutrients</p>
            </div>

            <div className="admin-row" style={{ marginBottom: 8 }}>
              <label style={{ color: '#fff', marginRight: 8, minWidth: 80 }}>Meal type:</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)} style={{ maxWidth: 220 }}>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
              </select>
            </div>

            <div style={{ marginBottom: 12 }}>
              <input className="input large" placeholder="Recipe title" value={recipeTitle} onChange={e => setRecipeTitle(e.target.value)} />
            </div>

            <div className="admin-row admin-row--spaced">
              <div className="admin-field admin-field--grow">
                <input className="input admin-input" placeholder="Ingredient name" value={freeIngName} onChange={e => setFreeIngName(e.target.value)} />
              </div>
              <div className="admin-field">
                <input className="input admin-input" placeholder="Qty per person (e.g. 100 grams)" value={freeIngQty} onChange={e => setFreeIngQty(e.target.value)} />
              </div>
              <div className="admin-field">
                <button className="btn admin-action-btn" onClick={addIngredientToRecipe} style={{ ['--btn-delay']: '80ms' }}>Add Ingredient</button>
              </div>
            </div>

            <div className="admin-row admin-row--spaced" style={{ marginTop: 12 }}>
              <div className="admin-field admin-field--grow">
                <input className="input admin-input" placeholder="Nutrient name (e.g. Protein)" value={freeNutName} onChange={e => setFreeNutName(e.target.value)} />
              </div>
              <div className="admin-field">
                <input className="input admin-input" placeholder="Info (e.g. Protein: 12g)" value={freeNutInfo} onChange={e => setFreeNutInfo(e.target.value)} />
              </div>
              <div className="admin-field">
                <button className="btn admin-action-btn" onClick={addNutrientToRecipe} style={{ ['--btn-delay']: '160ms' }}>Add Nutrient</button>
              </div>
            </div>

            <div className="admin-actions" style={{ marginTop: '16px' }}>
              <button className="btn btn-primary" onClick={addRecipe}>Save Recipe</button>
              <button className="btn" style={{ marginLeft: 8 }} onClick={() => { sessionStorage.removeItem('adminAuth'); setAuthOk(false); navigate('/'); }}>Logout</button>
            </div>

            <div className="current-lists" style={{ marginTop: '48px', color: '#fff', marginBottom: '24px' }}>
              <div className="col current-ingredients">
                <strong>Current recipe ingredients</strong>
                <ul>
                  {recipeIngredients.map((ri, idx) => (
                    <li key={idx} className="current-item">
                      <span className="item-text">{ri.name} — {ri.quantityPerPerson}</span>
                      <button className="btn" onClick={() => setRecipeIngredients(prev => prev.filter((_, i) => i !== idx))}>Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="col current-nutrients">
                <strong>Current recipe nutrients</strong>
                <ul>
                  {recipeNutrients.map((rn, idx) => (
                    <li key={idx} className="current-item">
                      <span className="item-text">{rn.name} — {rn.info}</span>
                      <button className="btn" onClick={() => setRecipeNutrients(prev => prev.filter((_, i) => i !== idx))}>Remove</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}                                                             