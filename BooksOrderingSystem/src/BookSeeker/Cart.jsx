import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Button, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const BASE_URL = 'http://10.201.182.65:3001'; 

const CartPage = ({ route, navigation }) => {
  const { userId } = route.params; 
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch cart data from the API
  useEffect(() => {
    const fetchCart = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/cart/${userId}`);
        const data = await res.json();
        setCartItems(data.cart || []); 
      } catch (error) {
        console.error('Error fetching cart:', error);
        Alert.alert('Error', 'Could not fetch cart data.');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [userId]);

  // Calculate the total amount from all cart items
  const calculateTotal = () => {
    let total = 0;
    cartItems.forEach(item => {
      total += item.price * item.quantity;
    });
    return total;
  };

  // Handle the checkout process
  const handleCheckout = () => {
    const totalAmount = calculateTotal();
    
    if (totalAmount > 0) {
      console.log('Proceeding to checkout with total amount:', totalAmount);
      // Navigate to the PaymentScreen and pass the total amount and currency as params
      navigation.navigate('PaymentScreen', { 
        amount: totalAmount * 100, // Pass amount in cents to match Stripe API
        currency: 'LKR',
        orderItems: cartItems
      });
    } else {
      Alert.alert('Empty Cart', 'Your cart is empty. Please add items before checking out.');
    }
  };

  // Render a single cart item
  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Text style={styles.cartTitle}>{item.title}</Text>
      <Text style={styles.cartDetails}>Quantity: {item.quantity}</Text>
      <Text style={styles.cartDetails}>Price: Rs. {item.price}</Text>
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
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
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
  cartItem: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
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
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#eee',
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
});

export default CartPage;
