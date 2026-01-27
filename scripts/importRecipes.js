/**
 * Script to import recipes from Excel file
 * Run with: node scripts/importRecipes.js <userId>
 * Example: node scripts/importRecipes.js abc123
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, query, where, doc, getDoc } from "firebase/firestore";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Recipes data from Excel (rows 23-46)
const recipesData = [
  { title: "roasted carrots", category: null, mainIngredients: null, optionalIngredients: "cinnamon, maple syrup or parm cheese" },
  { title: "상추볶음: steamed lettuce", category: null, mainIngredients: "lettuce", optionalIngredients: "mushroom" },
  { title: "닭 들깨 미역국", category: "main", mainIngredients: "chicken" },
  { title: "tortilla pizza with bbq chicken", category: null, mainIngredients: "roast chicken" },
  { title: "가지 미소", category: null, mainIngredients: null },
  { title: "tuna casserol", category: null, mainIngredients: "MacNCheese, Tuna", optionalIngredients: "peas, broccoli" },
  { title: "밥전", category: "main", mainIngredients: "rice", optionalIngredients: "tuna, ground beef, cabbage" },
  { title: "양배추 참치 덮밥", category: "main", mainIngredients: "tuna, cabbage" },
  { title: "shrimp scampi", category: "main", mainIngredients: "shrimp" },
  { title: "잔치국수 - 닭/멸치", category: "main", mainIngredients: "chicken broth, 멸치, zucchini" },
  { title: "돈까스 - 치킨", category: "main", mainIngredients: "chicken, bread crumb" },
  { title: "돈까스 - 포크", category: "main", mainIngredients: "pork, bread crumb" },
  { title: "잡채", category: "main", mainIngredients: "당면" },
  { title: "비지찌개", category: "main", mainIngredients: "soy beans, pork" },
  { title: "chicken taco", category: null, mainIngredients: "roast chicken, tortilla" },
  { title: "pork taco", category: null, mainIngredients: null },
  { title: "shrimp taco", category: null, mainIngredients: "shrimp, cabbage" },
  { title: "fish taco", category: null, mainIngredients: "white fish, cabbage" },
  { title: "비빔밥 - 야채, 갈은고기", category: "main", mainIngredients: null, optionalIngredients: "chicken, pork, beef, veggies" },
  { title: "caesar salad with grilled chicken", category: "main", mainIngredients: "roast chicken" },
  { title: "enchilada", category: null, mainIngredients: "roast chicken, fake chicken, fake beef" },
  { title: "sausage egg burrito", category: null, mainIngredients: null },
  { title: "carrot and pea salad", category: null, mainIngredients: null },
  { title: "salmon caesar salad taco", category: "main", mainIngredients: "salmon, lettuce" },
];

// Helper to capitalize title properly
function capitalizeTitle(title) {
  if (!title) return title;
  // Handle Korean characters - don't lowercase them
  return title
    .split(" ")
    .map((word) => {
      if (!word) return word;
      // Check if first char is Korean
      if (/[\uAC00-\uD7AF]/.test(word[0])) {
        return word;
      }
      // Capitalize English words
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

// Guess category based on title and ingredients
function guessCategory(title, mainIngredients) {
  const titleLower = (title || "").toLowerCase();
  const ingredientsLower = (mainIngredients || "").toLowerCase();

  if (titleLower.includes("salad")) return "Side";
  if (titleLower.includes("soup") || titleLower.includes("국") || titleLower.includes("찌개")) return "Soup";
  if (titleLower.includes("taco") || titleLower.includes("burrito") || titleLower.includes("pizza")) return "Main";
  if (titleLower.includes("roasted") || titleLower.includes("볶음")) return "Side";
  if (ingredientsLower.includes("rice") || ingredientsLower.includes("밥")) return "Main";

  return "Main"; // Default to Main
}

// Guess main ingredients based on title
function guessMainIngredients(title) {
  const titleLower = (title || "").toLowerCase();

  if (titleLower.includes("carrot")) return "carrot";
  if (titleLower.includes("pork") || titleLower.includes("돼지") || titleLower.includes("돈까스")) return "pork";
  if (titleLower.includes("chicken") || titleLower.includes("닭")) return "chicken";
  if (titleLower.includes("가지") || titleLower.includes("eggplant")) return "eggplant";
  if (titleLower.includes("sausage")) return "sausage";
  if (titleLower.includes("egg") || titleLower.includes("burrito")) return "egg, tortilla";
  if (titleLower.includes("비빔밥")) return "rice, vegetables";

  return null;
}

// Map ingredient names to standardized versions
function normalizeIngredientName(name) {
  const mappings = {
    "macncheese": "Mac n Cheese",
    "mac n cheese": "Mac n Cheese",
    "roast chicken": "Rotisserie Chicken",
    "rotisserie chicken": "Rotisserie Chicken",
    "fake chicken": "Plant-Based Chicken",
    "fake beef": "Plant-Based Beef",
    "ground beef": "Ground Beef",
    "ground beer": "Ground Beef", // typo fix
    "bread crumb": "Bread Crumbs",
    "breadcrumb": "Bread Crumbs",
    "bread crumbs": "Bread Crumbs",
    "white fish": "White Fish",
    "soy beans": "Soy Beans",
    "당면": "Glass Noodles (당면)",
    "멸치": "Dried Anchovies (멸치)",
    "chicken broth": "Chicken Broth",
    "veggies": "Mixed Vegetables",
    "vegetables": "Mixed Vegetables",
    "parm cheese": "Parmesan Cheese",
  };

  const lower = name.toLowerCase().trim();
  return mappings[lower] || name.trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
}

// Guess ingredient category
function guessIngredientCategory(name) {
  const nameLower = name.toLowerCase();

  if (nameLower.includes("chicken") || nameLower.includes("pork") || nameLower.includes("beef") || nameLower.includes("sausage") || nameLower.includes("lamb")) return "Meat";
  if (nameLower.includes("salmon") || nameLower.includes("shrimp") || nameLower.includes("fish") || nameLower.includes("tuna") || nameLower.includes("anchov") || nameLower.includes("멸치")) return "Seafood";
  if (nameLower.includes("cheese") || nameLower.includes("egg")) return "Dairy & Eggs";
  if (nameLower.includes("lettuce") || nameLower.includes("cabbage") || nameLower.includes("carrot") || nameLower.includes("zucchini") || nameLower.includes("mushroom") || nameLower.includes("eggplant") || nameLower.includes("pea") || nameLower.includes("broccoli") || nameLower.includes("vegetable")) return "Vegetables";
  if (nameLower.includes("rice") || nameLower.includes("tortilla") || nameLower.includes("noodle") || nameLower.includes("당면") || nameLower.includes("bread") || nameLower.includes("mac")) return "Grains & Pasta";
  if (nameLower.includes("cinnamon") || nameLower.includes("spice")) return "Herbs & Spices";
  if (nameLower.includes("maple") || nameLower.includes("broth") || nameLower.includes("sauce")) return "Condiments & Sauces";
  if (nameLower.includes("bean") || nameLower.includes("soy")) return "Pantry Staples";

  return "Pantry Staples";
}

async function getOrCreateIngredient(name, existingIngredients, userId, newIngredients) {
  const normalizedName = normalizeIngredientName(name);

  // Check if already exists
  const existing = existingIngredients.find(
    (ing) => ing.name.toLowerCase() === normalizedName.toLowerCase()
  );

  if (existing) {
    return { id: existing.id, name: existing.name };
  }

  // Check if we already created it in this run
  const alreadyCreated = newIngredients.find(
    (ing) => ing.name.toLowerCase() === normalizedName.toLowerCase()
  );

  if (alreadyCreated) {
    return { id: alreadyCreated.id, name: alreadyCreated.name };
  }

  // Create new ingredient
  const category = guessIngredientCategory(normalizedName);
  const ingredientData = {
    name: normalizedName,
    category,
    userId,
    isDefault: false,
    isPublic: false,
    tags: [],
  };

  const docRef = await addDoc(collection(db, "ingredients"), ingredientData);
  const newIngredient = { id: docRef.id, name: normalizedName };
  newIngredients.push({ ...newIngredient, ...ingredientData });

  console.log(`  Created ingredient: ${normalizedName} (${category})`);
  return newIngredient;
}

function parseIngredientList(ingredientString) {
  if (!ingredientString) return [];
  return ingredientString
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

async function importRecipes(userId) {
  // Fetch user profile to get creator name
  const userDocRef = doc(db, "users", userId);
  const userDoc = await getDoc(userDocRef);

  if (!userDoc.exists()) {
    throw new Error(`User profile not found for userId: ${userId}`);
  }

  const userProfile = userDoc.data();
  const creator = userProfile.userName || userProfile.email || "Unknown";

  console.log(`\nImporting recipes for user: ${userId}, creator: ${creator}\n`);

  // Load existing ingredients for this user
  const ingredientsQuery = query(
    collection(db, "ingredients"),
    where("userId", "==", userId)
  );
  const ingredientsSnapshot = await getDocs(ingredientsQuery);
  const existingIngredients = ingredientsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  console.log(`Found ${existingIngredients.length} existing ingredients\n`);

  const newIngredients = [];
  let recipesCreated = 0;

  for (const recipe of recipesData) {
    // Capitalize title
    const title = capitalizeTitle(recipe.title);

    // Determine category
    let category = recipe.category ? recipe.category.trim() : null;
    if (!category) {
      category = guessCategory(recipe.title, recipe.mainIngredients);
    }
    // Capitalize category
    category = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();

    // Determine main ingredients
    let mainIngredientsStr = recipe.mainIngredients;
    if (!mainIngredientsStr) {
      mainIngredientsStr = guessMainIngredients(recipe.title);
    }

    // Parse and create/get ingredients
    const mainIngredientNames = parseIngredientList(mainIngredientsStr);
    const optionalIngredientNames = parseIngredientList(recipe.optionalIngredients);

    const mainIngredients = [];
    for (const name of mainIngredientNames) {
      const ing = await getOrCreateIngredient(name, existingIngredients, userId, newIngredients);
      mainIngredients.push(ing);
    }

    const optionalIngredients = [];
    for (const name of optionalIngredientNames) {
      const ing = await getOrCreateIngredient(name, existingIngredients, userId, newIngredients);
      optionalIngredients.push(ing);
    }

    // Create recipe
    const recipeData = {
      title,
      category,
      mainIngredients,
      necessaryIngredients: [],
      optionalIngredients,
      fullIngredientList: [],
      shortInstruction: "",
      longInstruction: "",
      longInstructionType: "text",
      picture: "",
      tags: [],
      userId,
      creator,
      isDefault: false,
      isPublic: false,
    };

    const docRef = await addDoc(collection(db, "recipes"), recipeData);
    console.log(`Created recipe: ${title} (${category}) - ${mainIngredients.map(i => i.name).join(", ") || "no main ingredients"}`);
    recipesCreated++;
  }

  console.log(`\n========================================`);
  console.log(`Import complete!`);
  console.log(`Recipes created: ${recipesCreated}`);
  console.log(`New ingredients created: ${newIngredients.length}`);
  console.log(`========================================\n`);
}

// Get command line arguments
const args = process.argv.slice(2);
if (args.length < 1) {
  console.log("Usage: node scripts/importRecipes.js <userId>");
  console.log("Example: node scripts/importRecipes.js abc123");
  process.exit(1);
}

const userId = args[0];

importRecipes(userId)
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error importing recipes:", err);
    process.exit(1);
  });
