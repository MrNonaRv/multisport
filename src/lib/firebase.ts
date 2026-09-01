import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import defaultConfig from "../../firebase-applet-config.json";

let customConfigStr: string | null = null;
try {
  customConfigStr = typeof window !== "undefined" ? localStorage.getItem("custom_firebase_config") : null;
} catch (e) {
  console.warn("Could not read local storage for custom config", e);
}

let activeConfig = { ...defaultConfig };
let databaseId = defaultConfig.firestoreDatabaseId || "(default)";

if (customConfigStr) {
  try {
    const custom = JSON.parse(customConfigStr);
    // Only use custom config if it matches the current project or is explicitly valid
    if (custom && custom.apiKey && custom.projectId && custom.projectId === defaultConfig.projectId) {
      activeConfig = { ...activeConfig, ...custom };
      databaseId = custom.firestoreDatabaseId || "(default)";
    } else {
      // Clear outdated custom config from previous projects
      localStorage.removeItem("custom_firebase_config");
    }
  } catch (e) {
    console.error("Invalid custom firebase config in localStorage", e);
  }
}

export const firebaseConfig = activeConfig;
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = (databaseId === "(default)" || !databaseId)
  ? getFirestore(app)
  : getFirestore(app, databaseId);

// Connection test helper
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Firebase client operating in offline mode. Please check network/config.");
    }
    return false;
  }
}

// Data migration helper to push all state to any target Firebase project
export async function uploadDataToTargetFirebase(targetConfig: any, data: any): Promise<boolean> {
  const { initializeApp: initApp } = await import("firebase/app");
  const { getFirestore: getFs, doc: docRef, setDoc: setDocRef } = await import("firebase/firestore");
  
  const tempAppName = `transfer-target-${Date.now()}`;
  const targetApp = initApp(targetConfig, tempAppName);
  const targetDbId = targetConfig.firestoreDatabaseId || "(default)";
  const targetDb = (targetDbId === "(default)" || !targetDbId)
    ? getFs(targetApp)
    : getFs(targetApp, targetDbId);

  const documentRef = docRef(targetDb, "data", "sports_db");
  await setDocRef(documentRef, data);
  return true;
}

