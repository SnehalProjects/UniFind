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
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import LottieView from 'lottie-react-native';

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
        headers: { 'Content-Type': 'multipart/form-data' },
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
  const [imageUri, setImageUri] = useState(null);
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
      } catch (err) {
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
      setImageUri(null);
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
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#cfd8ee' }}>
        <LottieView
          source={require('../assets/Searching-animation.json')}
          autoPlay
          loop
          style={{ width: 150, height: 150 }}
        />
        <Text style={{ marginTop: 18, color: '#374151', fontWeight: 'bold', fontSize: wp('4.5%') }}>Loading your profile...</Text>
      </View>
    );
  }

const ContainerComponent = isEditing ? ScrollView : View;

return (
  <ContainerComponent
    style={styles.container}
    contentContainerStyle={isEditing ? { paddingBottom: hp('8%') } : null}
  >
    <View style={styles.headerRow}>
      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Icon name="chevron-back" size={wp('7%')} color="#374151" />
      </TouchableOpacity>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={styles.title}>Profile Details</Text>
      </View>
      <View style={{ width: wp('7%') }} />
    </View>

    <View style={styles.imageContainer}>
      <TouchableOpacity onPress={isEditing && !imageUri ? pickImage : null} style={styles.imageWrapper}>
        <Image
          source={{
            uri: imageUri || userData.profileImage || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
          }}
          style={styles.profileImage}
        />
        {isEditing && !imageUri && (
          <View style={styles.cameraOverlay}>
            <Icon name="camera-outline" size={wp('7%')} color="#fff" />
          </View>
        )}
      </TouchableOpacity>

      {imageUri && (
        <TouchableOpacity onPress={() => setImageUri(null)} style={styles.removeImageIcon}>
          <Icon name="close-circle" size={wp('6.5%')} color="#67666f" />
        </TouchableOpacity>
      )}
    </View>

    {renderInput('Name:', userData.name, val => handleChange('name', val), isEditing)}
    {renderStatic('Email:', userData.email)}
    {renderInput('Course:', userData.course, val => handleChange('course', val), isEditing)}
    {renderPicker('College:', colleges, selectedCollege, setSelectedCollege, userData.college, isEditing)}
    {renderPicker('Semester:', semesters, selectedSem, setSelectedSem, userData.semester, isEditing)}
    {renderInput('Contact:', userData.contact, val => handleChange('contact', val), isEditing, 'phone-pad')}

    {isEditing ? (
      <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
        <Text style={styles.saveText}>Save Changes</Text>
      </TouchableOpacity>
    ) : (
      <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editBtn}>
        <Text style={styles.editText}>Edit Details</Text>
      </TouchableOpacity>
    )}
  </ContainerComponent>
);
};

const renderInput = (label, value, onChange, editable, keyboardType = 'default') => (
  <View style={styles.infoBox}>
    <Text style={styles.label}>{label}</Text>
    {editable ? (
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
      />
    ) : (
      <Text style={styles.value}>{value}</Text>
    )}
  </View>
);

const renderStatic = (label, value) => (
  <View style={styles.infoBox}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const renderPicker = (label, items, selectedValue, setValue, displayValue, editable) => (
  <View style={styles.infoBox}>
    <Text style={styles.label}>{label}</Text>
    {editable ? (
      <Picker
        selectedValue={selectedValue}
        onValueChange={setValue}
        style={styles.picker}
      >
        <Picker.Item label={`Select ${label}`} value="" />
        {items.map((item, index) => (
          <Picker.Item label={item} value={item} key={index} />
        ))}
      </Picker>
    ) : (
      <Text style={styles.value}>{displayValue}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: wp('5%'),
    backgroundColor: '#cfd8ee',
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  title: {
    fontSize: wp('6.5%'),
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
  },
  imageContainer: { alignItems: 'center', marginBottom: hp('2.5%') },
  imageWrapper: {
    position: 'relative',
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('15%'),
    overflow: 'hidden',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: wp('15%'),
  },
  cameraOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: wp('30%'),
    height: wp('30%'),
    borderRadius: wp('15%'),
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  removeImageIcon: {
    position: 'absolute',
    top: hp('1%'),
    right: wp('30%'),
  },
  infoBox: {
    backgroundColor: '#f5f7fb',
    borderRadius: 10,
    padding: wp('3.5%'),
    marginBottom: hp('1.5%'),
  },
  label: { fontSize: wp('3.5%'), color: '#4b5563', fontWeight: '600' },
  value: { fontSize: wp('4%'), color: '#111827', marginTop: hp('0.5%') },
  input: {
    fontSize: wp('4%'),
    color: '#111827',
    marginTop: hp('0.5%'),
    backgroundColor: '#fff',
    padding: wp('2.5%'),
    borderRadius: 6,
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 6,
    marginTop: hp('0.5%'),
    color: '#111827',
  },
  editBtn: {
    backgroundColor: '#4b6cb7',
    borderRadius: 30,
    padding: wp('3%'),
    marginTop: hp('1%'),
    alignItems: 'center',
  },
  editText: { color: 'white', fontWeight: 'bold', fontSize: wp('4%') },
  saveBtn: {
    backgroundColor: '#4b6cb7',
    borderRadius: 30,
    padding: wp('3%'),
    marginTop: hp('3%'),
    alignItems: 'center',
  },
  saveText: { color: 'white', fontWeight: 'bold', fontSize: wp('4%') },
});

export default ProfileScreen;