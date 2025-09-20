import AsyncStorage from '@react-native-async-storage/async-storage';

// Save user session
export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem('user', JSON.stringify(user));
  } catch (err) {
    console.error('Error saving user:', err);
  }
};

export const saveSession = async (token, user) => {
  try {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
  } catch (err) {
    console.error('Error saving session:', err);
  }
};


// Get logged-in user
export const getUser = async () => {
  try {
    const user = await AsyncStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  } catch (err) {
    console.error('Error getting user:', err);
    return null;
  }
};

// Optional: clear user on logout
export const clearUser = async () => {
  try {
    await AsyncStorage.removeItem('user');
  } catch (err) {
    console.error('Error clearing user:', err);
  }
};
