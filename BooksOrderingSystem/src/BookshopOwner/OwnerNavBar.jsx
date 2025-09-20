import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function OwnerNavBar({ navigation, ownerId }) {
  return (
    <View style={styles.container}>

       <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Books', { ownerId })}
      >
        <Ionicons name="home-outline" size={24} color="black" />
        <Text style={styles.label}>Home</Text>
      </TouchableOpacity>
      
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('OwnerReservationList', { ownerId })}
      >
        <Ionicons name="book-outline" size={24} color="black" />
        <Text style={styles.label}>Reservations</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('OwnerOrderList', { ownerId })}
      >
        <Ionicons name="receipt-outline" size={24} color="black" />
        <Text style={styles.label}>Orders</Text>
      </TouchableOpacity>

     

      
    </View>
  );
}

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
});
