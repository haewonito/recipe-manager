// One-time migration script to add userId to existing recipes and ingredients
// Run with: node scripts/migrate-add-userid.js

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

const USER_ID = "NZDLKaXO5ahjECoOrypd34S5Jfg2";

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

async function migrateCollection(collectionName) {
  console.log(`\nMigrating ${collectionName}...`);

  const snapshot = await getDocs(collection(db, collectionName));
  let count = 0;

  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data();

    if (!data.userId) {
      await updateDoc(doc(db, collectionName, docSnapshot.id), {
        userId: USER_ID
      });
      console.log(`  Updated: ${docSnapshot.id}`);
      count++;
    } else {
      console.log(`  Skipped (already has userId): ${docSnapshot.id}`);
    }
  }

  console.log(`${collectionName}: ${count} documents updated`);
  return count;
}

async function main() {
  console.log("Starting migration...");
  console.log(`Adding userId: ${USER_ID}`);

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
