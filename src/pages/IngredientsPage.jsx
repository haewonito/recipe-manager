import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Plus, Edit2, Trash2, ArrowLeft, Copy } from "lucide-react";
import { INGREDIENT_CATEGORIES, CATEGORY_COLORS } from "../constants";
import CreateIngredientModal from "../components/common/CreateIngredientModal";

export default function IngredientsPage({
  ingredients,
  defaultIngredients = [],
  addIngredient,
  updateIngredient,
  deleteIngredient,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showDefaultIngredients, setShowDefaultIngredients] = useState(true);

  // Combine user ingredients with default ingredients (marked as isDefault)
  // Filter out default ingredients that user has already copied (by name)
  const userIngredientNames = new Set(
    ingredients.map((ing) => ing.name.toLowerCase()),
  );
  const allIngredients = [
    ...ingredients.map((ing) => ({ ...ing, isDefaultIngredient: false })),
    ...(showDefaultIngredients
      ? defaultIngredients
          .filter((ing) => !userIngredientNames.has(ing.name.toLowerCase()))
          .map((ing) => ({ ...ing, isDefaultIngredient: true }))
      : []),
  ];
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingCategory, setEditingCategory] = useState("");
  const [editingIsPublic, setEditingIsPublic] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [copyingId, setCopyingId] = useState(null);

  // Check if a default ingredient is already in user's collection
  const isAlreadyCopied = (defaultIng) => {
    return ingredients.some(
      (i) => i.name.toLowerCase() === defaultIng.name.toLowerCase(),
    );
  };

  const handleCopyDefault = async (ing) => {
    if (isAlreadyCopied(ing)) return;
    setCopyingId(ing.id);
    try {
      await addIngredient(ing.name, ing.category, false);
    } catch (error) {
      console.error("Failed to copy ingredient:", error);
    } finally {
      setCopyingId(null);
    }
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const filteredIngredients = allIngredients
    .filter((ing) => ing.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .filter((ing) => !filterCategory || ing.category === filterCategory)
    .sort((a, b) => {
      let compare;
      if (sortBy === "name") {
        compare = a.name.localeCompare(b.name);
      } else {
        compare = (a.category || "").localeCompare(b.category || "");
        // Secondary sort by name when categories are equal
        if (compare === 0) {
          compare = a.name.localeCompare(b.name);
        }
      }
      return sortDirection === "asc" ? compare : -compare;
    });

  const handleCreate = async (name, category, isPublic) => {
    await addIngredient(name, category, isPublic);
    setShowCreateModal(false);
  };

  const handleEdit = (ing) => {
    setEditingId(ing.id);
    setEditingName(ing.name);
    setEditingCategory(ing.category || INGREDIENT_CATEGORIES[0]);
    setEditingIsPublic(ing.isPublic || false);
  };

  const handleSaveEdit = async () => {
    if (editingName.trim()) {
      await updateIngredient(
        editingId,
        editingName.trim(),
        editingCategory,
        editingIsPublic,
      );
      setEditingId(null);
      setEditingName("");
      setEditingCategory("");
      setEditingIsPublic(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this ingredient?")) {
      await deleteIngredient(id);
    }
  };

  return (
    <div className="container-small">
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/"
          className="flex items-center gap-2 text-gray-600"
          style={{ background: "none" }}
        >
          <ArrowLeft className="icon-md" />
          Back to Home
        </Link>
        <h1 style={{ margin: 0 }}>Manage Ingredients</h1>
        <div className="w-24"></div>
      </div>

      <div className="card card-padding-small mb-6">
        <div className="flex gap-4 items-center mb-4">
          <div className="flex-1 input-with-icon">
            <Search className="input-icon icon-md" />
            <input
              type="text"
              placeholder="Search ingredients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary"
          >
            <Plus className="icon-md" />
            New Ingredient
          </button>
        </div>
        <div className="flex items-center gap-4">
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

          <label
            className="flex items-center gap-2"
            style={{ cursor: "pointer" }}
          >
            <input
              type="checkbox"
              checked={showDefaultIngredients}
              onChange={(e) => setShowDefaultIngredients(e.target.checked)}
              style={{ width: "16px", height: "16px" }}
            />
            <span style={{ color: "#374151", whiteSpace: "nowrap" }}>
              Show default ingredients
            </span>
          </label>
        </div>
      </div>

      <div className="card">
        {/* Header Row */}
        <div
          className="p-4 flex items-center justify-between border-b"
          style={{ backgroundColor: "#f9fafb" }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSort("name")}
              className="flex items-center gap-1"
              style={{
                minWidth: "200px",
                background: "none",
                padding: 0,
                fontWeight: 600,
                color: sortBy === "name" ? "#ea580c" : "#374151",
                cursor: "pointer",
              }}
            >
              Ingredient
              {sortBy === "name" && (
                <span style={{ fontSize: "12px" }}>
                  {sortDirection === "asc" ? "▲" : "▼"}
                </span>
              )}
            </button>
            <button
              onClick={() => handleSort("category")}
              className="flex items-center gap-1"
              style={{
                background: "none",
                padding: 0,
                fontWeight: 600,
                color: sortBy === "category" ? "#ea580c" : "#374151",
                cursor: "pointer",
              }}
            >
              Category
              {sortBy === "category" && (
                <span style={{ fontSize: "12px" }}>
                  {sortDirection === "asc" ? "▲" : "▼"}
                </span>
              )}
            </button>
          </div>
          <div style={{ width: "80px" }}></div>
        </div>

        {filteredIngredients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {ingredients.length === 0
              ? "No ingredients yet. Create your first one!"
              : "No matching ingredients found."}
          </div>
        ) : (
          filteredIngredients.map((ing, index) => (
            <div
              key={ing.id}
              className={`p-4 flex items-center justify-between ${
                index !== filteredIngredients.length - 1 ? "border-b" : ""
              }`}
            >
              {editingId === ing.id ? (
                <div
                  className="flex gap-2 flex-1 items-center"
                  style={{ marginRight: "16px" }}
                >
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                    style={{ flex: 1, minWidth: "150px" }}
                    autoFocus
                  />
                  <select
                    value={editingCategory}
                    onChange={(e) => setEditingCategory(e.target.value)}
                  >
                    {INGREDIENT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <label
                    className="flex items-center gap-1"
                    style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  >
                    <input
                      type="checkbox"
                      checked={editingIsPublic}
                      onChange={(e) => setEditingIsPublic(e.target.checked)}
                      style={{ width: "16px", height: "16px" }}
                    />
                    <span style={{ fontSize: "14px" }}>Public</span>
                  </label>
                </div>
              ) : (
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
              )}
              <div className="flex gap-2">
                {editingId === ing.id ? (
                  <>
                    <button
                      onClick={handleSaveEdit}
                      className="btn btn-green"
                      style={{ padding: "4px 12px", fontSize: "14px" }}
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="btn btn-secondary"
                      style={{ padding: "4px 12px", fontSize: "14px" }}
                    >
                      Cancel
                    </button>
                  </>
                ) : ing.isDefaultIngredient ? (
                  isAlreadyCopied(ing) ? (
                    <span
                      style={{
                        color: "#9ca3af",
                        fontSize: "12px",
                        padding: "8px",
                      }}
                    >
                      Already copied
                    </span>
                  ) : (
                    <button
                      onClick={() => handleCopyDefault(ing)}
                      disabled={copyingId === ing.id}
                      className="btn btn-secondary flex items-center gap-1"
                      style={{ padding: "4px 12px", fontSize: "14px" }}
                      title="Copy to my ingredients for editing"
                    >
                      <Copy className="icon-sm" />
                      {copyingId === ing.id ? "Copying..." : "Copy"}
                    </button>
                  )
                ) : (
                  <>
                    <button
                      onClick={() => handleEdit(ing)}
                      className="btn-icon text-blue-600"
                    >
                      <Edit2 className="icon-sm" />
                    </button>
                    <button
                      onClick={() => handleDelete(ing.id)}
                      className="btn-icon text-red-600"
                    >
                      <Trash2 className="icon-sm" />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showCreateModal && (
        <CreateIngredientModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
          initialValue=""
        />
      )}
    </div>
  );
}
