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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import React, { useEffect, useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const { width } = Dimensions.get('window');

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [secure, setSecure] = useState(true);
  const navigation = useNavigation();
  const [isSending, setIsSending] = useState(false);


  useEffect(() => {
    GoogleSignin.configure({
      webClientId: '925395177236-rlup1ghbi07fri5bgec56obk5bga540v.apps.googleusercontent.com',
      forceCodeForRefreshToken: true,
      // hostedDomain: 'gmail.com',
    });
  }, []);

  const onGoogleButtonPress = async () => {
    try {
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
      Alert.alert('Login Failed', 'Something went wrong with Google Sign-In.');
    }
  };

  const onLogin = async () => {
    setEmailError('');
    setPasswordError('');
  
    let isValid = true;
  
    if (!email) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!email.endsWith('@gmail.com')) {
      setEmailError('Use your Gmail ID');
      isValid = false;
    }
  
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }
  
    if (!isValid) return;
  
    try {
      const userCredential = await auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
  
      // 🔁 Reload to update emailVerified status
      await user.reload();
  
      // 🔒 Block unverified users
      if (!user.emailVerified) {
        Alert.alert(
          'Email Not Verified',
          'Please verify your email before logging in.',
          [
            {
              text: isSending ? 'Sending...' : 'Resend Email',
              onPress: async () => {
                if (isSending) return;
      
                setIsSending(true);
                try {
                  const tempUser = await auth().signInWithEmailAndPassword(email, password);
                  if (tempUser?.user && !tempUser.user.emailVerified) {
                    await tempUser.user.sendEmailVerification();
                    Alert.alert('Verification Email Sent', 'Please check your inbox/Spam.');
                  } else {
                    Alert.alert('Already Verified', 'Please try logging in again.');
                  }
                } catch (error) {
                  Alert.alert('Error', error.message);
                }
                setIsSending(false);
                await auth().signOut();
              },
            },
            { text: 'OK' },
          ]
        );
        await auth().signOut();
        return;
      }
      
      Toast.show({
        type: 'success',
        text1: 'Logged in successfully!',
        position: 'bottom',
      });
  
      // ✅ No need to navigate manually — App.js will take over and show HomeScreen
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setEmailError('No user found with this email');
      } else if (err.code === 'auth/wrong-password') {
        setPasswordError('Incorrect password');
      } else if (err.code === 'auth/invalid-credential') {
        setPasswordError('Invalid email or password');
      } else {
        Alert.alert('Login Error', 'Something went wrong. Please try again.');
      }
    }
  };
  

  const onForgotPassword = async () => {
    if (!email) {
      Alert.alert('Missing Email', 'Please enter your email to reset password.');
      return;
    }
  
    if (!email.endsWith('@gmail.com')) {
      Alert.alert('Invalid Email', 'Please enter a valid gmail ID.');
      return;
    }
  
    try {
      await auth().sendPasswordResetEmail(email);
      Alert.alert(
        'Email Sent',
        'A password reset link has been sent to your email address.'
      );
    } catch (error) {
      if (error.code === 'auth/user-not-found') {
        Alert.alert('User Not Found', 'No account found with this email.');
      } else if (error.code === 'auth/invalid-email') {
        Alert.alert('Invalid Email', 'Please enter a valid email address.');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };
  

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <Text style={styles.title}>CampusFind</Text>
          <Image source={require('../assets/login.png')} style={styles.logo} resizeMode="contain" />

          <View style={[styles.inputContainer, emailError && { borderColor: 'red' }]}>
            <FontAwesome name="envelope" size={14} color="#7f89b0" style={styles.icon} />
            <TextInput
              placeholder="user@gmail.com"
              placeholderTextColor="#7f89b0"
              style={styles.inputBox}
              value={email}
              onChangeText={text => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              keyboardType="email-address"
              autoComplete="email"
              autoCapitalize="none"
              selectionColor="#7f89b0"
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}

          <View style={[styles.passwordContainer, passwordError && { borderColor: 'red' }]}>
            <FontAwesome name="lock" size={18} color="#7f89b0" style={styles.icon} />
            <TextInput
              placeholder="Enter your password"
              placeholderTextColor="#7f89b0"
              style={styles.passwordInput}
              value={password}
              onChangeText={text => {
                setPassword(text);
                if (passwordError) setPasswordError('');
              }}
              secureTextEntry={secure}
              selectionColor="#7f89b0"
            />
            <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeIcon}>
              <FontAwesome name={secure ? 'eye-slash' : 'eye'} size={18} color="#7f89b0" />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}

          <TouchableOpacity
            onPress={onForgotPassword}
            disabled={!email || !email.endsWith('@gmail.com')}
          >
            <Text
              style={[
                styles.forgot,
                (!email || !email.endsWith('@gmail.com')) && { color: '#bbb' },
              ]}
            >
              Forgot password
            </Text>
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
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="logo-google" size={20} color="#5a6cb2" style={{ marginRight: 8 }} />
            <Text style={styles.googleText}>Google Sign in</Text>
          </View>
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
  container: {
    flexGrow: 1,
    backgroundColor: '#CFD8EE',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    elevation: 10,
  },
  logo: {
    width: width * 0.45,
    height: width * 0.45,
    marginVertical: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5a6cb2',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7f89b0',
    backgroundColor: 'white',
    borderRadius: 30,
    paddingHorizontal: 12,
    width: '100%',
    marginTop: 15,
  },
  icon: {
    marginRight: 8,
  },
  inputBox: {
    flex: 1,
    paddingVertical: 13,
    color: '#000',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7f89b0',
    backgroundColor: 'white',
    borderRadius: 30,
    paddingHorizontal: 12,
    width: '100%',
    marginTop: 20,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 13,
    color: '#000',
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
  errorText: {
    color: 'red',
    alignSelf: 'flex-start',
    marginTop: 4,
    fontSize: 13,
    marginLeft: 10,
  },
});

export default LoginScreen;
