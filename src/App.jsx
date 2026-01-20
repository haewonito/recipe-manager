import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import HomePage from "./pages/HomePage";
import RecipesPage from "./pages/RecipesPage";
import RecipeFormPage from "./pages/RecipeFormPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import IngredientsPage from "./pages/IngredientsPage";

export default function RecipeApp() {
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const recipesSnapshot = await getDocs(collection(db, "recipes"));
      const recipesData = recipesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecipes(recipesData);

      const ingredientsSnapshot = await getDocs(collection(db, "ingredients"));
      const ingredientsData = ingredientsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIngredients(ingredientsData);
    } catch (error) {
      console.error("Error loading data from Firestore:", error);
    }
  };

  const addRecipe = async (recipe) => {
    const docRef = await addDoc(collection(db, "recipes"), recipe);
    const newRecipe = { ...recipe, id: docRef.id };
    setRecipes([...recipes, newRecipe]);
  };

  const updateRecipe = async (updatedRecipe) => {
    const { id, ...recipeData } = updatedRecipe;
    await updateDoc(doc(db, "recipes", id), recipeData);
    setRecipes(recipes.map((r) => (r.id === id ? updatedRecipe : r)));
  };

  const deleteRecipe = async (id) => {
    await deleteDoc(doc(db, "recipes", id));
    setRecipes(recipes.filter((r) => r.id !== id));
  };

  const addIngredient = async (name, category) => {
    const docRef = await addDoc(collection(db, "ingredients"), {
      name,
      category,
    });
    const newIngredient = { id: docRef.id, name, category };
    setIngredients((prevIngredients) => [...prevIngredients, newIngredient]);
    return newIngredient;
  };

  const updateIngredient = async (id, name, category) => {
    await updateDoc(doc(db, "ingredients", id), { name, category });
    setIngredients(
      ingredients.map((i) => (i.id === id ? { ...i, name, category } : i))
    );
  };

  const deleteIngredient = async (id) => {
    await deleteDoc(doc(db, "ingredients", id));
    setIngredients(ingredients.filter((i) => i.id !== id));
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/recipes"
            element={
              <RecipesPage recipes={recipes} deleteRecipe={deleteRecipe} />
            }
          />
          <Route
            path="/recipes/new"
            element={
              <RecipeFormPage
                onSave={addRecipe}
                ingredients={ingredients}
                addIngredient={addIngredient}
                recipes={recipes}
              />
            }
          />
          <Route
            path="/recipes/:id"
            element={
              <RecipeDetailPage recipes={recipes} />
            }
          />
          <Route
            path="/recipes/:id/edit"
            element={
              <RecipeFormPage
                onSave={updateRecipe}
                ingredients={ingredients}
                addIngredient={addIngredient}
                recipes={recipes}
              />
            }
          />
          <Route
            path="/ingredients"
            element={
              <IngredientsPage
                ingredients={ingredients}
                addIngredient={addIngredient}
                updateIngredient={updateIngredient}
                deleteIngredient={deleteIngredient}
              />
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
