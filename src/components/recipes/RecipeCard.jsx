import React from "react";
import { ChefHat, Edit2, Trash2 } from "lucide-react";

export default function RecipeCard({ recipe, onClick, onEdit, onDelete }) {
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
        <div className="flex flex-wrap gap-2 items-center">
          <span className="badge badge-orange">{recipe.category}</span>
          {recipe.tags && recipe.tags.map((tag, idx) => (
            <span key={idx} className="badge badge-blue">{tag}</span>
          ))}
        </div>
        {recipe.mainIngredients.length > 0 && (
          <p className="recipe-card-main">
            Main: {recipe.mainIngredients.map((i) => i.name).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
