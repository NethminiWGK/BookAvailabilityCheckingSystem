import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';

const AddAddressScreen = ({ route, navigation }) => {
  const { userId } = route.params || {};
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [street, setStreet] = useState('');
  const [name, setName] = useState('');
  const [mobileNo, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!province || !district || !city || !mobileNo || !street || !name) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    setLoading(true);
    try {
      // Update cart address in backend
      const res = await fetch(`http://10.201.182.65:3001/api/cart/address`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, address: { province, district, city, street, name,  mobileNo } })
      });
      const data = await res.json();
      console.log('Address response:', data);
      if (res.ok) {
        navigation.goBack();
      } else {
        Alert.alert('Error', 'Could not update address.');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not update address.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add Address</Text>
      <TextInput
        style={styles.input}
        placeholder="Province"
        value={province}
        onChangeText={setProvince}
      />
      <TextInput
        style={styles.input}
        placeholder="District"
        value={district}
        onChangeText={setDistrict}
      />
       <TextInput
        style={styles.input}
        placeholder="City"
        value={city}
        onChangeText={setCity}
      />
      <TextInput
        style={styles.input}
        placeholder="Street"
        value={street}
        onChangeText={setStreet}
      />
       <TextInput
        style={styles.input}
        placeholder="Name"
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        value={mobileNo}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Button title={loading ? 'Saving...' : 'Save Address'} onPress={handleSubmit} disabled={loading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    padding: 20,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
  },
});

export default AddAddressScreen;
