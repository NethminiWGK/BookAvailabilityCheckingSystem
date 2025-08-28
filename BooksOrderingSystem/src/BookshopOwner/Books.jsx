// screens/BooksScreen.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Image,TextInput,  ActivityIndicator,TouchableOpacity, TouchableWithoutFeedback , RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native'; // Add this import

const BASE_URL = 'http://10.201.182.65:3001';


export default function BooksScreen({ route , navigation}) {
  const { ownerId } = route.params;           // <- only id
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [ownerStatus, setOwnerStatus] = useState(null); // <-- Add this

  // Fetch owner status
  useEffect(() => {
    const fetchOwner = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/owner/${ownerId}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
         console.log('Owner data:', data); // <-- Add this line
        setOwnerStatus(data.status); // assuming your API returns { ..., status: "Approved" }
      } catch (e) {
        setOwnerStatus(null);
      }
    };
    fetchOwner();
  }, [ownerId]);

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

const handleDelete = async (bookId) => {
  try {
    const res = await fetch(`${BASE_URL}/api/books/${bookId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    // remove from local list
    setBooks(prev => prev.filter(b => b.id !== bookId));
  } catch (e) {
    setError(e.message || 'Failed to delete book');
  }
};

const handleEdit = (book) => {
  navigation.navigate('EditBookDetails', { bookId: book.id });
};

const handleAddBooks = () => {
  if (ownerStatus === 'Approved') {
    navigation.navigate('AddBooks', { ownerId });
  } else if (ownerStatus === 'Not Approved') {
    Alert.alert('Registration Pending', 'Please wait for registration approval.');
  } else if (ownerStatus === 'Rejected') {
    Alert.alert('Registration Rejected', 'You cannot add books. Your registration was rejected.');
  } 
};

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
        return { ...b, imageUri, price, id: b._id }; // add id for your onPress usage };
      });

      setBooks(mapped);
    } catch (e) {
      setError(e.message || 'Failed to load books');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [ownerId]);

  useEffect(() => { fetchBooks(); }, [fetchBooks]);

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

  return (
      <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Find Your Book</Text>
        <TouchableOpacity
  style={styles.registerButton}
  onPress={handleAddBooks}
>
          <Text style={styles.registerButtonText}>Add Books</Text>
        </TouchableOpacity>
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

     {ownerStatus === 'Approved' && books.length === 0 ? (
  <Text style={{ color: 'green', textAlign: 'center', margin: 10, fontWeight: 'bold' }}>
    Now your shop is open, start to add books.
  </Text>
) : ownerStatus === 'Rejected' ? (
  <Text style={{ color: 'red', textAlign: 'center', margin: 10, fontWeight: 'bold' }}>
    Not registration approved, please try again.
  </Text>
) : ownerStatus === 'Not Approved' ? (
  <Text style={{ color: 'green', textAlign: 'center', margin: 10, fontWeight: 'bold' }}>
    registration approval process Pending.
  </Text>
) : null}


     
      {!!error && <Text style={styles.error}>⚠ {error}</Text>}

      <FlatList
        data={filteredBooks}
        keyExtractor={item => item._id}
         numColumns={2}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
       
        renderItem={({ item }) => (
          <View style={styles.card}>
            {item.imageUri
              ? <Image source={{ uri: item.imageUri }} style={styles.image} resizeMode="cover" />
              : <View style={[styles.image, styles.placeholder]} />}
           
              <Text style={styles.title}>{item.title}</Text>
             
              {!!item.price && <Text style={styles.price}>Rs. {item.price}</Text>}
                <Text style={styles.stock}>{item.stock}</Text>
          

            <View style={styles.actions}>
              <TouchableOpacity onPress={() => handleEdit(item)}>
                <Ionicons name="create" size={24} color="blue" style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)}>
                <Ionicons name="trash" size={24} color="red" style={styles.icon} />
              </TouchableOpacity>
            </View>
            </View>
              )}
      />
    </View>
        )
      }


const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#f2f2f2' },
  header: {
    backgroundColor: '#007bff', // Blue background
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row', // Align text and button horizontally
    justifyContent: 'space-between', // Ensure space between header text and button
    alignItems: 'center', // Vertically center content
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  registerButton: {
    backgroundColor: '#FF4500', // Button color for "Add Books"
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 5,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 20,
    backgroundColor: '#fff',
    marginTop: 10,
    width: '90%', // Take up most of the screen width
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
  },
  icon: {
    margin: 5,
  },
});
