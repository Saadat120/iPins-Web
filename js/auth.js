// /js/auth.js
import { auth, db } from './firebase.js'; // Import Firebase configuration and instances
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";

// Register function
export function registerUser(email, password, username) {
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('User Registered:', user);

      // Save additional user info in Firestore
      const userRef = doc(db, "users", user.uid);
      setDoc(userRef, {
        username: username,
        email: email,
        createdAt: new Date(),
      }).then(() => {
        console.log('User data added to Firestore');
      }).catch((error) => {
        console.error("Error adding document: ", error);
      });
    })
    .catch((error) => {
      console.error('Error: ', error.code, error.message);
    });
}

export function loginUser(email, password) {
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      console.log('User Signed In:', user);

      // Retrieve user data from Firestore
      const userRef = doc(db, "users", user.uid);
      getDoc(userRef).then((docSnap) => {
        if (docSnap.exists()) {
          console.log("User data:", docSnap.data());
        } else {
          console.log("No such document!");
        }
      }).catch((error) => {
        console.error("Error getting document:", error);
      });
    })
    .catch((error) => {
      console.error('Error: ', error.code, error.message);
    });
}

signOut(auth).then(() => {
  console.log("Signed Out")
  // Sign-out successful.
}).catch((error) => {
  console.error('Error: ', error.code, error.message);
});