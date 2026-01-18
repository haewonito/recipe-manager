import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  ChefHat,
  List,
  Grid,
  ArrowLeft,
  X,
} from "lucide-react";
import { db } from "./firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";

const INGREDIENT_CATEGORIES = [
  "Meat",
  "Seafood",
  "Dairy & Eggs",
  "Vegetables",
  "Fruits",
  "Grains & Pasta",
  "Herbs & Spices",
  "Condiments & Sauces",
  "Pantry Staples",
  "Nuts & Seeds",
];

const CATEGORY_COLORS = {
  Meat: { bg: "#fecaca", text: "#991b1b" }, // pastel red
  Seafood: { bg: "#bfdbfe", text: "#1e40af" }, // pastel blue
  "Dairy & Eggs": { bg: "#fef08a", text: "#854d0e" }, // pastel yellow
  Vegetables: { bg: "#bbf7d0", text: "#166534" }, // pastel green
  Fruits: { bg: "#fed7aa", text: "#9a3412" }, // pastel orange
  "Grains & Pasta": { bg: "#e9d5ff", text: "#6b21a8" }, // pastel purple
  "Herbs & Spices": { bg: "#a7f3d0", text: "#065f46" }, // pastel teal
  "Condiments & Sauces": { bg: "#fecdd3", text: "#9f1239" }, // pastel pink
  "Pantry Staples": { bg: "#e5e7eb", text: "#374151" }, // pastel gray
  "Nuts & Seeds": { bg: "#d4c4a8", text: "#5c4813" }, // pastel tan
};

export default function RecipeApp() {
  const [currentPage, setCurrentPage] = useState("home");
  const [recipes, setRecipes] = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const recipesSnapshot = await getDocs(collection(db, "recipes"));
      const recipesData = recipesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRecipes(recipesData);

      const ingredientsSnapshot = await getDocs(collection(db, "ingredients"));
      const ingredientsData = ingredientsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setIngredients(ingredientsData);
    } catch (error) {
      console.error("Error loading data from Firestore:", error);
    }
  };

  const addRecipe = async (recipe) => {
    const docRef = await addDoc(collection(db, "recipes"), recipe);
    const newRecipe = { ...recipe, id: docRef.id };
    setRecipes([...recipes, newRecipe]);
  };

  const updateRecipe = async (updatedRecipe) => {
    const { id, ...recipeData } = updatedRecipe;
    await updateDoc(doc(db, "recipes", id), recipeData);
    setRecipes(recipes.map((r) => (r.id === id ? updatedRecipe : r)));
  };

  const deleteRecipe = async (id) => {
    await deleteDoc(doc(db, "recipes", id));
    setRecipes(recipes.filter((r) => r.id !== id));
  };

  const addIngredient = async (name, category) => {
    const docRef = await addDoc(collection(db, "ingredients"), {
      name,
      category,
    });
    const newIngredient = { id: docRef.id, name, category };
    setIngredients([...ingredients, newIngredient]);
    return newIngredient;
  };

  const updateIngredient = async (id, name, category) => {
    await updateDoc(doc(db, "ingredients", id), { name, category });
    setIngredients(
      ingredients.map((i) => (i.id === id ? { ...i, name, category } : i))
    );
  };

  const deleteIngredient = async (id) => {
    await deleteDoc(doc(db, "ingredients", id));
    setIngredients(ingredients.filter((i) => i.id !== id));
  };

  const navigateTo = (page, data = null) => {
    setCurrentPage(page);
    if (page === "recipeDetail") {
      setSelectedRecipe(data);
    } else if (page === "editRecipe") {
      setEditingRecipe(data);
    }
  };

  return (
    <div className="min-h-screen">
      {currentPage === "home" && <HomePage navigateTo={navigateTo} />}
      {currentPage === "recipes" && (
        <RecipesPage
          recipes={recipes}
          navigateTo={navigateTo}
          deleteRecipe={deleteRecipe}
        />
      )}
      {currentPage === "createRecipe" && (
        <RecipeFormPage
          navigateTo={navigateTo}
          onSave={addRecipe}
          ingredients={ingredients}
          addIngredient={addIngredient}
        />
      )}
      {currentPage === "editRecipe" && editingRecipe && (
        <RecipeFormPage
          navigateTo={navigateTo}
          onSave={updateRecipe}
          ingredients={ingredients}
          addIngredient={addIngredient}
          existingRecipe={editingRecipe}
        />
      )}
      {currentPage === "recipeDetail" && selectedRecipe && (
        <RecipeDetailPage
          recipe={selectedRecipe}
          navigateTo={navigateTo}
          allRecipes={recipes}
        />
      )}
      {currentPage === "ingredients" && (
        <IngredientsPage
          ingredients={ingredients}
          addIngredient={addIngredient}
          updateIngredient={updateIngredient}
          deleteIngredient={deleteIngredient}
          navigateTo={navigateTo}
        />
      )}
      {currentPage === "createCombination" && (
        <CombinationRecipeFormPage
          navigateTo={navigateTo}
          onSave={addRecipe}
          recipes={recipes.filter((r) => r.category !== "Combination")}
        />
      )}
    </div>
  );
}

