import React, { useState } from "react";
import { Search, ArrowLeft, X } from "lucide-react";

export default function CombinationRecipeFormPage({ navigateTo, onSave, recipes }) {
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [creator, setCreator] = useState("");

  // Filter recipes based on search
  const filteredRecipes = recipes.filter(
    (recipe) =>
      recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedRecipes.find((r) => r.id === recipe.id)
  );

  // Auto-generate title from selected recipes
  const generatedTitle = selectedRecipes.map((r) => r.title).join(" & ");

  // Aggregate ingredients from selected recipes (remove duplicates by id)
  const aggregateIngredients = (field) => {
    const allIngredients = selectedRecipes.flatMap(
      (recipe) => recipe[field] || []
    );
    const uniqueMap = new Map();
    allIngredients.forEach((ing) => {
      if (ing && ing.id && !uniqueMap.has(ing.id)) {
        uniqueMap.set(ing.id, ing);
      }
    });
    return Array.from(uniqueMap.values());
  };

  const handleAddRecipe = (recipe) => {
    setSelectedRecipes([...selectedRecipes, recipe]);
    setSearchTerm("");
  };

  const handleRemoveRecipe = (recipeId) => {
    setSelectedRecipes(selectedRecipes.filter((r) => r.id !== recipeId));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedRecipes.length < 2) {
      alert("Please select at least 2 recipes to combine.");
      return;
    }
    if (!creator.trim()) {
      alert("Please enter a creator name.");
      return;
    }

    const combinationRecipe = {
      title: generatedTitle,
      creator: creator.trim(),
      category: "Combination",
      mainIngredients: aggregateIngredients("mainIngredients"),
      necessaryIngredients: aggregateIngredients("necessaryIngredients"),
      optionalIngredients: aggregateIngredients("optionalIngredients"),
      shortInstruction: "",
      longInstruction: "",
      longInstructionType: "text",
      picture: "",
      isCombination: true,
      subRecipes: selectedRecipes.map((r) => ({ id: r.id, title: r.title })),
    };

    await onSave(combinationRecipe);
    navigateTo("recipes");
  };

  return (
    <div className="container-small">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateTo("home")}
          className="flex items-center gap-2 text-gray-600"
          style={{ background: "none" }}
        >
          <ArrowLeft className="icon-md" />
          Back to Home
        </button>
        <h1 style={{ margin: 0 }}>Create Combination Recipe</h1>
        <div className="w-24"></div>
      </div>

      <form onSubmit={handleSubmit} className="card card-padding">
        <div className="form-group">
          <label>Creator *</label>
          <input
            type="text"
            required
            value={creator}
            onChange={(e) => setCreator(e.target.value)}
            placeholder="Enter creator name"
          />
        </div>

        <div className="form-group">
          <label>Select Recipes to Combine *</label>
          <div className="input-with-icon mb-2">
            <Search className="input-icon icon-md" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search recipes..."
            />
          </div>

          {searchTerm && filteredRecipes.length > 0 && (
            <div
              className="dropdown-menu"
              style={{
                position: "relative",
                maxHeight: "200px",
                overflowY: "auto",
              }}
            >
              {filteredRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => handleAddRecipe(recipe)}
                  className="dropdown-item"
                >
                  {recipe.title}
                  <span
                    style={{
                      color: "#9ca3af",
                      marginLeft: "8px",
                      fontSize: "12px",
                    }}
                  >
                    ({recipe.category})
                  </span>
                </div>
              ))}
            </div>
          )}

          {selectedRecipes.length > 0 && (
            <div className="mt-4">
              <p style={{ fontWeight: 500, marginBottom: "8px" }}>
                Selected Recipes:
              </p>
              <div className="flex flex-col gap-2">
                {selectedRecipes.map((recipe, index) => (
                  <div
                    key={recipe.id}
                    className="flex items-center justify-between p-3"
                    style={{ backgroundColor: "#f3f4f6", borderRadius: "8px" }}
                  >
                    <span>
                      {index + 1}. {recipe.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveRecipe(recipe.id)}
                      className="btn-icon text-red-600"
                    >
                      <X className="icon-sm" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {selectedRecipes.length >= 2 && (
          <>
            <div className="form-group">
              <label>Generated Title</label>
              <input
                type="text"
                value={generatedTitle}
                disabled
                style={{ backgroundColor: "#f3f4f6" }}
              />
            </div>

            <div className="form-group">
              <label>Combined Main Ingredients</label>
              <div className="flex flex-wrap gap-2">
                {aggregateIngredients("mainIngredients").map((ing) => (
                  <span key={ing.id} className="tag tag-orange">
                    {ing.name}
                  </span>
                ))}
                {aggregateIngredients("mainIngredients").length === 0 && (
                  <span style={{ color: "#9ca3af" }}>No main ingredients</span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Combined Necessary Ingredients</label>
              <div className="flex flex-wrap gap-2">
                {aggregateIngredients("necessaryIngredients").map((ing) => (
                  <span key={ing.id} className="tag tag-blue">
                    {ing.name}
                  </span>
                ))}
                {aggregateIngredients("necessaryIngredients").length === 0 && (
                  <span style={{ color: "#9ca3af" }}>
                    No necessary ingredients
                  </span>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Combined Optional Ingredients</label>
              <div className="flex flex-wrap gap-2">
                {aggregateIngredients("optionalIngredients").map((ing) => (
                  <span key={ing.id} className="tag tag-gray">
                    {ing.name}
                  </span>
                ))}
                {aggregateIngredients("optionalIngredients").length === 0 && (
                  <span style={{ color: "#9ca3af" }}>
                    No optional ingredients
                  </span>
                )}
              </div>
            </div>
          </>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            className="flex-1 btn btn-primary"
            disabled={selectedRecipes.length < 2}
          >
            Create Combination Recipe
          </button>
          <button
            type="button"
            onClick={() => navigateTo("home")}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
