import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';


import Heading from '../common/Heading';
import { getUser } from '../common/AuthStore';


const BASE_URL = 'http://10.185.32.65:3001'; 

const CartPage = ({ route, navigation }) => {
  const { userId } = route.params; 
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  // Address logic removed

  // Fetch cart data from the API
  const fetchCart = useCallback(async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/cart/${userId}`);
      const data = await res.json();
      setCartItems(data.cart || []);
  // Address logic removed
    } catch (error) {
      console.error('Error fetching cart:', error);
      Alert.alert('Error', 'Could not fetch cart data.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchCart();
    const unsubscribe = navigation.addListener('focus', () => {
      fetchCart();
    });
    return unsubscribe;
  }, [navigation, fetchCart]);

  // Calculate the total amount from all cart items
  const calculateTotal = () => {
    let total = 0;
    cartItems.forEach(item => {
      total += item.price * item.quantity;
    });
    return total;
  };
  if (!userId || typeof userId !== 'string' || userId.length !== 24) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'red', fontSize: 16 }}>Invalid or missing user ID. Please log in again.</Text>
    </View>
  );
}

  // Helper to fetch ownerId for a bookId
  const fetchOwnerIdForBook = async (bookId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/books/${bookId}`);
      const data = await res.json();
      return data.ownerId || null;
    } catch (e) {
      return null;
    }
  };

  // Handle the checkout process
  const handleCheckout = async () => {
    const totalAmount = calculateTotal();
    if (totalAmount <= 0) {
      Alert.alert('Empty Cart', 'Your cart is empty. Please add items before checking out.');
      return;
    }
    // Get userId from storage
    const user = await getUser();
    const userId = user?.id;
    // For each cart item, fetch ownerId and build orderItems array
    const orderItemsWithOwner = await Promise.all(
      cartItems.map(async (item) => {
        let ownerId = item.ownerId;
        if (!ownerId && item.bookId) {
          ownerId = await fetchOwnerIdForBook(item.bookId);
        }
        return {
          ...item,
          ownerId,
        };
      })
    );
    navigation.navigate('PaymentScreen', {
      amount: totalAmount,
      currency: 'LKR',
      orderItems: orderItemsWithOwner,
      userId,
    });
  };

  // Delete item handler
  const handleDelete = async (bookId) => {
    try {
      const res = await fetch(`${BASE_URL}/api/cart/remove`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, bookId })
      });
      const data = await res.json();
      if (res.ok) {
        setCartItems(data.cart || []);
      } else {
        Alert.alert('Error', data.error || 'Could not remove item.');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not remove item.');
    }
  };

  // Render a single cart item with image left, details right, and delete icon inside the card
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItemRow}>
      <TouchableOpacity
        style={styles.cartItemTouchable}
        activeOpacity={0.8}
        onPress={() => {
          navigation.navigate('AddQuantity', {
            userId,
            bookId: item.bookId,
            currentQuantity: item.quantity,
          });
        }}
      >
        <View style={styles.cartItem}>
          <Image
            source={{ uri: `${BASE_URL}/${item.coverImage}` }}
            style={styles.cartImage}
            resizeMode="cover"
          />
          <View style={styles.cartDetailsWrap}>
            <Text style={styles.cartTitle}>{item.title}</Text>
            <Text style={styles.cartDetails}>Quantity: {item.quantity}</Text>
            <Text style={styles.cartDetails}>Price: Rs. {item.price}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(item.bookId)} style={styles.deleteIconWrap}>
            <Ionicons name="trash-outline" size={24} color="#888" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <Text>Loading your cart...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f2f2f2' }}>
      <Heading title="Your Cart" />
      {/* Address Box removed */}
      {cartItems.length === 0 ? (
        <Text style={styles.emptyCartText}>Your cart is empty!</Text>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.bookId.toString()}
            contentContainerStyle={styles.flatListContent}
          />
          <View style={styles.checkoutContainer}>
            <Text style={styles.totalText}>Total: Rs. {calculateTotal().toFixed(2)}</Text>
            <Button 
              title="Proceed to Checkout" 
              onPress={handleCheckout} 
            />
          </View>
        </>
      )}
    </View>
  );
 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    // backgroundColor intentionally omitted to allow parent View to control it
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 50,
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    marginLeft: 10,
    marginRight: 10,
  },
  cartItemTouchable: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingLeft: 40,
    paddingRight: 40,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    position: 'relative',
  },
  deleteIconWrap: {
    padding: 4,
    marginLeft: 8,
    alignSelf: 'center',
  },
  cartImage: {
    width: 70,
    height: 90,
    borderRadius: 6,
    marginRight: 16,
    backgroundColor: '#eaeaea',
  },
  cartDetailsWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  cartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartDetails: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  flatListContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  checkoutContainer: {
    marginTop: 20,
    marginBottom: 70,
    paddingTop: 15,
    
    borderBottomWidth: 1,
    borderTopColor: '#ccc',
    borderBottomColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // addressBox and addressText styles removed
});

export default CartPage;
