// Migration script to add isDefault and isPublic fields to existing recipes and ingredients
// Run with: node scripts/migrate-ispublic-to-isdefault.js

import "dotenv/config";
import { db } from "../src/firebase.js";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

async function migrateCollection(collectionName) {
  console.log(`\nMigrating ${collectionName}...`);

  const snapshot = await getDocs(collection(db, collectionName));
  let count = 0;

  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data();

    // Skip if already migrated (has isDefault field)
    if (data.isDefault !== undefined) {
      console.log(`  Skipped (already has isDefault): ${docSnapshot.id}`);
      continue;
    }

    // Set isDefault: true for existing documents (these are starter recipes/ingredients)
    await updateDoc(doc(db, collectionName, docSnapshot.id), {
      isDefault: true,
      isPublic: false,
    });
    console.log(`  Updated: ${docSnapshot.id} (isDefault: true, isPublic: false)`);
    count++;
  }

  console.log(`${collectionName}: ${count} documents updated`);
  return count;
}

async function main() {
  console.log("Starting migration...");
  console.log("Adding isDefault and isPublic: false to all documents");

  try {
    const recipesCount = await migrateCollection("recipes");
    const ingredientsCount = await migrateCollection("ingredients");

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
