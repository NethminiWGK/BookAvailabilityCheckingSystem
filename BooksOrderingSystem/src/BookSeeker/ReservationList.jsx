import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { getUser } from '../common/AuthStore';
import BottomNavigation from '../common/BottomNavigation';

const BASE_URL = 'http://10.201.182.65:3001';

const ReservationList = ({ navigation }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      const user = await getUser();
      if (!user?.id) {
        setReservations([]);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${BASE_URL}/api/reservations/user/${user.id}`);
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
  }, [navigation]);

  const renderReservation = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        {item.bookId?.coverImage ? (
          <Image source={{ uri: `${BASE_URL}/${item.bookId.coverImage}` }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}>\n            <Text>No Image</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.title}>{item.bookId?.title}</Text>
          <Text style={styles.detail}>Qty: {item.quantity}</Text>
          <Text style={styles.detail}>Fee: Rs. {item.reservationFee.toFixed(2)}</Text>
          <Text style={styles.detail}>Pickup by: {new Date(item.pickupDeadline).toLocaleDateString()}</Text>
          <Text style={[styles.status, { color: item.status === 'pending' ? '#e67e22' : item.status === 'picked_up' ? '#28a745' : '#e74c3c' }]}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007bff" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>My Reservations</Text>
      {reservations.length === 0 ? (
        <Text style={styles.noReservations}>No reservations found.</Text>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item._id}
          renderItem={renderReservation}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
        />
      )}
      <BottomNavigation navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
    textAlign: 'center',
  },
  noReservations: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  image: {
    width: 60,
    height: 80,
    borderRadius: 6,
    marginRight: 14,
    backgroundColor: '#eaeaea',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  detail: {
    fontSize: 14,
    color: '#555',
    marginBottom: 2,
  },
  status: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 6,
  },
});

export default ReservationList;
