import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { saveUser } from './AuthStore';  // Utility to save token and user data

const BASE_URL = 'http://10.201.182.65:3001';

export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
      await saveUser( data.user);  // `saveSession` stores the token and user info

      // Navigate based on user role, pass userId to the next screen
      if (data.user.role === 'BOOKSELLER') {
        navigation.replace('Home', { userId: data.user._id });  // Pass userId to Home
      } 
      else if (data.user.role === 'BOOKSEEKER') {
        navigation.replace('ShopList', { userId: data.user._id });  // Pass userId to Home
      } 
      else {
        navigation.replace('ShopTable', { userId: data.user._id });  // Pass userId to ShopList
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
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

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
    backgroundColor: '#f7f7f7', // Light background color
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
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    marginBottom: 15,
    backgroundColor: '#fff',
    fontSize: 16,
    color: '#333',
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
