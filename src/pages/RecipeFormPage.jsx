import React, { useState } from "react";
import { ArrowLeft, Search, X } from "lucide-react";
import IngredientSelector from "../components/ingredients/IngredientSelector";
import MeasuredIngredientSelector from "../components/ingredients/MeasuredIngredientSelector";

export default function RecipeFormPage({
  navigateTo,
  onSave,
  ingredients,
  addIngredient,
  existingRecipe,
  recipes = [],
}) {
  const [activeTab, setActiveTab] = useState("new");

  // If editing, only show the regular form (no tabs)
  if (existingRecipe) {
    return (
      <NewRecipeForm
        navigateTo={navigateTo}
        onSave={onSave}
        ingredients={ingredients}
        addIngredient={addIngredient}
        existingRecipe={existingRecipe}
      />
    );
  }

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
        <h1 style={{ margin: 0 }}>Create Recipe</h1>
        <div className="w-24"></div>
      </div>

      {/* Tab Navigation */}
      <div className="flex mb-6" style={{ borderBottom: "2px solid #e5e7eb" }}>
        <button
          onClick={() => setActiveTab("new")}
          className="tab-btn"
          style={{
            padding: "12px 24px",
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "new"
                ? "2px solid #ea580c"
                : "2px solid transparent",
            marginBottom: "-2px",
            color: activeTab === "new" ? "#ea580c" : "#1f2937",
            fontWeight: activeTab === "new" ? 600 : 400,
            cursor: "pointer",
          }}
        >
          Create New Recipe
        </button>
        <button
          onClick={() => setActiveTab("combination")}
          className="tab-btn"
          style={{
            padding: "12px 24px",
            background: "none",
            border: "none",
            borderBottom:
              activeTab === "combination"
                ? "2px solid #ea580c"
                : "2px solid transparent",
            marginBottom: "-2px",
            color: activeTab === "combination" ? "#ea580c" : "#1f2937",
            fontWeight: activeTab === "combination" ? 600 : 400,
            cursor: "pointer",
          }}
        >
          Combine Existing Recipes for Meal Ideas
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "new" ? (
        <NewRecipeFormContent
          navigateTo={navigateTo}
          onSave={onSave}
          ingredients={ingredients}
          addIngredient={addIngredient}
        />
      ) : (
        <CombinationFormContent
          navigateTo={navigateTo}
          onSave={onSave}
          recipes={recipes}
        />
      )}
    </div>
  );
}

