// Migration script to set roles for existing users
// Run with: node scripts/migrate-set-user-roles.js

import "dotenv/config";
import { db } from "../src/firebase.js";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";

// Admin user UIDs - add UIDs of users who should be admins
const ADMIN_UIDS = [
  "nCvsAQ7AxqVtHdDUpuX8hmVzUVt1", // haewonito
];

async function migrateUserRoles() {
  console.log("Starting user roles migration...");

  const snapshot = await getDocs(collection(db, "users"));
  let adminCount = 0;
  let regularCount = 0;

  for (const docSnapshot of snapshot.docs) {
    const data = docSnapshot.data();
    const uid = docSnapshot.id;

    const isAdmin = ADMIN_UIDS.includes(uid);
    const role = isAdmin ? "admin" : "regularUser";

    await updateDoc(doc(db, "users", uid), {
      role: role,
    });

    console.log(`  Updated user ${uid}: role = ${role}`);

    if (isAdmin) {
      adminCount++;
    } else {
      regularCount++;
    }
  }

  console.log("\n✓ Migration complete!");
  console.log(`  Admins: ${adminCount}`);
  console.log(`  Regular users: ${regularCount}`);
}

migrateUserRoles()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Migration failed:", error);
    process.exit(1);
  });
