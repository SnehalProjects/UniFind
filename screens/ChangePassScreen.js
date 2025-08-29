import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const { width, height } = Dimensions.get('window');

const ChangePassScreen = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secureOld, setSecureOld] = useState(true);
  const [secureNew, setSecureNew] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [errorCurrent, setErrorCurrent] = useState('');
  const [errorNew, setErrorNew] = useState('');
  const [errorConfirm, setErrorConfirm] = useState('');

  const navigation = useNavigation();

  const reauthenticate = async (currentPassword) => {
    const user = auth().currentUser;
    const cred = auth.EmailAuthProvider.credential(user.email, currentPassword);
    return user.reauthenticateWithCredential(cred);
  };

  const handleChangePassword = async () => {
    let hasError = false;
    setErrorCurrent('');
    setErrorNew('');
    setErrorConfirm('');

    if (!currentPassword) {
      setErrorCurrent('Your old password does not matches with the password you provided.');
      hasError = true;
    }
    if (!newPassword) {
      setErrorNew('New password is required');
      hasError = true;
    } else if (newPassword.length < 6) {
      setErrorNew('Password must be at least 6 characters');
      hasError = true;
    }
    if (!confirmPassword) {
      setErrorConfirm('Confirm password is required');
      hasError = true;
    } else if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      setErrorConfirm('Must match with New password');
      hasError = true;
    }
    if (hasError) return;

    try {
      await reauthenticate(currentPassword);
      await auth().currentUser.updatePassword(newPassword);
      Alert.alert('Success', 'Your password has been updated.');
      navigation.goBack();
    } catch (error) {
      if (error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        setErrorCurrent('Wrong Password');
      } else {
        Alert.alert('Error', error.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.bgContainer}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      {/* Centered Title and Back Icon */}
      <View style={styles.headerRowOutCard}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backIcon}>
          <Icon name="chevron-back" size={wp('7%')} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.titleOutCard}>Change Password</Text>
        </View>
        {/* Empty view for symmetry */}
        <View style={{ width: wp('7%') }} />
      </View>
      <View style={styles.flexGrow}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.card}>
            <Text style={styles.subtitle}>Enter your current and new password to update your credentials.</Text>
            <Image source={require('../assets/changepass.png')} style={styles.logo} resizeMode="contain" />
            {/* Current Password */}
            <View style={[styles.inputContainer, errorCurrent ? styles.inputError : null]}>
              <Icon name="lock-closed-outline" size={20} color="#4b6cb7" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Current Password"
                secureTextEntry={secureOld}
                onChangeText={setCurrentPassword}
                placeholderTextColor="#7f89b0"
                value={currentPassword}
              />
              <TouchableOpacity onPress={() => setSecureOld(!secureOld)}>
                <Icon name={secureOld ? 'eye-off' : 'eye'} size={18} color="#4b6cb7" />
              </TouchableOpacity>
            </View>
            {!!errorCurrent && <Text style={styles.errorText}>{errorCurrent}</Text>}
            {/* New Password */}
            <View style={[styles.inputContainer, errorNew ? styles.inputError : null]}>
              <Icon name="lock-closed-outline" size={20} color="#4b6cb7" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="New Password"
                secureTextEntry={secureNew}
                onChangeText={setNewPassword}
                placeholderTextColor="#7f89b0"
                value={newPassword}
              />
              <TouchableOpacity onPress={() => setSecureNew(!secureNew)}>
                <Icon name={secureNew ? 'eye-off' : 'eye'} size={18} color="#4b6cb7" />
              </TouchableOpacity>
            </View>
            {!!errorNew && <Text style={styles.errorText}>{errorNew}</Text>}
            {/* Confirm Password */}
            <View style={[styles.inputContainer, errorConfirm ? styles.inputError : null]}>
              <Icon name="lock-closed-outline" size={20} color="#4b6cb7" style={styles.icon} />
              <TextInput
                style={styles.input}
                placeholder="Confirm Password"
                secureTextEntry={secureConfirm}
                onChangeText={setConfirmPassword}
                placeholderTextColor="#7f89b0"
                value={confirmPassword}
              />
              <TouchableOpacity onPress={() => setSecureConfirm(!secureConfirm)}>
                <Icon name={secureConfirm ? 'eye-off' : 'eye'} size={18} color="#4b6cb7" />
              </TouchableOpacity>
            </View>
            {!!errorConfirm && <Text style={styles.errorText}>{errorConfirm}</Text>}
            <TouchableOpacity style={styles.button} onPress={handleChangePassword}>
              <Text style={styles.buttonText}>Update Password</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  bgContainer: {
    flex: 1,
    backgroundColor: '#CFD8EE',
  },
  flexGrow: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: hp('70%'),
  },
  headerRowOutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Platform.OS === 'android' ? hp('3%') : hp('5%'),
    marginBottom: 0,
    width: '100%',
    paddingHorizontal: wp('4%'),
  },
  backIcon: {
    marginRight: 8,
  },
  titleOutCard: {
    fontSize: wp('6.5%'),
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  card: {
    width: '98%',
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: width * 0.06,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    marginTop: hp('2%'),
    marginBottom: hp('2%'),
  },
  logo: {
    width: width * 0.75,
    height: width * 0.35,
    marginVertical: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#7f89b0',
    borderRadius: 30,
    paddingHorizontal: 15,
    marginVertical: height * 0.012,
    width: '100%',
  },
  inputError: {
    borderColor: '#D32F2F',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 14,
    alignSelf: 'flex-start',
    marginLeft: 10,
    marginTop: -5,
    marginBottom: 5,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    color: '#000',
  },
  button: {
    backgroundColor: '#4b6cb7',
    padding: 15,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 30,
    elevation: 5,
    width: '100%',
    shadowColor: '#4b6cb7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: width * 0.045,
    fontWeight: 'bold',
  },
});

export default ChangePassScreen;