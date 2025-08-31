import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, DeviceEventEmitter } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getUser } from './AuthStore';

const BASE_URL = 'http://10.201.182.65:3001'; // Adjust if needed


// Pass userId as a prop from parent screens: <BottomNavigation navigation={navigation} userId={userId} />
const BottomNavigation = ({ navigation }) => {
  const [userId, setUserId] = useState('');
  const [cartCount, setCartCount] = useState(0);

  // Fetch userId on mount
  useEffect(() => {
    (async () => {
      const user = await getUser();
      if (user && user.id) setUserId(user.id);
    })();
  }, []);

  // Fetch cart count when userId changes or when navigation is focused
  useEffect(() => {
    if (!userId) return;
    const fetchCartCount = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/cart/${userId}`);
        const data = await res.json();
        const items = data.cart || data.items || [];
        const count = Array.isArray(items)
          ? items.reduce((sum, item) => sum + (item.quantity || 1), 0)
          : 0;
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };
    fetchCartCount();
    const unsubscribe = navigation.addListener && navigation.addListener('focus', fetchCartCount);
    // Listen for global cartUpdated event
    const cartListener = DeviceEventEmitter.addListener('cartUpdated', fetchCartCount);
    return () => {
      if (unsubscribe) unsubscribe();
      cartListener.remove();
    };
  }, [userId, navigation]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Reservations')}>
        <Ionicons name="book-outline" size={24} color="black" />
        <Text style={styles.label}>Reservations</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Orders')}>
        <Ionicons name="receipt-outline" size={24} color="black" />
        <Text style={styles.label}>Orders</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (!userId || typeof userId !== 'string' || userId.length !== 24) {
            alert('Invalid or missing user ID. Please log in again.');
            return;
          }
          navigation.navigate('Cart', { userId });
        }}
      >
        <View style={{ position: 'relative' }}>
          <Ionicons name="cart-outline" size={24} color="black" />
          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartCount}</Text>
            </View>
          )}
        </View>
        <Text style={styles.label}>Cart</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('AddBooks')}>
        <Ionicons name="person-outline" size={24} color="black" />
        <Text style={styles.label}>Account</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    marginBottom: 37,
  },
  button: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    backgroundColor: '#eb7a29ff',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default BottomNavigation;
