import { account, ID } from './appwrite';

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
    
    // Immediately create session after signup
    const session = await account.createEmailPasswordSession(email, password);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("sessionId", session.$id);
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
    return session;
  } catch (error) {
    throw error;
  }
};


const signOut = async () => {
  try {
    await account.deleteSession('current');
    localStorage.clear(); // Clear all auth-related data
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
      return session;
    }
    return null;
  } catch (error) {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("sessionId");
    return null;
  }
};

export { signUp, signIn, signOut, checkSession };