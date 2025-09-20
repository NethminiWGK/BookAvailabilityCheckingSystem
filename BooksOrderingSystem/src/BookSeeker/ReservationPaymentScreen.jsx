
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
import { useStripe } from '@stripe/stripe-react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import Heading from '../common/Heading';


const ReservationPaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { book, quantity, reservationFee, pickupDeadline, userId } = route.params || {};
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);
  const [paymentSheetEnabled, setPaymentSheetEnabled] = useState(false);
  const [clientSecret, setClientSecret] = useState(null);

  // Fetch PaymentIntent client secret from backend
  const fetchPaymentSheetParams = async () => {
    try {
      const response = await fetch('http://10.185.32.65:3001/api/payments/create-reservation-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(reservationFee * 100), // Stripe expects cents
          currency: 'LKR',
          metadata: {
            bookId: book._id,
            quantity,
            userId,
          },
        }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch payment params');
      throw error;
    }
  };

  const initializePaymentSheet = async () => {
    try {
      setLoading(true);
      const { clientSecret } = await fetchPaymentSheetParams();
      setClientSecret(clientSecret);
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Bookshop App',
        paymentIntentClientSecret: clientSecret,
        style: 'automatic',
      });
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        setPaymentSheetEnabled(true);
      }
    } catch (error) {
      // Already handled
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async () => {
    if (!paymentSheetEnabled) return;
    setLoading(true);
    const { error } = await presentPaymentSheet();
    if (error) {
      Alert.alert('Payment Failed', error.message);
      setLoading(false);
      return;
    }
    // Payment successful, create reservation in backend
    try {
      const res = await fetch('http://10.185.32.65:3001/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          bookId: book._id,
          quantity,
          reservationFee,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        navigation.replace('ReservationSuccess', {
          book,
          quantity,
          pickupDeadline,
        });
      } else {
        Alert.alert('Reservation failed', data.error || 'Reservation failed');
        // Re-initialize payment sheet so user can retry
        await initializePaymentSheet();
      }
    } catch (e) {
      Alert.alert('Reservation failed', 'Could not create reservation.');
      // Re-initialize payment sheet so user can retry
      await initializePaymentSheet();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    initializePaymentSheet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Heading title="Complete Reservation" />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.orderSummary}>
            <Text style={styles.sectionTitle}>Reservation Summary</Text>
            <View style={styles.orderItem}>
              <Text style={styles.itemName}>{book?.title}</Text>
              <Text style={styles.itemDetails}>Qty: {quantity}</Text>
              <Text style={styles.itemTotal}>Rs. {(reservationFee).toFixed(2)}</Text>
            </View>
            <View style={styles.totalContainer}>
              <Text style={styles.totalLabel}>Reservation Fee:</Text>
              <Text style={styles.totalAmount}>Rs. {reservationFee.toFixed(2)}</Text>
            </View>
            <Text style={styles.label}>Pick up by: <Text style={{ color: '#007bff' }}>{pickupDeadline ? new Date(pickupDeadline).toLocaleString() : ''}</Text></Text>
          </View>

          <View style={styles.paymentSection}>
            <Text style={styles.sectionTitle}>Payment</Text>
            <Text style={styles.paymentInfo}>Secure payment powered by Stripe</Text>
            <TouchableOpacity
              style={[
                styles.payButton,
                (!paymentSheetEnabled || loading) && styles.payButtonDisabled,
              ]}
              onPress={handlePay}
              disabled={!paymentSheetEnabled || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.payButtonText}>Pay & Reserve</Text>
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
    </>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
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
  itemName: {
    flex: 2,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  itemDetails: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
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
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
});

export default ReservationPaymentScreen;
