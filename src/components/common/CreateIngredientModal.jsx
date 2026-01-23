import React, { useState } from "react";
import { INGREDIENT_CATEGORIES } from "../../constants";

export default function CreateIngredientModal({ onClose, onCreate, initialValue }) {
  const [name, setName] = useState(initialValue);
  const [category, setCategory] = useState(INGREDIENT_CATEGORIES[0]);
  const [isPublic, setIsPublic] = useState(false);

  const handleCreate = () => {
    if (name.trim()) {
      onCreate(name.trim(), category, isPublic);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Create New Ingredient</h3>
        <div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ingredient name"
            autoFocus
            className="mb-4"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mb-4"
            style={{ width: "100%" }}
          >
            {INGREDIENT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <label className="flex items-center gap-2 mb-4" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              style={{ width: "16px", height: "16px" }}
            />
            <span style={{ color: "#374151" }}>Make this ingredient public</span>
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleCreate}
              className="flex-1 btn btn-primary"
            >
              Create
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
