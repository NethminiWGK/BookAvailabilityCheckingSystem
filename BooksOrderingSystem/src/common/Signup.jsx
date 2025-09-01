
import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { saveSession } from './AuthStore';  // Utility to save session (token, user)

const BASE_URL = 'http://10.201.182.65:3001';

export default function Signup({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('BOOKSEEKER'); // BOOKSEEKER | BOOKSELLER
  const [password, setPassword] = useState('');

  const onSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Validation', 'Please fill all fields.');
      return;
    }
    try {
      const res = await fetch(`${BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

      // Save session (token and user data)
      await saveSession(data.token, data.user);

      // Navigate to the Login screen after successful signup and pass the userId
      navigation.replace('Login', { userId: data.user._id });  // Pass userId to Login screen
    } catch (e) {
      Alert.alert('Signup failed', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Find Your Book</Text>
      </View>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
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
      <View style={{ flexDirection:'row', gap: 12, marginVertical: 8, justifyContent:'center' }}>
        <TouchableOpacity onPress={() => setRole('BOOKSEEKER')}>
          <Text style={[styles.chip, role==='BOOKSEEKER' && styles.chosen]}>Bookseeker</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRole('BOOKSELLER')}>
          <Text style={[styles.chip, role==='BOOKSELLER' && styles.chosen]}>Bookseller</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setRole('ADMIN')}>
          <Text style={[styles.chip, role==='ADMIN' && styles.chosen]}>Admin</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.btn} onPress={onSignup}>
        <Text style={styles.btnText}>Sign up</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.signupLink}>
        <Text style={styles.signupText}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f7f7f7d8',
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
    width: '95%',
    alignSelf: 'center',
   
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
  input: { borderWidth:1, borderColor:'#ddd', borderRadius:6, padding:10, marginBottom:12 },
  chip: { paddingHorizontal:12, paddingVertical:6, borderWidth:1, borderRadius:16, borderColor:'#aaa' },
  chosen: { backgroundColor:'#007bff', color:'#fff', borderColor:'#007bff' },
  btn: { backgroundColor:'#007bff', padding:12, borderRadius:6, alignItems:'center', marginTop:8 }
});
