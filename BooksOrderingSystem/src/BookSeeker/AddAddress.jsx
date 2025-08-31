import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Button, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const AddAddressScreen = ({ route, navigation }) => {
  const {
    userId,
    province: initialProvince = '',
    district: initialDistrict = '',
    city: initialCity = '',
    street: initialStreet = '',
    name: initialName = '',
    mobileNo: initialMobileNo = '',
  } = route.params || {};
  const [province, setProvince] = useState(initialProvince);
  const [district, setDistrict] = useState(initialDistrict);
  const [city, setCity] = useState(initialCity);
  const [street, setStreet] = useState(initialStreet);
  const [name, setName] = useState(initialName);
  const [mobileNo, setPhone] = useState(initialMobileNo);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!province || !district || !city  || !street || !name || !mobileNo) {
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
      <View style={styles.input}>
        <Picker
          selectedValue={province}
          onValueChange={(itemValue) => {
            setProvince(itemValue);
            setDistrict(''); // Reset district when province changes
          }}
          style={styles.picker}
        >
          <Picker.Item label="Select Province" value="" color="#0c0b0bff" />
          <Picker.Item label="Western" value="Western" />
          <Picker.Item label="Central" value="Central" />
          <Picker.Item label="Southern" value="Southern" />
          {/* Add more provinces as needed */}
        </Picker>
      </View>
      <View style={styles.input}>
        <Picker
          selectedValue={district}
          onValueChange={setDistrict}
          enabled={!!province}
          style={styles.picker}
        >
          <Picker.Item label="Select District" value="" color="#0c0b0bff" />
          {province === 'Western' && [
            <Picker.Item label="Colombo" value="Colombo" key="Colombo" />,
            <Picker.Item label="Gampaha" value="Gampaha" key="Gampaha" />,
            <Picker.Item label="Kalutara" value="Kalutara" key="Kalutara" />
          ]}
          {province === 'Central' && [
            <Picker.Item label="Kandy" value="Kandy" key="Kandy" />,
            <Picker.Item label="Matale" value="Matale" key="Matale" />,
            <Picker.Item label="Nuwara Eliya" value="Nuwara Eliya" key="Nuwara Eliya" />
          ]}
          {province === 'Southern' && [
            <Picker.Item label="Galle" value="Galle" key="Galle" />,
            <Picker.Item label="Matara" value="Matara" key="Matara" />,
            <Picker.Item label="Hambantota" value="Hambantota" key="Hambantota" />
          ]}
          {/* Add more districts for other provinces as needed */}
        </Picker>
      </View>
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
    padding: 0,
    marginBottom: 15,
    fontSize: 16,
    height: 48,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    fontSize: 16,
    color: '#222',
    width: '100%',
    backgroundColor: 'transparent',
  },
});

export default AddAddressScreen;
