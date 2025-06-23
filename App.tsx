// import { NewAppScreen } from '@react-native/new-app-screen';
// import { StyleSheet, useColorScheme, View ,Text} from 'react-native';
// import { getAuth, createUserWithEmailAndPassword } from '@react-native-firebase/auth';
// import SignupScreen from './screens/SignUpScreen';


// const App = () =>  {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <View>
//       <SignupScreen/>
//     </View>
//   );
// }

// export default App;


import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useColorScheme, View, StatusBar } from 'react-native';
import SignUpScreen from './screens/SignUpScreen';
import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import ProfileMainScreen from './screens/ProfileMainScreen'; 
import { GoogleSignin } from '@react-native-google-signin/google-signin';

GoogleSignin.configure({
  webClientId: '925395177236-rlup1ghbi07fri5bgec56obk5bga540v.apps.googleusercontent.com', // from Firebase > Project Settings > Web Client ID
});


const Stack = createNativeStackNavigator();

const App = () => {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginScreen" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="LoginScreen" component={LoginScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
        <Stack.Screen name="ProfileMainScreen" component={ProfileMainScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


export default App;


