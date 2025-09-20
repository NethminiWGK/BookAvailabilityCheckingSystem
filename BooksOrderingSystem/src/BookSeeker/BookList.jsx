import React, { useCallback, useEffect, useState } from 'react';

import { View, Text, FlatList, Image, TextInput, ActivityIndicator, TouchableOpacity, TouchableWithoutFeedback, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigation from '../common/BottomNavigation';
import Heading from '../common/Heading';

const BASE_URL = 'http://10.185.32.65:3001';

export default function BookListScreen({ route, navigation }) {
  const { ownerId, userId } = route.params || {};
    console.log('BookListScreen params:', { ownerId, userId });
  if (!userId || typeof userId !== 'string' || userId.length !== 24) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red', fontSize: 16 }}>Invalid or missing user ID. Please log in again.</Text>
      </View>
    );
  }
  // ...existing code...
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');

  const filteredBooks = React.useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase();
    if (!q) return books;

    const norm = v => (v ?? '').toString().toLowerCase();
    return books.filter(b => {
      return (
        norm(b.title).includes(q) ||
        norm(b.isbn).includes(q) ||
        norm(b.author).includes(q) ||
        norm(b.category).includes(q)
      );
    });
  }, [books, searchQuery]);

  const fetchBooks = useCallback(async () => {
    try {
      setError('');
      const res = await fetch(`${BASE_URL}/api/owners/${ownerId}/books`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const mapped = (Array.isArray(data) ? data : []).map(b => {
        const p = typeof b.coverImage === 'string' ? b.coverImage.replace(/\\/g, '/') : '';
        const imageUri = p.startsWith('http') ? p : `${BASE_URL}/${p}`;
        const price = typeof b.price === 'number' ? b.price.toFixed(2) : '';
        return { ...b, imageUri, price, id: b._id }; // add id for your onPress usage
      });

      setBooks(mapped);
    } catch (e) {
      setError(e.message || 'Failed to load books');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ownerId]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBooks();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 8 }}>Loading books…</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>⚠ {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={{ flex: 1 }}>
        <Heading title="Find Your Book" />
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search books"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableWithoutFeedback onPress={() => {}}>
            <Ionicons name="search" size={24} color="black" style={styles.searchIcon} />
          </TouchableWithoutFeedback>
        </View>
        
        <FlatList
          data={filteredBooks}
          keyExtractor={item => item._id}
          numColumns={2}
          columnWrapperStyle={{ alignItems: 'stretch' }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={styles.empty}>No books found.</Text>}
          renderItem={({ item }) => (
            <View style={styles.card}>
              {item.imageUri
                ? <Image source={{ uri: item.imageUri }} style={styles.image} resizeMode="cover" />
                : <View style={[styles.image, styles.placeholder]} />}
              <Text style={styles.name}>{item.title}</Text>
              {!!item.price && <Text style={styles.price}>Rs. {item.price}</Text>}
              <Text style={styles.stock}>Stock Level: {item.stock}</Text>
              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate('AddQuantity', { bookId: item.id, userId, mode: 'purchase' })}
                >
                  <Text style={styles.buttonText}>Buy Now</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddQuantity', { bookId: item.id, userId, mode: 'reservation' })}>
                  <Text style={styles.buttonText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 50, marginTop: 12 }}
        />
      </View>
      <View style={{ height: 50 }}>
        <BottomNavigation navigation={navigation} userId={userId} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginRight: 10,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#120a0aff',
    marginTop: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  searchInput: { height: 40, flex: 1, paddingLeft: 10, fontSize: 16 },
  searchIcon: { marginRight: 8 },
  card: {
    width: '48%',
    margin: '1%',
    marginLeft: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'flex-start',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
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
  placeholder: { backgroundColor: '#eaeaea' },
  name: { fontSize: 16, fontWeight: '600' },
  price: { fontSize: 12, color: '#666' },
  stock: { fontSize: 12, color: '#999' },
  actions: {
    flexDirection: 'row',
    marginTop: 8,
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    backgroundColor: 'red',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginTop: 8,
    alignItems: 'center',
    width: '48%',
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  error: { color: 'red', textAlign: 'center', marginTop: 10 },
  empty: { textAlign: 'center', marginTop: 20, color: '#999' },
});
