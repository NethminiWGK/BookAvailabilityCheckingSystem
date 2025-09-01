import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image, SafeAreaView } from 'react-native';
import { getUser } from '../common/AuthStore';
import BottomNavigation from '../common/BottomNavigation';
import { useRoute } from '@react-navigation/native';
import Heading from '../common/Heading';

const BASE_URL = 'http://10.201.182.65:3001';

const ReservationList = ({ navigation }) => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const route = useRoute();
  const userIdFromParams = route.params?.userId;

  useEffect(() => {
    const fetchReservations = async () => {
      setLoading(true);
      let userId = userIdFromParams;
      if (!userId) {
        const user = await getUser();
        userId = user?.id;
      }
      if (!userId) {
        setReservations([]);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${BASE_URL}/api/reservations/user/${userId}`);
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
  }, [navigation, userIdFromParams]);

  // Group reservations by reserved date (date only, not time)
  function groupReservationsByDate(reservations) {
    const groups = {};
    reservations.forEach(item => {
      if (!item.reservedAt) return;
      const dateKey = new Date(item.reservedAt).toLocaleDateString();
      if (!groups[dateKey]) groups[dateKey] = [];
      groups[dateKey].push(item);
    });
    return Object.entries(groups).map(([date, data]) => ({ date, data }));
  }

  const renderReservation = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.row}>
        {item.bookId?.coverImage ? (
          <Image source={{ uri: `${BASE_URL}/${item.bookId.coverImage}` }} style={styles.image} />
        ) : (
          <View style={[styles.image, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}>
            <Text>No Image</Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.title}>{item.bookId?.title}</Text>
          <Text style={styles.detail}>Qty: {item.quantity}</Text>
          <Text style={styles.detail}>Fee: Rs. {item.reservationFee.toFixed(2)}</Text>
          <Text style={styles.detail}>Pickup by: {new Date(item.pickupDeadline).toLocaleDateString()}</Text>
        
        </View>
      </View>
    </View>
  );

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007bff" />;
  }

  const groupedReservations = groupReservationsByDate(reservations);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <Heading title="My Reservations" />
      <View style={styles.container}>
        {reservations.length === 0 ? (
          <Text style={styles.noReservations}>No reservations found.</Text>
        ) : (
          <FlatList
            data={groupedReservations}
            keyExtractor={(item) => item.date}
            renderItem={({ item }) => (
              <View>
                <Text style={styles.orderDate}>Date: {item.date}</Text>
                {item.data.map(reservation => renderReservation({ item: reservation }))}
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <BottomNavigation navigation={navigation} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
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
  orderDate: {
    color: '#111',
    marginBottom: 8,
    fontSize: 15,
   
  },
});

export default ReservationList;
