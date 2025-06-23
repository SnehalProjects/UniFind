import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, { useState } from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true); // 🔐 toggle visibility
  const navigation = useNavigation();

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
      await auth().signInWithEmailAndPassword(email, password);
      Alert.alert('Success', 'Logged in successfully!');
      navigation.navigate('ProfileMainScreen' as never)

    } catch (err: any) {
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

  const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const userInfo = await GoogleSignin.signIn();
    const { idToken } = await GoogleSignin.getTokens();

    if (!idToken) {
      Alert.alert('Google Sign-In Error', 'No ID token returned');
      return;
    }

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);

    const uid = userCredential.user.uid;
    const userDoc = await firestore().collection('users').doc(uid).get();

    if (!userDoc.exists) {
      // Ask user to complete profile
      navigation.navigate('SignUpScreen' as never);
    } else {
      Alert.alert('Google Sign-In Successful');
      navigation.navigate('ProfileScreen' as never);
    }

  } catch (error) {
    const errMsg = (error instanceof Error) ? error.message : 'Something went wrong';
    Alert.alert('Google Sign-In Error', errMsg);
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.signup}>Welcome Back</Text>
      <Text style={styles.header}>Login to continue your learning journey</Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#7f89b0"
        style={styles.inputBox}
        value={email}
        onChangeText={value => setEmail(value)}
        keyboardType="email-address"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          placeholder="Password"
          placeholderTextColor="#7f89b0"
          style={styles.passwordInput}
          value={password}
          onChangeText={value => setPassword(value)}
          secureTextEntry={secure}
        />
        <TouchableOpacity onPress={() => setSecure(!secure)} style={styles.eyeIcon}>
          <FontAwesome name={secure ? 'eye' : 'eye-slash'} size={22} color="#7f89b0" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={onLogin} style={styles.login}>
        <Text style={styles.registerTitle}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onForgotPassword}>
        <Text style={styles.forgot}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.googleBtn} onPress={signInWithGoogle}>
        <Text style={styles.googleText}>Continue with Google</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Text style={styles.alreadyText}>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('SignUpScreen' as never)}>
          <Text style={styles.link}>Register Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    backgroundColor: '#bbc9f8',
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#7f89b0',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    borderRadius: 7,
    width: '90%',
    marginTop: 20,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.1,
    elevation: 8,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7f89b0',
    backgroundColor: 'white',
    borderRadius: 7,
    paddingHorizontal: 12,
    width: '90%',
    marginTop: 20,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.1,
    elevation: 8,
  },
  passwordInput: {
    flex: 1,
    color: 'black',
    paddingVertical: 10,
  },
  eyeIcon: {
    paddingHorizontal: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  login: {
    width: '90%',
    backgroundColor: '#5a6cb2',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 40,
  },
  registerTitle: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  signup: {
    fontSize: 28,
    color: 'black',
    fontWeight: '900',
    fontFamily: 'serif',
    marginBottom: 20,
  },
  header: {
    margin: 10,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  forgot: {
    alignSelf: 'flex-end',
    marginTop: 10,
    color: 'black',
  },
  alreadyText: {
    marginTop: 10,
  },
  link: {
    color: '#5a6cb2',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
  },
  googleBtn: {
    backgroundColor: '#fff',
    borderColor: '#4285F4',
    borderWidth: 1,
    padding: 12,
    borderRadius: 25,
    width: '90%',
    alignItems: 'center',
    marginTop: 80,
  },
  googleText: {
    color: '#4285F4',
    fontWeight: '600',
  },
});

export default LoginScreen;
