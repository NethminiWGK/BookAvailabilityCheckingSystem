import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const ReservationPaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { book, quantity, reservationFee, pickupDeadline, userId } = route.params || {};
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    setLoading(true);
    try {
      // Simulate payment success (replace with real payment integration if needed)
      // After payment, create reservation in backend
      const res = await fetch('http://10.201.182.65:3001/api/reservations', {
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
        alert(data.error || 'Reservation failed');
      }
    } catch (e) {
      alert('Reservation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Reservation Payment</Text>
      <Text style={styles.label}>Book: <Text style={{ fontWeight: 'bold' }}>{book?.title}</Text></Text>
      <Text style={styles.label}>Quantity: {quantity}</Text>
      <Text style={styles.label}>Reservation Fee: <Text style={{ color: '#e67e22', fontWeight: 'bold' }}>Rs. {reservationFee.toFixed(2)}</Text></Text>
      <Text style={styles.label}>Pick up by: <Text style={{ color: '#007bff' }}>{pickupDeadline ? new Date(pickupDeadline).toLocaleString() : ''}</Text></Text>
      <TouchableOpacity style={styles.payButton} onPress={handlePay} disabled={loading}>
        <Text style={styles.payButtonText}>{loading ? 'Processing...' : 'Pay & Reserve'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  label: {
    fontSize: 16,
    color: '#555',
    marginBottom: 10,
  },
  payButton: {
    backgroundColor: '#28a745',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 8,
    marginTop: 30,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ReservationPaymentScreen;