// Home Page
function HomePage({ navigateTo }) {
  return (
    <div className="container-small">
      <div className="text-center mb-12 mt-8">
        <ChefHat
          className="icon-3xl text-orange-600"
          style={{ margin: "0 auto 16px" }}
        />
        <h1 className="mb-2">Recipe Manager</h1>
        <p className="text-gray-600" style={{ fontSize: "18px" }}>
          Plan your meals with ease
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <div className="menu-card" onClick={() => navigateTo("recipes")}>
          <h2>My Recipes</h2>
          <p>View, search, and manage your recipe collection</p>
        </div>
        <div
          className="menu-card amber"
          onClick={() => navigateTo("createRecipe")}
        >
          <h2>Create Recipe</h2>
          <p>Add a new recipe to your collection</p>
        </div>
        <div
          className="menu-card green"
          onClick={() => navigateTo("createCombination")}
        >
          <h2>Create Combination Recipe</h2>
          <p>Combine multiple recipes into one meal</p>
        </div>
        <div
          className="menu-card yellow"
          onClick={() => navigateTo("ingredients")}
        >
          <h2>View and Manage Ingredients</h2>
          <p>View and organize your ingredient list</p>
        </div>
      </div>
    </div>
  );
}

// Recipe categories
const RECIPE_CATEGORIES = [
  "Appetizer",
  "Main",
  "Side",
  "Dessert",
  "Combination",
];

