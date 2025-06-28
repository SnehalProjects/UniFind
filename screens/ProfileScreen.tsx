import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

const colleges = ['ARP', 'CMPICA', 'CSPIT', 'DEPSTAR', 'IIIM', 'MTIN', 'PDPIAS', 'RPCP'];
const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

const ProfileScreen = () => {
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('No user', 'Please login again.');
        navigation.navigate('LoginScreen' as never);
        return;
      }

      try {
        const doc = await firestore().collection('users').doc(currentUser.uid).get();
        if (!doc.exists) {
          navigation.navigate('SignUpScreen' as never);
        } else {
          const data = doc.data();
          setUserData(data);
          setSelectedCollege(data.college || '');
          setSelectedSem(data.semester || '');
        }
      } catch (err: any) {
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    const uid = auth().currentUser?.uid;
    if (!uid) return;

    try {
      const updatedData = {
        ...userData,
        college: selectedCollege,
        semester: selectedSem,
      };

      await firestore().collection('users').doc(uid).update(updatedData);
      setUserData(updatedData);
      Alert.alert('Profile Updated!');
      setIsEditing(false);
    } catch (err: any) {
      Alert.alert('Update Failed', err.message);
    }
  };

  const handleChange = (field: string, value: string) => {
    setUserData({ ...userData, [field]: value });
  };

  const pickImage = async () => {
    const result = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
    });

    if (result.didCancel || !result.assets || result.assets.length === 0) return;

    const image = result.assets[0];
    const uri = image.uri || (image as any).fileCopyUri;
    if (!uri) return;

    const uid = auth().currentUser?.uid;
    if (!uid) return;

    const reference = storage().ref(`/profileImages/${uid}_${Date.now()}`);
    setUploading(true);
    try {
      await reference.putFile(uri);
      const url = await reference.getDownloadURL();
      setUserData(prev => ({ ...prev, profileImage: url }));
      await firestore().collection('users').doc(uid).update({ profileImage: url });
      Alert.alert('Success', 'Profile picture updated!');
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading || !userData) {
    return <ActivityIndicator size="large" style={{ marginTop: 100 }} />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Profile Details</Text>
      </View>

      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{
              uri:
                userData.profileImage ||
                'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            }}
            style={styles.profileImage}
          />
          {uploading && <ActivityIndicator style={styles.uploadLoader} size="small" color="#000" />}
        </TouchableOpacity>
        {isEditing && <Text style={styles.uploadHint}>Tap image to change</Text>}
      </View>

      {/* Name */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>Name:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={userData.name}
            onChangeText={text => handleChange('name', text)}
          />
        ) : (
          <Text style={styles.value}>{userData.name}</Text>
        )}
      </View>

      {/* Email */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{userData.email}</Text>
      </View>

      {/* Course */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>Course:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={userData.course}
            onChangeText={text => handleChange('course', text)}
          />
        ) : (
          <Text style={styles.value}>{userData.course}</Text>
        )}
      </View>

      {/* College (Picker) */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>College:</Text>
        {isEditing ? (
          <Picker
            selectedValue={selectedCollege}
            onValueChange={itemValue => setSelectedCollege(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Select College" value="" />
            {colleges.map((college, index) => (
              <Picker.Item label={college} value={college} key={index} />
            ))}
          </Picker>
        ) : (
          <Text style={styles.value}>{userData.college}</Text>
        )}
      </View>

      {/* Semester (Picker) */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>Semester:</Text>
        {isEditing ? (
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
        ) : (
          <Text style={styles.value}>{userData.semester}</Text>
        )}
      </View>

      {/* Contact */}
      <View style={styles.infoBox}>
        <Text style={styles.label}>Contact:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={userData.contact}
            onChangeText={text => handleChange('contact', text)}
            keyboardType="phone-pad"
          />
        ) : (
          <Text style={styles.value}>{userData.contact}</Text>
        )}
      </View>

      {isEditing ? (
        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editBtn}>
          <Text style={styles.editText}>Edit Details</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 24, backgroundColor: '#cfd8ee', flex: 1 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 30 },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 10,
    fontFamily: 'serif',
  },
  imageContainer: { alignItems: 'center', marginBottom: 20 },
  profileImage: { width: 100, height: 100, borderRadius: 50, marginBottom: 10 },
  uploadHint: { color: '#6b7280', fontSize: 12 },
  uploadLoader: { position: 'absolute', top: 40, left: 40 },
  infoBox: {
    backgroundColor: '#f5f7fb',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
  },
  label: { fontSize: 14, color: '#4b5563', fontWeight: '600' },
  value: { fontSize: 16, color: '#111827', marginTop: 4 },
  input: {
    fontSize: 16,
    color: '#111827',
    marginTop: 4,
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 6,
    marginTop: 4,
    color: '#111827',
  },
  editBtn: {
    backgroundColor: '#4b6cb7',
    borderRadius: 30,
    padding: 12,
    marginTop: 30,
    alignItems: 'center',
  },
  editText: { color: 'white', fontWeight: 'bold' },
  saveBtn: {
    backgroundColor: '#4b6cb7',
    borderRadius: 30,
    padding: 12,
    marginTop: 30,
    alignItems: 'center',
  },
  saveText: { color: 'white', fontWeight: 'bold' },
});

export default ProfileScreen;
