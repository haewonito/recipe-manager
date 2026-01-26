import React from "react";
import { ChefHat, Edit2, Trash2 } from "lucide-react";

export default function RecipeListItem({ recipe, isLast, onClick, onEdit, onDelete }) {
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
            {recipe.tags && recipe.tags.map((tag, idx) => (
              <span key={idx} className="recipe-list-tag">{tag}</span>
            ))}
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
