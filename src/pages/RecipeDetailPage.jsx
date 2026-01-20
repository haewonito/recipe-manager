import React from "react";
import { ArrowLeft, Edit2, ChefHat } from "lucide-react";

export default function RecipeDetailPage({ recipe, navigateTo, allRecipes }) {
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
