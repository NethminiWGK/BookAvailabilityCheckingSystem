import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStripe } from '@stripe/stripe-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Heading from '../common/Heading';
import { getUser } from './AuthStore';

const BASE_URL = 'http://10.185.32.65:3001';

const PaymentScreen = () => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [paymentSheetEnabled, setPaymentSheetEnabled] = useState(false);
  const navigation = useNavigation();
  const route = useRoute();
  const { amount = 0, currency = 'LKR', orderItems = [], userId } = route.params || {};
  const [address, setAddress] = useState(null);

  // Fetch address from backend on mount and after address update
  const fetchAddress = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/auth/user/${userId}/address`);
      const data = await res.json();
      setAddress(data.address || null);
    } catch (e) {
      setAddress(null);
    }
  };

  useEffect(() => {
    fetchAddress();
  }, [userId]);

  const fetchPaymentSheetParams = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/payments/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: Math.round(amount * 100), // Stripe expects cents
          currency: currency,
          metadata: {
            orderItems: JSON.stringify(orderItems),
          },
        }),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching payment sheet params:', error);
      throw error;
    }
  };

  const initializePaymentSheet = async () => {
    try {
      setLoading(true);
      const { clientSecret, customerId } = await fetchPaymentSheetParams();

      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Bookshop App',
        paymentIntentClientSecret: clientSecret,
        customerId: customerId,
        style: 'automatic',
        googlePay: {
          merchantCountryCode: 'US',
          testEnv: true, // Set to false for production
          currencyCode: 'usd',
        },
        applePay: {
          merchantCountryCode: 'US',
        },
        returnURL: 'your-app://payment-return',
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setPaymentSheetEnabled(true);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initialize payment');
      console.error('Payment initialization error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openPaymentSheet = async () => {
    if (!paymentSheetEnabled) return;

    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert('Payment Failed', error.message);
    } else {
      // Payment successful - create order in backend
      try {
        // Send all items (with their ownerId) in a single order
        await fetch(`${BASE_URL}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            items: orderItems,
            address,
          }),
        });
      } catch (e) {
        // Optionally handle order creation error
      }
      navigation.navigate('PaymentSuccess', {
        orderTotal: amount, // Pass the total amount
        orderItems,
      });
    }
  };

  useEffect(() => {
    initializePaymentSheet();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Heading title="Complete Order " />
        {/* Address Box */}
        <TouchableOpacity
          style={styles.addressBox}
          activeOpacity={0.7}
          onPress={() => {
            navigation.navigate('AddAddress', {
              userId,
              address: address || null,
              onSave: async (newAddress) => {
                // Save address to backend
                try {
                  await fetch(`${BASE_URL}/api/user/${userId}/address`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ address: newAddress })
                  });
                  fetchAddress();
                } catch (e) {}
              }
            });
          }}
        >
          <Ionicons name={address ? 'create-outline' : 'add-circle-outline'} size={22} color="#090909ff" style={{ marginRight: 8 }} />
          {address ? (
            <View style={{ flex: 1 }}>
              <Text style={[styles.addressText, { fontWeight: 'bold' }]}>{address.name}</Text>
              <Text style={styles.addressText}>
                {address.street}, {address.city}, {address.district}, {address.province}
              </Text>
            </View>
          ) : (
            <Text style={styles.addressText}>Add Address</Text>
          )}
        </TouchableOpacity>
        <View style={styles.orderSummary}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {orderItems.map((item, index) => (
            <View key={index} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.title || item.name}</Text>
              <Text style={styles.itemDetails}>
                Qty: {item.quantity} × Rs. {item.price}
              </Text>
              <Text style={styles.itemTotal}>
                Rs. {(item.quantity * item.price).toFixed(2)}
              </Text>
            </View>
          ))}
          
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total Amount:</Text>
            <Text style={styles.totalAmount}>Rs. {amount.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment</Text>
          <Text style={styles.paymentInfo}>
            Secure payment powered by Stripe
          </Text>

          <TouchableOpacity
            style={[
              styles.payButton,
              (!paymentSheetEnabled || loading) && styles.payButtonDisabled,
            ]}
            onPress={openPaymentSheet}
            disabled={!paymentSheetEnabled || loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.payButtonText}>
                Pay Rs. {amount.toFixed(2)}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PaymentScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  orderSummary: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  totalContainer: {
    paddingTop: 15,
    borderTopWidth: 2,
    borderTopColor: '#ddd',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#28a745',
  },
  addressBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0b0000ff',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginHorizontal: 18,
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1
  },
  addressText: {
    fontSize: 16,
    color: '#2c2b2bff',
    fontWeight: 'normal'
  },
  paymentSection: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  paymentInfo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  payButton: {
    backgroundColor: '#007bff',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});
