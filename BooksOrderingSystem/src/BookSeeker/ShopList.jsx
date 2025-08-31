import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput, StyleSheet, TouchableWithoutFeedback, ActivityIndicator, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../common/BottomNavigation';
import Heading from "../common/Heading";
import { getUser } from '../common/AuthStore';

// 👉 set this to your machine’s LAN IP (same you used elsewhere)
const BASE_URL = 'http://10.201.182.65:3001';


const ShopListScreen = ({ route, navigation }) => {
  const [userId, setUserId] = useState(route?.params?.userId || '');
  const [checkingUser, setCheckingUser] = useState(!userId);
  useEffect(() => {
    console.log('ShopListScreen mounted, userId from params/state:', userId);
    if (!userId) {
      (async () => {
        const user = await getUser();
        if (user && user._id) {
          console.log('Fetched userId from getUser:', user._id);
          setUserId(user._id);
        }
        setCheckingUser(false);
      })();
    }
  }, [userId]);
  if ((!userId || typeof userId !== 'string' || userId.length !== 24) && !checkingUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', fontSize: 16 }}>Invalid or missing user ID. Please log in again.</Text>
      </View>
    );
  }
  if (checkingUser) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Checking user session…</Text>
      </View>
    );
  }
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

     // Only include owners with status 'Approved'
     const approvedOwners = (Array.isArray(data) ? data : []).filter(o => o.status === 'Approved');

     // Fetch books for each approved shop in parallel and map to UI structure
     const shopsWithBooks = await Promise.all(
       approvedOwners.map(async (o) => {
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
           location: [o.city, o.district].filter(Boolean).join(', '),
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

//filter by shop name,town or book name
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
  navigation.navigate('BookList', { ownerId,userId});
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
      {/* Main content area: search bar + FlatList, fills available space */}
      <View style={{ flex: 1 }}>
        <Heading title="Find Your Book" />
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
        {/* FlatList fills remaining space below search bar */}
        <View style={{ flex: 1 }}>
          <FlatList
            data={filteredShops}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{ alignItems: 'stretch' }}
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
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
          />
        </View>
      </View>

      {/* Bottom Navigation always at bottom, does not overlap FlatList */}
      <View style={{ height: 50 }}>
        <BottomNavigation navigation={navigation} userId={userId} />
      </View>
    </View>
  );
};

export default ShopListScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  header: {
    backgroundColor: '#007bff',
    paddingVertical: 20,
    justifyContent: 'center',
    position: 'relative',
  },
  headerText: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginLeft: 20 },

   searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,              // Add left margin for spacing
    marginRight: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#120a0aff',
    marginTop: 1,
    borderRadius: 6,
  },
  searchInput: { height: 40, flex: 1, paddingLeft: 10, fontSize: 16 },
  searchIcon: { marginRight: 8 },
  card: {
    width: '48%',
    margin: '1%',
    backgroundColor: '#f2f2f2',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
    maxHeight: 200,
  },
  image: {
    width: '100%',
    height: 120,
    minHeight: 120,
    maxHeight: 120,
    resizeMode: 'cover',
    marginBottom: 8,
    borderRadius: 6,
  },
  name: { fontSize: 16, fontWeight: '600' },
  location: { color: '#666' },
});
