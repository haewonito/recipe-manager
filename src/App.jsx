import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { db } from "./firebase";
import {
  collection,
  query,
  where,
  or,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import CompleteProfilePage from "./pages/CompleteProfilePage";
import HomePage from "./pages/HomePage";
import RecipesPage from "./pages/RecipesPage";
import RecipeFormPage from "./pages/RecipeFormPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import IngredientsPage from "./pages/IngredientsPage";
import RecipesToStartPage from "./pages/RecipesToStartPage";
import IngredientsToStartPage from "./pages/IngredientsToStartPage";
import DefaultRecipesPage from "./pages/DefaultRecipesPage";

function ProtectedRoute({ children }) {
  const { user, hasCompletedProfile } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasCompletedProfile) {
    return <Navigate to="/complete-profile" replace />;
  }

  return children;
}

function AppRoutes() {
  const { user, userProfile, hasCompletedProfile } = useAuth();
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [publicRecipes, setPublicRecipes] = useState([]);
  const [publicIngredients, setPublicIngredients] = useState([]);

  useEffect(() => {
    if (user) {
      loadData();
      loadPublicData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      // Query only recipes belonging to the current user
      const recipesQuery = query(
        collection(db, "recipes"),
        where("userId", "==", user.uid),
      );
      const recipesSnapshot = await getDocs(recipesQuery);
      const recipesData = recipesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecipes(recipesData);

      // Query only ingredients belonging to the current user
      const ingredientsQuery = query(
        collection(db, "ingredients"),
        where("userId", "==", user.uid),
      );
      const ingredientsSnapshot = await getDocs(ingredientsQuery);
      const ingredientsData = ingredientsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIngredients(ingredientsData);
    } catch (error) {
      console.error("Error loading data from Firestore:", error);
    }
  };

  const loadPublicData = async () => {
    try {
      // Query recipes where isDefault=true OR isPublic=true (excluding current user's own recipes)
      const publicRecipesQuery = query(
        collection(db, "recipes"),
        or(where("isDefault", "==", true), where("isPublic", "==", true)),
      );
      const publicRecipesSnapshot = await getDocs(publicRecipesQuery);
      const publicRecipesData = publicRecipesSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter((recipe) => !recipe.userId || recipe.userId !== user.uid);
      setPublicRecipes(publicRecipesData);

      // Query ingredients where isDefault=true OR isPublic=true (excluding current user's own ingredients)
      const publicIngredientsQuery = query(
        collection(db, "ingredients"),
        or(where("isDefault", "==", true), where("isPublic", "==", true)),
      );
      const publicIngredientsSnapshot = await getDocs(publicIngredientsQuery);
      const publicIngredientsData = publicIngredientsSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(
          (ingredient) => !ingredient.userId || ingredient.userId !== user.uid,
        );
      setPublicIngredients(publicIngredientsData);
    } catch (error) {
      console.error("Error loading public data from Firestore:", error);
    }
  };

  const copyRecipeToMyCollection = async (publicRecipe) => {
    // Copy ingredients that user doesn't have
    const ingredientMapping = {};
    const allIngredients = [
      ...(publicRecipe.mainIngredients || []),
      ...(publicRecipe.necessaryIngredients || []),
      ...(publicRecipe.optionalIngredients || []),
    ];

    for (const ing of allIngredients) {
      // Check if user already has this ingredient by name
      const existingIngredient = ingredients.find(
        (i) => i.name.toLowerCase() === ing.name.toLowerCase(),
      );

      if (existingIngredient) {
        ingredientMapping[ing.id] = existingIngredient;
      } else {
        // Find the ingredient in public ingredients to get its category
        const publicIng = publicIngredients.find((pi) => pi.id === ing.id);
        const category = publicIng?.category || "Pantry Staples";
        const newIngredient = await addIngredient(ing.name, category);
        ingredientMapping[ing.id] = newIngredient;
      }
    }

    // Map ingredients to use user's ingredient IDs
    const mapIngredients = (ingList) =>
      (ingList || []).map((ing) => ({
        id: ingredientMapping[ing.id]?.id || ing.id,
        name: ing.name,
      }));

    const { id, userId, isDefault, isPublic, ...recipeData } = publicRecipe;
    const newRecipe = {
      ...recipeData,
      mainIngredients: mapIngredients(publicRecipe.mainIngredients),
      necessaryIngredients: mapIngredients(publicRecipe.necessaryIngredients),
      optionalIngredients: mapIngredients(publicRecipe.optionalIngredients),
      userId: user.uid,
      isDefault: false,
      isPublic: false,
      sourceRecipeId: publicRecipe.id,
      sourceUserId: publicRecipe.userId,
    };

    const docRef = await addDoc(collection(db, "recipes"), newRecipe);
    const savedRecipe = { ...newRecipe, id: docRef.id };
    setRecipes([...recipes, savedRecipe]);
    return savedRecipe;
  };

  const addRecipe = async (recipe) => {
    const recipeWithUser = {
      ...recipe,
      userId: user.uid,
      creator: userProfile?.userName || user.email,
      isDefault: false,
      isPublic: false,
    };
    const docRef = await addDoc(collection(db, "recipes"), recipeWithUser);
    const newRecipe = { ...recipeWithUser, id: docRef.id };
    setRecipes([...recipes, newRecipe]);
  };

  const updateRecipe = async (updatedRecipe) => {
    const { id, ...recipeData } = updatedRecipe;
    await updateDoc(doc(db, "recipes", id), recipeData);
    setRecipes((prevRecipes) =>
      prevRecipes.map((r) => (r.id === id ? updatedRecipe : r))
    );
  };

  const deleteRecipe = async (id) => {
    await deleteDoc(doc(db, "recipes", id));
    setRecipes((prevRecipes) => prevRecipes.filter((r) => r.id !== id));
  };

  const addIngredient = async (name, category, isPublic = false) => {
    const docRef = await addDoc(collection(db, "ingredients"), {
      name,
      category,
      userId: user.uid,
      isDefault: false,
      isPublic,
    });
    const newIngredient = {
      id: docRef.id,
      name,
      category,
      userId: user.uid,
      isDefault: false,
      isPublic,
    };
    setIngredients((prevIngredients) => [...prevIngredients, newIngredient]);
    return newIngredient;
  };

  const updateIngredient = async (id, name, category, isPublic = false) => {
    await updateDoc(doc(db, "ingredients", id), { name, category, isPublic });
    setIngredients((prevIngredients) =>
      prevIngredients.map((i) =>
        i.id === id ? { ...i, name, category, isPublic } : i,
      ),
    );
  };

  const deleteIngredient = async (id) => {
    await deleteDoc(doc(db, "ingredients", id));
    setIngredients((prevIngredients) =>
      prevIngredients.filter((i) => i.id !== id)
    );
  };

  const copyIngredientToMyCollection = async (publicIngredient) => {
    // Check if user already has this ingredient by name
    const existingIngredient = ingredients.find(
      (i) => i.name.toLowerCase() === publicIngredient.name.toLowerCase()
    );

    if (existingIngredient) {
      return existingIngredient; // Already have it
    }

    const newIngredient = await addIngredient(
      publicIngredient.name,
      publicIngredient.category,
      false // copied ingredients are not public by default
    );
    return newIngredient;
  };

  return (
    <div className="min-h-screen">
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <LoginPage />}
        />
        <Route
          path="/complete-profile"
          element={
            !user ? (
              <Navigate to="/login" replace />
            ) : hasCompletedProfile ? (
              <Navigate to="/" replace />
            ) : (
              <CompleteProfilePage />
            )
          }
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
              <RecipeDetailPage
                recipes={recipes}
                publicRecipes={publicRecipes}
              />
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
                defaultIngredients={publicIngredients}
                addIngredient={addIngredient}
                updateIngredient={updateIngredient}
                deleteIngredient={deleteIngredient}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recipes-to-start"
          element={
            <ProtectedRoute>
              <RecipesToStartPage
                publicRecipes={publicRecipes}
                copyRecipe={copyRecipeToMyCollection}
                userRecipes={recipes}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ingredients-to-start"
          element={
            <ProtectedRoute>
              <IngredientsToStartPage
                publicIngredients={publicIngredients}
                copyIngredient={copyIngredientToMyCollection}
                userIngredients={ingredients}
              />
            </ProtectedRoute>
          }
        />
        <Route
          path="/default-recipes"
          element={
            <ProtectedRoute>
              <DefaultRecipesPage
                defaultRecipes={publicRecipes}
                copyRecipe={copyRecipeToMyCollection}
                userRecipes={recipes}
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
