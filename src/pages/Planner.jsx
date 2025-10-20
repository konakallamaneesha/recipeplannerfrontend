// frontend/src/pages/Planner.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;
import jsPDF from 'jspdf';

const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];

export default function Planner() {
  const [recipes, setRecipes] = useState([]);
  const [recipesByCategory, setRecipesByCategory] = useState({ breakfast: [], lunch: [], dinner: [] });
  const [showNutrients, setShowNutrients] = useState(false);
  const [currentNutrients, setCurrentNutrients] = useState([]);
  const [breakfast, setBreakfast] = useState('');
  const [lunch, setLunch] = useState('');
  const [dinner, setDinner] = useState('');
  const [peopleBreakfast, setPeopleBreakfast] = useState(1);
  const [peopleLunch, setPeopleLunch] = useState(1);
  const [peopleDinner, setPeopleDinner] = useState(1);
  const [selectedDay, setSelectedDay] = useState('');
  const [cart, setCart] = useState([]); // { day, meals: {breakfast:{recipeId,people},...} }
  const [savedSelections, setSavedSelections] = useState({});

  useEffect(() => { fetchRecipes(); fetchRecipesByCategory(); }, []);
  useEffect(() => { fetchPlans(); }, []);

  const fetchRecipes = async () => {
    try {
  const res = await axios.get(`${API_URL}/api/recipes`);
      setRecipes(res.data || []);
    } catch (err) { console.error(err); }
  };

  const fetchRecipesByCategory = async () => {
    try {
      const cats = ['breakfast','lunch','dinner'];
      const map = {};
      for (const c of cats) {
  const res = await axios.get(`${API_URL}/api/recipes?category=${encodeURIComponent(c)}`);
        map[c] = res.data || [];
      }
      setRecipesByCategory(map);
    } catch (err) { console.error(err); }
  };

  const openNutrientsForRecipe = (recipeId) => {
    // find recipe from cached category lists
    const all = [...(recipesByCategory.breakfast||[]), ...(recipesByCategory.lunch||[]), ...(recipesByCategory.dinner||[])];
    const r = all.find(x => String(x._id) === String(recipeId));
    if (!r) { setCurrentNutrients([]); setShowNutrients(true); return; }
    setCurrentNutrients(r.nutrients || []);
    setShowNutrients(true);
  };

  const fetchPlans = async () => {
    try {
      const username = sessionStorage.getItem('username');
  const res = await axios.get(`${API_URL}/api/plans${username ? `?username=${encodeURIComponent(username)}` : ''}`);
      const map = {};
      (res.data || []).forEach(p => {
        map[p.day] = {
          breakfast: p.meals?.breakfast ? { recipeId: p.meals.breakfast.recipeId?._id || p.meals.breakfast.recipeId, people: p.meals.breakfast.people } : null,
          lunch: p.meals?.lunch ? { recipeId: p.meals.lunch.recipeId?._id || p.meals.lunch.recipeId, people: p.meals.lunch.people } : null,
          dinner: p.meals?.dinner ? { recipeId: p.meals.dinner.recipeId?._id || p.meals.dinner.recipeId, people: p.meals.dinner.people } : null
        };
      });
      setSavedSelections(map);
      // if there's a saved selection for the current day, load it
      const cur = map[selectedDay];
      if (cur) {
        setBreakfast(cur.breakfast?.recipeId || ''); setPeopleBreakfast(cur.breakfast?.people || 1);
        setLunch(cur.lunch?.recipeId || ''); setPeopleLunch(cur.lunch?.people || 1);
        setDinner(cur.dinner?.recipeId || ''); setPeopleDinner(cur.dinner?.people || 1);
      }
    } catch (err) { console.error(err); }
  };

  // (history feature removed)

  const saveDayToDb = async () => {
    const username = sessionStorage.getItem('username');
    const payload = {
      username,
      day: selectedDay,
      meals: {
        breakfast: breakfast ? { recipeId: breakfast, people: Number(peopleBreakfast) || 1 } : undefined,
        lunch: lunch ? { recipeId: lunch, people: Number(peopleLunch) || 1 } : undefined,
        dinner: dinner ? { recipeId: dinner, people: Number(peopleDinner) || 1 } : undefined,
      }
    };
    try {
  const res = await axios.post(`${API_URL}/api/plans`, payload);
      alert('Day saved to your plans');
      // update local saved selections map
      setSavedSelections(prev => ({ ...prev, [selectedDay]: payload.meals }));
      return res.data;
    } catch (err) {
      console.error(err);
      alert('Failed to save day');
    }
  };

  const addToCart = () => {
    const item = {
      day: selectedDay,
      meals: {
        breakfast: breakfast ? { recipeId: breakfast, people: Number(peopleBreakfast) || 1 } : null,
        lunch: lunch ? { recipeId: lunch, people: Number(peopleLunch) || 1 } : null,
        dinner: dinner ? { recipeId: dinner, people: Number(peopleDinner) || 1 } : null,
      }
    };
    setCart(prev => [...prev, item]);
    // persist this selection locally so switching days preserves selections per day
    setSavedSelections(prev => ({ ...prev, [selectedDay]: {
      breakfast: item.meals.breakfast,
      lunch: item.meals.lunch,
      dinner: item.meals.dinner
    } }));
    alert(`${selectedDay} added to cart`);
  };

  // when user changes selected day, load saved selections for that day or clear inputs
  useEffect(() => {
    const sel = savedSelections[selectedDay];
    if (sel) {
      setBreakfast(sel.breakfast?.recipeId || ''); setPeopleBreakfast(sel.breakfast?.people || 1);
      setLunch(sel.lunch?.recipeId || ''); setPeopleLunch(sel.lunch?.people || 1);
      setDinner(sel.dinner?.recipeId || ''); setPeopleDinner(sel.dinner?.people || 1);
    } else {
      setBreakfast(''); setPeopleBreakfast(1);
      setLunch(''); setPeopleLunch(1);
      setDinner(''); setPeopleDinner(1);
    }
  }, [selectedDay, savedSelections]);

  const exportCartAsPDF = async () => {
    if (!cart.length) return alert('Cart is empty');
    // export history feature removed; proceed to generate PDF

    const doc = new jsPDF();
    doc.text('Weekly Shopping List', 10, 10);
    let y = 20;

    // For each cart item (day), request ingredient totals per meal and print them
    for (const entry of cart) {
      doc.text(`${entry.day}`, 10, y);
      y += 8;
      const meals = ['breakfast','lunch','dinner'];
      for (const m of meals) {
        const meal = entry.meals[m];
        if (!meal || !meal.recipeId) continue;
        try {
          const res = await axios.post('http://localhost:5000/api/recipes/calculate', { recipeId: meal.recipeId, people: meal.people });
          doc.text(`${m.toUpperCase()} - ${meal.people} person(s)`, 12, y);
          y += 8;
          (res.data || []).forEach(ing => {
            doc.text(`- ${ing.name}: ${ing.totalQuantity}`, 15, y);
            y += 8;
            if (y > 270) { doc.addPage(); y = 20; }
          });
        } catch (err) {
          doc.text(`${m}: error fetching ingredients`, 12, y); y += 8;
        }
      }
      y += 6;
      if (y > 270) { doc.addPage(); y = 20; }
    }

    doc.save('shopping-list.pdf');
  };

  // history removed

  return (
    <div className="planner-page page-enter">
      <div className="app-root">
        <div className="card planner-card card-entrance stagger-container" style={{ '--i': 0 }}>
          <div className="planner-body">
            <h1 className="heading-animate planner-title" style={{ marginTop: 0 }}>Weekly Planner</h1>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 8 }}>
              <p className="small-muted planner-sub">Select recipes for each day and export a shopping list</p>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: '2.25rem' }}>
              <select className="input select-day" value={selectedDay} onChange={e => setSelectedDay(e.target.value)}>
                <option value="">Select a day</option>
                {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginTop: 26 }}>
              <div>
                <label className="bright-label meal-label meal-breakfast">Breakfast</label>
                <select className="input meal-select" value={breakfast} onChange={e => { setBreakfast(e.target.value); if (e.target.value) openNutrientsForRecipe(e.target.value); }}>
                  <option value="">Select Breakfast</option>
                  {recipesByCategory.breakfast.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
                </select>
                <input className="input people-input" type="number" min={1} value={peopleBreakfast} onChange={e => setPeopleBreakfast(e.target.value)} placeholder="People" style={{ marginTop: 8 }} />
              </div>

              <div>
                <label className="bright-label meal-label meal-lunch">Lunch</label>
                <select className="input meal-select" value={lunch} onChange={e => { setLunch(e.target.value); if (e.target.value) openNutrientsForRecipe(e.target.value); }}>
                  <option value="">Select Lunch</option>
                  {recipesByCategory.lunch.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
                </select>
                <input className="input people-input" type="number" min={1} value={peopleLunch} onChange={e => setPeopleLunch(e.target.value)} placeholder="People" style={{ marginTop: 8 }} />
              </div>

              <div>
                <label className="bright-label meal-label meal-dinner">Dinner</label>
                <select className="input meal-select" value={dinner} onChange={e => { setDinner(e.target.value); if (e.target.value) openNutrientsForRecipe(e.target.value); }}>
                  <option value="">Select Dinner</option>
                  {recipesByCategory.dinner.map(r => <option key={r._id} value={r._id}>{r.title}</option>)}
                </select>
                <input className="input people-input" type="number" min={1} value={peopleDinner} onChange={e => setPeopleDinner(e.target.value)} placeholder="People" style={{ marginTop: 8 }} />
              </div>
            </div>
          </div>

          <div className="planner-footer" style={{ paddingTop: 1.75 + 'rem' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', width: '100%' }}>
              <button className="btn btn-primary" onClick={exportCartAsPDF}>Export Cart as PDF</button>
              <button className="btn btn-primary add-to-list-btn" onClick={addToCart}>Add to List (Cart)</button>
              <div style={{ marginLeft: 'auto' }}>
                <strong>Cart: </strong>{cart.length} day(s)
              </div>
            </div>
          </div>

        </div>
      </div>
      {showNutrients && (
        <div className="nutrients-root">
          <div className="nutrients-card card-entrance">
            <h2>That's a great choice! <span className="emoji emoji-hands" aria-hidden>👏</span></h2>
            <p>Nutrients for the selected recipe:</p>
            <ul className="nutrients-list">
              {currentNutrients.length ? currentNutrients.map((n, i) => (
                <li key={i}><strong>{n.name}</strong>: {n.info}</li>
              )) : (<li>No nutrients recorded for this recipe.</li>)}
            </ul>
            {/* floating emojis for visual flair */}
            <div className="float-emoji e1">✨</div>
            <div className="float-emoji e2">🥗</div>
            <div className="float-emoji e3">💪</div>
            <div className="float-emoji e4">🎉</div>
            <div className="float-emoji e5">🍏</div>
            <div className="float-emoji e6">🌿</div>
            <div className="nutrients-actions">
              <button className="btn nutrients-back-btn" onClick={() => setShowNutrients(false)}>Back to Planner</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Note: modal markup is inserted above return closure; adding here as separate component isn't necessary
