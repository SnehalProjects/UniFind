import React, { useState ,useEffect} from 'react';
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
import Icon from 'react-native-vector-icons/FontAwesome5';
import CountryPicker from 'react-native-country-picker-modal';

const colleges = ['ARP', 'CMPICA', 'CSPIT', 'DEPSTAR', 'IIIM', 'MTIN', 'PDPIAS', 'RPCP'];
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
  const [errors, setErrors] = useState({});
  const [verificationSent, setVerificationSent] = useState(false);
  const [countryCode, setCountryCode] = useState('IN');
  const [callingCode, setCallingCode] = useState('91');
  const [showCountryPicker, setShowCountryPicker] = useState(false);

  const onRegister = async () => {
    const newErrors = {};

    if (!name) newErrors.name = 'Full name is required';
    if (!email) newErrors.email = 'Email is required';
    else if (!email.endsWith('@gmail.com')) newErrors.email = 'Use gmail only';
    if (!password) newErrors.password = 'Password is required';
    if (!course) newErrors.course = 'Branch is required';
    if (!contact) newErrors.contact = 'Contact number is required';
    else if (!/^\d{10}$/.test(contact)) newErrors.contact = 'Contact number must be 10 digits';
    if (!selectedCollege) newErrors.selectedCollege = 'Please select your college';
    if (!selectedSem) newErrors.selectedSem = 'Please select your semester';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;

      await firestore().collection('users').doc(user.uid).set({
        name,
        email,
        course,
        contact: `+${callingCode}${contact}`,
        college: selectedCollege,
        semester: selectedSem,
        createdAt: firestore.Timestamp.now(),
        profileImage: '',
      });

      await user.sendEmailVerification();
      // setVerificationSent(true);
      // setCanResend(false);

      Alert.alert(
        'Verify Email',
        'Verification email is sent to your registered Email id. Click on Link to Verify.'
      );

      navigation.navigate('LoginScreen');
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        setErrors({ email: 'That email address is already in use!' });
      } else if (err.code === 'auth/invalid-email') {
        setErrors({ email: 'That email address is invalid!' });
      } else {
        Alert.alert('Error', err.message);
      }
    }
  };

  const handleResendVerification = async () => {
    const user = auth().currentUser;
    if (user && !user.emailVerified) {
      try {
        await user.sendEmailVerification();
        setCanResend(false);
  
        let interval = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              clearInterval(interval);
              setCanResend(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
  
        Alert.alert('Verification Email Resent', 'Check your inbox again.');
      } catch (err) {
        Alert.alert('Error', 'Unable to resend verification email.');
      }
    }
  };

  const renderInputField = (iconName, placeholder, value, onChangeText, errorKey, keyboardType = 'default', secure = false) => (
    <View style={[styles.inputWrapper, errors[errorKey] && styles.inputError]}>
      <Icon name={iconName} size={16} color="#7f89b0" style={styles.icon} />
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#7f89b0"
        style={styles.input}
        value={value}
        onChangeText={(text) => {
          onChangeText(text);
          setErrors({ ...errors, [errorKey]: null });
        }}
        keyboardType={keyboardType}
        secureTextEntry={secure}
        maxLength={keyboardType === 'phone-pad' ? 10 : undefined}
        selectionColor="#7f89b0"
      />
    </View>
  );

  // Custom contact field with country picker
  const renderContactField = () => (
    <View style={[styles.inputWrapper, errors['contact'] && styles.inputError]}> 
      <TouchableOpacity onPress={() => setShowCountryPicker(true)} style={styles.countryPickerBtn}>
        <CountryPicker
          countryCode={countryCode}
          withFlag
          withCallingCode
          withFilter
          withEmoji
          onSelect={country => {
            setCountryCode(country.cca2);
            setCallingCode(country.callingCode[0]);
          }}
          visible={showCountryPicker}
          onClose={() => setShowCountryPicker(false)}
        />
        <Text style={styles.countryCodeText}>+{callingCode}</Text>
      </TouchableOpacity>
      <TextInput
        placeholder="Contact Number"
        placeholderTextColor="#7f89b0"
        style={styles.input}
        value={contact}
        onChangeText={(text) => {
          setContact(text);
          setErrors({ ...errors, contact: null });
        }}
        keyboardType="phone-pad"
        maxLength={10}
        selectionColor="#7f89b0"
      />
    </View>
  );

  const renderPickerField = (iconName, selectedValue, onValueChange, items, placeholder, errorKey) => (
    <View style={[styles.inputWrapper, errors[errorKey] && styles.inputError]}>
      <Icon name={iconName} size={16} color="#7f89b0" style={styles.icon} />
      <Picker
        selectedValue={selectedValue}
        onValueChange={(value) => {
          onValueChange(value);
          setErrors({ ...errors, [errorKey]: null });
        }}
        style={[styles.picker, { color: selectedValue ? '#000' : '#7f89b0' }]}
        dropdownIconColor="#7f89b0"
      >
        <Picker.Item label={placeholder} value="" />
        {items.map((item, index) => (
          <Picker.Item label={item} value={item} key={index} />
        ))}
      </Picker>
    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#cfd8ee' }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
          <View style={[styles.card, { width: width * 0.92 }]}> 
            <Text style={styles.title}>CampusFind</Text>
            <Text style={styles.subtitle}>Helping things find their way back</Text>

            {renderInputField('user', 'Full Name', name, setName, 'name')}
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            {renderContactField()}
            {errors.contact && <Text style={styles.errorText}>{errors.contact}</Text>}

            {renderInputField('envelope', 'user@gmail.com', email, setEmail, 'email', 'email-address')}
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            {renderInputField('lock', 'Password', password, setPassword, 'password', 'default', true)}
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            {renderPickerField('university', selectedCollege, setSelectedCollege, colleges, 'Select College', 'selectedCollege')}
            {errors.selectedCollege && <Text style={styles.errorText}>{errors.selectedCollege}</Text>}

            {renderPickerField('layer-group', selectedSem, setSelectedSem, semesters, 'Select Semester', 'selectedSem')}
            {errors.selectedSem && <Text style={styles.errorText}>{errors.selectedSem}</Text>}

            {renderInputField('graduation-cap', 'Branch', course, setCourse, 'course')}
            {errors.course && <Text style={styles.errorText}>{errors.course}</Text>}

            <TouchableOpacity style={styles.button} onPress={onRegister}>
              <Text style={styles.buttonText}>Register</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity onPress={handleResendVerification}>
                <Text style={{ color: '#4B6CB7', fontWeight: 'bold' }}>
                  Resend Verification Email
                </Text>
            </TouchableOpacity> */}


            <Text style={styles.terms}>
              By signing up, you agree to our <Text style={styles.link}>Terms</Text> & <Text style={styles.link}>Privacy Policy</Text>.
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
    backgroundColor: '#CFD8EE',
    paddingVertical: 30,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 25,
    padding: 22,
    maxWidth: 330,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#4B6CB7',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#7f89b0',
    borderRadius: 30,
    paddingHorizontal: 12,
    marginTop: 12,
    backgroundColor: '#fff',
    elevation: 2,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: '#000',
  },
  picker: {
    flex: 1,
    height: 48,              // Same height as TextInput container
    paddingVertical: 10,  
  },
  button: {
    backgroundColor: '#4B6CB7',
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
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 18,
    marginTop:20
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 7,
  },
  bottomText: {
    fontSize: 14,
    paddingVertical: 5,
    color: '#6b7280',
  },
  link: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B6CB7',
  },
  logintext: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4B6CB7',
  },
  inputError: {
    borderColor: '#dc2626',
  },
  errorText: {
    color: '#dc2626',
    marginTop: 4,
    marginLeft: 10,
    fontSize: 12,
  },
  countryPickerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    paddingRight: 4,
    paddingLeft: 0,
  },
  countryCodeText: {
    fontSize: 15,
    color: '#000',
    marginLeft: 2,
    marginRight: 2,
    fontWeight: 'bold',
  },
});

export default SignUpScreen;