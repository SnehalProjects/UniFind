import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';

const colleges = [
  'ARP', 'CMPICA', 'CSPIT', 'DEPSTAR', 'IIIM', 'MTIN', 'PDPIAS', 'RPCP'
];
const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

const { width } = Dimensions.get('window');

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [course, setCourse] = useState('');
  const [contact, setContact] = useState('');
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedSem, setSelectedSem] = useState('');

  const onRegister = async () => {
    if (!email || !password || !name || !course || !contact || !selectedCollege || !selectedSem) {
      Alert.alert('Please fill in all fields');
      return;
    }

    if (!email.endsWith('@charusat.edu.in')) {
      Alert.alert('Invalid Email', 'Register with CHARUSAT email Id only.');
      return;
    }

    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await firestore().collection('users').doc(user.uid).set({
        name,
        email,
        course,
        contact,
        college: selectedCollege,
        semester: selectedSem,
        createdAt: firestore.FieldValue.serverTimestamp(),
        profileImage: '',
      });

      await user.sendEmailVerification();

      Alert.alert(
        'Verify Email',
        'A verification email has been sent. Please verify your email before logging in.'
      );

      navigation.navigate('LoginScreen');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        Alert.alert('That email address is already in use!');
      } else if (err.code === 'auth/invalid-email') {
        Alert.alert('That email address is invalid!');
      } else {
        Alert.alert('Error', err.message);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#e7ecfa' }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.screen}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={[styles.card, { width: width * 0.9 }]}>
            <Text style={styles.title}>CampusFind</Text>
            <Text style={styles.subtitle}>Helping things find their way back</Text>

            <TextInput
              placeholder="Full Name"
              placeholderTextColor="#9aa4c0"
              style={styles.input}
              value={name}
              onChangeText={setName}
            />

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedCollege}
                onValueChange={setSelectedCollege}
                style={[styles.picker, { color: selectedCollege ? 'black' : '#9aa4c0' }]}
                dropdownIconColor="#4b6cb7"
              >
                <Picker.Item label="Select College" value="" />
                {colleges.map((college, index) => (
                  <Picker.Item label={college} value={college} key={index} />
                ))}
              </Picker>
            </View>

            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedSem}
                onValueChange={setSelectedSem}
                style={[styles.picker, { color: selectedSem ? 'black' : '#9aa4c0' }]}
                dropdownIconColor="#4b6cb7"
              >
                <Picker.Item label="Select Semester" value="" />
                {semesters.map((sem, index) => (
                  <Picker.Item label={sem} value={sem} key={index} />
                ))}
              </Picker>
            </View>

            <TextInput
              placeholder="Branch"
              placeholderTextColor="#9aa4c0"
              style={styles.input}
              value={course}
              onChangeText={setCourse}
              autoCorrect={true}
            />

            <TextInput
              placeholder="Contact Number"
              placeholderTextColor="#9aa4c0"
              style={styles.input}
              value={contact}
              onChangeText={setContact}
              keyboardType="phone-pad"
            />

            <TextInput
              placeholder="user@charusat.edu.in"
              placeholderTextColor="#9aa4c0"
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              importantForAutofill="no"
              autoCapitalize="none"
            />

            <TextInput
              placeholder="Password"
              placeholderTextColor="#9aa4c0"
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />

            <TouchableOpacity style={styles.button} onPress={onRegister}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>

            <Text style={styles.terms}>
              By signing up, you agree to our <Text style={styles.link}>Terms</Text> &{' '}
              <Text style={styles.link}>Privacy Policy</Text>.
            </Text>

            <View style={styles.bottomRow}>
              <Text style={styles.bottomText}>Already have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
                <Text style={styles.logintext}> Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e7ecfa',
    paddingVertical: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 20,
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4b6cb7',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#9aa4c0',
    borderRadius: 30,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginTop: 16,
    fontSize: 15,
    color: '#000',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#ccc',
    shadowOpacity: 0.1,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#9aa4c0',
    borderRadius: 30,
    marginTop: 15,
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    height: 50,
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#ccc',
    shadowOpacity: 0.1,
  },
  picker: {
    width: '100%',
    height: '100%',
  },
  button: {
    backgroundColor: '#4b6cb7',
    paddingVertical: 14,
    borderRadius: 30,
    marginTop: 28,
    alignItems: 'center',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.2,
    elevation: 6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  terms: {
    marginTop: 15,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8,
  },
  bottomText: {
    fontSize: 14,
    paddingVertical: 5,
    color: '#6b7280',
  },
  link: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4b6cb7',
  },
  logintext: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4b6cb7',
  },
});

export default SignUpScreen;