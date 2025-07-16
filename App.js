import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Linking } from 'react-native';
import HomeScreen from './screens/HomeScreen';
import Toast from 'react-native-toast-message';
import PostItemScreen from './screens/PostItemScreen';
import LostItemsScreen from './screens/LostItemScreen';
import FoundItemsScreen from './screens/FoundItemScreen';
import firestore from '@react-native-firebase/firestore';
import ItemDetailScreen from './screens/ItemDetailScreen';
import LoginScreen from './screens/LoginScreen';
import SignUpScreen from './screens/SignUpScreen';
import ProfileScreen from './screens/ProfileScreen';
import DrawerScreen from './screens/DrawerScreen.js';
import MyPostsScreen from './screens/MyPostsScreen';
import SettingScreen from './screens/SettingScreen';
import CompleteProfileScreen from './screens/CompleteProfileScreen';
import HelpSupportScreen from './screens/HelpSupportScreen';
import FAQScreen from './screens/FAQScreen';

import { LogBox } from 'react-native';

const Stack = createNativeStackNavigator();

export default function App() {
  // Deep linking configuration
  const linking = {
    prefixes: ['campusfind://'],
    config: {
      screens: {
        ItemDetail: {
          path: 'post/:postId',
          parse: {
            postId: (postId) => postId,
          },
        },
        HomeScreen: '*',
      },
    },
  };

  return (
      <NavigationContainer linking={linking}>
        <Stack.Navigator initialRouteName="LoginScreen"screenOptions={{ headerShown: false }}>
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="PostItem" component={PostItemScreen} />
          <Stack.Screen name="LostItems" component={LostItemsScreen} />
          <Stack.Screen name="FoundItems" component={FoundItemsScreen} />
          <Stack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: 'Item Details' }}/>
          <Stack.Screen name="LoginScreen" component={LoginScreen} />
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
          <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
          <Stack.Screen name="DrawerScreen" component={DrawerScreen} />
          <Stack.Screen name="SettingScreen" component={SettingScreen} />
          <Stack.Screen name="MyPostsScreen" component={MyPostsScreen} />
          <Stack.Screen name="CompleteProfileScreen" component={CompleteProfileScreen} />
          <Stack.Screen name="HelpSupportScreen" component={HelpSupportScreen} />
          <Stack.Screen name="FAQScreen" component={FAQScreen} />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
  );
}
