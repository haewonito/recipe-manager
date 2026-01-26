import React from "react";
import { ChefHat, Copy, Check, Loader2 } from "lucide-react";

export default function PublicRecipeListItem({ recipe, isLast, onClick, onCopy, isCopying, isCopied }) {
  return (
    <div className={`recipe-list-item ${!isLast ? "border-b" : ""}`} onClick={onClick} style={{ cursor: "pointer" }}>
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
            {recipe.mainIngredients?.length > 0 && (
              <span className="recipe-list-ingredients">
                {recipe.mainIngredients.map((i) => i.name).join(", ")}
              </span>
            )}
          </div>
          {recipe.tags && recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {recipe.tags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    fontSize: "10px",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    backgroundColor: "#dbeafe",
                    color: "#1e40af",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCopy}
          className={`btn-icon ${isCopied ? "text-green-600" : "text-blue-600"}`}
          disabled={isCopying || isCopied}
          title={isCopied ? "Already in your collection" : "Copy to my recipes"}
        >
          {isCopying ? (
            <Loader2 className="icon-sm animate-spin" />
          ) : isCopied ? (
            <Check className="icon-sm" />
          ) : (
            <Copy className="icon-sm" />
          )}
        </button>
      </div>
    </div>
  );
}
