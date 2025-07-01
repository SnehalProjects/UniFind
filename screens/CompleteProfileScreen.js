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
import { launchImageLibrary } from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

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

const CompleteProfileScreen = () => {
  
  const user = auth().currentUser;
  const navigation = useNavigation();
  const [imageUri, setImageUri] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleChange = (field, value) => {
    setData({ ...data, [field]: value });
  };

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

  const handleSave = async () => {
    const { name, email, course, contact, college, semester } = data;
    const uid = auth().currentUser?.uid;

    if (!course || !contact || !college || !semester) {
      Alert.alert('Incomplete Profile', 'Please fill in all the required fields.');
      return;
    }

    if (!uid) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    try {
      setUploading(true);

      let imageUrl = data.profileImage || null;

      if (imageUri) {
        const uploadedUrl = await uploadImageToImgbb(imageUri);
        if (uploadedUrl) imageUrl = uploadedUrl;
      }

      const updatedData = {
        name,
        email,
        course,
        contact,
        college,
        semester,
        profileImage: imageUrl,
        createdAt: firestore.FieldValue.serverTimestamp(),
      };

      await firestore().collection('users').doc(uid).set(updatedData);

      Alert.alert('Success', 'Profile completed!');
      navigation.navigate('HomeScreen');
    } catch (err) {
      Alert.alert('Error saving profile', err.message);
    } finally {
      setUploading(false);
    }
  };



  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      <Text style={styles.title}>Complete Profile Details</Text>
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={pickImage} style={styles.imageWrapper}>
          <Image
            source={{
              uri:
                imageUri ||
                data.profileImage ||
                'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            }}
            style={styles.profileImage}
          />

          {/* Show camera icon when no imageUri is selected */}
          {!imageUri && (
            <View style={styles.cameraOverlay}>
              <Icon name="camera-outline" size={28} color="#fff" />
            </View>
          )}
        </TouchableOpacity>

        {/* Show close button when imageUri is selected */}
        {imageUri && (
          <TouchableOpacity onPress={() => setImageUri(null)} style={styles.removeImageIcon}>
            <Icon name="close-circle" size={24} color="#67666f" />
          </TouchableOpacity>
        )}
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
          style={[
            styles.picker,
            !data.college && styles.placeholderColor
          ]}
          dropdownIconColor="#7f89b0"
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
          style={[
            styles.picker,
            !data.semester && styles.placeholderColor 
          ]}
          dropdownIconColor="#7f89b0"
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
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 40,
    marginTop:30, 
    color:'#374151'
  },
  input: {
    height:45,
    backgroundColor: 'white',
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#7f89b0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 20,
    shadowColor: '#6684c4',
    shadowOpacity: 0.1,
    elevation: 8,
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: '#7f89b0',
    borderRadius: 7,
    marginBottom: 20,
    backgroundColor: 'white',
    shadowColor: '#6684c4',
    shadowOpacity: 0.1,
    elevation: 8,
    height:45,
    justifyContent:'center',
    paddingHorizontal: 2,
    shadowRadius: 8,
  },
  picker: {
    color: 'black', // normal selected item color
  },

  placeholderColor: {
    color: '#7f89b0', // color for placeholder
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
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageIcon: {
    position: 'absolute',
    top: 3,
    right: '32%',
    width: 32,
    height: 32,
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
