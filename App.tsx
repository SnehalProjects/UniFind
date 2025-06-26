import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import Toast from 'react-native-toast-message';
import PostItemScreen from './screens/PostItemScreen';
import LostItemsScreen from './screens/LostItemScreen';
import FoundItemsScreen from './screens/FoundItemScreen';
import firestore from '@react-native-firebase/firestore';
import ItemDetailScreen from './screens/ItemDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="PostItem" component={PostItemScreen} />
        <Stack.Screen name="LostItems" component={LostItemsScreen} />
        <Stack.Screen name="FoundItems" component={FoundItemsScreen} />
        <Stack.Screen
          name="ItemDetail"
          component={ItemDetailScreen}
          options={{ title: 'Item Details' }}
        />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}
