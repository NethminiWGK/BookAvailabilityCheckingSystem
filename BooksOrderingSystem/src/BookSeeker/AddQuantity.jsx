import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { getUser } from '../common/AuthStore'; // Import your AuthStore function

const BASE_URL = 'http://10.201.182.65:3001';

const AddQuantityScreen = ({ route, navigation }) => {
  const { bookId } = route.params;  // No need to pass userId anymore
  const [book, setBook] = useState(null);
  const [user, setUser] = useState(null); // Store logged-in user
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookAndUser = async () => {
      try {
        // Fetch logged-in user
        const loggedInUser = await getUser();
        console.log("user ->", loggedInUser)
        if (!loggedInUser) throw new Error('User not found');
        setUser(loggedInUser);

        // Fetch book details
        const res = await fetch(`${BASE_URL}/api/books/${bookId}`);
        if (!res.ok) throw new Error('Failed to fetch book details');
        const data = await res.json();
        setBook(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      }
    };

    fetchBookAndUser();
    console.log("userrrrr")
  }, [bookId]);

  const handleQuantityChange = (action) => {
    if (action === 'increment') setQuantity(prev => prev + 1);
    else if (action === 'decrement' && quantity > 1) setQuantity(prev => prev - 1);
  };

  const handleAddToCart = async () => {
    if (!user || !book) {
      setError('User or book not found');
      return;
    }

    console.log("fetch user .",user.id)

    const cartData = {
      userId: user.id, // Use logged-in user ID
      bookId,
       quantity, 
     
    };

    console.log("card data",cartData)

    try {
      const res = await fetch(`${BASE_URL}/api/cart`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cartData),
      });

      if (!res.ok) {
        try {
          const errorData = await res.json();
          setError(errorData.error || 'Failed to add to cart');
        } catch {
          const errorText = await res.text();
          setError(errorText || 'An error occurred');
        }
      } else {
        console.log(`Added ${quantity} of ${book.title} to cart.`);
        setError('');
        navigation.navigate('Cart',{ userId: user.id }); // You can remove userId since Cart can also fetch from AsyncStorage
      }
    } catch (err) {
      console.error(err);
      setError('Failed to add item to cart');
    }
  };

  if (!book) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{book.title}</Text>
      <Image source={{ uri: `${BASE_URL}/${book.coverImage}` }} style={styles.image} />
      <Text style={styles.price}>Rs. {book.price}</Text>

      <View style={styles.quantityContainer}>
        <TouchableOpacity onPress={() => handleQuantityChange('decrement')}>
          <Text style={styles.quantityButton}>-</Text>
        </TouchableOpacity>
        <Text style={styles.quantityText}>{quantity}</Text>
        <TouchableOpacity onPress={() => handleQuantityChange('increment')}>
          <Text style={styles.quantityButton}>+</Text>
        </TouchableOpacity>
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
        <Text style={styles.addToCartButtonText}>Add to Cart</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', alignItems: 'center' },
  image: { width: '100%', height: 200, resizeMode: 'cover', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  price: { fontSize: 18, color: '#666' },
  quantityContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  quantityButton: { fontSize: 30, color: '#007bff', marginHorizontal: 20 },
  quantityText: { fontSize: 20, fontWeight: 'bold' },
  addToCartButton: { backgroundColor: '#007bff', paddingVertical: 12, paddingHorizontal: 30, borderRadius: 6 },
  addToCartButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  errorText: { color: 'red', fontSize: 16, marginTop: 10 },
  center: { justifyContent: 'center', alignItems: 'center', flex: 1 },
});

export default AddQuantityScreen;
