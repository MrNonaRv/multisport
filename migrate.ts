
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, writeBatch, setDoc } from "firebase/firestore";
import { Database } from "./src/types";

// Correct configuration
const firebaseConfig = {
  apiKey: "AIzaSyDdkUg7F-3rd028W8BbdTU9ZTki8-NESR0",
  authDomain: "automatic-climate-zgxqk.firebaseapp.com",
  projectId: "automatic-climate-zgxqk",
  storageBucket: "automatic-climate-zgxqk.firebasestorage.app",
  messagingSenderId: "557160494463",
  appId: "1:557160494463:web:61726a040bf3571277964a"
};

const app = initializeApp(firebaseConfig);
const dbId = "ai-studio-multisportstourn-d9b21812-4785-4395-9200-73f03ac81dc4";
const db = getFirestore(app, dbId);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function migrateCollection(collectionName: string, items: any[], idField: string | null) {
    console.log(`Migrating ${collectionName}...`);
    const batchSize = 100;
    for (let i = 0; i < items.length; i += batchSize) {
        const batch = writeBatch(db);
        const chunk = items.slice(i, i + batchSize);
        chunk.forEach((item, index) => {
            const id = idField ? item[idField].toString() : (i + index).toString();
            batch.set(doc(db, collectionName, id), item);
        });
        await batch.commit();
        console.log(`Processed ${i + chunk.length}/${items.length} items for ${collectionName}`);
        await sleep(1000); // Wait 1 second between batches to respect rate limits
    }
}

async function migrate() {
    const oldDocRef = doc(db, "data/sports_db");
    const snapshot = await getDoc(oldDocRef);
    if (!snapshot.exists()) {
        console.log("No data to migrate");
        return;
    }
    const data = snapshot.data() as Database;

    await migrateCollection("teams", data.teams, "team_id");
    await migrateCollection("players", data.players, "player_id");
    await migrateCollection("matches", data.matches, "match_id");
    await migrateCollection("playerStats", data.playerStats, "stat_id");
    await migrateCollection("users", data.users, "user_id");
    await migrateCollection("referees", data.referees, "referee_id");
    
    // Collections without direct IDs
    await migrateCollection("activityLogs", data.activityLogs, null);
    
    // For brackets, handle ID special
    const brackets = data.brackets.map(b => ({
        ...b,
        id: b.sport + "_" + (b.category || "General")
    }));
    await migrateCollection("brackets", brackets, "id");

    await migrateCollection("finalsGames", data.finalsGames, null);

    console.log("Migration complete");
}

migrate().catch(console.error);
