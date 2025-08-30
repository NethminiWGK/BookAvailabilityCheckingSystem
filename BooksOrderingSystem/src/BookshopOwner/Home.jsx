import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, TextInput, StyleSheet, TouchableWithoutFeedback, ActivityIndicator, RefreshControl } from 'react-native';
import { getUser } from '../common/AuthStore'; // adjust path as needed
import BottomNavigation from '../common/BottomNavigation';
import Heading from "../common/Heading"; // <-- path to Heading.js

// 👉 set this to your machine’s LAN IP (same you used elsewhere)
const BASE_URL = 'http://10.201.182.65:3001';

const TownListScreen = ({ navigation }) => {
    const [userId, setUserId] = useState('');

     useEffect(() => {
    (async () => {
      const user = await getUser();
      if (user && user._id) setUserId(user._id);
    })();
  }, []);

  return (
    <View style={styles.container}>
      {/* Header with Search Bar */}
      <View>
        <Heading title="Find Your Book" />
        <Text style={styles.welcomeText}>Welcome to Book shop</Text>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate('Register', { userId })}
        >
          <Text style={styles.registerButtonText}>Register</Text>
        </TouchableOpacity>
      </View>
      <BottomNavigation navigation={navigation} />
    </View>
  );
}

export default TownListScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  registerButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    marginTop:35,
    marginRight:10,
    backgroundColor: 'red',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  registerButtonText: { 
    color: '#fff', 
    fontSize: 16, 
    fontWeight: 'bold'
   },
  
   welcomeText: {
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,              // Add left margin for spacing
    marginRight: 10,
    backgroundColor: '#fff',
    marginTop: 1,
    borderRadius: 6,
  },
});