// Standalone form for editing (no tabs, full page layout)
function NewRecipeForm({
  navigateTo,
  onSave,
  ingredients,
  addIngredient,
  existingRecipe,
}) {
  const [formData, setFormData] = useState({
    title: "",
    creator: "",
    category: "Main",
    mainIngredients: [],
    necessaryIngredients: [],
    optionalIngredients: [],
    fullIngredientList: [],
    shortInstruction: "",
    longInstruction: "",
    longInstructionType: "text",
    picture: "",
    ...existingRecipe,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
    navigateTo("recipes");
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <div className="container-small">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateTo("recipes")}
          className="flex items-center gap-2 text-gray-600"
          style={{ background: "none" }}
        >
          <ArrowLeft className="icon-md" />
          Back to Recipes
        </button>
        <h1 style={{ margin: 0 }}>Edit Recipe</h1>
        <div className="w-24"></div>
      </div>

      <form onSubmit={handleSubmit} className="card card-padding">
        <div className="form-group">
          <label>Title *</label>
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) => updateField("title", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Creator *</label>
          <input
            type="text"
            required
            value={formData.creator}
            onChange={(e) => updateField("creator", e.target.value)}
          />
        </div>

        <div className="form-group">
          <label>Category *</label>
          <select
            value={formData.category}
            onChange={(e) => updateField("category", e.target.value)}
          >
            <option value="Appetizer">Appetizer</option>
            <option value="Main">Main</option>
            <option value="Side">Side</option>
            <option value="Dessert">Dessert</option>
          </select>
        </div>

        <IngredientSelector
          label="Main Ingredients (1-2 key ingredients)"
          selectedIngredients={formData.mainIngredients}
          allIngredients={ingredients}
          onChange={(selected) => updateField("mainIngredients", selected)}
          addIngredient={addIngredient}
        />

        <IngredientSelector
          label="Necessary Ingredients"
          selectedIngredients={formData.necessaryIngredients}
          allIngredients={ingredients}
          onChange={(selected) => updateField("necessaryIngredients", selected)}
          addIngredient={addIngredient}
        />

        <IngredientSelector
          label="Optional/Secondary Ingredients"
          selectedIngredients={formData.optionalIngredients}
          allIngredients={ingredients}
          onChange={(selected) => updateField("optionalIngredients", selected)}
          addIngredient={addIngredient}
        />

        <MeasuredIngredientSelector
          label="Full Ingredient List"
          selectedIngredients={formData.fullIngredientList}
          allIngredients={ingredients}
          onChange={(selected) => updateField("fullIngredientList", selected)}
          addIngredient={addIngredient}
        />

        <div className="form-group">
          <label>Short Instruction</label>
          <textarea
            value={formData.shortInstruction}
            onChange={(e) => updateField("shortInstruction", e.target.value)}
            rows="3"
          />
        </div>

        <div className="form-group">
          <label>Long Instruction Type</label>
          <select
            value={formData.longInstructionType}
            onChange={(e) => updateField("longInstructionType", e.target.value)}
            className="mb-2"
          >
            <option value="text">Text</option>
            <option value="link">Link</option>
            <option value="image">Image URL</option>
          </select>
          {formData.longInstructionType === "text" ? (
            <textarea
              value={formData.longInstruction}
              onChange={(e) => updateField("longInstruction", e.target.value)}
              rows="6"
              placeholder="Detailed cooking instructions..."
            />
          ) : (
            <input
              type="url"
              value={formData.longInstruction}
              onChange={(e) => updateField("longInstruction", e.target.value)}
              placeholder={
                formData.longInstructionType === "link"
                  ? "https://..."
                  : "Image URL"
              }
            />
          )}
        </div>

        <div className="form-group">
          <label>Picture URL</label>
          <input
            type="url"
            value={formData.picture}
            onChange={(e) => updateField("picture", e.target.value)}
            placeholder="https://..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button type="submit" className="flex-1 btn btn-primary">
            Update Recipe
          </button>
          <button
            type="button"
            onClick={() => navigateTo("recipes")}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

// New recipe form content (for the "Create New Recipe" tab)
function NewRecipeFormContent({
  navigateTo,
  onSave,
  ingredients,
  addIngredient,
}) {
  const [formData, setFormData] = useState({
    title: "",
    creator: "",
    category: "Main",
    mainIngredients: [],
    necessaryIngredients: [],
    optionalIngredients: [],
    fullIngredientList: [],
    shortInstruction: "",
    longInstruction: "",
    longInstructionType: "text",
    picture: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave(formData);
    navigateTo("recipes");
  };

  const updateField = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  return (
    <form onSubmit={handleSubmit} className="card card-padding">
      <div className="form-group">
        <label>Title *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Creator *</label>
        <input
          type="text"
          required
          value={formData.creator}
          onChange={(e) => updateField("creator", e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Category *</label>
        <select
          value={formData.category}
          onChange={(e) => updateField("category", e.target.value)}
        >
          <option value="Appetizer">Appetizer</option>
          <option value="Main">Main</option>
          <option value="Side">Side</option>
          <option value="Dessert">Dessert</option>
        </select>
      </div>

      <IngredientSelector
        label="Main Ingredients (1-2 key ingredients)"
        selectedIngredients={formData.mainIngredients}
        allIngredients={ingredients}
        onChange={(selected) => updateField("mainIngredients", selected)}
        addIngredient={addIngredient}
      />

      <IngredientSelector
        label="Necessary Ingredients"
        selectedIngredients={formData.necessaryIngredients}
        allIngredients={ingredients}
        onChange={(selected) => updateField("necessaryIngredients", selected)}
        addIngredient={addIngredient}
      />

      <IngredientSelector
        label="Optional/Secondary Ingredients"
        selectedIngredients={formData.optionalIngredients}
        allIngredients={ingredients}
        onChange={(selected) => updateField("optionalIngredients", selected)}
        addIngredient={addIngredient}
      />

      <MeasuredIngredientSelector
        label="Full Ingredient List"
        selectedIngredients={formData.fullIngredientList}
        allIngredients={ingredients}
        onChange={(selected) => updateField("fullIngredientList", selected)}
        addIngredient={addIngredient}
      />

      <div className="form-group">
        <label>Short Instruction</label>
        <textarea
          value={formData.shortInstruction}
          onChange={(e) => updateField("shortInstruction", e.target.value)}
          rows="3"
        />
      </div>

      <div className="form-group">
        <label>Long Instruction Type</label>
        <select
          value={formData.longInstructionType}
          onChange={(e) => updateField("longInstructionType", e.target.value)}
          className="mb-2"
        >
          <option value="text">Text</option>
          <option value="link">Link</option>
          <option value="image">Image URL</option>
        </select>
        {formData.longInstructionType === "text" ? (
          <textarea
            value={formData.longInstruction}
            onChange={(e) => updateField("longInstruction", e.target.value)}
            rows="6"
            placeholder="Detailed cooking instructions..."
          />
        ) : (
          <input
            type="url"
            value={formData.longInstruction}
            onChange={(e) => updateField("longInstruction", e.target.value)}
            placeholder={
              formData.longInstructionType === "link"
                ? "https://..."
                : "Image URL"
            }
          />
        )}
      </div>

      <div className="form-group">
        <label>Picture URL</label>
        <input
          type="url"
          value={formData.picture}
          onChange={(e) => updateField("picture", e.target.value)}
          placeholder="https://..."
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button type="submit" className="flex-1 btn btn-primary">
          Create Recipe
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
  );
}

// Combination recipe form content (for the "Combine Existing Recipes" tab)
function CombinationFormContent({ navigateTo, onSave, recipes }) {
  const [selectedRecipes, setSelectedRecipes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [creator, setCreator] = useState("");

  // Filter out combination recipes and already selected recipes
  const availableRecipes = recipes.filter(
    (recipe) =>
      recipe.category !== "Combination" &&
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

        {searchTerm && availableRecipes.length > 0 && (
          <div
            className="dropdown-menu"
            style={{
              position: "relative",
              maxHeight: "200px",
              overflowY: "auto",
            }}
          >
            {availableRecipes.map((recipe) => (
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
  );
}
