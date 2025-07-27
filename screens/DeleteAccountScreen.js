import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  ActivityIndicator,
  Platform,
  SafeAreaView,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const DeleteAccountScreen = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = () => {
    setModalVisible(true);
    setPassword('');
    setError('');
  };

  const handleConfirmDelete = async () => {
    setError('');
    setLoading(true);
    const user = auth().currentUser;
    if (!user || !user.email) {
      setLoading(false);
      setError('User not found. Please login again.');
      return;
    }
    const credential = auth.EmailAuthProvider.credential(user.email, password);
    try {
      await user.reauthenticateWithCredential(credential);
      await user.delete();
      setLoading(false);
      setModalVisible(false);
      Toast.show({
        type: 'success',
        text1: 'Account deleted successfully',
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'LoginScreen' }],
      });
    } catch (error) {
      setLoading(false);
      if (error.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else if (error.code === 'auth/requires-recent-login') {
        setError('Please sign in again and try deleting your account.');
        await auth().signOut();
        setModalVisible(false);
        navigation.replace('LoginScreen');
      } else {
        setError(error.message);
      }
    }
  };

  return (
    <SafeAreaView style={styles.bgContainer}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Icon name="chevron-back" size={28} color="#374151" />
        </TouchableOpacity>
        <Text style={styles.title}>Delete account</Text>
        <View style={{ width: 28 }} />
      </View>
      {/* Main Content */}
      <View style={styles.content}>
        <Text style={styles.bigTitle}>Are you sure you want to delete your account?</Text>
        <Text style={styles.paragraph}>
          Once you delete your account, it cannot be undone. All your data will be permanently erased from this app includes your profile information, preferences, saved content, and any activity history.
        </Text>
        <Text style={styles.paragraph}>
          We're sad to see you go, but we understand that sometimes it's necessary. Please take a moment to consider the consequences before proceeding.
        </Text>
      </View>
      {/* Bottom Buttons */}
      <View style={styles.bottomBtns}>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteAccount}>
          <Text style={styles.deleteText}>Delete account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.goBackButton} onPress={() => navigation.goBack()}>
          <Text style={styles.goBackText}>Go back</Text>
        </TouchableOpacity>
      </View>
      {/* Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirm Deletion</Text>
            <Text style={styles.modalSubtitle}>Enter your password to confirm:</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              editable={!loading}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#eee' }]}
                onPress={() => setModalVisible(false)}
                disabled={loading}
              >
                <Text style={{ color: '#222', fontWeight: 'bold' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: '#B00020' }]}
                onPress={handleConfirmDelete}
                disabled={loading || !password}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default DeleteAccountScreen;

const styles = StyleSheet.create({
  bgContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: width * 0.065, // ~24-28 depending on screen
    fontWeight: 'bold',
    color: '#374151',
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
  headerTitle: {
    fontSize: width * 0.05,
    fontWeight: 'bold',
    color: '#222',
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
    marginBottom: 12,
    lineHeight: 22,
  },
  bottomBtns: {
    paddingHorizontal: width * 0.07,
    paddingBottom: 30,
    backgroundColor: '#fff',
  },
  deleteButton: {
    backgroundColor: '#4b6cb7',
    borderRadius: 22,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  deleteText: {
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: width * 0.85,
    alignItems: 'center',
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#B00020',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 15,
    color: '#40304D',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    fontSize: 16,
    color: '#000',
  },
  errorText: {
    color: '#E53935',
    marginBottom: 8,
    fontSize: 14,
    alignSelf: 'flex-start',
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
  },
});
