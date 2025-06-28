import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import React, {useState} from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import {useNavigation} from '@react-navigation/native';

const colleges = [
  'ARP', 'CMPICA', 'CSPIT', 'DEPSTAR', 'IIIM', 'MTIN', 'PDPIAS', 'RPCP'
];
const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

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
      const uid = userCredential.user.uid;

      await firestore().collection('users').doc(uid).set({
        name,
        email,
        course,
        contact,
        college: selectedCollege,
        semester: selectedSem,
        createdAt: firestore.FieldValue.serverTimestamp(),
        profileImage: '',
      });

      Alert.alert('Success', 'User account created !');
      navigation.navigate('HomeScreen' as never); 
      } 
      catch (err: any) {
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
    <View style={styles.container}>
      <Text style={styles.signup}>Create Account</Text>
      <Text style={styles.header}>Join your college community and start your learning journey</Text>
      
      <TextInput
        placeholder="Full Name"
        placeholderTextColor={'#7f89b0'}
        style={styles.inputBox}
        value={name}
        onChangeText={value => setName(value)}
      />

      <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={selectedCollege}
        onValueChange={itemValue => setSelectedCollege(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Collage" value="" />
        {colleges.map((college, index) => (
          <Picker.Item label={college} value={college} key={index} />
        ))}
      </Picker>
      </View>

      <View style={styles.pickerWrapper}>
      <Picker
        selectedValue={selectedSem}
        onValueChange={itemValue => setSelectedSem(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Select Semester" value="" />
        {semesters.map((sem, index) => (
          <Picker.Item label={sem} value={sem} key={index} />
        ))}
      </Picker>
      </View>

      <TextInput
        placeholder="Course Name"
        placeholderTextColor={'#7f89b0'}
        style={styles.inputBox}
        value={course}
        onChangeText={value => setCourse(value)}
      />

      <TextInput
        placeholder="Contact No"
        placeholderTextColor={'#7f89b0'}
        style={styles.inputBox}
        value={contact}
        onChangeText={value => setContact(value)}
        keyboardType="phone-pad"
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor={'#7f89b0'}
        style={styles.inputBox}
        value={email}
        onChangeText={value => setEmail(value)}
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={'#7f89b0'}
        style={styles.inputBox}
        value={password}
        onChangeText={value => setPassword(value)}
        secureTextEntry
      />

      <TouchableOpacity onPress={onRegister} style={styles.register}>
        <Text style={styles.registerTitle}>Register</Text>
      </TouchableOpacity>

      <Text style={styles.footerText}>By creating an account, you agree to our
         Terms of Service and Privacy Policy</Text>

      <View style={{flexDirection:'row',alignItems:'center'}}>
       <Text style={styles.alreadyText}>Already have an account ?    </Text>
       <TouchableOpacity onPress={() => navigation.navigate('LoginScreen' as never)}>
        <Text style={styles.link}>Login</Text>
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
    backgroundColor:'#cfd8ee',
  },
  inputBox: {
    borderWidth: 1,
    borderColor: '#7f89b0',
    backgroundColor:'white',
    paddingHorizontal: 12,
    borderRadius: 7,
    width: '90%',
    marginTop: 20,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.1,
    elevation: 8,
  },
  pickerWrapper: {
    width: '90%',
    height:40,
    borderWidth: 1,
    borderColor: '#7f89b0',
    borderRadius: 7,
    justifyContent:'center',
    paddingHorizontal: 2,
    marginTop: 20,
    backgroundColor: 'white',
    shadowColor: '#4f46e5',
    shadowRadius: 8,
    elevation: 8,
  },
  picker: {
    color: '#7f89b0',
    fontSize: 16,
  },
  register: {
    width: '90%',
    backgroundColor: '#4b6cb7',
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
    color: 'Black',
    fontWeight: '900',
    fontFamily:'serif',
    marginBottom: 20,
  },
  header:{
    margin:10,
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
  },
  footerText:{
    margin:20,
    textAlign: 'center',
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20
  },
  alreadyText:{
    marginTop:10
  },
  link: {
    color: '#4b6cb7',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 10,
  },
  login:{
    width: '90%',
    backgroundColor: '#5a6cb2',
    padding: 12,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 40,
  }

});

export default SignUpScreen;
