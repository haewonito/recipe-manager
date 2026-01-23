import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowLeft, Copy, Check } from "lucide-react";
import { INGREDIENT_CATEGORIES, CATEGORY_COLORS } from "../constants";

export default function IngredientsToStartPage({
  publicIngredients,
  copyIngredient,
  userIngredients,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterType, setFilterType] = useState("");
  const [copyingId, setCopyingId] = useState(null);
  const [copiedIds, setCopiedIds] = useState(new Set());

  // Check if ingredient is already in user's collection (by name, case-insensitive)
  const isAlreadyCopied = (ingredient) => {
    return (
      userIngredients.some(
        (i) => i.name.toLowerCase() === ingredient.name.toLowerCase(),
      ) || copiedIds.has(ingredient.id)
    );
  };

  const filteredIngredients = publicIngredients
    .filter((ing) => ing.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((ing) => !filterCategory || ing.category === filterCategory)
    .filter((ing) => {
      if (!filterType) return true;
      if (filterType === "default") return ing.isDefault === true;
      if (filterType === "public") return ing.isPublic === true;
      return true;
    });

  const sortedIngredients = [...filteredIngredients].sort((a, b) => {
    if (sortBy === "category") {
      const catCompare = (a.category || "").localeCompare(b.category || "");
      if (catCompare !== 0) return catCompare;
      return a.name.localeCompare(b.name);
    }
    return a.name.localeCompare(b.name);
  });

  const handleCopy = async (e, ingredient) => {
    e.stopPropagation();
    if (isAlreadyCopied(ingredient) || copyingId === ingredient.id) return;

    setCopyingId(ingredient.id);
    try {
      await copyIngredient(ingredient);
      setCopiedIds((prev) => new Set([...prev, ingredient.id]));
    } catch (error) {
      console.error("Failed to copy ingredient:", error);
    } finally {
      setCopyingId(null);
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
        <h1 style={{ margin: 0 }}>Public Ingredients</h1>
        <div className="w-24"></div>
      </div>

      <p className="text-gray-600 mb-6 text-center">
        Browse ingredients shared by other users. Copy any ingredient to add it
        to your collection.
      </p>

      <div className="card card-padding-small mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <div className="flex-1" style={{ minWidth: "256px" }}>
            <div className="input-with-icon">
              <Search className="input-icon icon-md" />
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">Sort by Name</option>
              <option value="category">Sort by Category</option>
            </select>
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
              style={{ minWidth: "150px" }}
            >
              <option value="">All</option>
              {INGREDIENT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() =>
              setFilterType(filterType === "default" ? "" : "default")
            }
            className={`btn ${filterType === "default" ? "btn-primary" : "btn-secondary"}`}
          >
            {filterType === "default"
              ? "Showing Defaults Only"
              : "Show Defaults Only"}
          </button>
        </div>
      </div>

      {sortedIngredients.length === 0 ? (
        <div className="empty-state">
          <p className="mb-4">No public ingredients yet</p>
          <p className="text-gray-500">
            Check back later for ingredients shared by other users.
          </p>
        </div>
      ) : (
        <div className="card">
          {/* Header Row */}
          <div
            className="p-4 flex items-center justify-between border-b"
            style={{ backgroundColor: "#f9fafb" }}
          >
            <div className="flex items-center gap-3">
              <span style={{ minWidth: "200px", fontWeight: 600 }}>
                Ingredient
              </span>
              <span style={{ fontWeight: 600 }}>Category</span>
            </div>
            <div style={{ width: "100px" }}></div>
          </div>

          {sortedIngredients.map((ing, index) => (
            <div
              key={ing.id}
              className={`p-4 flex items-center justify-between ${
                index !== sortedIngredients.length - 1 ? "border-b" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-gray-800" style={{ minWidth: "200px" }}>
                  {ing.name}
                </span>
                {ing.category && (
                  <span
                    style={{
                      fontSize: "12px",
                      padding: "4px 8px",
                      borderRadius: "4px",
                      backgroundColor:
                        CATEGORY_COLORS[ing.category]?.bg || "#e5e7eb",
                      color: CATEGORY_COLORS[ing.category]?.text || "#374151",
                    }}
                  >
                    {ing.category}
                  </span>
                )}
              </div>
              <div>
                {isAlreadyCopied(ing) ? (
                  <span className="flex items-center gap-1 text-green-600">
                    <Check className="icon-sm" />
                    <span style={{ fontSize: "14px" }}>Added</span>
                  </span>
                ) : (
                  <button
                    onClick={(e) => handleCopy(e, ing)}
                    disabled={copyingId === ing.id}
                    className="btn btn-secondary flex items-center gap-1"
                    style={{ padding: "6px 12px", fontSize: "14px" }}
                  >
                    <Copy className="icon-sm" />
                    {copyingId === ing.id ? "Copying..." : "Copy"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
