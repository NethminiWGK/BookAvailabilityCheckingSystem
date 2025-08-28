import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ReservationDetails = () => {
  const [reservations, setReservations] = useState([
    {
      title: 'Head KID',
      quantity: 2,
      resNo: 1,
      expDate: '2025-12-10',
      status: 'Not Completed',
      image: require('../../assets/background.jpg'),
    },
    {
      title: 'Those Eyes',
      quantity: 10,
      resNo: 2,
      expDate: '2023-09-05',
      status: 'Completed',
      image: require('../../assets/background.jpg'),
    },
    {
      title: 'Head KID',
      quantity: 3,
      resNo: 3,
      expDate: '2025-10-01',
      status: 'Not Completed',
      image: require('../../assets/background.jpg'),
    },
  ]);

  const isOutdated = (expDateStr) => {
    const today = new Date();
    const exp = new Date(expDateStr);
    return exp < today;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'green';
      case 'Not Completed':
        return 'red';
      case 'Outdated':
        return 'gold';
      default:
        return 'gray';
    }
  };

  const handleTickClick = (index) => {
    const updatedReservations = reservations.map((reservation, i) =>
      i === index
        ? { ...reservation, status: 'Completed' }
        : reservation
    );
    setReservations(updatedReservations);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Reservation Details</Text>
      {reservations.map((res, index) => {
        const isExpired = isOutdated(res.expDate);
        const effectiveStatus = isExpired ? 'Outdated' : res.status;
        const bgColor = getStatusColor(effectiveStatus);

        return (
          <View key={index} style={styles.card}>
            <Image source={res.image} style={styles.image} />
            <View style={styles.textContainer}>
              <Text style={styles.title}>{res.title}</Text>
              <Text>Quantity: {res.quantity}</Text>
              <Text>Res. No: {res.resNo}</Text>
              <Text>Exp Date: {res.expDate}</Text>

              {/* Container for status and tick mark */}
              <View style={styles.statusContainer}>
                {/* Displaying status as text */}
                <Text style={[styles.status, { backgroundColor: bgColor }]}>
                  {effectiveStatus}
                </Text>

                {/* Tick mark to change status */}
                <TouchableOpacity
                  style={styles.tickContainer}
                  onPress={() => handleTickClick(index)}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={effectiveStatus === 'Completed' ? 'blue' : 'gray'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f4f4f4',
  },
  header: {
    backgroundColor: '#0052cc',
    color: 'white',
    padding: 20,
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
  },
  card: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 10,
  },
  image: {
    width: 120,
    height: 150,
    marginRight: 10,
    borderRadius: 4,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'space-around',
  },
  title: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  status: {
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    fontSize: 13,
    marginTop: 5,
    color: 'white',
    flex: 1, // Make status text take all available space
    textAlign: 'center', // Center-align the status text
  },
  statusContainer: {
    flexDirection: 'row', // Aligning status and tick mark side by side
    alignItems: 'center', // Vertically center the items
    marginTop: 10,
    width: '100%', // Ensure it takes full width
  },
  tickContainer: {
    marginLeft: 10, // Add some spacing between status and tick mark
  },
});

export default ReservationDetails;
