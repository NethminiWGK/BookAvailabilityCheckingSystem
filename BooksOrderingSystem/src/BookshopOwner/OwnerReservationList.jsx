import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, SafeAreaView, StyleSheet, Image } from 'react-native';
import Heading from '../common/Heading';
import OwnerNavBar from './OwnerNavBar';

const BASE_URL = 'http://10.185.32.65:3001';

export default function OwnerReservationList({ route, navigation }) {
  const { ownerId } = route.params;
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/reservations/owner/${ownerId}`);
        const data = await res.json();
        setReservations(data.reservations || []);
      } catch (e) {
        setReservations([]);
      } finally {
        setLoading(false);
      }
    };
    fetchReservations();
    const unsubscribe = navigation.addListener('focus', fetchReservations);
    return unsubscribe;
  }, [navigation, ownerId]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007bff" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <Heading title="Shop Reservations" />
      <View style={styles.container}>
        {reservations.length === 0 ? (
          <Text style={styles.noReservations}>No reservations found.</Text>
        ) : (
          <FlatList
            data={reservations}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  {item.bookId?.coverImage ? (
                    <Image source={{ uri: item.bookId.coverImage.startsWith('http') ? item.bookId.coverImage : `${BASE_URL}/${item.bookId.coverImage.replace(/\\/g, '/')}` }} style={styles.bookImage} />
                  ) : (
                    <View style={[styles.bookImage, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}>
                      <Text>No Image</Text>
                    </View>
                  )}
                  <View style={{ marginLeft: 10 }}>
                    <Text style={styles.title}>{item.bookId?.title}</Text>
                    <Text>Qty: {item.quantity}</Text>
                    <Text>Fee: Rs. {item.reservationFee}</Text>
                    <Text>Status: {item.status}</Text>
                    <Text>Reserved At: {new Date(item.reservedAt).toLocaleString()}</Text>
                    <Text>Pickup Deadline: {new Date(item.pickupDeadline).toLocaleDateString()}</Text>
                  </View>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <OwnerNavBar navigation={navigation} ownerId={ownerId} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  noReservations: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16,
  },
  bookImage: {
    width: 90,
    height: 110,
    borderRadius: 6,
    marginRight: 4,
    resizeMode: 'cover',
  },
});