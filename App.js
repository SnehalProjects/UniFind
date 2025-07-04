import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import HomeScreen from './screens/HomeScreen ';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import DrawerScreen from './screens/DrawerScreen'; 
import SettingScreen from './screens/SettingScreen';
import CompleteProfileScreen from './screens/CompleteProfileScreen';
import PostItemScreen from './screens/PostItemScreen';
import LostItemsScreen from './screens/LostItemScreen';
import FoundItemsScreen from './screens/FoundItemScreen';
import ItemDetailScreen from './screens/ItemDetailScreen';
import MyPostsScreen from './screens/MyPostsScreen';
import { LogBox } from 'react-native';

LogBox.ignoreAllLogs();

// OR: Ignore specific warnings
LogBox.ignoreLogs([
  'Warning: ...', // exact warning string
  'AsyncStorage has been extracted from react-native core',
]);

const Stack = createNativeStackNavigator();

const App = () => {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen}/>
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="DrawerScreen" component={DrawerScreen} />
        <Stack.Screen name="SettingScreen" component={SettingScreen} />
        <Stack.Screen name="CompleteProfileScreen" component={CompleteProfileScreen} />
        <Stack.Screen name="PostItem" component={PostItemScreen} />
        <Stack.Screen name="LostItems" component={LostItemsScreen} />
        <Stack.Screen name="FoundItems" component={FoundItemsScreen} />
        <Stack.Screen name="MyPostsScreen" component={MyPostsScreen} />
        <Stack.Screen name="ItemDetail" component={ItemDetailScreen} options={{ title: 'Item Details' }}/>
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
    </GestureHandlerRootView>
  );
};


export default App;