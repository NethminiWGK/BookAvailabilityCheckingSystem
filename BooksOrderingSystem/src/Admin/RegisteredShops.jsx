import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import Heading from '../common/Heading';
import { useIsFocused } from '@react-navigation/native';

const BASE_URL = 'http://10.201.182.65:3001';

const ShopTable = ({ navigation }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const isFocused = useIsFocused(); // <- detect when screen is active

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/owners`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const data = await res.json();
      setRegistrations(data);
    } catch (e) {
      console.log('Fetch error:', e.message);
      Alert.alert('Error', 'Failed to load registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  // Refresh when coming back from ShopDetails
  useEffect(() => {
    if (isFocused) {
      fetchRegistrations(); // refetch when screen is focused
    }
  }, [isFocused]);
  



  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <Text style={styles.text}>{item.bookShopName}</Text>
      <Text
        style={[
          styles.status,
          item.status === 'Approved'
            ? styles.accepted
            : item.status === 'Rejected'
            ? styles.rejected
            : styles.notAccepted
        ]}
      >
        {item.status}
      </Text>
     <TouchableOpacity
  style={styles.eyeIcon}
  onPress={() => navigation.navigate('ViewShopDetails', {
    ownerId: item._id})}
>
  <Text style={styles.eyeText}>👁️</Text>
</TouchableOpacity>

    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Heading title="Check Registrations" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableHeaderText}>Shop Name</Text>
            <Text style={styles.tableHeaderText}>Status</Text>
            <Text style={styles.tableHeaderText}>Action</Text>
          </View>
          <FlatList
            data={registrations}
            renderItem={renderItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.tableBody}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 10,
  },
  table: {
    marginTop: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 6,
   width:385,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    zIndex: 2,
    elevation: 8,
  },
  tableHeaderText: {
    fontSize: 19,
    color: 'white',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0,0,0,0.1)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  tableBody: {
    paddingBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    backgroundColor: '#fff',
    minHeight: 50,
    marginBottom: 2,
    borderRadius: 8,
    marginHorizontal: 0,
  },
  text: {
    flex: 1,
    fontSize: 17,
    color: '#222',
    fontWeight: '500',
    textAlign: 'center',
    alignSelf: 'center',
  },
  status: {
    flex: 1,
    paddingVertical: 7,
    paddingHorizontal: 0,
    textAlign: 'center',
    fontSize: 16,
    borderRadius: 6,
    overflow: 'hidden',
    fontWeight: 'bold',
    marginHorizontal: 8,
    alignSelf: 'center',
  },
  accepted: {
    backgroundColor: '#28a745',
    color: 'white',
  },
  rejected: {
    backgroundColor: '#dc3545',
    color: 'white',
  },
  notAccepted: {
    backgroundColor: '#ffc107',
    color: '#222',
  },
  eyeIcon: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    alignSelf: 'center',
  },
  eyeText: {
    fontSize: 22,
    color: '#007bff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ShopTable;
