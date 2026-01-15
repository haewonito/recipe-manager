import { db } from "./firebase.js";
import { collection, addDoc, getDocs } from "firebase/firestore";

// Category enum values
export const INGREDIENT_CATEGORIES = [
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

const ingredients = [
  // Meat
  { name: "Chicken Breast", category: "Meat" },
  { name: "Chicken Thighs", category: "Meat" },
  { name: "Beef", category: "Meat" },
  { name: "Ground Beef", category: "Meat" },
  { name: "Beef Steak", category: "Meat" },
  { name: "Pork", category: "Meat" },
  { name: "Pork Chops", category: "Meat" },
  { name: "Bacon", category: "Meat" },
  { name: "Ground Pork", category: "Meat" },
  { name: "Fake Chicken Nuggets", category: "Meat" },
  { name: "Ham", category: "Meat" },
  { name: "Lamb", category: "Meat" },
  { name: "Sausage", category: "Meat" },
  { name: "Tofu", category: "Meat" },
  { name: "Tempeh", category: "Meat" },

  // Seafood
  { name: "Salmon", category: "Seafood" },
  { name: "Canned Salmon", category: "Seafood" },
  { name: "Smoked Salmon", category: "Seafood" },
  { name: "Shrimp", category: "Seafood" },
  { name: "Tuna", category: "Seafood" },
  { name: "Canned Tuna", category: "Seafood" },
  { name: "Cod", category: "Seafood" },
  { name: "Tilapia", category: "Seafood" },
  { name: "Crab", category: "Seafood" },
  { name: "Scallops", category: "Seafood" },
  { name: "Mussels", category: "Seafood" },
  { name: "Mackerel", category: "Seafood" },
  { name: "Fish Collar", category: "Seafood" },

  // Dairy & Eggs
  { name: "Milk", category: "Dairy & Eggs" },
  { name: "Butter", category: "Dairy & Eggs" },
  { name: "Heavy Cream", category: "Dairy & Eggs" },
  { name: "Sour Cream", category: "Dairy & Eggs" },
  { name: "Cream Cheese", category: "Dairy & Eggs" },
  { name: "Cheddar Cheese", category: "Dairy & Eggs" },
  { name: "Mozzarella Cheese", category: "Dairy & Eggs" },
  { name: "Parmesan Cheese", category: "Dairy & Eggs" },
  { name: "Feta Cheese", category: "Dairy & Eggs" },
  { name: "Greek Yogurt", category: "Dairy & Eggs" },
  { name: "Eggs", category: "Dairy & Eggs" },

  // Vegetables
  { name: "Onion", category: "Vegetables" },
  { name: "Garlic", category: "Vegetables" },
  { name: "Tomato", category: "Vegetables" },
  { name: "Potato", category: "Vegetables" },
  { name: "Carrot", category: "Vegetables" },
  { name: "Celery", category: "Vegetables" },
  { name: "Bell Pepper", category: "Vegetables" },
  { name: "Broccoli", category: "Vegetables" },
  { name: "Spinach", category: "Vegetables" },
  { name: "Lettuce", category: "Vegetables" },
  { name: "Cucumber", category: "Vegetables" },
  { name: "Zucchini", category: "Vegetables" },
  { name: "Mushrooms", category: "Vegetables" },
  { name: "Corn", category: "Vegetables" },
  { name: "Green Beans", category: "Vegetables" },
  { name: "Asparagus", category: "Vegetables" },
  { name: "Cauliflower", category: "Vegetables" },
  { name: "Cabbage", category: "Vegetables" },
  { name: "Napa Cabbage", category: "Vegetables" },
  { name: "Kale", category: "Vegetables" },
  { name: "Sweet Potato", category: "Vegetables" },
  { name: "Eggplant", category: "Vegetables" },
  { name: "Peas", category: "Vegetables" },
  { name: "Brussels Sprouts", category: "Vegetables" },
  { name: "Avocado", category: "Vegetables" },
  { name: "Jalapeño", category: "Vegetables" },

  // Fruits
  { name: "Lemon", category: "Fruits" },
  { name: "Lime", category: "Fruits" },
  { name: "Orange", category: "Fruits" },
  { name: "Apple", category: "Fruits" },
  { name: "Banana", category: "Fruits" },
  { name: "Strawberries", category: "Fruits" },
  { name: "Blueberries", category: "Fruits" },

  // Grains & Pasta
  { name: "Rice", category: "Grains & Pasta" },
  { name: "Pasta", category: "Grains & Pasta" },
  { name: "Linguini", category: "Grains & Pasta" },
  { name: "Macaroni", category: "Grains & Pasta" },
  { name: "Somyeon", category: "Grains & Pasta" },
  { name: "Bread", category: "Grains & Pasta" },
  { name: "Flour", category: "Grains & Pasta" },
  { name: "Quinoa", category: "Grains & Pasta" },
  { name: "Oats", category: "Grains & Pasta" },
  { name: "Couscous", category: "Grains & Pasta" },
  { name: "Breadcrumbs", category: "Grains & Pasta" },
  { name: "Tortillas", category: "Grains & Pasta" },
  { name: "Noodles", category: "Grains & Pasta" },

  // Herbs & Spices
  { name: "Salt", category: "Herbs & Spices" },
  { name: "Black Pepper", category: "Herbs & Spices" },
  { name: "Basil", category: "Herbs & Spices" },
  { name: "Oregano", category: "Herbs & Spices" },
  { name: "Thyme", category: "Herbs & Spices" },
  { name: "Rosemary", category: "Herbs & Spices" },
  { name: "Cilantro", category: "Herbs & Spices" },
  { name: "Parsley", category: "Herbs & Spices" },
  { name: "Cumin", category: "Herbs & Spices" },
  { name: "Paprika", category: "Herbs & Spices" },
  { name: "Chili Powder", category: "Herbs & Spices" },
  { name: "Cinnamon", category: "Herbs & Spices" },
  { name: "Ginger", category: "Herbs & Spices" },
  { name: "Turmeric", category: "Herbs & Spices" },
  { name: "Bay Leaves", category: "Herbs & Spices" },
  { name: "Red Pepper Flakes", category: "Herbs & Spices" },

  // Condiments & Sauces
  { name: "Olive Oil", category: "Condiments & Sauces" },
  { name: "Vegetable Oil", category: "Condiments & Sauces" },
  { name: "Sesame Oil", category: "Condiments & Sauces" },
  { name: "Soy Sauce", category: "Condiments & Sauces" },
  { name: "Sriracha", category: "Condiments & Sauces" },
  { name: "Vinegar", category: "Condiments & Sauces" },
  { name: "Honey", category: "Condiments & Sauces" },
  { name: "Mustard", category: "Condiments & Sauces" },
  { name: "Ketchup", category: "Condiments & Sauces" },
  { name: "Mayonnaise", category: "Condiments & Sauces" },
  { name: "Hot Sauce", category: "Condiments & Sauces" },
  { name: "Worcestershire Sauce", category: "Condiments & Sauces" },
  { name: "Tomato Paste", category: "Condiments & Sauces" },
  { name: "Tomato Sauce", category: "Condiments & Sauces" },
  { name: "Coconut Milk", category: "Condiments & Sauces" },

  // Pantry Staples
  { name: "Sugar", category: "Pantry Staples" },
  { name: "Brown Sugar", category: "Pantry Staples" },
  { name: "Chicken Broth", category: "Pantry Staples" },
  { name: "Beef Broth", category: "Pantry Staples" },
  { name: "Vegetable Broth", category: "Pantry Staples" },
  { name: "Canned Tomatoes", category: "Pantry Staples" },
  { name: "Black Beans", category: "Pantry Staples" },
  { name: "Chickpeas", category: "Pantry Staples" },
  { name: "Lentils", category: "Pantry Staples" },
  { name: "Peanut Butter", category: "Pantry Staples" },

  // Nuts & Seeds
  { name: "Almonds", category: "Nuts & Seeds" },
  { name: "Walnuts", category: "Nuts & Seeds" },
  { name: "Sesame Seeds", category: "Nuts & Seeds" },
  { name: "Perilla Seeds", category: "Nuts & Seeds" },
];

async function seedIngredients() {
  console.log("Starting to seed ingredients...");

  try {
    // Check existing ingredients to avoid duplicates
    const existingSnapshot = await getDocs(collection(db, "ingredients"));
    const existingNames = new Set(
      existingSnapshot.docs.map((doc) => doc.data().name.toLowerCase())
    );

    let addedCount = 0;
    let skippedCount = 0;

    for (const ingredient of ingredients) {
      if (existingNames.has(ingredient.name.toLowerCase())) {
        console.log(`Skipping (already exists): ${ingredient.name}`);
        skippedCount++;
        continue;
      }

      await addDoc(collection(db, "ingredients"), {
        name: ingredient.name,
        category: ingredient.category,
      });
      console.log(`Added: ${ingredient.name} (${ingredient.category})`);
      addedCount++;
    }

    console.log("\n--- Seeding Complete ---");
    console.log(`Added: ${addedCount} ingredients`);
    console.log(`Skipped: ${skippedCount} ingredients (already existed)`);
    console.log(`Total in list: ${ingredients.length}`);
  } catch (error) {
    console.error("Error seeding ingredients:", error);
  }
}

// Run the seed function
seedIngredients();
