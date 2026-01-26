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
  const [filterTag, setFilterTag] = useState("");
  const [filterType, setFilterType] = useState("");
  const [copyingId, setCopyingId] = useState(null);
  const [copiedIds, setCopiedIds] = useState(new Set());
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isCopyingMultiple, setIsCopyingMultiple] = useState(false);

  // Check if ingredient is already in user's collection (by name, case-insensitive)
  const isAlreadyCopied = (ingredient) => {
    return (
      userIngredients.some(
        (i) => i.name.toLowerCase() === ingredient.name.toLowerCase(),
      ) || copiedIds.has(ingredient.id)
    );
  };

  // Get unique tags from all public ingredients
  const allTags = [
    ...new Set(publicIngredients.flatMap((ing) => ing.tags || [])),
  ].sort();

  const filteredIngredients = publicIngredients
    .filter((ing) => ing.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((ing) => !filterCategory || ing.category === filterCategory)
    .filter((ing) => !filterTag || ing.tags?.includes(filterTag))
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

  // Get selectable ingredients (not already copied)
  const selectableIngredients = sortedIngredients.filter(
    (ing) => !isAlreadyCopied(ing),
  );

  const handleCopy = async (e, ingredient) => {
    e.stopPropagation();
    if (isAlreadyCopied(ingredient) || copyingId === ingredient.id) return;

    setCopyingId(ingredient.id);
    try {
      await copyIngredient(ingredient);
      setCopiedIds((prev) => new Set([...prev, ingredient.id]));
      setSelectedIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(ingredient.id);
        return newSet;
      });
    } catch (error) {
      console.error("Failed to copy ingredient:", error);
    } finally {
      setCopyingId(null);
    }
  };

  const toggleSelect = (ingredientId, ingredient) => {
    if (isAlreadyCopied(ingredient)) return;
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientId)) {
        newSet.delete(ingredientId);
      } else {
        newSet.add(ingredientId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === selectableIngredients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(selectableIngredients.map((ing) => ing.id)));
    }
  };

  const handleCopySelected = async () => {
    if (selectedIds.size === 0 || isCopyingMultiple) return;

    setIsCopyingMultiple(true);
    const ingredientsToCopy = sortedIngredients.filter((ing) =>
      selectedIds.has(ing.id),
    );

    for (const ingredient of ingredientsToCopy) {
      try {
        await copyIngredient(ingredient);
        setCopiedIds((prev) => new Set([...prev, ingredient.id]));
      } catch (error) {
        console.error("Failed to copy ingredient:", ingredient.name, error);
      }
    }

    setSelectedIds(new Set());
    setIsCopyingMultiple(false);
  };

  const isAllSelected =
    selectableIngredients.length > 0 &&
    selectedIds.size === selectableIngredients.length;

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
          {}
          <div
            className="p-4 flex items-center justify-between border-b"
            style={{ backgroundColor: "#f9fafb" }}
          >
            <div className="flex items-center gap-3">
              <label
                className="flex items-center gap-2"
                style={{ cursor: "pointer", minWidth: "30px" }}
              >
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleSelectAll}
                  style={{ width: "18px", height: "18px" }}
                />
              </label>
              <span style={{ minWidth: "200px", fontWeight: 600 }}>
                Ingredient
              </span>
              <span style={{ fontWeight: 600 }}>Category</span>
            </div>
            <div style={{ minWidth: "150px" }} className="flex justify-end">
              <button
                onClick={handleCopySelected}
                disabled={selectedIds.size === 0 || isCopyingMultiple}
                className="btn btn-primary flex items-center gap-1"
                style={{ padding: "6px 12px", fontSize: "14px" }}
              >
                <Copy className="icon-sm" />
                {isCopyingMultiple
                  ? "Copying..."
                  : `Copy Selected (${selectedIds.size})`}
              </button>
            </div>
          </div>

          {sortedIngredients.map((ing, index) => (
            <div
              key={ing.id}
              className={`p-4 flex items-center justify-between ${
                index !== sortedIngredients.length - 1 ? "border-b" : ""
              }`}
              style={{
                backgroundColor: selectedIds.has(ing.id)
                  ? "#fff7ed"
                  : "transparent",
              }}
            >
              <div className="flex items-center gap-3 flex-wrap">
                <div style={{ minWidth: "30px" }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(ing.id)}
                    onChange={() => toggleSelect(ing.id, ing)}
                    disabled={isAlreadyCopied(ing)}
                    style={{
                      width: "18px",
                      height: "18px",
                      cursor: isAlreadyCopied(ing) ? "not-allowed" : "pointer",
                    }}
                  />
                </div>
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
                {ing.tags && ing.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap" style={{ marginLeft: "8px" }}>
                    {ing.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        style={{
                          fontSize: "12px",
                          padding: "4px 12px",
                          borderRadius: "9999px",
                          backgroundColor: "#dbeafe",
                          color: "#1e40af",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ minWidth: "150px" }} className="flex justify-end">
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
