import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Safety check for metadata
const config = firebaseConfig as any;

const isConfigValid = !!(config && config.apiKey && config.apiKey !== "YOUR_API_KEY" && config.projectId);

if (!isConfigValid) {
  console.warn("Firebase configuration is missing or invalid. Please run the 'set_up_firebase' tool.");
}

// Only initialize if we have a real config
export const app = isConfigValid ? initializeApp(config) : null;
export const db = (app && isConfigValid) ? (config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app)) : null;
export const auth = (app && isConfigValid) ? getAuth(app) : null;
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  if (!auth) {
    alert("Firebase not configured. Please setup Firebase first.");
    return;
  }
  return signInWithPopup(auth, googleProvider);
};

// Connection test
async function testConnection() {
  if (!db || !isConfigValid) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Firebase Connected Successfully");
  } catch (error) {
    console.debug("Firestore connectivity check skipped:", error);
  }
}

testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
