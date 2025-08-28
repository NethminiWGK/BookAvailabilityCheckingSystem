import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';

const BASE_URL = 'http://10.201.182.65:3001';

import { useIsFocused } from '@react-navigation/native';

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
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>Check Registrations</Text>
      </View>

      <ScrollView horizontal>
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
container: { flex: 1, backgroundColor: '#f5f5f5', padding: 10, }, 
headerContainer: { backgroundColor: '#007bff', paddingVertical: 20, justifyContent: 'center', alignItems: 'center', }, 
headerText: { fontSize: 24, color: 'white', fontWeight: 'bold', }, 
table: { marginTop: 20, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', elevation: 4, }, 
tableHeader: { flexDirection: 'row', backgroundColor: '#007bff', paddingVertical: 15, paddingHorizontal: 25, justifyContent: 'space-between', }, 
tableHeaderText: { fontSize: 18, color: 'white', fontWeight: 'bold', flex: 1, textAlign: 'center', }, 
tableBody: { paddingBottom: 20, }, 
row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 15, paddingHorizontal: 80, borderBottomWidth: 1, borderBottomColor: '#ddd', }, 
text: { flex: 2, fontSize: 16, color: '#333', }, 
status: { flex: 1, padding: 5, textAlign: 'center', fontSize: 16, },
 accepted: { backgroundColor: 'green', color: 'white', borderRadius: 4, }, 
 rejected: { backgroundColor: 'red', color: 'white', borderRadius: 4, }, 
 notAccepted: { backgroundColor: 'yellow', color: 'black', borderRadius: 4, }, 
 eyeIcon: { flex: 0.5, justifyContent: 'center', alignItems: 'center', }, 
 eyeText: { fontSize: 20, color: 'blue', },

});

export default ShopTable;
