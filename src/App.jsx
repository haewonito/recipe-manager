import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import RecipesPage from "./pages/RecipesPage";
import RecipeFormPage from "./pages/RecipeFormPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import IngredientsPage from "./pages/IngredientsPage";

function ProtectedRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

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
    <div className="min-h-screen">
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes"
          element={
            <ProtectedRoute>
              <RecipesPage recipes={recipes} deleteRecipe={deleteRecipe} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes/new"
          element={
            <ProtectedRoute>
              <RecipeFormPage
                onSave={addRecipe}
                ingredients={ingredients}
                addIngredient={addIngredient}
                recipes={recipes}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes/:id"
          element={
            <ProtectedRoute>
              <RecipeDetailPage recipes={recipes} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes/:id/edit"
          element={
            <ProtectedRoute>
              <RecipeFormPage
                onSave={updateRecipe}
                ingredients={ingredients}
                addIngredient={addIngredient}
                recipes={recipes}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ingredients"
          element={
            <ProtectedRoute>
              <IngredientsPage
                ingredients={ingredients}
                addIngredient={addIngredient}
                updateIngredient={updateIngredient}
                deleteIngredient={deleteIngredient}
              />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default function RecipeApp() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
