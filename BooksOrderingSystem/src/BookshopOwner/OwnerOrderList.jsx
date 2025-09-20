import React, { useEffect, useState } from 'react';
import { View, Text, Image, FlatList, ActivityIndicator, SafeAreaView, StyleSheet } from 'react-native';
import Heading from '../common/Heading';
import OwnerNavBar from './OwnerNavBar';

const BASE_URL = 'http://10.185.32.65:3001';

export default function OwnerOrderList({ route, navigation }) {
  const { ownerId } = route.params;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${BASE_URL}/api/orders/owner/${ownerId}`);
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (e) {
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
    const unsubscribe = navigation.addListener('focus', fetchOrders);
    return unsubscribe;
  }, [navigation, ownerId]);

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007bff" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
      <Heading title="Shop Orders" />
      <View style={styles.container}>
        {orders.length === 0 ? (
          <Text style={styles.noOrders}>No orders found.</Text>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={item => item._id}
            renderItem={({ item }) => (
              <View style={styles.card}>
             
                <Text>Created At: {new Date(item.createdAt).toLocaleString()}</Text>
                <Text>Items:</Text>
                {item.items.filter(i => i.ownerId === ownerId).map(i => (
                  <View key={i.bookId} style={styles.itemRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      {i.coverImage ? (
                        <Image source={{ uri: i.coverImage.startsWith('http') ? i.coverImage : `${BASE_URL}/${i.coverImage.replace(/\\/g, '/')}` }} style={styles.bookImage} />
                      ) : (
                        <View style={[styles.bookImage, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}>
                          <Text>No Image</Text>
                        </View>
                      )}
                      <View style={{ marginLeft: 10 }}>
                        <Text style={styles.bookTitle}>{i.title}</Text>
                        <Text>Qty: {i.quantity}</Text>
                        <Text>Status: {item.status}</Text>
                      </View>
                    </View>
                  </View>
                ))}
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
  itemRow: {
    marginLeft: 8,
    marginTop: 8,
  },
  bookImage: {
    width: 90,
    height: 90,
    borderRadius: 6,
    marginRight: 4,
    resizeMode: 'cover',
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  noOrders: {
    textAlign: 'center',
    color: '#888',
    marginTop: 40,
    fontSize: 16,
  },
});