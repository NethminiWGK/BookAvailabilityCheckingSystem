import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const ReservationSuccess = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { book, quantity, pickupDeadline } = route.params || {};

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Text style={styles.checkmark}>✓</Text>
      </View>
      <Text style={styles.title}>Reservation Successful!</Text>
      <Text style={styles.subtitle}>
        You have reserved <Text style={{ fontWeight: 'bold' }}>{book?.title}</Text> (Qty: {quantity}).
      </Text>
      <Text style={styles.info}>Please pick up your book by:</Text>
      <Text style={styles.deadline}>{pickupDeadline ? new Date(pickupDeadline).toLocaleString() : ''}</Text>
      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('ReservationList')}>
        <Text style={styles.buttonText}>View My Reservations</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('BookList')}>
        <Text style={styles.secondaryButtonText}>Continue Browsing</Text>
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
  iconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#28a745',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  checkmark: {
    fontSize: 48,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 18,
    textAlign: 'center',
  },
  info: {
    fontSize: 15,
    color: '#333',
    marginBottom: 4,
    textAlign: 'center',
  },
  deadline: {
    fontSize: 16,
    color: '#e67e22',
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007bff',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
  },
  secondaryButtonText: {
    color: '#007bff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ReservationSuccess;
