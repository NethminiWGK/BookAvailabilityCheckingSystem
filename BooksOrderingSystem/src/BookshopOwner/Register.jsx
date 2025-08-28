import React, { useState } from 'react';
import { ScrollView, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Title, Provider as PaperProvider } from 'react-native-paper';
import * as DocumentPicker from 'expo-document-picker';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [bookShopName, setBookShopName] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [nic, setNic] = useState('');
  const [nicFile, setNicFile] = useState(null);
  const [shopImage, setShopImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const pickNicFile = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      type: '*/*',
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (!res.canceled && res.assets?.length > 0) setNicFile(res.assets[0]);
  };

  const pickShopImage = async () => {
    const res = await DocumentPicker.getDocumentAsync({
      // If you only want images, you can use: 'image/*'
      type: '*/*',
      multiple: false,
      copyToCacheDirectory: true,
    });
    if (!res.canceled && res.assets?.length > 0) setShopImage(res.assets[0]);
  };

  const handleSubmit = async () => {
    if (!nicFile) return Alert.alert('Validation Error', 'Please select a NIC file.');
    if (!shopImage) return Alert.alert('Validation Error', 'Please select a bookshop image.');

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('address', address);
      formData.append('mobileNo', mobileNo);
      formData.append('bookShopName', bookShopName);
      formData.append('district', district);
      formData.append('city', city);
      formData.append('nic', nic);

      formData.append('nicFile', {
        uri: nicFile.uri,
        name: nicFile.name ?? 'nic-file',
        type: nicFile.mimeType || 'application/octet-stream',
      });

      // ⚠️ KEY MUST MATCH YOUR BACKEND FIELD NAME (bookshopImage)
      formData.append('bookshopImage', {
        uri: shopImage.uri,
        name: shopImage.name ?? 'shop-image',
        type: shopImage.mimeType || 'application/octet-stream',
      });

      const res = await fetch('http://10.201.182.65:3001/api/register', {
        method: 'POST',
        body: formData, // don't set Content-Type yourself
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      await res.json();
      Alert.alert('✅ Success', 'Owner registered successfully!');

      // Reset
      setFullName('');
      setAddress('');
      setMobileNo('');
      setBookShopName('');
      setDistrict('');
      setCity('');
      setNic('');
      setNicFile(null);
      setShopImage(null);
    } catch (e) {
      console.log('Upload error:', e.message);
      Alert.alert('❌ Error', e.message || 'Failed to register.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PaperProvider>
      <ScrollView contentContainerStyle={styles.container}>
        <Title style={styles.header}>Register Now</Title>

        <TextInput label="Full Name" value={fullName} onChangeText={setFullName} mode="outlined" style={styles.input} />
        <TextInput label="Address" value={address} onChangeText={setAddress} mode="outlined" style={styles.input} />
        <TextInput label="Mobile No" value={mobileNo} onChangeText={setMobileNo} keyboardType="phone-pad" mode="outlined" style={styles.input} />
        <TextInput label="Book Shop Name" value={bookShopName} onChangeText={setBookShopName} mode="outlined" style={styles.input} />
        <TextInput label="District" value={district} onChangeText={setDistrict} mode="outlined" style={styles.input} />
        <TextInput label="City" value={city} onChangeText={setCity} mode="outlined" style={styles.input} />
        <TextInput label="NIC" value={nic} onChangeText={setNic} mode="outlined" style={styles.input} />

        <Button mode="outlined" onPress={pickNicFile} style={{ marginBottom: 10 }} disabled={loading}>
          {nicFile ? `📄 ${nicFile.name}` : 'Upload NIC File'}
        </Button>

        <Button mode="outlined" onPress={pickShopImage} style={{ marginBottom: 10 }} disabled={loading}>
          {shopImage ? `🖼️ ${shopImage.name}` : 'Upload Bookshop Image'}
        </Button>

        <Button mode="contained" onPress={handleSubmit} loading={loading} disabled={loading}>
          Submit
        </Button>
      </ScrollView>
    </PaperProvider>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  header: {
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007bff',
    marginBottom: 20,
  },
  input: { marginBottom: 15 },
});

export default RegisterPage;
