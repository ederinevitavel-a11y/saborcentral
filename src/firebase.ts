import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCyPEmnAIil2WkFbG4fRpdhWJh8TreK4Ig",
  authDomain: "gen-lang-client-0974579776.firebaseapp.com",
  projectId: "gen-lang-client-0974579776",
  storageBucket: "gen-lang-client-0974579776.firebasestorage.app",
  messagingSenderId: "574288513218",
  appId: "1:574288513218:web:e08db3dac7ba0edeea935b"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
