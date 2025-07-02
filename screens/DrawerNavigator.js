// // DrawerNavigator.tsx
// import React from 'react';
// import { createDrawerNavigator } from '@react-navigation/drawer';
// import { Dimensions } from 'react-native';
// import HomeScreen from './HomeScreen ';
// // import DrawerScreen from './DrawerScreen';

// const Drawer = createDrawerNavigator();

// const DrawerNavigator = () => {
//   return (
//     <Drawer.Navigator
//       screenOptions={{
//         drawerStyle: {
//           width: Dimensions.get('window').width * 0.7, // 70% width
//         },
//         headerShown: false, 
//       }}
//       drawerContent={() => <DrawerScreen />} // Custom drawer content
//     >
//       <Drawer.Screen name="HomeScreen" component={HomeScreen} />
//     </Drawer.Navigator>
//   );
// };

// export default DrawerNavigator;
