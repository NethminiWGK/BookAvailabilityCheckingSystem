import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert, DeviceEventEmitter } from 'react-native';
import { getUser } from '../common/AuthStore'; // Import your AuthStore function
import BottomNavigation from '../common/BottomNavigation';

const BASE_URL = 'http://10.201.182.65:3001';

const AddQuantityScreen = ({ route, navigation }) => {
  const { userId, bookId, currentQuantity, mode } = route.params;
const [quantity, setQuantity] = useState(currentQuantity || 1);
  const [book, setBook] = useState(null);
  const [user, setUser] = useState(null); // Store logged-in user
  
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
  Alert.alert('Success', 'Item added to cart');
  // Emit event to update cart badge globally
  DeviceEventEmitter.emit('cartUpdated');
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
      <View style={styles.card}>
        <Image source={{ uri: `${BASE_URL}/${book.coverImage}` }} style={styles.image} />
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.price}>Rs. {book.price}</Text>

        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={() => handleQuantityChange('decrement')} style={styles.quantityBtnWrap}>
            <Text style={styles.quantityButton}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{quantity}</Text>
          <TouchableOpacity onPress={() => handleQuantityChange('increment')} style={styles.quantityBtnWrap}>
            <Text style={styles.quantityButton}>+</Text>
          </TouchableOpacity>
        </View>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {mode === 'reservation' ? (
          <TouchableOpacity
            style={styles.addToCartButton}
            onPress={() => {
              // Calculate reservation fee (50% of price * quantity)
              const reservationFee = (book.price * quantity * 0.5);
              // Set pickup deadline to 7 days from now
              const pickupDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
              navigation.navigate('ReservationPaymentScreen', {
                book,
                quantity,
                reservationFee,
                pickupDeadline,
                userId: user?.id || userId,
              });
            }}
          >
            <Text style={styles.addToCartButtonText}>Reserve Book</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
            <Text style={styles.addToCartButtonText}>Add to Cart</Text>
          </TouchableOpacity>
        )}
      </View>
      <BottomNavigation navigation={navigation} userId={userId} style={styles.bottomNav} />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    minHeight: 600,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    marginTop: -50, // Move card higher on the page
  },
  image: {
    width: '100%',
    height: 400,
    maxHeight: 480,
    borderRadius: 12,
    marginBottom: 24,
    resizeMode: 'cover',
    backgroundColor: '#eaeaea',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
    textAlign: 'center',
  },
  price: {
    fontSize: 20,
    color: '#007bff',
    fontWeight: '600',
    marginBottom: 18,
    textAlign: 'center',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#f7f7f7',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    shadowColor: '#007bff',
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  quantityBtnWrap: {
    backgroundColor: '#e6f0ff',
    borderRadius: 8,
    padding: 4,
    marginHorizontal: 8,
  },
  quantityButton: {
    fontSize: 32,
    color: '#007bff',
    fontWeight: 'bold',
    paddingHorizontal: 8,
  },
  quantityText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#222',
    marginHorizontal: 8,
    minWidth: 32,
    textAlign: 'center',
  },
  addToCartButton: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 10,
    shadowColor: '#007bff',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  },

  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 60,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    elevation: 8,
    zIndex: 10,
  },
});

export default AddQuantityScreen;
