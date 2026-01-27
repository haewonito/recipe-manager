import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import CreateIngredientModal from "../common/CreateIngredientModal";

export default function IngredientSelector({
  label,
  selectedIngredients,
  allIngredients,
  onChange,
  addIngredient,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  // Deduplicate ingredients by name (case-insensitive), keeping the first occurrence
  const deduplicatedIngredients = allIngredients.reduce((acc, ing) => {
    const nameLower = ing.name.toLowerCase().trim();
    if (!acc.seen.has(nameLower)) {
      acc.seen.add(nameLower);
      acc.list.push(ing);
    }
    return acc;
  }, { seen: new Set(), list: [] }).list;

  const filteredIngredients = deduplicatedIngredients.filter(
    (ing) =>
      ing.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedIngredients.find((s) => s.id === ing.id)
  );

  // Total options = filtered ingredients + "Create new" option
  const totalOptions = filteredIngredients.length + 1;

  const handleSelect = (ingredient) => {
    onChange([...selectedIngredients, ingredient]);
    setSearchTerm("");
    setShowDropdown(false);
    setHighlightedIndex(0);
  };

  const handleRemove = (id) => {
    onChange(selectedIngredients.filter((i) => i.id !== id));
  };

  const handleCreateNew = async (name, category) => {
    const newIngredient = await addIngredient(name, category);
    onChange([...selectedIngredients, newIngredient]);
    setShowCreateModal(false);
    setSearchTerm("");
  };

  const handleKeyDown = (e) => {
    if (!showDropdown || !searchTerm) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1) % totalOptions);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 + totalOptions) % totalOptions);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex < filteredIngredients.length) {
        handleSelect(filteredIngredients[highlightedIndex]);
      } else {
        setShowCreateModal(true);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setHighlightedIndex(0);
    }
  };

  return (
    <div className="form-group">
      <label>{label}</label>

      <div className="dropdown mb-2">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowDropdown(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setShowDropdown(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search ingredients..."
        />

        {showDropdown && searchTerm && (
          <div className="dropdown-menu">
            {filteredIngredients.length > 0 ? (
              filteredIngredients.map((ing, index) => (
                <div
                  key={ing.id}
                  onClick={() => handleSelect(ing)}
                  className="dropdown-item"
                  style={{
                    backgroundColor: highlightedIndex === index ? "#f0f0f0" : "transparent",
                  }}
                >
                  {ing.name}
                </div>
              ))
            ) : (
              <div className="dropdown-empty">No ingredients found</div>
            )}
            <div
              onClick={() => setShowCreateModal(true)}
              className="dropdown-create"
              style={{
                backgroundColor: highlightedIndex === filteredIngredients.length ? "#f0f0f0" : "transparent",
              }}
            >
              <Plus className="icon-sm" />
              Create new ingredient
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {selectedIngredients.map((ing) => (
          <span key={ing.id} className="tag tag-orange">
            {ing.name}
            <button
              type="button"
              onClick={() => handleRemove(ing.id)}
              style={{ background: "none", padding: 0 }}
            >
              <X className="icon-sm" />
            </button>
          </span>
        ))}
      </div>

      {showCreateModal && (
        <CreateIngredientModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreateNew}
          initialValue={searchTerm}
        />
      )}
    </div>
  );
}
