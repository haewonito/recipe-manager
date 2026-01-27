import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, X, Search, ChefHat } from "lucide-react";
import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const FRIDGE_SECTIONS = {
  priority: { label: "Priority (Use First!)", color: "#fecaca", textColor: "#991b1b" },
  fresh: { label: "Fresh", color: "#bbf7d0", textColor: "#166534" },
  frozen: { label: "Frozen", color: "#bfdbfe", textColor: "#1e40af" },
};

export default function HelpMeFindDinnerPage({ ingredients, recipes = [], user }) {
  const navigate = useNavigate();
  const [fridgeContents, setFridgeContents] = useState({
    priority: [],
    fresh: [],
    frozen: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addingToSection, setAddingToSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Load fridge contents from Firestore on mount
  useEffect(() => {
    const loadFridgeContents = async () => {
      if (!user?.uid) return;

      try {
        const docRef = doc(db, "fridgeContents", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setFridgeContents({
            priority: data.priority || [],
            fresh: data.fresh || [],
            frozen: data.frozen || [],
          });
        }
      } catch (error) {
        console.error("Failed to load fridge contents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFridgeContents();
  }, [user?.uid]);

  // Save fridge contents to Firestore when changed
  const saveFridgeContents = async (newContents) => {
    if (!user?.uid) return;

    try {
      const docRef = doc(db, "fridgeContents", user.uid);
      await setDoc(docRef, {
        priority: newContents.priority,
        fresh: newContents.fresh,
        frozen: newContents.frozen,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Failed to save fridge contents:", error);
    }
  };

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

    const newContents = {
      ...fridgeContents,
      [addingToSection]: [...fridgeContents[addingToSection], { id: ingredient.id, name: ingredient.name }],
    };
    setFridgeContents(newContents);
    saveFridgeContents(newContents);
    closeAddModal();
  };

  const removeIngredientFromSection = (section, ingredientId) => {
    const newContents = {
      ...fridgeContents,
      [section]: fridgeContents[section].filter((item) => item.id !== ingredientId),
    };
    setFridgeContents(newContents);
    saveFridgeContents(newContents);
  };

  const moveIngredient = (fromSection, toSection, ingredient) => {
    const newContents = {
      ...fridgeContents,
      [fromSection]: fridgeContents[fromSection].filter((item) => item.id !== ingredient.id),
      [toSection]: [...fridgeContents[toSection], ingredient],
    };
    setFridgeContents(newContents);
    saveFridgeContents(newContents);
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

  // Calculate matching recipes
  const priorityIds = new Set(fridgeContents.priority.map((i) => i.id));
  const freshIds = new Set(fridgeContents.fresh.map((i) => i.id));
  const frozenIds = new Set(fridgeContents.frozen.map((i) => i.id));

  const getRecipeMatches = (recipe) => {
    const allRecipeIngredients = [
      ...(recipe.mainIngredients || []),
      ...(recipe.necessaryIngredients || []),
      ...(recipe.optionalIngredients || []),
    ];

    const matches = {
      priority: [],
      fresh: [],
      frozen: [],
      total: 0,
      priorityCount: 0,
    };

    allRecipeIngredients.forEach((ing) => {
      if (priorityIds.has(ing.id)) {
        matches.priority.push(ing.name);
        matches.priorityCount++;
        matches.total++;
      } else if (freshIds.has(ing.id)) {
        matches.fresh.push(ing.name);
        matches.total++;
      } else if (frozenIds.has(ing.id)) {
        matches.frozen.push(ing.name);
        matches.total++;
      }
    });

    return matches;
  };

  const matchingRecipes = recipes
    .map((recipe) => ({
      ...recipe,
      matches: getRecipeMatches(recipe),
    }))
    .filter((recipe) => recipe.matches.total > 0)
    .sort((a, b) => {
      // First sort by priority matches (descending)
      if (b.matches.priorityCount !== a.matches.priorityCount) {
        return b.matches.priorityCount - a.matches.priorityCount;
      }
      // Then by total matches (descending)
      return b.matches.total - a.matches.total;
    });

  const totalFridgeItems = fridgeContents.priority.length + fridgeContents.fresh.length + fridgeContents.frozen.length;

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

      {isLoading ? (
        <div className="text-center" style={{ padding: "40px 0" }}>
          <p className="text-gray-500">Loading your fridge contents...</p>
        </div>
      ) : (
        <>
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

      {/* Recipe Suggestions Section */}
      <div className="card card-padding mb-8">
        <h2 className="mb-6" style={{ fontSize: "20px", fontWeight: 600 }}>
          🍳 Recipe Suggestions
        </h2>

        {totalFridgeItems === 0 ? (
          <p className="text-gray-500 text-center" style={{ padding: "40px 0" }}>
            Add ingredients to your fridge to see recipe suggestions!
          </p>
        ) : matchingRecipes.length === 0 ? (
          <p className="text-gray-500 text-center" style={{ padding: "40px 0" }}>
            No recipes found matching your fridge ingredients. Try adding more items!
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {matchingRecipes.map((recipe) => (
              <div
                key={recipe.id}
                onClick={() => navigate(`/recipes/${recipe.id}`)}
                className="flex items-start gap-4 p-4"
                style={{
                  backgroundColor: recipe.matches.priorityCount > 0 ? "#fef2f2" : "#f9fafb",
                  borderRadius: "12px",
                  cursor: "pointer",
                  border: recipe.matches.priorityCount > 0 ? "2px solid #fecaca" : "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    borderRadius: "8px",
                    backgroundColor: "#fff7ed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  {recipe.picture ? (
                    <img
                      src={recipe.picture}
                      alt={recipe.title}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  ) : (
                    <ChefHat className="icon-lg text-orange-600" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 600 }}>
                      {recipe.title}
                    </h3>
                    {recipe.matches.priorityCount > 0 && (
                      <span
                        style={{
                          fontSize: "12px",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          backgroundColor: "#fecaca",
                          color: "#991b1b",
                        }}
                      >
                        🔥 Uses priority items!
                      </span>
                    )}
                  </div>

                  <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 8px 0" }}>
                    {recipe.category} • {recipe.matches.total} ingredient{recipe.matches.total !== 1 ? "s" : ""} you have
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {recipe.matches.priority.map((name, idx) => (
                      <span
                        key={`priority-${idx}`}
                        style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          backgroundColor: "#fecaca",
                          color: "#991b1b",
                        }}
                      >
                        {name}
                      </span>
                    ))}
                    {recipe.matches.fresh.map((name, idx) => (
                      <span
                        key={`fresh-${idx}`}
                        style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          backgroundColor: "#bbf7d0",
                          color: "#166534",
                        }}
                      >
                        {name}
                      </span>
                    ))}
                    {recipe.matches.frozen.map((name, idx) => (
                      <span
                        key={`frozen-${idx}`}
                        style={{
                          fontSize: "11px",
                          padding: "2px 8px",
                          borderRadius: "9999px",
                          backgroundColor: "#bfdbfe",
                          color: "#1e40af",
                        }}
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
        </>
      )}
    </div>
  );
}
