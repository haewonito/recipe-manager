import React from "react";
import { ChefHat } from "lucide-react";

export default function HomePage({ navigateTo }) {
  return (
    <div className="container-small">
      <div className="text-center mb-12 mt-8">
        <ChefHat
          className="icon-3xl text-orange-600"
          style={{ margin: "0 auto 16px" }}
        />
        <h1 className="mb-2">Recipe Manager</h1>
        <p className="text-gray-600" style={{ fontSize: "18px" }}>
          Plan your meals with ease
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="menu-card" onClick={() => navigateTo("recipes")}>
          <h2>My Recipes</h2>
          <p>View, search, and manage your recipe collection</p>
        </div>
        <div
          className="menu-card amber"
          onClick={() => navigateTo("createRecipe")}
        >
          <h2>Create Recipe</h2>
          <p>Add a new recipe to your collection</p>
        </div>
        <div
          className="menu-card green"
          onClick={() => navigateTo("createCombination")}
        >
          <h2>Create Combination Recipe</h2>
          <p>Combine multiple recipes into one meal</p>
        </div>
        <div
          className="menu-card yellow"
          onClick={() => navigateTo("ingredients")}
        >
          <h2>View and Manage Ingredients</h2>
          <p>View and organize your ingredient list</p>
        </div>
      </div>
    </div>
  );
}
