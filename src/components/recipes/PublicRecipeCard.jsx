import React from "react";
import { ChefHat, Copy, Check, Loader2 } from "lucide-react";

export default function PublicRecipeCard({ recipe, onCopy, isCopying, isCopied }) {
  return (
    <div className="recipe-card">
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
        <p className="recipe-card-creator">by {recipe.creator}</p>
        <span className="badge badge-orange">{recipe.category}</span>
        {recipe.mainIngredients?.length > 0 && (
          <p className="recipe-card-main">
            Main: {recipe.mainIngredients.map((i) => i.name).join(", ")}
          </p>
        )}
      </div>
    </div>
  );
}
