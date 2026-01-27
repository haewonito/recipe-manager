/**
 * Script to make all existing recipes public
 * Run with: node scripts/makeRecipesPublic.js
 */

import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
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

async function makeRecipesPublic() {
  console.log("Fetching all recipes...\n");

  const recipesSnapshot = await getDocs(collection(db, "recipes"));
  const recipes = recipesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  console.log(`Found ${recipes.length} recipes\n`);

  let updatedCount = 0;
  let alreadyPublicCount = 0;

  for (const recipe of recipes) {
    if (recipe.isPublic === true) {
      alreadyPublicCount++;
      console.log(`Already public: ${recipe.title}`);
    } else {
      await updateDoc(doc(db, "recipes", recipe.id), {
        isPublic: true,
      });
      updatedCount++;
      console.log(`Updated: ${recipe.title}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`Complete!`);
  console.log(`Already public: ${alreadyPublicCount}`);
  console.log(`Updated to public: ${updatedCount}`);
  console.log(`========================================\n`);
}

makeRecipesPublic()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  });
