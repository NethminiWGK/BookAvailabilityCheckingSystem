import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Image } from 'react-native';
import Heading from '../common/Heading';
import BottomNavigation from '../common/BottomNavigation';
import { getUser } from '../common/AuthStore';


const BASE_URL = 'http://10.201.182.65:3001';

const OrderDetails = ({ navigation }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      const user = await getUser();
      if (!user?.id) {
        setOrders([]);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${BASE_URL}/api/orders/user/${user.id}`);
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
  }, [navigation]);

  const renderOrder = ({ item }) => (
    <View>
      <Text style={styles.orderDate}>Date: {new Date(item.createdAt).toLocaleString()}</Text>
      {item.items && item.items.map((book) => (
        <View style={styles.bookCard} key={book.bookId}>
          <View style={styles.imageWrap}>
            {book.coverImage ? (
              <Image
                source={{ uri: `${BASE_URL}/${book.coverImage}` }}
                style={styles.bookImage}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.bookImage, { backgroundColor: '#eee', justifyContent: 'center', alignItems: 'center' }]}>
                <Text>No Image</Text>
              </View>
            )}
          </View>
          <View style={styles.bookInfo}>
            <View style={styles.bookRowAligned}>
              <Text style={styles.bookTitle}>{book.title}</Text>
              <Text style={styles.bookQty}>Qty: {book.quantity}</Text>
              <Text style={styles.bookPrice}>Rs. {book.price}</Text>
            </View>
          </View>
        </View>
      ))}
    </View>
  );

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#007bff" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <Heading title="Your Orders" />
      <View style={styles.container}>
        {orders.length === 0 ? (
          <Text style={styles.noOrders}>No orders found.</Text>
        ) : (
          <FlatList
            data={orders}
            keyExtractor={(item) => item._id}
            renderItem={renderOrder}
            contentContainerStyle={{ paddingBottom: 80 }}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
      <BottomNavigation navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
     padding: 17, // Remove padding to allow FlatList to use full height
  },

  Heading: {
    
    marginLeft: 4,
  },
  bookCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
    alignItems: 'center',
  },
  imageWrap: {
    marginRight: 14,
  },
  bookImage: {
    width: 60,
    height: 80,
    borderRadius: 6,
    backgroundColor: '#eaeaea',
  },
  bookInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  bookRowAligned: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  bookTitle: {
    flex: 2,
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookQty: {
    flex: 1,
    color: '#555',
    textAlign: 'center',
    fontSize: 15,
  },
  bookPrice: {
    flex: 1,
    color: '#28a745',
    textAlign: 'right',
    fontSize: 16,
    fontWeight: 'bold',
  },
  orderDate: {
    color: '#666',
    marginBottom: 8,
  },
  bookRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  bookTitle: {
    flex: 2,
    color: '#333',
  },
  bookQty: {
    flex: 1,
    color: '#555',
    textAlign: 'center',
  },
  bookPrice: {
    flex: 1,
    color: '#28a745',
    textAlign: 'right',
  },
  addressTitle: {
    marginTop: 10,
    fontWeight: 'bold',
    color: '#333',
  },
  addressText: {
    color: '#555',
    fontSize: 14,
  },
});

export default OrderDetails;
