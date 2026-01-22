import "dotenv/config";
import { db } from "./firebase.js";
import { collection, addDoc, getDocs } from "firebase/firestore";

/**
 * User Schema
 * Collection: "users"
 * Document ID: Firebase Auth UID (not auto-generated)
 * Fields:
 *   - userName: string (unique, lowercase)
 *   - firstName: string
 *   - lastName: string
 *   - email: string (from Firebase Auth)
 *   - authProvider: string ("google.com" | "password")
 *   - createdAt: string (ISO timestamp)
 *
 * Note: Users are created via Firebase Auth, then their profile
 * is stored here using their Auth UID as the document ID.
 * This seed script is for reference/testing only.
 */

const users = [
  // Sample users - remove or modify for production
  { userName: "admin", firstName: "Admin", lastName: "User", email: "admin@example.com", password: "admin123" },
  { userName: "user", firstName: "Regular", lastName: "User", email: "user@example.com", password: "user123" },
  { userName: "haewonito", firstName: "Haewon", lastName: "Jeon", email: "haewonjeonibmacc@gmail.com", password: "admin123" },
  { userName: "john", firstName: "John", lastName: "Morris", email: "haewonjeonibmacc+john@gmail.com", password: "user123" },
];

async function seedUsers() {
  console.log("Starting to seed users...");

  try {
    // Check existing users to avoid duplicates (by email)
    const existingSnapshot = await getDocs(collection(db, "users"));
    const existingEmails = new Set(
      existingSnapshot.docs.map((doc) => doc.data().email.toLowerCase())
    );

    let addedCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      if (existingEmails.has(user.email.toLowerCase())) {
        console.log(`Skipping (already exists): ${user.email}`);
        skippedCount++;
        continue;
      }

      await addDoc(collection(db, "users"), {
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: user.password,
      });
      console.log(`Added: ${user.email}`);
      addedCount++;
    }

    console.log("\n--- Seeding Complete ---");
    console.log(`Added: ${addedCount} users`);
    console.log(`Skipped: ${skippedCount} users (already existed)`);
    console.log(`Total in list: ${users.length}`);
  } catch (error) {
    console.error("Error seeding users:", error);
  }
}

// Run the seed function
seedUsers();
