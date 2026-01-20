import React from "react";
import { Link } from "react-router-dom";
import { ChefHat } from "lucide-react";

export default function HomePage() {
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
        <Link to="/recipes" className="menu-card">
          <h2>My Recipes</h2>
          <p>View, search, and manage your recipe collection</p>
        </Link>
        <Link to="/recipes/new" className="menu-card amber">
          <h2>Create Recipe</h2>
          <p>Add a new recipe or combine existing recipes</p>
        </Link>
        <Link to="/ingredients" className="menu-card yellow">
          <h2>View and Manage Ingredients</h2>
          <p>View and organize your ingredient list</p>
        </Link>
      </div>
    </div>
  );
}
