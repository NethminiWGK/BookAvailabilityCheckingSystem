import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TextInput, ActivityIndicator, TouchableOpacity, TouchableWithoutFeedback, RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const BASE_URL = 'http://10.201.182.65:3001';

export default function BookListScreen({ route, navigation }) {
  const { ownerId, userId } = route.params; // Ensure userId is passed in route.params
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
      <View style={styles.header}>
        <Text style={styles.headerText}>Find Your Book</Text>
      </View>

      <View style={styles.searchContainer}>
        <TouchableWithoutFeedback onPress={() => { /* Handle Search Icon Press if needed */ }}>
          <Ionicons name="search" size={24} color="black" style={styles.searchIcon} />
        </TouchableWithoutFeedback>
        <TextInput
          style={styles.searchInput}
          placeholder="Search books"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredBooks}
        keyExtractor={item => item._id}
        numColumns={2}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={<Text style={styles.empty}>No books found.</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imageUri
              ? <Image source={{ uri: item.imageUri }} style={styles.image} resizeMode="cover" />
              : <View style={[styles.image, styles.placeholder]} />}
            <Text style={styles.title}>{item.title}</Text>
            {!!item.price && <Text style={styles.price}>Rs. {item.price}</Text>}
            <Text style={styles.stock}>Stock Level: {item.stock}</Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.button}
                onPress={() => navigation.navigate('AddQuantity', { bookId: item.id})} // Pass userId along
              >
                <Text style={styles.buttonText}>Buy Now</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.button}
              
              >
                <Text style={styles.buttonText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f2' },
  header: {
    backgroundColor: '#007bff', 
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20,
    backgroundColor: '#fff',
    marginTop: 10,
    width: '90%',
    borderRadius: 8,
    paddingHorizontal: 10,
  },
  searchInput: {
    height: 40,
    flex: 1,
    paddingLeft: 10,
    fontSize: 16,
    borderRadius: 5,
    backgroundColor: '#e6e6e6',
  },
  searchIcon: {
    marginRight: 8,
  },
  card: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: '45%',
    maxWidth: '50%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
    borderRadius: 6,
    marginBottom: 8,
  },
  placeholder: { backgroundColor: '#eaeaea' },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  price: {
    fontSize: 12,
    color: '#666',
  },
  stock: {
    fontSize: 12,
    color: '#999',
  },
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
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
  },
});
