import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default function CompleteProfilePage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [userName, setUserName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, createUserProfile } = useAuth();
  const navigate = useNavigate();

  const checkUserNameExists = async (userName) => {
    const usersQuery = query(
      collection(db, "users"),
      where("userName", "==", userName.toLowerCase()),
    );
    const snapshot = await getDocs(usersQuery);
    return !snapshot.empty;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!firstName.trim() || !lastName.trim() || !userName.trim()) {
      return setError("All fields are required");
    }

    if (userName.length < 3) {
      return setError("Username must be at least 3 characters");
    }

    if (!/^[a-zA-Z0-9_]+$/.test(userName)) {
      return setError(
        "Username can only contain letters, numbers, and underscores",
      );
    }

    setLoading(true);

    try {
      let userNameExists = false;
      try {
        userNameExists = await checkUserNameExists(userName);
      } catch (checkErr) {
        console.error("Error checking username:", checkErr);
      }

      if (userNameExists) {
        setError("This username is already taken");
        setLoading(false);
        return;
      }

      await createUserProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        userName: userName.toLowerCase().trim(),
      });

      navigate("/");
    } catch (err) {
      console.error("Error creating profile:", err);
      setError(`Failed to create profile: ${err.message}`);
    }

    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#fff7ed" }}
    >
      <div
        className="card card-padding"
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <div className="text-center mb-8">
          <ChefHat
            className="icon-3xl text-orange-600"
            style={{ margin: "0 auto 16px" }}
          />
          <h1 className="mb-2">Complete Your Profile</h1>
          <p className="text-gray-600">
            Welcome! Please tell us a bit about yourself.
          </p>
          {user?.email && (
            <p className="text-gray-500 text-sm mt-2">
              Signed in as {user.email}
            </p>
          )}
        </div>

        {error && (
          <div
            className="mb-4 p-3"
            style={{
              backgroundColor: "#fef2f2",
              color: "#dc2626",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              placeholder="John"
            />
          </div>

          <div className="form-group">
            <label>Last Name</label>
            <input
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              placeholder="Doe"
            />
          </div>

          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              placeholder="johndoe"
            />
            <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "4px" }}>
              Letters, numbers, and underscores only
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full"
          >
            {loading ? "Creating Profile..." : "Complete Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
