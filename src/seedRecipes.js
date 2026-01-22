import "dotenv/config";
import { db } from "./firebase.js";
import { collection, addDoc, getDocs } from "firebase/firestore";

const recipes = [
  {
    title: "Salmon Burger",
    creator: "Haewon",
    category: "Main",
    mainIngredients: ["Canned Salmon", "Salmon"],
    necessaryIngredients: [],
    optionalIngredients: [],
    shortInstruction: "",
    longInstruction: "",
    longInstructionType: "text",
    picture: "",
  },
  {
    title: "Salmon Rolls - Spicy",
    creator: "Haewon",
    category: "Appetizer",
    mainIngredients: ["Salmon", "Smoked Salmon"],
    necessaryIngredients: [],
    optionalIngredients: [],
    shortInstruction: "Sriracha, mayo few drops of (soy sauce, sesame oil)",
    longInstruction: "",
    longInstructionType: "text",
    picture: "",
  },
  {
    title: "두부 조림",
    creator: "Haewon",
    category: "Side",
    mainIngredients: ["Tofu"],
    necessaryIngredients: [],
    optionalIngredients: [],
    shortInstruction: "",
    longInstruction: "",
    longInstructionType: "text",
    picture: "",
  },
  {
    title: "돼지불고기 & 배추 구이",
    creator: "Haewon",
    category: "Main",
    mainIngredients: ["Napa Cabbage", "Pork"],
    necessaryIngredients: [],
    optionalIngredients: [],
    shortInstruction: "Quarter the cabbage, salt and grill in pan with a little oil. Take it out half way and cook meat. Put back the cabbage and cook together to soak up sauce.",
    longInstruction: "",
    longInstructionType: "text",
    picture: "",
  },
  {
    title: "들깨소면 & 겉절이",
    creator: "Haewon",
    category: "Main",
    mainIngredients: ["Somyeon", "Perilla Seeds"],
    necessaryIngredients: ["Napa Cabbage"],
    optionalIngredients: [],
    shortInstruction: "",
    longInstruction: "",
    longInstructionType: "text",
    picture: "",
  },
  {
    title: "Tuna Casserole",
    creator: "Haewon",
    category: "Main",
    mainIngredients: ["Canned Tuna", "Macaroni"],
    necessaryIngredients: [],
    optionalIngredients: [],
    shortInstruction: "",
    longInstruction: "",
    longInstructionType: "text",
    picture: "",
  },
  {
    title: "고등어조림",
    creator: "Haewon",
    category: "Main",
    mainIngredients: ["Mackerel"],
    necessaryIngredients: [],
    optionalIngredients: [],
    shortInstruction: "",
    longInstruction: "",
    longInstructionType: "text",
    picture: "",
  },
  {
    title: "기쿠니",
    creator: "Haewon",
    category: "Main",
    mainIngredients: ["Fish Collar"],
    necessaryIngredients: [],
    optionalIngredients: [],
    shortInstruction: "",
    longInstruction: "",
    longInstructionType: "text",
    picture: "",
  },
  {
    title: "Mongolian Beef",
    creator: "Haewon",
    category: "Main",
    mainIngredients: ["Beef"],
    necessaryIngredients: [],
    optionalIngredients: [],
    shortInstruction: "",
    longInstruction: "",
    longInstructionType: "text",
    picture: "",
  },
  {
    title: "Lamb Meatball Sandwich & Tzatziki",
    creator: "Haewon",
    category: "Main",
    mainIngredients: ["Lamb"],
    necessaryIngredients: ["Cucumber", "Avocado"],
    optionalIngredients: [],
    shortInstruction: "",
    longInstruction: "",
    longInstructionType: "text",
    picture: "",
  },
  {
    title: "Fake Chicken Parmesan",
    creator: "Haewon",
    category: "Main",
    mainIngredients: ["Fake Chicken Nuggets"],
    necessaryIngredients: [],
    optionalIngredients: [],
    shortInstruction: "",
    longInstruction: "",
    longInstructionType: "text",
    picture: "",
  },
  {
    title: "Eggplant Parmesan",
    creator: "Haewon",
    category: "Main",
    mainIngredients: ["Eggplant"],
    necessaryIngredients: [],
    optionalIngredients: [],
    shortInstruction: "",
    longInstruction: "",
    longInstructionType: "text",
    picture: "",
  },
  {
    title: "Cabbage Roll",
    creator: "Haewon",
    category: "Main",
    mainIngredients: ["Ground Beef", "Cabbage"],
    necessaryIngredients: [],
    optionalIngredients: [],
    shortInstruction: "",
    longInstruction: "",
    longInstructionType: "text",
    picture: "",
  },
  {
    title: "Seared Salmon & Linguini With Cream Sauce",
    creator: "Haewon",
    category: "Main",
    mainIngredients: ["Salmon", "Linguini"],
    necessaryIngredients: ["Heavy Cream"],
    optionalIngredients: [],
    shortInstruction: "",
    longInstruction: "",
    longInstructionType: "text",
    picture: "",
  },
];

async function seedRecipes() {
  console.log("Starting to seed recipes...");

  try {
    // First, fetch all ingredients to get their IDs
    const ingredientsSnapshot = await getDocs(collection(db, "ingredients"));
    const ingredientMap = new Map();

    ingredientsSnapshot.docs.forEach((doc) => {
      const data = doc.data();
      ingredientMap.set(data.name.toLowerCase(), {
        id: doc.id,
        name: data.name,
      });
    });

    console.log(`Found ${ingredientMap.size} ingredients in database`);

    // Check existing recipes to avoid duplicates
    const existingSnapshot = await getDocs(collection(db, "recipes"));
    const existingTitles = new Set(
      existingSnapshot.docs.map((doc) => doc.data().title.toLowerCase())
    );

    let addedCount = 0;
    let skippedCount = 0;

    for (const recipe of recipes) {
      if (existingTitles.has(recipe.title.toLowerCase())) {
        console.log(`Skipping (already exists): ${recipe.title}`);
        skippedCount++;
        continue;
      }

      // Convert ingredient names to ingredient objects with IDs
      const resolveIngredients = (ingredientNames) => {
        return ingredientNames
          .map((name) => {
            const ingredient = ingredientMap.get(name.toLowerCase());
            if (!ingredient) {
              console.warn(`  Warning: Ingredient "${name}" not found in database`);
              return null;
            }
            return ingredient;
          })
          .filter(Boolean);
      };

      const recipeData = {
        title: recipe.title,
        creator: recipe.creator,
        category: recipe.category,
        mainIngredients: resolveIngredients(recipe.mainIngredients),
        necessaryIngredients: resolveIngredients(recipe.necessaryIngredients),
        optionalIngredients: resolveIngredients(recipe.optionalIngredients),
        shortInstruction: recipe.shortInstruction,
        longInstruction: recipe.longInstruction,
        longInstructionType: recipe.longInstructionType,
        picture: recipe.picture,
        isDefault: true,
        isPublic: false,
      };

      await addDoc(collection(db, "recipes"), recipeData);
      console.log(`Added: ${recipe.title}`);
      addedCount++;
    }

    console.log("\n--- Seeding Complete ---");
    console.log(`Added: ${addedCount} recipes`);
    console.log(`Skipped: ${skippedCount} recipes (already existed)`);
    console.log(`Total in list: ${recipes.length}`);
  } catch (error) {
    console.error("Error seeding recipes:", error);
  }
}

// Run the seed function
seedRecipes();
