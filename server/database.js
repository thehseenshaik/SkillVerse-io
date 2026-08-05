const firebaseAdmin = require('firebase-admin');

// Initialize Firebase Admin or use in-memory storage for development
let db;

function initializeDatabase() {
  try {
    if (process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_PRIVATE_KEY !== '-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_HERE\\n-----END PRIVATE KEY-----') {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      };

      firebaseAdmin.initializeApp({
        credential: firebaseAdmin.credential.cert(serviceAccount),
      });

      db = firebaseAdmin.firestore();
      console.log('✓ Firebase Admin initialized');
    } else {
      // Use in-memory storage for development
      console.log('⚠ Firebase credentials not configured, using in-memory storage for development');
      db = createInMemoryStorage();
    }
  } catch (error) {
    console.log('⚠ Firebase initialization failed, using in-memory storage for development:', error.message);
    db = createInMemoryStorage();
  }
  
  return db;
}

// Simple in-memory storage for development
function createInMemoryStorage() {
  const memoryStore = {
    users: new Map(),
    
    collection(collectionName) {
      return {
        doc(docId) {
          return {
            async get() {
              const userData = memoryStore.users.get(docId);
              return {
                exists: !!userData,
                data: () => userData || {}
              };
            },
            async set(data, options) {
              const existing = memoryStore.users.get(docId) || {};
              
              if (options?.merge) {
                // Handle dot notation for nested merges
                const merged = { ...existing };
                
                for (const key in data) {
                  if (key.includes('.')) {
                    // Handle dot notation (e.g., 'connections.github')
                    const keys = key.split('.');
                    let current = merged;
                    
                    for (let i = 0; i < keys.length - 1; i++) {
                      if (!current[keys[i]]) {
                        current[keys[i]] = {};
                      }
                      current = current[keys[i]];
                    }
                    
                    // Assign the entire value (could be object or primitive) to the leaf node
                    current[keys[keys.length - 1]] = data[key];
                  } else {
                    // Regular merge
                    merged[key] = data[key];
                  }
                }
                
                memoryStore.users.set(docId, merged);
              } else {
                // For non-merge, also handle dot notation
                const result = {};
                for (const key in data) {
                  if (key.includes('.')) {
                    const keys = key.split('.');
                    let current = result;
                    for (let i = 0; i < keys.length - 1; i++) {
                      if (!current[keys[i]]) {
                        current[keys[i]] = {};
                      }
                      current = current[keys[i]];
                    }
                    // Assign the entire value (could be object or primitive) to the leaf node
                    current[keys[keys.length - 1]] = data[key];
                  } else {
                    result[key] = data[key];
                  }
                }
                memoryStore.users.set(docId, result);
              }
              
              return this;
            },
            async update(data) {
              const existing = memoryStore.users.get(docId) || {};
              memoryStore.users.set(docId, { ...existing, ...data });
              return this;
            },
            async delete() {
              memoryStore.users.delete(docId);
            }
          };
        }
      };
    }
  };
  
  return memoryStore;
}

// Initialize database immediately
const database = initializeDatabase();

module.exports = database;
