import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import IngredientSelector from "../components/ingredients/IngredientSelector";
import MeasuredIngredientSelector from "../components/ingredients/MeasuredIngredientSelector";

export default function RecipeFormPage({
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
        <h1 style={{ margin: 0 }}>
          {existingRecipe ? "Edit Recipe" : "Create Recipe"}
        </h1>
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
            {existingRecipe ? "Update Recipe" : "Create Recipe"}
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
