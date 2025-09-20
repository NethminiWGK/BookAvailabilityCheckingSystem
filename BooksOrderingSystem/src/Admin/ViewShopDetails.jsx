import React, { useEffect, useState } from 'react';
import { View, Text, Image, Button, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import Heading from '../common/Heading';

const BASE_URL = 'http://10.185.32.65:3001';

const ShopDetails = ({ route, navigation }) => {
  const { ownerId } = route.params; // This is the shop ID passed from the previous screen
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchShopDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/owner/${ownerId}`); // Replace with your actual API endpoint
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();

      // Handle bookshopImage and NIC Image
      const bookshopImagePath = data.bookshopImage.replace(/\\/g, '/');
      const nicFilePath = data.nicFile.replace(/\\/g, '/');
      const bookshopImageUri = bookshopImagePath?.startsWith('http') ? bookshopImagePath : `${BASE_URL}/${bookshopImagePath}`;
      const nicFileUri = nicFilePath?.startsWith('http') ? nicFilePath : `${BASE_URL}/${nicFilePath}`;

      setDetails({
        ...data,
        bookshopImage: bookshopImageUri,  // Set the correct URI for the bookshop image
        nicFile: nicFileUri,  // Set the correct URI for the NIC image
      });
    } catch (e) {
      console.log('Error fetching shop details:', e.message);
      Alert.alert('Error', 'Failed to load shop details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShopDetails();
  }, []);

  const handleAccept = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/owner/${ownerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Approved' }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      
      Alert.alert('Success', 'Shop Approved');
      navigation.goBack(); // go back to previous list
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  const handleReject = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/owner/${ownerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Rejected' }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      Alert.alert('Success', 'Shop Rejected');
      navigation.goBack();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#abb0b6ff" />
      </View>
    );
  }

  if (!details) {
    return null; // or a fallback UI
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#e3eafce0' }}>
      <Heading title="Check Details" />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <Text style={styles.label}>Shop Owner's Full Name: {details.ownerName}</Text>
          <Text style={styles.label}>Address: {details.address}</Text>
          <Text style={styles.label}>Mobile No: {details.mobileNo}</Text>
          <Text style={styles.label}>Book Shop Name: {details.bookShopName}</Text>
          <Text style={styles.label}>District: {details.district}</Text>
          <Text style={styles.label}>City: {details.city}</Text>
          <Text style={styles.label}>NIC: {details.nic}</Text>

          {/* Bookshop Image Display */}
          <Text style={styles.subHeader}>Bookshop Image:</Text>
          <Image
            source={{ uri: details.bookshopImage }}
            style={styles.smallImage}
          />

          {/* NIC Image Display */}
          <Text style={styles.subHeader}>NIC Image:</Text>
          <Image
            source={{ uri: details.nicFile }}
            style={styles.smallImage}
          />

          <Button title="Approved" onPress={handleAccept} color="green" />
          <View style={{ height: 10 }} />
          <Button title="Rejected" onPress={handleReject} color="red" />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  scrollContent: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  card: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 5,
    marginBottom: 30,
    alignSelf: 'center',
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: '#333' },
  label: { fontSize: 16, marginBottom: 10, color: '#555' },
  subHeader: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#333' },
  coverImage: { width: '100%', height: 200, borderRadius: 6, resizeMode: 'cover', marginBottom: 15 },
  smallImage: { width: '60%', height: 120, borderRadius: 6, resizeMode: 'cover', marginBottom: 15, alignSelf: 'center' },
});

export default ShopDetails;
