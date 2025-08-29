import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const ForgotPassScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState(null);

  useEffect(() => {
    const user = auth().currentUser;
    if (user && user.email) {
      setEmail(user.email);
      setRegisteredEmail(user.email);
    }
  }, []);

  const handleSendReset = async () => {
    setError('');
    setSuccess('');
    if (!email) {
      setError('Email is required');
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (registeredEmail && email !== registeredEmail) {
      setError('Please enter your registered email address.');
      return;
    }
    setLoading(true);
    try {
      await auth().sendPasswordResetEmail(email);
      setSuccess('A password reset link has been sent to your email.');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.bgContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={28} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Forgot password</Text>
        <View style={{ width: 28 }} />
      </View>
      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.bigTitle}>Forgot your password?</Text>
        <Text style={styles.paragraph}>
          Enter your registered email address and we'll send you a link to reset your password.
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Email address"
          placeholderTextColor="#7f89b0"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        {success ? <Text style={styles.successText}>{success}</Text> : null}
      </View>
      {/* Bottom Buttons */}
      <View style={styles.bottomBtns}>
        <TouchableOpacity style={styles.sendButton} onPress={handleSendReset} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sendText}>Send reset link</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>Go back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  bgContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.04,
    paddingTop: Platform.OS === 'android' ? 18 : 0,
    paddingBottom: 10,
    backgroundColor: '#fff',
  },
  backBtn: {
    padding: 4,
    marginRight: 2,
  },
  title: {
    fontSize: width * 0.065,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: width * 0.07,
    paddingTop: 30,
    paddingBottom: 10,
    justifyContent: 'flex-start',
  },
  bigTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 18,
    marginTop: 10,
  },
  paragraph: {
    fontSize: 15,
    color: '#444',
    marginBottom: 18,
    lineHeight: 22,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: '#000',
    marginBottom: 8,
    backgroundColor: '#f8f8f8',
  },
  errorText: {
    color: '#B00020',
    marginBottom: 8,
    fontSize: 14,
    alignSelf: 'flex-start',
  },
  successText: {
    color: '#388e3c',
    marginBottom: 8,
    fontSize: 14,
    alignSelf: 'flex-start',
  },
  bottomBtns: {
    paddingHorizontal: width * 0.07,
    paddingBottom: 30,
    backgroundColor: '#fff',
  },
  sendButton: {
    backgroundColor: '#4b6cb7',
    borderRadius: 22,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  sendText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  goBackButton: {
    backgroundColor: '#f5f5f5',
    borderRadius: 22,
    paddingVertical: 15,
    alignItems: 'center',
  },
  goBackText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default ForgotPassScreen;