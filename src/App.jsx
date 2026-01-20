import React, { useState, useEffect } from "react";
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
import CombinationRecipeFormPage from "./pages/CombinationRecipeFormPage";

export default function RecipeApp() {
  const [currentPage, setCurrentPage] = useState("home");
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);

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

  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    if (page === "recipeDetail") {
      setSelectedRecipe(data);
    } else if (page === "editRecipe") {
      setEditingRecipe(data);
    }
  };

  return (
    <div className="min-h-screen">
      {currentPage === "home" && <HomePage navigateTo={navigateTo} />}
      {currentPage === "recipes" && (
        <RecipesPage
          recipes={recipes}
          navigateTo={navigateTo}
          deleteRecipe={deleteRecipe}
        />
      )}
      {currentPage === "createRecipe" && (
        <RecipeFormPage
          navigateTo={navigateTo}
          onSave={addRecipe}
          ingredients={ingredients}
          addIngredient={addIngredient}
        />
      )}
      {currentPage === "editRecipe" && editingRecipe && (
        <RecipeFormPage
          navigateTo={navigateTo}
          onSave={updateRecipe}
          ingredients={ingredients}
          addIngredient={addIngredient}
          existingRecipe={editingRecipe}
        />
      )}
      {currentPage === "recipeDetail" && selectedRecipe && (
        <RecipeDetailPage
          recipe={selectedRecipe}
          navigateTo={navigateTo}
          allRecipes={recipes}
        />
      )}
      {currentPage === "ingredients" && (
        <IngredientsPage
          ingredients={ingredients}
          addIngredient={addIngredient}
          updateIngredient={updateIngredient}
          deleteIngredient={deleteIngredient}
          navigateTo={navigateTo}
        />
      )}
      {currentPage === "createCombination" && (
        <CombinationRecipeFormPage
          navigateTo={navigateTo}
          onSave={addRecipe}
          recipes={recipes.filter((r) => r.category !== "Combination")}
        />
      )}
    </div>
  );
}
