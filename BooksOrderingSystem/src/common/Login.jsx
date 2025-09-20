import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { saveUser } from './AuthStore';  // Utility to save token and user data

const BASE_URL = 'http://10.185.32.65:3001';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onLogin = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.status === 404) {
        Alert.alert('No account', 'Please register first.');
        return;
      }
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

  // Store the session (JWT token, user data)
  console.log('Login response user object:', data.user);
  await saveUser(data.user);  // `saveSession` stores the token and user info

  // Navigate based on user role, pass userId to the next screen
  if (data.user.role === 'BOOKSELLER') {
        try {
          const userId = data.user._id || data.user.id;
          console.log('Fetching owner for userId:', userId);
          const ownerRes = await fetch(`${BASE_URL}/api/owner/by-user/${userId}`);

          const text = await ownerRes.text();
          let ownerData;
          try {
            ownerData = JSON.parse(text);
          } catch {
            throw new Error('Invalid response from server');
          }
          console.log('Owner API response:', ownerData);
          if (!ownerRes.ok) {
            // If owner not found, navigate to Home (not error)
            navigation.replace('Home', { userId });
            return;
          }
          // Navigate to Books page for any status
          navigation.replace('Books', { ownerId: ownerData._id, status: ownerData.status });
        } catch (err) {
          console.log('Owner status fetch error:', err);
          Alert.alert('Error', err.message || 'Could not verify owner status.');
          navigation.replace('Home', { userId: data.user._id });
        }
      }
      else if (data.user.role === 'BOOKSEEKER') {
        console.log('Navigating to ShopList with userId:', data.user.id);
        navigation.replace('ShopList', { userId: data.user.id });
      } 
      else {
        navigation.replace('ShopTable', { userId: data.user._id });
      }
    } catch (e) {
      Alert.alert('Login failed', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Find Your Book</Text>
      </View>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
      />
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          style={[styles.input, { paddingRight: 40 }]}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowPassword((prev) => !prev)}
        >
          <MaterialCommunityIcons
            name={showPassword ? 'eye-off-outline' : 'eye-outline'}
            size={24}
            color="#6e6b6be6"
          />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.btn} onPress={onLogin}>
        <Text style={styles.btnText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Signup')} style={styles.signupLink}>
        <Text style={styles.signupText}>New here? Create an account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    padding: 20,
  },
  header: {
    width: '100%',
    backgroundColor: '#007bff',
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 30,
    borderRadius: 10,
  },
  headerText: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    height: 54,
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 18,
    backgroundColor: '#fff',
    fontSize: 18,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
    marginBottom: 15,
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -18 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  btn: {
    width: '100%',
    paddingVertical: 15,
    borderRadius: 6,
    backgroundColor: '#007bff',
    alignItems: 'center',
    marginTop: 10,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  signupLink: {
    marginTop: 20,
  },
  signupText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
