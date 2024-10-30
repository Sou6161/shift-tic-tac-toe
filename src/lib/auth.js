import { account, ID } from './appwrite';

// Create a custom event for auth state changes
const authStateChanged = new Event('authStateChanged');

const signUp = async (email, password, name) => {
  if (!email || !password || !name) {
    throw new Error("Please fill in all fields");
  }
  try {
    const user = await account.create(
      ID.unique(),
      email,
      password,
      name
    );
    
    // Create session after signup
    const session = await account.createEmailPasswordSession(email, password);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("sessionId", session.$id);
    localStorage.setItem("username", name); // Store username
    
    // Dispatch auth state change event
    window.dispatchEvent(authStateChanged);
    return session;
  } catch (error) {
    throw error;
  }
};

const signIn = async (email, password) => {
  if (!email || !password) {
    throw new Error("Please fill in all fields");
  }
  try {
    const session = await account.createEmailPasswordSession(
      email,
      password
    );
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("sessionId", session.$id);
    
    // Get and store user details
    const user = await account.get();
    localStorage.setItem("username", user.name);
    
    // Dispatch auth state change event
    window.dispatchEvent(authStateChanged);
    return session;
  } catch (error) {
    throw error;
  }
};

const signOut = async () => {
  try {
    await account.deleteSession('current');
    localStorage.clear();
    
    // Dispatch auth state change event
    window.dispatchEvent(authStateChanged);
  } catch (error) {
    throw error;
  }
};

const checkSession = async () => {
  try {
    const session = await account.getSession('current');
    if (session) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("sessionId", session.$id);
      
      // Get and store user details if not already stored
      if (!localStorage.getItem("username")) {
        const user = await account.get();
        localStorage.setItem("username", user.name);
      }
      
      return session;
    }
    return null;
  } catch (error) {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("sessionId");
    localStorage.removeItem("username");
    return null;
  }
};

export { signUp, signIn, signOut, checkSession };