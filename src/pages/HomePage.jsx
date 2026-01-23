import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ChefHat, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  return (
    <div className="container-small">
      <div className="flex justify-end mb-4 mt-4">
        <div className="flex items-center gap-4">
          <span style={{ fontSize: "14px", color: "#6b7280" }}>
            {user?.email}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-gray-600"
            style={{
              background: "none",
              padding: "8px 12px",
              fontSize: "14px",
            }}
          >
            <LogOut className="icon-sm" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="text-center mb-12">
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
        <Link to="/recipes" className="menu-card">
          <h2>My Recipes</h2>
          <p>View and manage your recipe collection</p>
        </Link>
        <Link to="/ingredients" className="menu-card yellow">
          <h2>My Ingredients</h2>
          <p>View and manage your ingredient list</p>
        </Link>
        <Link to="/recipes-to-start" className="menu-card green">
          <h2>Public Recipes</h2>
          <p>
            Browse and copy recipes shared by other users. Import a set of
            default recipes.
          </p>
        </Link>
        <Link to="/ingredients-to-start" className="menu-card green">
          <h2>Public Ingredients</h2>
          <p>
            Browse and copy ingredients shared by other users. Import a set of
            default ingredients.
          </p>
        </Link>
      </div>
    </div>
  );
}
