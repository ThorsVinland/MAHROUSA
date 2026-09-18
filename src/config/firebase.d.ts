import { Firestore } from 'firebase/firestore';
import { Auth } from 'firebase/auth';
import { FirebaseApp } from 'firebase/app';

export const app: FirebaseApp;
export const analytics: any;
export const db: Firestore;
export const auth: Auth;
export const firebaseConfig: Record<string, any>;
