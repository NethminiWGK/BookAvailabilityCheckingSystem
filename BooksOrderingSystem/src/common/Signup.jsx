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
    <View style={styles.wrap}>
      <TextInput placeholder="Name" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" style={styles.input} />
      <TextInput placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      {/* Simple role picker */}
      <View style={{ flexDirection:'row', gap: 12, marginVertical: 8 }}>
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
        <Text style={{ color:'#fff', fontWeight:'bold' }}>Sign up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 10 }}>
        <Text>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20 },
  input: { borderWidth:1, borderColor:'#ddd', borderRadius:6, padding:10, marginBottom:12 },
  chip: { paddingHorizontal:12, paddingVertical:6, borderWidth:1, borderRadius:16, borderColor:'#aaa' },
  chosen: { backgroundColor:'#007bff', color:'#fff', borderColor:'#007bff' },
  btn: { backgroundColor:'#007bff', padding:12, borderRadius:6, alignItems:'center', marginTop:8 }
});
