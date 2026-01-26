import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Grid, List, ArrowLeft, Copy, Check } from "lucide-react";
import { RECIPE_CATEGORIES } from "../constants";
import PublicRecipeCard from "../components/recipes/PublicRecipeCard";
import PublicRecipeListItem from "../components/recipes/PublicRecipeListItem";

export default function RecipesToStartPage({
  publicRecipes,
  copyRecipe,
  userRecipes,
}) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [viewMode, setViewMode] = useState("grid");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterMainIngredient, setFilterMainIngredient] = useState("");
  const [filterCreator, setFilterCreator] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterTag, setFilterTag] = useState("");
  const [copyingId, setCopyingId] = useState(null);
  const [copiedIds, setCopiedIds] = useState(new Set());
  const [isCopyingAll, setIsCopyingAll] = useState(false);
  const [isCopyingFiltered, setIsCopyingFiltered] = useState(false);

  // Get unique main ingredients from all public recipes
  const allMainIngredients = [
    ...new Set(
      publicRecipes.flatMap(
        (recipe) => recipe.mainIngredients?.map((ing) => ing.name) || [],
      ),
    ),
  ].sort();

  // Get unique creators from all public recipes
  const allCreators = [
    ...new Set(publicRecipes.map((recipe) => recipe.creator).filter(Boolean)),
  ].sort();

  // Get unique tags from all public recipes
  const allTags = [
    ...new Set(publicRecipes.flatMap((recipe) => recipe.tags || [])),
  ].sort();

  // Check if recipe is already copied (by sourceRecipeId)
  const isAlreadyCopied = (recipeId) => {
    return (
      userRecipes.some((r) => r.sourceRecipeId === recipeId) ||
      copiedIds.has(recipeId)
    );
  };

  const filteredRecipes = publicRecipes
    .filter(
      (recipe) =>
        recipe.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.creator?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((recipe) => !filterCategory || recipe.category === filterCategory)
    .filter(
      (recipe) =>
        !filterMainIngredient ||
        recipe.mainIngredients?.some(
          (ing) => ing.name === filterMainIngredient,
        ),
    )
    .filter((recipe) => !filterCreator || recipe.creator === filterCreator)
    .filter((recipe) => !filterTag || recipe.tags?.includes(filterTag))
    .filter((recipe) => {
      if (!filterType) return true;
      if (filterType === "default") return recipe.isDefault === true;
      if (filterType === "public") return recipe.isPublic === true;
      return true;
    });

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

  const handleCopy = async (e, recipe) => {
    e.stopPropagation();
    if (isAlreadyCopied(recipe.id) || copyingId === recipe.id) return;

    setCopyingId(recipe.id);
    try {
      await copyRecipe(recipe);
      setCopiedIds((prev) => new Set([...prev, recipe.id]));
    } catch (error) {
      console.error("Failed to copy recipe:", error);
    } finally {
      setCopyingId(null);
    }
  };

  const handleCopyAll = async () => {
    if (isCopyingAll) return;
    const recipesToCopy = publicRecipes.filter((r) => !isAlreadyCopied(r.id));
    if (recipesToCopy.length === 0) return;

    setIsCopyingAll(true);
    for (const recipe of recipesToCopy) {
      try {
        await copyRecipe(recipe);
        setCopiedIds((prev) => new Set([...prev, recipe.id]));
      } catch (error) {
        console.error("Failed to copy recipe:", recipe.title, error);
      }
    }
    setIsCopyingAll(false);
  };

  const handleCopyFiltered = async () => {
    if (isCopyingFiltered) return;
    const recipesToCopy = sortedRecipes.filter((r) => !isAlreadyCopied(r.id));
    if (recipesToCopy.length === 0) return;

    setIsCopyingFiltered(true);
    for (const recipe of recipesToCopy) {
      try {
        await copyRecipe(recipe);
        setCopiedIds((prev) => new Set([...prev, recipe.id]));
      } catch (error) {
        console.error("Failed to copy recipe:", recipe.title, error);
      }
    }
    setIsCopyingFiltered(false);
  };

  const uncopyableAllCount = publicRecipes.filter((r) => !isAlreadyCopied(r.id)).length;
  const uncopyableFilteredCount = sortedRecipes.filter((r) => !isAlreadyCopied(r.id)).length;
  const hasActiveFilters = filterCategory || filterMainIngredient || filterCreator || filterType || filterTag || searchTerm;

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
        <h1 style={{ margin: 0 }}>Public Recipes</h1>
        <div className="w-24"></div>
      </div>

      <p className="text-gray-600 mb-6 text-center">
        Browse recipes shared by other users. Copy any recipe to add it to your
        collection and make it your own.
      </p>

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

          <div className="flex items-center gap-2">
            <span style={{ color: "#374151", whiteSpace: "nowrap" }}>
              Filter by Creator:
            </span>
            <select
              value={filterCreator}
              onChange={(e) => setFilterCreator(e.target.value)}
              style={{ minWidth: "120px" }}
            >
              <option value="">All</option>
              {allCreators.map((creator) => (
                <option key={creator} value={creator}>
                  {creator}
                </option>
              ))}
            </select>
          </div>

          {allTags.length > 0 && (
            <div className="flex items-center gap-2">
              <span style={{ color: "#374151", whiteSpace: "nowrap" }}>
                Filter by Tag:
              </span>
              <select
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
                style={{ minWidth: "120px" }}
              >
                <option value="">All</option>
                {allTags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          )}
          <button
            onClick={() =>
              setFilterType(filterType === "default" ? "" : "default")
            }
            className={`btn ${filterType === "default" ? "btn-primary" : "btn-secondary"}`}
          >
            {filterType === "default"
              ? "Showing Default Only"
              : "Show Default Only"}
          </button>
        </div>

        <div className="flex flex-wrap gap-4 items-center mt-4 pt-4 border-t">
          <button
            onClick={handleCopyAll}
            disabled={isCopyingAll || uncopyableAllCount === 0}
            className="btn btn-primary flex items-center gap-2"
          >
            <Copy className="icon-sm" />
            {isCopyingAll
              ? "Copying..."
              : `Copy All Recipes (${uncopyableAllCount})`}
          </button>
          {hasActiveFilters && (
            <button
              onClick={handleCopyFiltered}
              disabled={isCopyingFiltered || uncopyableFilteredCount === 0}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Copy className="icon-sm" />
              {isCopyingFiltered
                ? "Copying..."
                : `Copy Filtered Recipes (${uncopyableFilteredCount})`}
            </button>
          )}
        </div>
      </div>

      {sortedRecipes.length === 0 ? (
        <div className="empty-state">
          <p className="mb-4">No public recipes available yet</p>
          <p className="text-gray-500">
            Check back later for recipes shared by other users.
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-3 gap-6">
          {sortedRecipes.map((recipe) => (
            <PublicRecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => navigate(`/recipes/${recipe.id}`)}
              onCopy={(e) => handleCopy(e, recipe)}
              isCopying={copyingId === recipe.id}
              isCopied={isAlreadyCopied(recipe.id)}
            />
          ))}
        </div>
      ) : (
        <div className="card">
          {sortedRecipes.map((recipe, index) => (
            <PublicRecipeListItem
              key={recipe.id}
              recipe={recipe}
              isLast={index === sortedRecipes.length - 1}
              onClick={() => navigate(`/recipes/${recipe.id}`)}
              onCopy={(e) => handleCopy(e, recipe)}
              isCopying={copyingId === recipe.id}
              isCopied={isAlreadyCopied(recipe.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
