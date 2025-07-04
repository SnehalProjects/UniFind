import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Dimensions,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { KeyboardAvoidingView, Platform } from 'react-native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const navigation = useNavigation();
  const { width } = Dimensions.get('window');

  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '21704621494-fbocvhcr2osirbd0vaj6mj1po1qhhfju.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
      hostedDomain: 'charusat.edu.in',
    });
  }, []);

  const onGoogleButtonPress = async () => {
  try {
    // Sign out from Google to force account selection
    await GoogleSignin.signOut();

    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const userInfo = await GoogleSignin.signIn();
    if (!userInfo) throw new Error('Google Sign-In failed or was cancelled');

    const { idToken } = await GoogleSignin.getTokens();
    if (!idToken) throw new Error('No ID token returned from Google');

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);
    const user = userCredential.user;

    if (!user) throw new Error('Firebase user not found after Google Sign-In');

    const uid = user.uid;
    const userDoc = await firestore().collection('users').doc(uid).get();

    if (userDoc.exists) {
      const userData = userDoc.data();

      if (!userData?.course || !userData?.college || !userData?.semester) {
        Alert.alert('Complete Profile', 'Please finish setting up your profile.');
        navigation.navigate('CompleteProfileScreen');
      } else {
        navigation.navigate('HomeScreen');
      }
    } else {
      await firestore().collection('users').doc(uid).set({
        name: user.displayName || '',
        email: user.email || '',
        profileImage: user.photoURL || '',
        course: '',
        contact: '',
        college: '',
        semester: '',
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Almost there!', 'Please complete your profile.');
      navigation.navigate('CompleteProfileScreen');
    }
  } catch (error) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      // User cancelled the login flow — no need to show error
      return;
    }

    // Optional: show an alert for unexpected errors only
    Alert.alert('Login Failed', 'An unexpected error occurred. Please try again.');
    // console.error('[Google Sign-In Error]', error); // You can keep this in development if needed
  }
};

    const onLogin = async () => {
    if (!email || !password) {
      Alert.alert('Please enter email and password');
      return;
    }

    if (!email.endsWith('@charusat.edu.in')) {
      Alert.alert('Invalid Email', 'Login with your CHARUSAT email ID.');
      return;
    }

    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email before logging in. Check your inbox or spam folder.',
          [
            {
              text: 'Resend Email',
              onPress: async () => {
                await user.sendEmailVerification();
                Alert.alert('Verification email resent');
              }
            },
            {
              text: 'OK',
              onPress: () => {}
            }
          ]
        );

        await auth().signOut();
        return;
      }

      Alert.alert('Success', 'Logged in successfully!');
      navigation.navigate('HomeScreen');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        Alert.alert('No user found with that email!');
      } else if (err.code === 'auth/wrong-password') {
        Alert.alert('Incorrect password!');
      } else {
        Alert.alert('Login Error', err.message);
      }
    }
  };

  const onForgotPassword = () => {
    if (!email) {
      Alert.alert('Enter your email to reset password');
      return;
    }
    auth()
      .sendPasswordResetEmail(email)
      .then(() => {
        Alert.alert('Password reset email sent!');
      })
      .catch(error => {
        Alert.alert('Error', error.message);
      });
  };

  return (
    // <View style={styles.container}>
    //   <Text style={styles.signup}>Welcome Back</Text>
    //   <Text style={styles.header}>Login to continue your learning journey</Text>

    //   <TextInput
    //      placeholder="user@charusat.edu.in"
    //     placeholderTextColor="#7f89b0"
    //     style={styles.inputBox}
    //     value={email}
    //     onChangeText={value => setEmail(value)}
    //     keyboardType="email-address"
    //   />

    //   <View style={styles.passwordContainer}>
    //     <TextInput
    //       placeholder="Password"
    //       placeholderTextColor="#7f89b0"
    //       style={styles.passwordInput}
    //       value={password}
    //       onChangeText={value => setPassword(value)}
    //       secureTextEntry={secure}
    //     />
    //     <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeIcon}>
    //       <FontAwesome name={secure ? 'eye' : 'eye-slash'} size={18} color="#7f89b0" />
    //     </TouchableOpacity>
    //   </View>

    //   <TouchableOpacity onPress={onLogin} style={styles.login}>
    //     <Text style={styles.registerTitle}>Login</Text>
    //   </TouchableOpacity>

    //   <TouchableOpacity onPress={onForgotPassword}>
    //     <Text style={styles.forgot}>Forgot Password?</Text>
    //   </TouchableOpacity>

    //   <TouchableOpacity style={styles.googleBtn} onPress={onGoogleButtonPress}>
    //     <Text style={styles.googleText}>Continue with Google</Text>
    //   </TouchableOpacity>

    //   <View style={{ flexDirection: 'row', alignItems: 'center' }}>
    //     <Text style={styles.alreadyText}>Don't have an account? </Text>
    //     <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
    //       <Text style={styles.link}>Register Now</Text>
    //     </TouchableOpacity>
    //   </View>
    // </View>
    
    <KeyboardAvoidingView
    style={{ flex: 1 }}
    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
  >
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
      <Text style={styles.title}>CampusFind</Text>

        <Image
          source={require('../assets/login.png')} // You can replace this image later
          style={styles.logo}
          resizeMode="contain"
        />

        <TextInput
          placeholder="example@charusat.edu.in"
          placeholderTextColor="#7f89b0"
          style={[styles.inputBox, { backgroundColor: '#fff' }]}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoComplete="email"
        />

        <View style={styles.passwordContainer}>
          <TextInput
            placeholder="Enter your password"
            placeholderTextColor="#7f89b0"
            style={styles.passwordInput}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={secure}
          />
          <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeIcon}>
            <FontAwesome name={secure ? 'eye-slash' : 'eye'} size={18} color="#7f89b0" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onForgotPassword}>
          <Text style={styles.forgot}>Forgot password</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.login} onPress={onLogin}>
          <Text style={styles.loginText}>Sign in</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.dividerContainer}>
      <View style={styles.line} />
      <Text style={styles.orText}>or</Text>
      <View style={styles.line} />
      </View>

      <TouchableOpacity style={styles.googleBtn} onPress={onGoogleButtonPress}>
        <Text style={styles.googleText}>Google Sign in</Text>
      </TouchableOpacity>

      <View style={styles.bottomRow}>
        <Text style={styles.bottomText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen')}>
          <Text style={styles.registerLink}>Register</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
      </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // 
  container: {
    flex: 1,
    backgroundColor: '#cfd8ee',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 25,
    width: '90%',
    minHeight: 500,
    alignItems: 'center',
    elevation: 20,
  },
  logo: {
    width: 170,
    height: 170,
  },
  title: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#5a6cb2',
    marginBottom: 10,
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#7f89b0',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderRadius: 30,
    width: '100%',
    marginTop: 13,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7f89b0',
    backgroundColor: 'white',
    borderRadius: 30,
    paddingHorizontal: 12,
    paddingVertical: 3,
    width: '100%',
    marginTop: 20,
  },
  passwordInput: {
    flex: 1,
    color: 'black',
    paddingVertical: 10,
  },
  eyeIcon: {
    paddingHorizontal: 8,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: 16,
    color: '#4b6cb7',
    fontSize: 14,
  },
login: {
    width: '100%',
    backgroundColor: '#5a6cb2',
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 25,
    elevation: 10,
  },
  loginText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    width: '82%',
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#6e7e91',
  },
  orText: {
    marginHorizontal: 10,
    fontWeight: '600',
    color: 'black',
  },  
  googleBtn: {
    backgroundColor: '#fff',
    borderColor: '#5a6cb2',
    borderWidth: 1,
    padding: 14,
    borderRadius: 25,
    width: '88%',
    alignItems: 'center',
    marginTop: 30,
  },
  googleText: {
    color: '#5a6cb2',
    fontWeight: '600',
    fontSize: 16,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  bottomText: {
    color: '#7f89b0',
    fontSize: 15,
  },
  registerLink: {
    color: '#4b6cb7',
    fontWeight: 'bold',
    fontSize: 18,
    paddingLeft: 5,
  },
});
export default LoginScreen;
