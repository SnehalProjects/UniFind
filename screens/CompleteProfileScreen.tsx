import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';

const colleges = ['ARP', 'CMPICA', 'CSPIT', 'DEPSTAR', 'IIIM', 'MTIN', 'PDPIAS', 'RPCP'];
const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

const CompleteProfileScreen = () => {
  const user = auth().currentUser;
  const navigation = useNavigation();

  const [data, setData] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    course: '',
    contact: '',
    college: '',
    semester: '',
    profileImage: user?.photoURL || '',
  });

  const [uploading, setUploading] = useState(false);

  const handleChange = (field: string, value: string) => {
    setData({ ...data, [field]: value });
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
    if (!uri || !user?.uid) return;

    const reference = storage().ref(`/profileImages/${user.uid}_${Date.now()}`);
    setUploading(true);
    try {
      await reference.putFile(uri);
      const url = await reference.getDownloadURL();
      setData(prev => ({ ...prev, profileImage: url }));
    } catch (err: any) {
      Alert.alert('Upload Failed', err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    const { name, email, course, contact, college, semester, profileImage } = data;

    if (!course || !contact || !college || !semester) {
      Alert.alert('Incomplete Profile', 'Please fill in all the required fields.');
      return;
    }

    try {
      await firestore().collection('users').doc(user?.uid!).set({
        name,
        email,
        course,
        contact,
        college,
        semester,
        profileImage,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });

      Alert.alert('Success', 'Profile completed!');
      navigation.navigate('HomeScreen' as never);
    } catch (err: any) {
      Alert.alert('Error saving profile', err.message);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.title}>Complete Your Profile</Text>

      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={pickImage}>
          <Image
            source={{
              uri: data.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            }}
            style={styles.profileImage}
          />
          {uploading && <ActivityIndicator style={styles.uploadLoader} size="small" />}
        </TouchableOpacity>
        <Text style={styles.uploadHint}>Tap to change profile picture</Text>
      </View>
    <View style={{marginStart:10,marginEnd:10}}>
      <TextInput
        placeholder="Full Name"
        style={styles.input}
        value={data.name}
        editable={false}
      />

      <TextInput
        placeholder="Email"
        style={styles.input}
        value={data.email}
        editable={false}
      />

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={data.college}
          onValueChange={value => handleChange('college', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select College" value="" style={{fontSize:15}} />
          {colleges.map((college, i) => (
            <Picker.Item label={college} value={college} key={i} />
          ))}
        </Picker>
      </View>

      <View style={styles.pickerWrapper}>
        <Picker
          selectedValue={data.semester}
          onValueChange={value => handleChange('semester', value)}
          style={styles.picker}
        >
          <Picker.Item label="Select Semester" value="" style={{fontSize:15}}/>
          {semesters.map((sem, i) => (
            <Picker.Item label={sem} value={sem} key={i} />
          ))}
        </Picker>
      </View>

      <TextInput
        placeholder="Course"
        placeholderTextColor={'#7f89b0'}
        style={styles.input}
        value={data.course}
        onChangeText={value => handleChange('course', value)}
      />

      <TextInput
        placeholder="Contact Number"
        placeholderTextColor={'#7f89b0'}
        style={styles.input}
        value={data.contact}
        onChangeText={value => handleChange('contact', value)}
        keyboardType="phone-pad"
      />

      <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
        <Text style={styles.saveText}>Save Profile</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#cfd8ee', flex: 1 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, fontFamily: 'serif' },
  input: {
    height:45,
    backgroundColor: 'white',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#7f89b0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    shadowColor: '#4f46e5',
    shadowOpacity: 0.1,
    elevation: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#7f89b0',
    borderRadius: 7,
    marginBottom: 20,
    backgroundColor: 'white',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.1,
    elevation: 8,
    height:45,
    justifyContent:'center',
    paddingHorizontal: 2,
    shadowRadius: 8,
  },
  picker: {
    color: 'black',
  },
  saveBtn: {
    backgroundColor: '#4b6cb7',
    padding: 14,
    borderRadius: 30,
    alignItems: 'center',
    marginTop: 10,
  },
  saveText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  uploadHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 6,
  },
  uploadLoader: {
    position: 'absolute',
    top: 40,
    left: 40,
  },
});

export default CompleteProfileScreen;
