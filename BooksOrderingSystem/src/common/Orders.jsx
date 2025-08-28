import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView } from 'react-native';

const OrderDetails = () => {
  // ✅ Dummy data
  const orders = [
    {
      title: 'Head KID',
      quantity: 2,
      orderNo: 1,
      status: 'Completed',
      image: require('../../assets/background.jpg'), // replace with your local image
    },
    {
      title: 'Those Eyes',
      quantity: 1,
      orderNo: 2,
      status: 'Not Completed',
      image: require('../../assets/background.jpg'), // replace with your local image
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Order Details</Text>
      {orders.map((order, index) => (
        <View key={index} style={styles.card}>
          <Image source={order.image} style={styles.image} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>{order.title}</Text>
            <Text>Quantity: {order.quantity}</Text>
            <Text>Order No: {order.orderNo}</Text>
            <Text
              style={[
                styles.status,
                {
                  backgroundColor: order.status === 'Completed' ? 'green' : 'red',
                },
              ]}
            >
              {order.status}
            </Text>
          </View>
        </View>
      ))}
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
    height: 100,
    marginRight: 20,
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
    color: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 5,
    fontSize: 12,
  },
});

export default OrderDetails;
