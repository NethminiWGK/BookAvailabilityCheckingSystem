import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput, StyleSheet, TouchableWithoutFeedback, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../common/BottomNavigation';
import Heading from "../common/Heading"; // <-- path to Heading.js

// 👉 set this to your machine’s LAN IP (same you used elsewhere)
const BASE_URL = 'http://10.201.182.65:3001';

const TownListScreen = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  // ...existing code...
const fetchShops = useCallback(async () => {
  try {
    setError('');
    setLoading(true);
    const res = await fetch(`${BASE_URL}/api/owners`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Fetch books for each shop in parallel and map to UI structure
   const shopsWithBooks = await Promise.all(
  (Array.isArray(data) ? data : []).map(async (o) => {
    let books = [];
    try {
      const booksRes = await fetch(`${BASE_URL}/api/owners/${o._id}/books`);
      books = booksRes.ok ? await booksRes.json() : [];
    } catch {
      books = [];
    }
    // ...map to your UI structure...
    return {
      id: o._id,
      name: o.bookShopName || 'Unnamed',
      location: [o.city].filter(Boolean).join(', '),
      imageUri: `${BASE_URL}/${(o.bookshopImage || '').replace(/\\/g, '/')}`,
      books,
      raw: o,
    };
  })
);

    setShops(shopsWithBooks);
  } catch (e) {
    setError(e.message || 'Failed to load bookshops');
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, []);
// ...existing code...

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchShops();
  }, [fetchShops]);

  // Filter by shop name, location, or book title
 // ...existing code...
// ...existing code...
const filteredShops = useMemo(() => {
  const q = searchQuery.trim().toLowerCase();
  if (!q) return shops;
  return shops.filter(s => {
    // You can log here for debugging:
    console.log('Shop:', s.name, 'Books:', s.books);
    return (
      (s.name && s.name.toLowerCase().includes(q)) ||
      (s.location && s.location.toLowerCase().includes(q)) ||
      (Array.isArray(s.books) && s.books.some(
        book => book.title && book.title.toLowerCase().includes(q)
      ))
    );
  });
}, [searchQuery, shops]);


  // replace your existing handlePress
const handlePress = (ownerId) => {
  navigation.navigate('Books', { ownerId});
};

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading bookshops…</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header with Search Bar */}
      <View>
        <Heading title="Find Your Book" />

         {/* Conditionally render the Register button */}
        {/* Only show the Register button if the user is logged out and their role is Bookseller */}
          <TouchableOpacity
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
          >
            <Text style={styles.registerButtonText}>Register</Text>
          </TouchableOpacity>
      


        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your town or shop"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableWithoutFeedback onPress={() => {}}>
            <Ionicons name="search" size={24} color="black" style={styles.searchIcon} />
          </TouchableWithoutFeedback>
        </View>
        {!!error && <Text style={{ color: '#fff', marginLeft: 20, marginTop: 6 }}>⚠ {error}</Text>}
      </View>

      {/* Town List */}
      <FlatList
        data={filteredShops}
        keyExtractor={(item) => item.id}
        numColumns={2}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={{ padding: 24 }}>
            <Text style={{ textAlign: 'center' }}>
              {searchQuery ? 'No shops match your search.' : 'No shops found.'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handlePress(item.id)}>
            {item.imageUri ? (
              <Image source={{ uri: item.imageUri }} style={styles.image} resizeMode="cover" />
            ) : (
              <View style={[styles.image, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#eaeaea' }]}>
                <Ionicons name="image" size={28} color="#999" />
              </View>
            )}
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.location}>{item.location}</Text>
          </TouchableOpacity>
        )}
      />

      <View >
        <BottomNavigation navigation={navigation} />
      </View>
    </View>
  );
};

export default TownListScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  registerButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    marginTop:35,
    marginRight:10,
    backgroundColor: 'red',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  registerButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold'
   },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,              // Add left margin for spacing
    marginRight: 10,
    backgroundColor: '#fff',
    marginTop: 1,
    borderRadius: 6,
  },
  searchInput: { height: 40, flex: 1, paddingLeft: 10, fontSize: 16 },
  searchIcon: { marginRight: 8 },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '45%',
    maxWidth: '50%',
  },
  image: { width: '100%', height: 120, resizeMode: 'cover', marginBottom: 8, borderRadius: 6 },
  name: { fontSize: 16, fontWeight: '600' },
  location: { color: '#666' },
});
