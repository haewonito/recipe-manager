import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import CreateIngredientModal from "../common/CreateIngredientModal";

export default function MeasuredIngredientSelector({
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

  const filteredIngredients = allIngredients.filter(
    (ing) =>
      ing.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedIngredients.find((s) => s.ingredient?.id === ing.id)
  );

  // Total options = filtered ingredients + "Create new" option
  const totalOptions = filteredIngredients.length + 1;

  const handleSelect = (ingredient) => {
    onChange([...selectedIngredients, { ingredient, amount: "", unit: "", notes: "" }]);
    setSearchTerm("");
    setShowDropdown(false);
    setHighlightedIndex(0);
  };

  const handleRemove = (id) => {
    onChange(selectedIngredients.filter((i) => i.ingredient?.id !== id));
  };

  const handleUpdate = (id, field, value) => {
    onChange(
      selectedIngredients.map((item) =>
        item.ingredient?.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleCreateNew = async (name, category) => {
    const newIngredient = await addIngredient(name, category);
    onChange([...selectedIngredients, { ingredient: newIngredient, amount: "", unit: "", notes: "" }]);
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

      {selectedIngredients.length > 0 && (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #ddd" }}>
              <th style={{ textAlign: "left", padding: "8px" }}>Ingredient</th>
              <th style={{ textAlign: "left", padding: "8px", width: "80px" }}>Amount</th>
              <th style={{ textAlign: "right", padding: "8px", width: "160px" }}>Unit</th>
              <th style={{ textAlign: "right", padding: "8px", width: "150px" }}>Notes</th>
              <th style={{ width: "40px" }}></th>
            </tr>
          </thead>
          <tbody>
            {selectedIngredients.map((item) => (
              <tr key={item.ingredient?.id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "8px" }}>{item.ingredient?.name}</td>
                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    value={item.amount}
                    onChange={(e) => handleUpdate(item.ingredient?.id, "amount", e.target.value)}
                    placeholder="e.g. 2"
                    style={{ width: "100%", padding: "4px" }}
                  />
                </td>
                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    value={item.unit}
                    onChange={(e) => handleUpdate(item.ingredient?.id, "unit", e.target.value)}
                    placeholder="e.g. cups"
                    style={{ width: "100%", padding: "4px" }}
                  />
                </td>
                <td style={{ padding: "8px" }}>
                  <input
                    type="text"
                    value={item.notes || ""}
                    onChange={(e) => handleUpdate(item.ingredient?.id, "notes", e.target.value)}
                    placeholder="e.g. diced"
                    style={{ width: "100%", padding: "4px" }}
                  />
                </td>
                <td style={{ padding: "8px" }}>
                  <button
                    type="button"
                    onClick={() => handleRemove(item.ingredient?.id)}
                    style={{ background: "none", padding: 0 }}
                  >
                    <X className="icon-sm" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

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
