/**
 * Artscent User Authentication & Customer Account Engine
 * Handles customer sign up, login, profile management, and automatic Firestore synchronization.
 */

(function() {
  const USER_STORAGE_KEY = 'artscent_current_user';
  const CART_STORAGE_KEY = 'artscent_cart_items';

  let currentUser = null;
  const authListeners = [];

  function notifyListeners(user) {
    currentUser = user;
    authListeners.forEach(fn => {
      try { fn(user); } catch(e) { console.error(e); }
    });
  }

  function getLocalUser() {
    try {
      const data = localStorage.getItem(USER_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch(e) {
      return null;
    }
  }

  function setLocalUser(user) {
    if (user) {
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }

  /**
   * Sync shopping cart items with customer document in Firestore
   */
  async function syncCartToFirestore(cartItems) {
    if (!window.firebaseDb || !currentUser || !currentUser.uid) return;
    try {
      const userRef = window.firebaseDb.collection('users').doc(currentUser.uid);
      await userRef.set({
        cart_items: cartItems || [],
        updated_at: new Date().toISOString()
      }, { merge: true });
      console.log('Cart successfully synced to customer profile in Firestore.');
    } catch (err) {
      console.warn('Could not sync cart to Firestore:', err);
    }
  }

  /**
   * Pull saved cart items from Firestore on user sign in
   */
  async function syncCartFromFirestore(uid) {
    if (!window.firebaseDb || !uid) return;
    try {
      const userDoc = await window.firebaseDb.collection('users').doc(uid).get();
      if (userDoc.exists) {
        const data = userDoc.data();
        if (data && Array.isArray(data.cart_items) && data.cart_items.length > 0) {
          let localCart = [];
          try {
            const raw = localStorage.getItem(CART_STORAGE_KEY);
            if (raw) localCart = JSON.parse(raw);
          } catch(e) {}

          // Merge local cart and cloud cart by item id
          const mergedMap = new Map();
          localCart.forEach(item => { if (item && item.id) mergedMap.set(item.id, item); });
          data.cart_items.forEach(item => {
            if (item && item.id) {
              if (mergedMap.has(item.id)) {
                // Update quantity to max
                const existing = mergedMap.get(item.id);
                existing.quantity = Math.max(existing.quantity || 1, item.quantity || 1);
              } else {
                mergedMap.set(item.id, item);
              }
            }
          });

          const finalCart = Array.from(mergedMap.values());
          localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(finalCart));
          if (window.artscentCart && typeof window.artscentCart.render === 'function') {
            window.artscentCart.render();
          }
          console.log('Customer cart restored from Firestore profile.');
        }
      }
    } catch (err) {
      console.warn('Error fetching user cart from Firestore:', err);
    }
  }

  /**
   * Initialize Firebase Auth listener
   */
  function initAuthListener() {
    if (typeof firebase === 'undefined' || !window.firebaseAuth) {
      setTimeout(initAuthListener, 100);
      return;
    }

    window.firebaseAuth.onAuthStateChanged(async (user) => {
      if (user) {
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL || '',
          phoneNumber: user.phoneNumber || ''
        };
        setLocalUser(userData);
        notifyListeners(userData);

        // Fetch or create profile doc in Firestore
        if (window.firebaseDb) {
          try {
            const docRef = window.firebaseDb.collection('users').doc(user.uid);
            const snap = await docRef.get();
            if (!snap.exists) {
              await docRef.set({
                uid: user.uid,
                email: user.email,
                displayName: userData.displayName,
                phoneNumber: userData.phoneNumber,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              }, { merge: true });
            }
            await syncCartFromFirestore(user.uid);
          } catch(e) {
            console.error('Error fetching user doc:', e);
          }
        }
      } else {
        setLocalUser(null);
        notifyListeners(null);
      }
      updateNavbarAccountIcon();
    });
  }

  /**
   * Update nav icon across all pages to show logged in state
   */
  function updateNavbarAccountIcon() {
    const user = currentUser || getLocalUser();
    const accountLinks = document.querySelectorAll('a[aria-label="Account"], a.order-nav-action-icon[title="Account"], a.aevi-mobile-link');
    accountLinks.forEach(link => {
      if (link.classList.contains('aevi-mobile-link')) {
        if (user) {
          link.textContent = 'MY ACCOUNT (' + (user.displayName || 'USER').toUpperCase() + ')';
        } else {
          link.textContent = 'SIGN IN / ACCOUNT';
        }
      } else {
        if (user) {
          link.title = 'Account: ' + (user.displayName || user.email);
          link.style.position = 'relative';
          if (!link.querySelector('.user-active-badge')) {
            const badge = document.createElement('span');
            badge.className = 'user-active-badge';
            badge.style.cssText = 'position:absolute;top:2px;right:2px;width:7px;height:7px;background:#10b981;border-radius:50%;border:1.5px solid #fff;';
            link.appendChild(badge);
          }
        } else {
          const badge = link.querySelector('.user-active-badge');
          if (badge) badge.remove();
        }
      }
    });
  }

  /**
   * Customer Sign In with Email & Password
   */
  async function signInWithEmail(email, password) {
    if (!window.firebaseAuth) throw new Error('Authentication is not initialized');
    const cred = await window.firebaseAuth.signInWithEmailAndPassword(email, password);
    return cred.user;
  }

  /**
   * Customer Sign Up with Email & Password
   */
  async function signUpWithEmail(email, password, displayName, phone) {
    if (!window.firebaseAuth) throw new Error('Authentication is not initialized');
    const cred = await window.firebaseAuth.createUserWithEmailAndPassword(email, password);
    const user = cred.user;

    if (displayName && user.updateProfile) {
      await user.updateProfile({ displayName: displayName });
    }

    if (window.firebaseDb) {
      // Save full profile and current cart in Firestore
      let cart = [];
      try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (raw) cart = JSON.parse(raw);
      } catch(e) {}

      await window.firebaseDb.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: email,
        displayName: displayName || email.split('@')[0],
        phoneNumber: phone || '',
        cart_items: cart,
        saved_products: [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }

    return user;
  }

  /**
   * Customer Sign In with Google
   */
  async function signInWithGoogle() {
    if (!window.firebaseAuth) throw new Error('Authentication is not initialized');
    const provider = new firebase.auth.GoogleAuthProvider();
    const result = await window.firebaseAuth.signInWithPopup(provider);
    const user = result.user;

    if (window.firebaseDb) {
      let cart = [];
      try {
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        if (raw) cart = JSON.parse(raw);
      } catch(e) {}

      await window.firebaseDb.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        phoneNumber: user.phoneNumber || '',
        cart_items: cart,
        updated_at: new Date().toISOString()
      }, { merge: true });
    }

    return user;
  }

  /**
   * Customer Sign Out
   */
  async function signOut() {
    if (window.firebaseAuth) {
      await window.firebaseAuth.signOut();
    }
    setLocalUser(null);
    notifyListeners(null);
    updateNavbarAccountIcon();
  }

  /**
   * Save Wishlist item to user account
   */
  async function saveProductToAccount(product) {
    if (!currentUser || !window.firebaseDb) return;
    try {
      const userRef = window.firebaseDb.collection('users').doc(currentUser.uid);
      const doc = await userRef.get();
      let saved = [];
      if (doc.exists && doc.data().saved_products) {
        saved = doc.data().saved_products;
      }
      if (!saved.some(p => p.id === product.id)) {
        saved.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image_url: product.image_url || product.image,
          saved_at: new Date().toISOString()
        });
        await userRef.update({ saved_products: saved });
      }
    } catch(err) {
      console.warn('Error saving product to account:', err);
    }
  }

  // Expose API globally
  window.artscentUserAuth = {
    getUser: function() { return currentUser || getLocalUser(); },
    onAuthStateChanged: function(fn) {
      authListeners.push(fn);
      if (currentUser) fn(currentUser);
      else if (getLocalUser()) fn(getLocalUser());
    },
    signInWithEmail,
    signIn: signInWithEmail,
    signUpWithEmail,
    signUp: signUpWithEmail,
    signInWithGoogle,
    signInGoogle: signInWithGoogle,
    signOut,
    syncCart: syncCartToFirestore,
    saveProductToAccount
  };

  document.addEventListener('DOMContentLoaded', () => {
    initAuthListener();
    updateNavbarAccountIcon();
  });
})();
