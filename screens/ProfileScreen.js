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
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { launchImageLibrary } from 'react-native-image-picker';

const colleges = ['ARP', 'CMPICA', 'CSPIT', 'DEPSTAR', 'IIIM', 'MTIN', 'PDPIAS', 'RPCP'];
const semesters = ['1', '2', '3', '4', '5', '6', '7', '8'];

const IMGBB_API_KEY = 'c0d620761e1a43633b65a8deec759687';

const uploadImageToImgbb = async (imageUri) => {
  const formData = new FormData();
  formData.append('image', {
    uri: imageUri,
    type: 'image/jpeg',
    name: 'upload.jpg',
  });

  try {
    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    const data = await response.json();
    return data?.data?.url;
  } catch (error) {
    console.error('Image upload failed:', error);
    return null;
  }
};


const ProfileScreen = () => {
  const [userData, setUserData] = useState(null);
  const [imageUri, setImageUri] = useState(null); // For local preview
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedCollege, setSelectedCollege] = useState('');
  const [selectedSem, setSelectedSem] = useState('');
  const navigation = useNavigation();

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      const assets = response?.assets;

      if (assets && assets.length > 0 && assets[0]?.uri) {
        setImageUri(assets[0].uri);
      } else {
        console.warn('Image not selected or cancelled.');
      }
    });
  };


  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        Alert.alert('No user', 'Please login again.');
        navigation.navigate('LoginScreen');
        return;
      }

      try {
        const doc = await firestore().collection('users').doc(currentUser.uid).get();
        if (!doc.exists) {
          navigation.navigate('SignUpScreen');
        } else {
          const data = doc.data();
          setUserData(data);
          setSelectedCollege(data.college || '');
          setSelectedSem(data.semester || '');
        }
      } catch  {
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
    setLoading(true);

    let imageUrl = userData.profileImage || null;
    if (imageUri) {
      const uploadedUrl = await uploadImageToImgbb(imageUri);
      if (uploadedUrl) imageUrl = uploadedUrl;
    }

    const updatedData = {
      ...userData,
      college: selectedCollege,
      semester: selectedSem,
      profileImage: imageUrl,
    };

    await firestore().collection('users').doc(uid).update(updatedData);
    setUserData(updatedData);
    setImageUri(null); // reset selected image
    Alert.alert('Profile Updated!');
    setIsEditing(false);
  } catch (err) {
    Alert.alert('Update Failed', err.message);
  } finally {
    setLoading(false);
  }
};


  const handleChange = (field, value) => {
    setUserData({ ...userData, [field]: value });
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
        <TouchableOpacity onPress={isEditing && !imageUri ? pickImage : null} style={styles.imageWrapper}>
          <Image
            source={{
              uri: imageUri || userData.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            }}
            style={styles.profileImage}
          />

          {/* Show camera icon when editing and no image is selected */}
          {isEditing && !imageUri && (
            <View style={styles.cameraOverlay}>
              <Icon name="camera-outline" size={28} color="#fff" />
            </View>
          )}

          {/* Show remove/close icon if new image is selected */}
          
        </TouchableOpacity>
        {imageUri && (
            <TouchableOpacity onPress={() => setImageUri(null)} style={styles.removeImageIcon}>
              <Icon name="close-circle" size={24} color="#67666f" />
            </TouchableOpacity>
          )}
      </View>

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

      <View style={styles.infoBox}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{userData.email}</Text>
      </View>

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
    profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
    imageWrapper: {
    position: 'relative',
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  removeImageIcon: {
      position: 'absolute',
      top: 3,
      right: '32%',
      width: 32,
      height: 32,
      color:"fff"
  },
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
