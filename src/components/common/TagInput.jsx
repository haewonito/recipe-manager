import React, { useState } from "react";
import { X } from "lucide-react";

export default function TagInput({ tags = [], onChange, placeholder = "Add tag..." }) {
  const [inputValue, setInputValue] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && inputValue === "" && tags.length > 0) {
      removeTag(tags.length - 1);
    }
  };

  const addTag = () => {
    const newTag = inputValue.trim().toLowerCase();
    if (newTag && !tags.includes(newTag)) {
      onChange([...tags, newTag]);
    }
    setInputValue("");
  };

  const removeTag = (index) => {
    onChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div
      className="tag-input-container"
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "6px",
        padding: "8px",
        border: "1px solid #d1d5db",
        borderRadius: "6px",
        backgroundColor: "#fff",
        minHeight: "42px",
        alignItems: "center",
      }}
    >
      {tags.map((tag, index) => (
        <span
          key={index}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "4px",
            padding: "6px 12px",
            backgroundColor: "#dbeafe",
            color: "#1e40af",
            borderRadius: "9999px",
            fontSize: "13px",
          }}
        >
          #{tag}
          <button
            type="button"
            onClick={() => removeTag(index)}
            style={{
              background: "none",
              border: "none",
              padding: "0",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
            }}
          >
            <X size={14} color="#1e40af" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : ""}
        style={{
          flex: 1,
          minWidth: "80px",
          border: "none",
          outline: "none",
          padding: "4px",
          fontSize: "14px",
        }}
      />
    </div>
  );
}
