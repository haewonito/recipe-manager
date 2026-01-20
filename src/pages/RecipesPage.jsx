import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Grid, List, ArrowLeft } from "lucide-react";
import { RECIPE_CATEGORIES } from "../constants";
import RecipeCard from "../components/recipes/RecipeCard";
import RecipeListItem from "../components/recipes/RecipeListItem";

export default function RecipesPage({ recipes, deleteRecipe }) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [viewMode, setViewMode] = useState("grid");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterMainIngredient, setFilterMainIngredient] = useState("");

  // Get unique main ingredients from all recipes
  const allMainIngredients = [
    ...new Set(
      recipes.flatMap(
        (recipe) => recipe.mainIngredients?.map((ing) => ing.name) || []
      )
    ),
  ].sort();

  const filteredRecipes = recipes
    .filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.creator.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((recipe) => !filterCategory || recipe.category === filterCategory)
    .filter(
      (recipe) =>
        !filterMainIngredient ||
        recipe.mainIngredients?.some((ing) => ing.name === filterMainIngredient)
    );

  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortBy === "category") {
      return a.category.localeCompare(b.category);
    } else if (sortBy === "mainIngredients") {
      const aMain = a.mainIngredients[0]?.name || "";
      const bMain = b.mainIngredients[0]?.name || "";
      return aMain.localeCompare(bMain);
    }
    return a.title.localeCompare(b.title);
  });

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      await deleteRecipe(id);
    }
  };

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-600"
          style={{ background: "none" }}
        >
          <ArrowLeft className="icon-md" />
          Back to Home
        </Link>
        <h1 style={{ margin: 0 }}>My Recipes</h1>
        <div className="w-24"></div>
      </div>

      <div className="card card-padding-small mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <div className="flex-1" style={{ minWidth: "256px" }}>
            <div className="input-with-icon">
              <Search className="input-icon icon-md" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="title">Sort by Title</option>
              <option value="category">Sort by Category</option>
              <option value="mainIngredients">Sort by Main Ingredient</option>
            </select>

            <div className="toggle-group">
              <button
                onClick={() => setViewMode("grid")}
                className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              >
                <Grid className="icon-md" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
              >
                <List className="icon-md" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <span style={{ color: "#374151", whiteSpace: "nowrap" }}>
              Filter by Category:
            </span>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              style={{ minWidth: "120px" }}
            >
              <option value="">All</option>
              {RECIPE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span style={{ color: "#374151", whiteSpace: "nowrap" }}>
              Filter by Main Ingredient:
            </span>
            <select
              value={filterMainIngredient}
              onChange={(e) => setFilterMainIngredient(e.target.value)}
              style={{ minWidth: "150px" }}
            >
              <option value="">All</option>
              {allMainIngredients.map((ing) => (
                <option key={ing} value={ing}>
                  {ing}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {sortedRecipes.length === 0 ? (
        <div className="empty-state">
          <p className="mb-4">No recipes found</p>
          <Link to="/recipes/new" className="btn btn-primary">
            Create Your First Recipe
          </Link>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-3 gap-6">
          {sortedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => navigate(`/recipes/${recipe.id}`)}
              onEdit={(e) => {
                e.stopPropagation();
                navigate(`/recipes/${recipe.id}/edit`);
              }}
              onDelete={(e) => handleDelete(e, recipe.id)}
            />
          ))}
        </div>
      ) : (
        <div className="card">
          {sortedRecipes.map((recipe, index) => (
            <RecipeListItem
              key={recipe.id}
              recipe={recipe}
              isLast={index === sortedRecipes.length - 1}
              onClick={() => navigate(`/recipes/${recipe.id}`)}
              onEdit={(e) => {
                e.stopPropagation();
                navigate(`/recipes/${recipe.id}/edit`);
              }}
              onDelete={(e) => handleDelete(e, recipe.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
