// screens/BooksScreen.jsx
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList, Image,TextInput,  ActivityIndicator,TouchableOpacity, TouchableWithoutFeedback , RefreshControl, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Alert } from 'react-native'; // Add this import
import OwnerNavBar from './OwnerNavBar';
import Heading from "../common/Heading";

const BASE_URL = 'http://10.185.32.65:3001';


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


// Callback to add a new book to the list
const handleBookAdded = (newBook) => {
  setBooks(prev => [...prev, {
    ...newBook,
    imageUri: newBook.coverImage?.startsWith('http') ? newBook.coverImage : `${BASE_URL}/${(newBook.coverImage || '').replace(/\\/g, '/')}`,
    price: typeof newBook.price === 'number' ? newBook.price.toFixed(2) : '',
    id: newBook._id
  }]);
};

// Callback to update a book in the list
const handleBookEdited = (updatedBook) => {
  setBooks(prev => prev.map(b => b.id === updatedBook._id ? {
    ...updatedBook,
    imageUri: updatedBook.coverImage?.startsWith('http') ? updatedBook.coverImage : `${BASE_URL}/${(updatedBook.coverImage || '').replace(/\\/g, '/')}`,
    price: typeof updatedBook.price === 'number' ? updatedBook.price.toFixed(2) : '',
    id: updatedBook._id
  } : b));
};

const handleEdit = (book) => {
  navigation.navigate('EditBookDetails', {
    bookId: book.id,
    onBookChanged: handleBookEdited
  });
};

const handleAddBooks = () => {
  if (ownerStatus === 'Approved') {
    navigation.navigate('AddBooks', {
      ownerId,
      onBookChanged: handleBookAdded
    });
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
      <View>
        <Heading title="Find Your Book" />
       
        <TouchableOpacity
          style={styles.registerButton}
          onPress={handleAddBooks}
        >
          <Text style={styles.registerButtonText}>Add Books</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Search books"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
         <TouchableWithoutFeedback onPress={() => { /* Handle Search Icon Press if needed */ }}>
          <Ionicons name="search" size={24} color="black" style={styles.searchIcon} />
        </TouchableWithoutFeedback>
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
        columnWrapperStyle={{ alignItems: 'stretch' }}
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
              <TouchableOpacity onPress={() => handleEdit(item)} style={styles.actionButton}>
                <Ionicons name="create" size={24} color="blue" style={styles.icon} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.actionButton}>
                <Ionicons name="trash" size={24} color="red" style={styles.icon} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50, marginTop: 12 }}
      />
      <OwnerNavBar navigation={navigation} ownerId={ownerId} />
    </View>
        )
      }


const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#f2f2f2' },
  registerButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    marginTop: 35,
    marginRight: 10,
    backgroundColor: 'red',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    zIndex: 10,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    color: '#333',
  },
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
  searchInput: {
    height: 40,
    flex: 1,
    paddingLeft: 10,
    fontSize: 16,
   
  },
  searchIcon: {
    marginRight: 8,
  },
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
  actionButton: {
    width: '48%',
    alignItems: 'center',
  },
  empty: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
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
