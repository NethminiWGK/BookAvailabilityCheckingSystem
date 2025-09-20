import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { saveSession } from './AuthStore';  // Utility to save session (token, user)

const BASE_URL = 'http://10.185.32.65:3001';

export default function Signup({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('BOOKSEEKER'); // BOOKSEEKER | BOOKSELLER
  const [open, setOpen] = useState(false);
  const [roleItems, setRoleItems] = useState([
    { label: 'Bookseeker', value: 'BOOKSEEKER' },
    { label: 'Bookseller', value: 'BOOKSELLER' },
  ]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
   const emailRegex = /^[\w-.]+@[\w-]+\.[a-zA-Z]{2,}$/;
   const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%]).{8,}$/;

  const onSignup = async () => {
    let newErrors = {};
    if (!name) newErrors.name = 'Name can not be blank';
    if (!email) newErrors.email = 'Email can not be blank';
     else if (!emailRegex.test(email)) newErrors.email = 'Invalid email address';
    if (!password) newErrors.password = 'Password can not be blank';
     else if (!passwordRegex.test(password)) newErrors.password = 'Password must contain 8+ characters with uppercase, lowercase, number & symbol (!,@,#,$,%)';
    if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    if (password && confirmPassword && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;
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
      setErrors({ general: e.message });
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
      {errors.name && <Text style={styles.error}>{errors.name}</Text>}
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
      />
      {errors.email && <Text style={styles.error}>{errors.email}</Text>}
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
            color="#4d4949e6"
          />
        </TouchableOpacity>
      </View>
      {errors.password && <Text style={styles.error}>{errors.password}</Text>}
      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          style={[styles.input, { paddingRight: 40 }]}
        />
        <TouchableOpacity
          style={styles.eyeIcon}
          onPress={() => setShowConfirmPassword((prev) => !prev)}
        >
          <MaterialCommunityIcons
            name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
            size={24}
            color="#4d4949e6"
          />
        </TouchableOpacity>
      </View>
      {errors.confirmPassword && <Text style={styles.error}>{errors.confirmPassword}</Text>}
      <Text style={styles.roleLabel}>Sign up as</Text>
      <DropDownPicker
        open={open}
        value={role}
        items={roleItems}
        setOpen={setOpen}
        setValue={setRole}
        setItems={setRoleItems}
        containerStyle={styles.pickerContainer}
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
        placeholder="Select role"
        zIndex={1000}
      />
      {errors.general && <Text style={styles.error}>{errors.general}</Text>}
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
  btn: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: '#007bff',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 3,
  },
  btnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
    letterSpacing: 0.5,
  },
  signupLink: {
    marginTop: 20,
  },
  signupText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    alignSelf: 'flex-start',
    marginLeft: 2,
  },
  pickerContainer: {
    width: '100%',
    height: 54,
    paddingHorizontal: 18,
    paddingVertical: 0,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    marginBottom: 19,
    backgroundColor: '#fff',
    fontSize: 18,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
    zIndex: 1,
  },
  passwordContainer: {
    width: '100%',
    position: 'relative',
   
  },
  eyeIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -18 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerContainer: {
    width: '100%',
    marginBottom: 19,
    zIndex: 1000,
  },
  dropdown: {
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 24,
    color: '#333',
    minHeight: 54,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  dropdownContainer: {
    borderColor: '#ddd',
    borderRadius: 10,
    backgroundColor: '#fff',
    fontSize: 18,
    color: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 2,
  },
  error: {
    color: 'red',
    fontSize: 14,
    marginBottom: 8,
    marginLeft: 2,
    marginTop:-8,
    alignSelf: 'flex-start',
  
  },
});