import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Make sure this is installed

const BottomNavigation = ({ navigation }) => {
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
    marginBottom: 40,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    
  },
  button: {
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default BottomNavigation;
