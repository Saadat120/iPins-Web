import { auth, db } from './firebase.js';
import {
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import {
  doc,
  setDoc,
  serverTimestamp
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';
import { loadComponent } from './loadComponents.js';

export function initAuthUI() {
  let currentUser = null;

  // Inject profile modal and set up handlers
  loadComponent("#profileModalContainer", "././profileModal.html").then(() => {
    const closeBtn = document.getElementById('closeProfileModal');
    const logoutBtn = document.getElementById('logoutBtn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        document.getElementById('profileModal').style.display = 'none';
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        signOut(auth).then(() => {
          document.getElementById('profileModal').style.display = 'none';
        });
      });
    }
  });

  // Monitor auth state
  onAuthStateChanged(auth, (user) => {
    currentUser = user;
    const loginBtn = document.getElementById('openModalBtn');
    const signOutBtn = document.getElementById('signOutBtn');
    const profileBtn = document.getElementById('profileBtn');

    if (user) {
      if (loginBtn) loginBtn.style.display = "none";
      if (signOutBtn) signOutBtn.style.display = "inline-block";
    } else {
      if (loginBtn) loginBtn.style.display = "inline-block";
      if (signOutBtn) signOutBtn.style.display = "none";
    }

    if (profileBtn) {
      profileBtn.addEventListener('click', () => {
        if (currentUser) {
          document.getElementById('profileModal').style.display = 'block';
          const emailDisplay = document.getElementById('userEmailDisplay');
          if (emailDisplay) emailDisplay.textContent = `${currentUser.email}`;
        } else {
          document.getElementById('authModal').style.display = 'block';
        }
      });
    }
  });

  // Login/Register handling
  document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    if (loginForm) {
      loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        loginUser(email, password);
      });
    }

    if (registerForm) {
      registerForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const username = document.getElementById('registerUsername').value;
        registerUser(email, password, username);
      });
    }

    // Modal toggling
    const openModalBtn = document.getElementById('openModalBtn');
    const authModal = document.getElementById('authModal');
    const closeModal = document.getElementById('closeModal');
    const closeModalRegister = document.getElementById('closeModalRegister');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');
    const loginWrapper = document.getElementById('login');
    const registerWrapper = document.getElementById('register');

    openModalBtn?.addEventListener('click', () => authModal.style.display = 'block');
    closeModal?.addEventListener('click', () => authModal.style.display = 'none');
    closeModalRegister?.addEventListener('click', () => authModal.style.display = 'none');

    window.addEventListener('click', (e) => {
      if (e.target === authModal) {
        authModal.style.display = 'none';
      }
    });

    showRegister?.addEventListener('click', () => {
      loginWrapper.style.display = 'none';
      registerWrapper.style.display = 'block';
    });

    showLogin?.addEventListener('click', () => {
      registerWrapper.style.display = 'none';
      loginWrapper.style.display = 'block';
    });
  });
}

// Auth helper functions
function loginUser(email, password) {
  const loginError = document.getElementById('loginError');
  loginError.textContent = ''; // Clear old message
  return signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      document.getElementById('authModal').style.display = 'none';
    })
    .catch((error) => {
      loginError.textContent = error.message;
    });
}

function registerUser(email, password, username) {
  const registerError = document.getElementById('registerError');
  registerError.textContent = ''; // Clear old message

  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const userRef = doc(db, "users", userCredential.user.uid);
      return setDoc(userRef, {
        username,
        email,
        createdAt: serverTimestamp()
      });
    })
    .then(() => {
      document.getElementById('authModal').style.display = 'none';
    })
    .catch((error) => {
      registerError.textContent = error.message;
    });
}
