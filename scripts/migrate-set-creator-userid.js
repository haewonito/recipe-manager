// Migration script to set userId on existing recipes and ingredients
// Run with: node scripts/migrate-set-creator-userid.js

import "dotenv/config";
import { db } from "../src/firebase.js";
import { collection, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";

// Default creator UID and userName for existing recipes/ingredients
const DEFAULT_CREATOR_UID = "nCvsAQ7AxqVtHdDUpuX8hmVzUVt1";
const DEFAULT_CREATOR_USERNAME = "haewonito";

async function getCreatorUserName(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      return userDoc.data().userName || userDoc.data().email || DEFAULT_CREATOR_USERNAME;
    }
    return DEFAULT_CREATOR_USERNAME;
  } catch (error) {
    console.error("Error fetching user:", error);
    return DEFAULT_CREATOR_USERNAME;
  }
}

async function migrateRecipes(creatorUserName) {
  console.log("\nMigrating recipes...");

  const snapshot = await getDocs(collection(db, "recipes"));
  let count = 0;

  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data();

    // Update all recipes with the default creator
    await updateDoc(doc(db, "recipes", docSnapshot.id), {
      userId: DEFAULT_CREATOR_UID,
      creator: creatorUserName,
    });
    console.log(`  Updated recipe: ${data.title || docSnapshot.id}`);
    count++;
  }

  console.log(`Recipes: ${count} documents updated`);
  return count;
}

async function migrateIngredients() {
  console.log("\nMigrating ingredients...");

  const snapshot = await getDocs(collection(db, "ingredients"));
  let count = 0;

  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data();

    // Update all ingredients with the default creator
    await updateDoc(doc(db, "ingredients", docSnapshot.id), {
      userId: DEFAULT_CREATOR_UID,
    });
    console.log(`  Updated ingredient: ${data.name || docSnapshot.id}`);
    count++;
  }

  console.log(`Ingredients: ${count} documents updated`);
  return count;
}

async function main() {
  console.log("Starting migration...");
  console.log(`Setting userId to: ${DEFAULT_CREATOR_UID}`);

  try {
    // Get the creator's userName for recipes
    const creatorUserName = await getCreatorUserName(DEFAULT_CREATOR_UID);
    console.log(`Creator userName: ${creatorUserName}`);

    const recipesCount = await migrateRecipes(creatorUserName);
    const ingredientsCount = await migrateIngredients();

    console.log("\n✓ Migration complete!");
    console.log(`  Recipes updated: ${recipesCount}`);
    console.log(`  Ingredients updated: ${ingredientsCount}`);
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }

  process.exit(0);
}

main();
