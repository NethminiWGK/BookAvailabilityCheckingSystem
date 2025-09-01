import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StripeProvider } from '@stripe/stripe-react-native';

// Import all your components
import Start from './src/common/StartPage';
import Login from './src/common/Login';
import Signup from './src/common/Signup';
import BottomNavigation from './src/common/BottomNavigation';
import Heading from './src/common/Heading';
import Orders from './src/common/Orders';
import ReservationList from './src/BookSeeker/ReservationList';
import ReservationPaymentScreen from './src/BookSeeker/ReservationPaymentScreen';
import ReservationSuccess from './src/BookSeeker/ReservationSuccess';
import Home from './src/BookshopOwner/Home';
import Books from './src/BookshopOwner/Books';
import Register from './src/BookshopOwner/Register';
import AddBooks from './src/BookshopOwner/AddBooks';
import EditBookDetails from './src/BookshopOwner/EditBookDetails';
import ShopList from './src/BookSeeker/ShopList';
import BookList from './src/BookSeeker/BookList';
import AddQuantity from './src/BookSeeker/AddQuantity';
import Cart from './src/BookSeeker/Cart';
import ShopTable from './src/Admin/RegisteredShops';
import ViewShopDetails from './src/Admin/ViewShopDetails';
import PaymentScreen from './src/common/PaymentScreen';
import PaymentSuccess from './src/common/PaymentSuccess';
import AddAddress from './src/BookSeeker/AddAddress';
import OrderDetails from './src/BookSeeker/OrderDetails';

const Stack = createStackNavigator();

// Replace with your actual Stripe publishable key
const STRIPE_PUBLISHABLE_KEY = 'pk_test_51S0dvWIjmc9m2AmJ4eclMCvJ8kgw561J28WpF8op8rtSshPKLDw7VhkQeIkmAb3RonGHxzWaUKL90VJOXI6QRhoX00q5XcbK8T'; 

function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Welcome">
        {/* Your stack screens */}
        <Stack.Screen name="Welcome" component={Start} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={Login} options={{ headerShown: false }} />
        <Stack.Screen name="Signup" component={Signup} options={{ headerShown: false }} />
        <Stack.Screen name="BottomNavigation" component={BottomNavigation} options={{ headerShown: false }} />
        <Stack.Screen name="Heading" component={Heading} options={{ headerShown: false }} />
        <Stack.Screen name="Orders" component={Orders} options={{ headerShown: false }} />
  {/* Reservation Screens */}
  <Stack.Screen name="ReservationList" component={ReservationList} options={{ headerShown: false }} />
  <Stack.Screen name="ReservationPaymentScreen" component={ReservationPaymentScreen} options={{ headerShown: false }} />
  <Stack.Screen name="ReservationSuccess" component={ReservationSuccess} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={Home} options={{ headerShown: false }} />
        <Stack.Screen name="Books" component={Books} options={{ headerShown: false }} />
        <Stack.Screen name="Register" component={Register} options={{ headerShown: false }} />
        <Stack.Screen name="AddBooks" component={AddBooks} options={{ headerShown: false }} />
        <Stack.Screen name="EditBookDetails" component={EditBookDetails} options={{ headerShown: false }} />
        <Stack.Screen name="ShopList" component={ShopList} options={{ headerShown: false }} />
        <Stack.Screen name="BookList" component={BookList} options={{ headerShown: false }} />
        <Stack.Screen name="AddQuantity" component={AddQuantity} options={{ headerShown: false }} />
        <Stack.Screen name="Cart" component={Cart} options={{ headerShown: false }} />
        <Stack.Screen name="AddAddress" component={AddAddress} options={{ headerShown: false }} />
        {/* Payment Screens */}
        <Stack.Screen name="PaymentScreen" component={PaymentScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PaymentSuccess" component={PaymentSuccess} options={{ headerShown: false }} />

        <Stack.Screen name="ShopTable" component={ShopTable} options={{ headerShown: false }} />
        <Stack.Screen name="ViewShopDetails" component={ViewShopDetails} options={{ headerShown: false }} />
        <Stack.Screen name="OrderDetails" component={OrderDetails} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
    >
      <AppNavigator />
    </StripeProvider>
  );
}