// Firebase Web Client Initialization
(function() {
  const firebaseConfig = {
    projectId: "gen-lang-client-0849003683",
    appId: "1:653860473802:web:bc587714be10321f325d33",
    apiKey: "AIzaSyC1IRw6nJ89ipF75bf9fkvwl1l_X80bN_E",
    authDomain: "gen-lang-client-0849003683.firebaseapp.com",
    firestoreDatabaseId: "ai-studio-artscent-3ed955d4-8528-4874-b821-f096f5c0872a",
    storageBucket: "gen-lang-client-0849003683.firebasestorage.app",
    messagingSenderId: "653860473802"
  };

  window.firebaseConfig = firebaseConfig;

  // Initialize Firebase using compat SDK if loaded, or prepare configuration
  if (typeof firebase !== 'undefined') {
    if (!firebase.apps || !firebase.apps.length) {
      window.firebaseApp = firebase.initializeApp(firebaseConfig);
    } else {
      window.firebaseApp = firebase.app();
    }
    
    // Initialize Firestore with custom databaseId
    try {
      window.firebaseDb = firebase.app().firestore(firebaseConfig.firestoreDatabaseId);
    } catch(e) {
      window.firebaseDb = firebase.firestore();
    }
    
    window.firebaseAuth = firebase.auth();
    console.log("Artscent: Firebase initialized successfully with Firestore database", firebaseConfig.firestoreDatabaseId);
  }
})();
