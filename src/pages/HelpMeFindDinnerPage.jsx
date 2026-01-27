import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Plus, X, Search } from "lucide-react";

const FRIDGE_SECTIONS = {
  priority: { label: "Priority (Use First!)", color: "#fecaca", textColor: "#991b1b" },
  fresh: { label: "Fresh", color: "#bbf7d0", textColor: "#166534" },
  frozen: { label: "Frozen", color: "#bfdbfe", textColor: "#1e40af" },
};

export default function HelpMeFindDinnerPage({ ingredients }) {
  const [fridgeContents, setFridgeContents] = useState({
    priority: [],
    fresh: [],
    frozen: [],
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingToSection, setAddingToSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load fridge contents from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("fridgeContents");
    if (saved) {
      try {
        setFridgeContents(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse fridge contents:", e);
      }
    }
  }, []);

  // Save fridge contents to localStorage when changed
  useEffect(() => {
    localStorage.setItem("fridgeContents", JSON.stringify(fridgeContents));
  }, [fridgeContents]);

  const openAddModal = (section) => {
    setAddingToSection(section);
    setSearchTerm("");
    setShowAddModal(true);
  };

  const closeAddModal = () => {
    setShowAddModal(false);
    setAddingToSection(null);
    setSearchTerm("");
  };

  const addIngredientToSection = (ingredient) => {
    // Check if already in any section
    const allItems = [
      ...fridgeContents.priority,
      ...fridgeContents.fresh,
      ...fridgeContents.frozen,
    ];
    if (allItems.some((item) => item.id === ingredient.id)) {
      return; // Already in fridge
    }

    setFridgeContents((prev) => ({
      ...prev,
      [addingToSection]: [...prev[addingToSection], { id: ingredient.id, name: ingredient.name }],
    }));
    closeAddModal();
  };

  const removeIngredientFromSection = (section, ingredientId) => {
    setFridgeContents((prev) => ({
      ...prev,
      [section]: prev[section].filter((item) => item.id !== ingredientId),
    }));
  };

  const moveIngredient = (fromSection, toSection, ingredient) => {
    setFridgeContents((prev) => ({
      ...prev,
      [fromSection]: prev[fromSection].filter((item) => item.id !== ingredient.id),
      [toSection]: [...prev[toSection], ingredient],
    }));
  };

  // Filter available ingredients (not already in fridge)
  const allFridgeIds = new Set([
    ...fridgeContents.priority.map((i) => i.id),
    ...fridgeContents.fresh.map((i) => i.id),
    ...fridgeContents.frozen.map((i) => i.id),
  ]);

  const availableIngredients = ingredients
    .filter((ing) => !allFridgeIds.has(ing.id))
    .filter((ing) => ing.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

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
        <h1 style={{ margin: 0 }}>Help Me Find Dinner</h1>
        <div className="w-24"></div>
      </div>

      <p className="text-gray-600 mb-8 text-center">
        Tell us what's in your fridge, and we'll help you find the perfect dinner!
      </p>

      {/* Things in my fridge section */}
      <div className="card card-padding mb-8">
        <h2 className="mb-6" style={{ fontSize: "20px", fontWeight: 600 }}>
          🧊 Things In My Fridge
        </h2>

        <div className="grid grid-cols-3 gap-6">
          {Object.entries(FRIDGE_SECTIONS).map(([sectionKey, sectionConfig]) => (
            <div
              key={sectionKey}
              style={{
                backgroundColor: sectionConfig.color,
                borderRadius: "12px",
                padding: "16px",
                minHeight: "200px",
              }}
            >
              <div className="flex justify-between items-center mb-4">
                <h3
                  style={{
                    fontSize: "16px",
                    fontWeight: 600,
                    color: sectionConfig.textColor,
                    margin: 0,
                  }}
                >
                  {sectionConfig.label}
                </h3>
                <button
                  onClick={() => openAddModal(sectionKey)}
                  className="btn-icon"
                  style={{
                    backgroundColor: "white",
                    borderRadius: "50%",
                    width: "28px",
                    height: "28px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Add ingredient"
                >
                  <Plus size={16} color={sectionConfig.textColor} />
                </button>
              </div>

              <div className="flex flex-col gap-2">
                {fridgeContents[sectionKey].length === 0 ? (
                  <p
                    style={{
                      color: sectionConfig.textColor,
                      opacity: 0.6,
                      fontSize: "14px",
                      textAlign: "center",
                      padding: "20px 0",
                    }}
                  >
                    No items yet
                  </p>
                ) : (
                  fridgeContents[sectionKey].map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between"
                      style={{
                        backgroundColor: "white",
                        padding: "8px 12px",
                        borderRadius: "8px",
                      }}
                    >
                      <span style={{ fontSize: "14px", color: "#374151" }}>
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1">
                        {/* Move buttons */}
                        {sectionKey !== "priority" && (
                          <button
                            onClick={() => moveIngredient(sectionKey, "priority", item)}
                            style={{
                              background: "none",
                              border: "none",
                              padding: "4px",
                              cursor: "pointer",
                              fontSize: "12px",
                              color: "#991b1b",
                            }}
                            title="Move to Priority"
                          >
                            🔥
                          </button>
                        )}
                        {sectionKey !== "fresh" && (
                          <button
                            onClick={() => moveIngredient(sectionKey, "fresh", item)}
                            style={{
                              background: "none",
                              border: "none",
                              padding: "4px",
                              cursor: "pointer",
                              fontSize: "12px",
                              color: "#166534",
                            }}
                            title="Move to Fresh"
                          >
                            🥬
                          </button>
                        )}
                        {sectionKey !== "frozen" && (
                          <button
                            onClick={() => moveIngredient(sectionKey, "frozen", item)}
                            style={{
                              background: "none",
                              border: "none",
                              padding: "4px",
                              cursor: "pointer",
                              fontSize: "12px",
                              color: "#1e40af",
                            }}
                            title="Move to Frozen"
                          >
                            ❄️
                          </button>
                        )}
                        <button
                          onClick={() => removeIngredientFromSection(sectionKey, item.id)}
                          className="btn-icon"
                          style={{ padding: "4px" }}
                          title="Remove"
                        >
                          <X size={14} color="#6b7280" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Ingredient Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: "400px" }}>
            <h3 style={{ marginBottom: "16px" }}>
              Add to {FRIDGE_SECTIONS[addingToSection]?.label}
            </h3>

            <div className="input-with-icon mb-4">
              <Search className="input-icon icon-md" />
              <input
                type="text"
                placeholder="Search ingredients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
            </div>

            <div
              style={{
                maxHeight: "300px",
                overflowY: "auto",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            >
              {availableIngredients.length === 0 ? (
                <p
                  style={{
                    padding: "20px",
                    textAlign: "center",
                    color: "#6b7280",
                  }}
                >
                  {searchTerm
                    ? "No matching ingredients found"
                    : "All ingredients are already in your fridge!"}
                </p>
              ) : (
                availableIngredients.map((ing) => (
                  <div
                    key={ing.id}
                    onClick={() => addIngredientToSection(ing)}
                    className="dropdown-item"
                    style={{
                      padding: "12px 16px",
                      cursor: "pointer",
                      borderBottom: "1px solid #f3f4f6",
                    }}
                  >
                    {ing.name}
                    {ing.category && (
                      <span
                        style={{
                          marginLeft: "8px",
                          fontSize: "12px",
                          color: "#9ca3af",
                        }}
                      >
                        ({ing.category})
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end mt-4">
              <button onClick={closeAddModal} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