// Recipes List Page
function RecipesPage({ recipes, navigateTo, deleteRecipe }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [viewMode, setViewMode] = useState("grid");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterMainIngredient, setFilterMainIngredient] = useState("");

  // Get unique main ingredients from all recipes
  const allMainIngredients = [
    ...new Set(
      recipes.flatMap(
        (recipe) => recipe.mainIngredients?.map((ing) => ing.name) || []
      )
    ),
  ].sort();

  const filteredRecipes = recipes
    .filter(
      (recipe) =>
        recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        recipe.creator.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter((recipe) => !filterCategory || recipe.category === filterCategory)
    .filter(
      (recipe) =>
        !filterMainIngredient ||
        recipe.mainIngredients?.some((ing) => ing.name === filterMainIngredient)
    );

  const sortedRecipes = [...filteredRecipes].sort((a, b) => {
    if (sortBy === "category") {
      return a.category.localeCompare(b.category);
    } else if (sortBy === "mainIngredients") {
      const aMain = a.mainIngredients[0]?.name || "";
      const bMain = b.mainIngredients[0]?.name || "";
      return aMain.localeCompare(bMain);
    }
    return a.title.localeCompare(b.title);
  });

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      await deleteRecipe(id);
    }
  };

  return (
    <div className="container">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigateTo("home")}
          className="flex items-center gap-2 text-gray-600"
          style={{ background: "none" }}
        >
          <ArrowLeft className="icon-md" />
          Back to Home
        </button>
        <h1 style={{ margin: 0 }}>My Recipes</h1>
        <div className="w-24"></div>
      </div>

      <div className="card card-padding-small mb-6">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <div className="flex-1" style={{ minWidth: "256px" }}>
            <div className="input-with-icon">
              <Search className="input-icon icon-md" />
              <input
                type="text"
                placeholder="Search recipes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-4 items-center">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="title">Sort by Title</option>
              <option value="category">Sort by Category</option>
              <option value="mainIngredients">Sort by Main Ingredient</option>
            </select>

            <div className="toggle-group">
              <button
                onClick={() => setViewMode("grid")}
                className={`toggle-btn ${viewMode === "grid" ? "active" : ""}`}
              >
                <Grid className="icon-md" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`toggle-btn ${viewMode === "list" ? "active" : ""}`}
              >
                <List className="icon-md" />
              </button>
            </div>
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
              style={{ minWidth: "120px" }}
            >
              <option value="">All</option>
              {RECIPE_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span style={{ color: "#374151", whiteSpace: "nowrap" }}>
              Filter by Main Ingredient:
            </span>
            <select
              value={filterMainIngredient}
              onChange={(e) => setFilterMainIngredient(e.target.value)}
              style={{ minWidth: "150px" }}
            >
              <option value="">All</option>
              {allMainIngredients.map((ing) => (
                <option key={ing} value={ing}>
                  {ing}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {sortedRecipes.length === 0 ? (
        <div className="empty-state">
          <p className="mb-4">No recipes found</p>
          <button
            onClick={() => navigateTo("createRecipe")}
            className="btn btn-primary"
          >
            Create Your First Recipe
          </button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-3 gap-6">
          {sortedRecipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onClick={() => navigateTo("recipeDetail", recipe)}
              onEdit={(e) => {
                e.stopPropagation();
                navigateTo("editRecipe", recipe);
              }}
              onDelete={(e) => handleDelete(e, recipe.id)}
            />
          ))}
        </div>
      ) : (
        <div className="card">
          {sortedRecipes.map((recipe, index) => (
            <RecipeListItem
              key={recipe.id}
              recipe={recipe}
              isLast={index === sortedRecipes.length - 1}
              onClick={() => navigateTo("recipeDetail", recipe)}
              onEdit={(e) => {
                e.stopPropagation();
                navigateTo("editRecipe", recipe);
              }}
              onDelete={(e) => handleDelete(e, recipe.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RecipeCard({ recipe, onClick, onEdit, onDelete }) {
  return (
    <div className="recipe-card" onClick={onClick}>
      <div className="recipe-card-image">
        {recipe.picture ? (
          <img src={recipe.picture} alt={recipe.title} />
        ) : (
          <ChefHat className="icon-2xl text-orange-600" />
        )}
      </div>
      <div className="recipe-card-content">
        <div className="flex justify-between items-center mb-2">
          <h3 className="recipe-card-title" style={{ margin: 0 }}>
            {recipe.title}
          </h3>
          <div className="flex gap-2">
            <button onClick={onEdit} className="btn-icon text-blue-600">
              <Edit2 className="icon-sm" />
            </button>
            <button onClick={onDelete} className="btn-icon text-red-600">
              <Trash2 className="icon-sm" />
            </button>
          </div>
        </div>
        <p className="recipe-card-creator">by {recipe.creator}</p>
        <span className="badge badge-orange">{recipe.category}</span>
        {recipe.mainIngredients.length > 0 && (
          <p className="recipe-card-main">
            Main: {recipe.mainIngredients.map((i) => i.name).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}

function RecipeListItem({ recipe, isLast, onClick, onEdit, onDelete }) {
  return (
    <div
      className={`recipe-list-item ${!isLast ? "border-b" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-center gap-4 flex-1">
        <div className="recipe-list-image">
          {recipe.picture ? (
            <img src={recipe.picture} alt={recipe.title} />
          ) : (
            <ChefHat className="icon-xl text-orange-600" />
          )}
        </div>
        <div className="recipe-list-info">
          <h3 className="recipe-list-title">{recipe.title}</h3>
          <p className="recipe-list-creator">by {recipe.creator}</p>
          <div className="recipe-list-meta">
            <span className="recipe-list-category">{recipe.category}</span>
            {recipe.mainIngredients.length > 0 && (
              <span className="recipe-list-ingredients">
                {recipe.mainIngredients.map((i) => i.name).join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit} className="btn-icon text-blue-600">
          <Edit2 className="icon-sm" />
        </button>
        <button onClick={onDelete} className="btn-icon text-red-600">
          <Trash2 className="icon-sm" />
        </button>
      </div>
    </div>
  );
}

// Recipe Form Page
function RecipeFormPage({
  navigateTo,
  onSave,
  ingredients,
  addIngredient,
  existingRecipe,
}) {
  const [formData, setFormData] = useState(
    existingRecipe || {
      title: "",
      creator: "",
      category: "Main",
      mainIngredients: [],
      necessaryIngredients: [],
      optionalIngredients: [],
      shortInstruction: "",
      longInstruction: "",
      longInstructionType: "text",
      picture: "",
    }
  );

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

// Ingredient Selector Component
function IngredientSelector({
  label,
  selectedIngredients,
  allIngredients,
  onChange,
  addIngredient,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const filteredIngredients = allIngredients.filter(
    (ing) =>
      ing.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !selectedIngredients.find((s) => s.id === ing.id)
  );

  const handleSelect = (ingredient) => {
    onChange([...selectedIngredients, ingredient]);
    setSearchTerm("");
    setShowDropdown(false);
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
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder="Search ingredients..."
        />

        {showDropdown && searchTerm && (
          <div className="dropdown-menu">
            {filteredIngredients.length > 0 ? (
              filteredIngredients.map((ing) => (
                <div
                  key={ing.id}
                  onClick={() => handleSelect(ing)}
                  className="dropdown-item"
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

// Create Ingredient Modal
function CreateIngredientModal({ onClose, onCreate, initialValue }) {
  const [name, setName] = useState(initialValue);
  const [category, setCategory] = useState(INGREDIENT_CATEGORIES[0]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), category);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h3>Create New Ingredient</h3>
        <form onSubmit={handleSubmit}>
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
          <div className="flex gap-4">
            <button type="submit" className="flex-1 btn btn-primary">
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
        </form>
      </div>
    </div>
  );
}

// Recipe Detail Page
function RecipeDetailPage({ recipe, navigateTo, allRecipes }) {
  // For combination recipes, look up the full sub-recipe objects
  const subRecipesFull = recipe.isCombination
    ? (recipe.subRecipes || [])
        .map((sub) => allRecipes.find((r) => r.id === sub.id))
        .filter(Boolean)
    : [];

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
        {!recipe.isCombination && (
          <button
            onClick={() => navigateTo("editRecipe", recipe)}
            className="btn btn-blue"
          >
            <Edit2 className="icon-sm" />
            Edit Recipe
          </button>
        )}
      </div>

      <div className="card">
        {!recipe.isCombination && (
          <div className="detail-hero">
            {recipe.picture ? (
              <img src={recipe.picture} alt={recipe.title} />
            ) : (
              <ChefHat className="icon-3xl text-orange-600" />
            )}
          </div>
        )}

        <div className="p-8">
          <div className="mb-6">
            <h1 className="mb-2">{recipe.title}</h1>
            <p className="text-gray-600">Created by {recipe.creator}</p>
            <span className="badge badge-orange mt-2">{recipe.category}</span>
          </div>

          {recipe.mainIngredients?.length > 0 && (
            <div className="detail-section">
              <h2>Main Ingredients</h2>
              <div className="ingredient-list">
                {recipe.mainIngredients.map((ing) => (
                  <span key={ing.id} className="ingredient-chip main">
                    {ing.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {recipe.necessaryIngredients?.length > 0 && (
            <div className="detail-section">
              <h2>Necessary Ingredients</h2>
              <div className="ingredient-list">
                {recipe.necessaryIngredients.map((ing) => (
                  <span key={ing.id} className="ingredient-chip necessary">
                    {ing.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {recipe.optionalIngredients?.length > 0 && (
            <div className="detail-section">
              <h2>Optional Ingredients</h2>
              <div className="ingredient-list">
                {recipe.optionalIngredients.map((ing) => (
                  <span key={ing.id} className="ingredient-chip optional">
                    {ing.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Sub-recipes section for combination recipes */}
          {recipe.isCombination && subRecipesFull.length > 0 && (
            <div className="detail-section">
              <h2>Included Recipes</h2>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {subRecipesFull.map((subRecipe) => (
                  <div
                    key={subRecipe.id}
                    onClick={() => navigateTo("recipeDetail", subRecipe)}
                    className="card card-padding-small"
                    style={{ cursor: "pointer" }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        style={{
                          width: "48px",
                          height: "48px",
                          borderRadius: "8px",
                          backgroundColor: "#fff7ed",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {subRecipe.picture ? (
                          <img
                            src={subRecipe.picture}
                            alt={subRecipe.title}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                        ) : (
                          <ChefHat className="icon-md text-orange-600" />
                        )}
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: "14px" }}>
                          {subRecipe.title}
                        </h3>
                        <span style={{ fontSize: "12px", color: "#9ca3af" }}>
                          {subRecipe.category}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Only show instructions for non-combination recipes */}
          {!recipe.isCombination && recipe.shortInstruction && (
            <div className="detail-section">
              <h2>Quick Instructions</h2>
              <p>{recipe.shortInstruction}</p>
            </div>
          )}

          {!recipe.isCombination && recipe.longInstruction && (
            <div className="detail-section">
              <h2>Detailed Instructions</h2>
              {recipe.longInstructionType === "text" && (
                <p className="whitespace-pre-wrap">{recipe.longInstruction}</p>
              )}
              {recipe.longInstructionType === "link" && (
                <a
                  href={recipe.longInstruction}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {recipe.longInstruction}
                </a>
              )}
              {recipe.longInstructionType === "image" && (
                <img
                  src={recipe.longInstruction}
                  alt="Detailed instructions"
                  style={{ maxWidth: "100%" }}
                  className="rounded-lg"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Ingredients Management Page
function IngredientsPage({
  ingredients,
  addIngredient,
  updateIngredient,
  deleteIngredient,
  navigateTo,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingCategory, setEditingCategory] = useState("");
  const [sortBy, setSortBy] = useState("name"); // "name" or "category"
  const [sortDirection, setSortDirection] = useState("asc"); // "asc" or "desc"

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("asc");
    }
  };

  const filteredIngredients = ingredients
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

  const handleCreate = async (name, category) => {
    await addIngredient(name, category);
    setShowCreateModal(false);
  };

  const handleEdit = (ing) => {
    setEditingId(ing.id);
    setEditingName(ing.name);
    setEditingCategory(ing.category || INGREDIENT_CATEGORIES[0]);
  };

  const handleSaveEdit = async () => {
    if (editingName.trim()) {
      await updateIngredient(editingId, editingName.trim(), editingCategory);
      setEditingId(null);
      setEditingName("");
      setEditingCategory("");
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
        <button
          onClick={() => navigateTo("home")}
          className="flex items-center gap-2 text-gray-600"
          style={{ background: "none" }}
        >
          <ArrowLeft className="icon-md" />
          Back to Home
        </button>
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
                  className="flex gap-2 flex-1"
                  style={{ marginRight: "16px" }}
                >
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSaveEdit()}
                    className="flex-1"
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

// Combination Recipe Form Page
function CombinationRecipeFormPage({ navigateTo, onSave, recipes }) {
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
