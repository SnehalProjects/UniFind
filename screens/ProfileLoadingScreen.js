import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const ProfileLoadingScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    // Show the animation for 1.5 seconds, then navigate to HomeScreen
    const timer = setTimeout(() => {
      navigation.replace('HomeScreen'); // Use replace to prevent going back to this screen
    }, 1500); // 1.5 seconds

    // Cleanup timer on component unmount
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <LottieView
        source={require('../assets/searching for profile.json')}
        autoPlay
        loop={false} // Don't loop, play once
        style={styles.animation}
      />
      <Text style={styles.text}>Setting up your profile...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#cfd8ee', // Match your app's background color
  },
  animation: {
    width: wp('60%'), // 60% of screen width
    height: hp('30%'), // 30% of screen height
  },
  text: {
    marginTop: hp('3%'),
    color: '#374151',
    fontWeight: 'bold',
    fontSize: wp('4.5%'),
    textAlign: 'center',
  },
});

export default ProfileLoadingScreen;
