import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  Modal,
  PermissionsAndroid,
} from 'react-native';
import { getApp } from '@react-native-firebase/app';
import { getFirestore, collection, doc, addDoc, setDoc, updateDoc, serverTimestamp, Timestamp } from '@react-native-firebase/firestore';
import { getAuth } from '@react-native-firebase/auth';
import {
  launchCamera,
  launchImageLibrary,
} from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';
import { useNavigation } from '@react-navigation/native';


const IMGBB_API_KEY = '0c8654c65866f2d583a13f9cd54da770'; 

// Request camera permission for Android
const requestCameraPermission = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA,
        {
          title: 'Camera Permission',
          message: 'This app needs access to your camera to take photos.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.error('Permission request error:', err);
      return false;
    }
  }
  return true; // iOS handles permissions automatically
};

const uploadImageToImgbb = async (base64data) => {
  try {
    const formData = new FormData();
    formData.append('image', base64data);

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const data = await response.json();
    if (!data.success) {
      console.error('ImgBB upload error:', data);
      return null;
    }

    return data.data.url;
  } catch (error) {
    console.error('Image upload failed:', error);
    return null;
  }
};




const PostItemScreen = () => {
  const navigation = useNavigation();
  const app = getApp();
  const firestore = getFirestore(app);
  const auth = getAuth(app);
  const [itemType, setItemType] = useState('Lost');
  const [imageUri, setImageUri] = useState(null);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [email, setEmail] = useState('');
  const [showImagePickerModal, setShowImagePickerModal] = useState(false);
  const [imageBase64, setImageBase64] = useState(null);

  useState(() => {
  const fetchUserEmail = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    try {
      const doc = await doc(collection(firestore, 'users'), currentUser.uid).get();
      if (doc.exists) {
        const userData = doc.data();
        setEmail(userData.email || '');
      }
    } catch (error) {
      console.error('Failed to fetch user email:', error);
    }
  };

  fetchUserEmail();
}, []);

  const pickImageFromGallery = () => {
    setShowImagePickerModal(false);
    launchImageLibrary({ mediaType: 'photo', includeBase64: true}, response => {
      const assets = response?.assets;

      if (assets && assets.length > 0) {
        setImageUri(assets[0].uri);
        setImageBase64(assets[0].base64);
      } else {
        console.warn('Image not selected or cancelled.');
      }
    });
  };

  const takePhotoWithCamera = async () => {
    setShowImagePickerModal(false);
    
    // Request camera permission first
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) {
      return;
    }

    // Launch camera with basic configuration
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      saveToPhotos: false,
    };

    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled camera');
        return;
      }
      
      if (response.error) {
        console.error('Camera error:', response.error);
        Alert.alert('Camera Error', 'Failed to open camera. Please try again.');
        return;
      }

      const assets = response?.assets;
      if (assets && assets.length > 0 && assets[0]?.uri) {
        console.log('Camera Image URI:', assets[0].uri);
        setImageUri(assets[0].uri);
      } else {
        console.warn('No image captured from camera.');
      }
    });
  };

  const showImagePickerOptions = () => {
    setShowImagePickerModal(true);
  };

  const handleSubmit = async () => {
    const netState = await NetInfo.fetch();

    if (!netState.isConnected || !netState.isInternetReachable) {
      Toast.show({
        type: 'error',
        text1: 'No internet connection',
        text2: 'Please connect to the internet to post the item.',
        position: 'bottom',
      });
      return;
    }

    // Check required fields
    if (!itemName.trim() || !description.trim() || !location.trim() || !email.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Please fill in all required (*) fields',
        position: 'bottom',
      });
      return;
    }

    // Validate CHARUSAT email
    if (!email.endsWith('@charusat.edu.in')) {
      Toast.show({
        type: 'error',
        text1: 'Please use your CHARUSAT email ID',
        position: 'bottom',
      });
      return;
    }

    setIsPosting(true);
    try {
      // Upload image to imgbb
      const imageUrl = imageUri ? await uploadImageToImgbb(imageBase64) : null;

      await addDoc(collection(firestore, 'items'), {
        itemType,
        itemName,
        category,
        description,
        location,
        date: date.toISOString(),
        email: email.trim().toLowerCase(),
        imageUrl,
        createdAt: serverTimestamp(),
        status: 'Active'
      });

      Toast.show({
        type: 'success',
        text1: `${itemType} item posted successfully!`,
        position: 'bottom',
      });

      // ✅ Clear form after successful post
      setItemName('');
      setCategory('');
      setDescription('');
      setLocation('');
      setEmail('');
      setImageUri(null);
      setDate(new Date());
      setItemType('Lost');
    } catch (error) {
      console.error(error);
      Toast.show({
        type: 'error',
        text1: 'Failed to post item',
        position: 'bottom',
      });
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 5 }}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 8 }}>
          <Icon name="chevron-back" size={28} color="#4B6CB7" />
        </TouchableOpacity>
        <Text style={styles.title}>Post Item</Text>
      </View>
      <Text style={styles.subtitle}>Help reunite items with their owners</Text>

      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            itemType === 'Lost' && styles.activeToggle,
          ]}
          onPress={() => setItemType('Lost')}
        >
          <Text
            style={
              itemType === 'Lost' ? styles.activeText : styles.inactiveText
            }
          >
            Lost Item
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.toggleButton,
            itemType === 'Found' && styles.activeToggle,
          ]}
          onPress={() => setItemType('Found')}
        >
          <Text
            style={
              itemType === 'Found' ? styles.activeText : styles.inactiveText
            }
          >
            Found Item
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imagePicker}>
        {imageUri ? (
          <>
            <Image source={{ uri: imageUri }} style={styles.image} />
            <TouchableOpacity
              onPress={() => setImageUri(null)}
              style={styles.removeImageIcon}
            >
              <Icon name="close-circle" size={24} color="#999" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={showImagePickerOptions}>
            <Text style={styles.imagePickerText}>Add Photo* </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Item Name */}
      <View style={styles.labelRow}>
        <Icon name="pricetag-outline" size={18} color="#444" />
        <Text style={styles.labelText}>Item Name *</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="e.g., Blue Bottle, Black Wallet"
        placeholderTextColor="#A3AAB8"
        value={itemName}
        onChangeText={setItemName}
      />

      {/* Category */}
      <View style={styles.labelRow}>
        <Icon name="list-outline" size={18} color="#444" />
        <Text style={styles.labelText}>Category</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="e.g., Electronic"
        placeholderTextColor="#A3AAB8"
        value={category}
        onChangeText={setCategory}
      />

      {/* Description */}
      <View style={styles.labelRow}>
        <Icon name="document-text-outline" size={18} color="#444" />
        <Text style={styles.labelText}>Description *</Text>
      </View>
      <TextInput
        style={[styles.input, { height: 80 }]}
        multiline
        placeholderTextColor="#A3AAB8"
        placeholder="Describe the item in detail (color, size, brand, condition, etc.)"
        value={description}
        onChangeText={setDescription}
      />

      {/* Location */}
      <View style={styles.labelRow}>
        <Icon name="location-outline" size={18} color="#444" />
        <Text style={styles.labelText}>
          {itemType === 'Lost'
            ? 'Where did you lose it?'
            : 'Where did you find it?'}{' '}
          *
        </Text>
      </View>
      <TextInput
        style={styles.input}
        placeholderTextColor="#A3AAB8"
        placeholder="e.g., Library building, Main gate"
        value={location}
        onChangeText={setLocation}
      />

      <View style={styles.labelRow}>
        <Icon name="calendar-outline" size={18} color="#444" />
        <Text style={styles.labelText}>
          {itemType === 'Lost'
            ? 'When did you lose it?'
            : 'When did you find it?'}{' '}
          *
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => setShowDatePicker(true)}
        style={styles.input}
      >
        <Text>{date.toDateString()}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display="default"
          onChange={(event, selectedDate) => {
            setShowDatePicker(Platform.OS === 'ios');
            if (selectedDate) setDate(selectedDate);
          }}
          maximumDate={new Date()}
        />
      )}

      <View style={styles.labelRow}>
        <Icon name="mail-outline" size={18} color="#444" />
        <Text style={styles.labelText}>Contact Email *</Text>
      </View>
      <TextInput
        style={[styles.input, { backgroundColor: '#efefef',color: '#444' }]}
        value={email}
        editable={false} // Disable editing
        selectTextOnFocus={false}
        placeholder="Email loading..."
        placeholderTextColor="#A3AAB8"
      />

      <TouchableOpacity
        style={[
          styles.postButton,
          isPosting && styles.postingButton,
        ]}
        onPress={handleSubmit}
        disabled={isPosting}
      >
        <Text style={[
          styles.postButtonText,
          isPosting && styles.postingButtonText
        ]}>
          {isPosting
            ? 'Posting...'
            : itemType === 'Lost'
              ? 'Post Lost Item'
              : 'Post Found Item'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        * Required fields. By posting, you agree to share your contact
        information with interested parties.
      </Text>

      {/* Image Picker Modal */}
      <Modal
        visible={showImagePickerModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowImagePickerModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choose Photo</Text>
              <TouchableOpacity
                onPress={() => setShowImagePickerModal(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={pickImageFromGallery}
            >
              <Icon name="images-outline" size={24} color="#4B6CB7" />
              <Text style={styles.modalOptionText}>Choose from Gallery</Text>
              <Icon name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.modalOption}
              onPress={takePhotoWithCamera}
            >
              <Icon name="camera-outline" size={24} color="#4B6CB7" />
              <Text style={styles.modalOptionText}>Take Photo with Camera</Text>
              <Icon name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#CFD8EE',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 5,
    color: '#444C5E',
  },
  subtitle: {
    fontSize: 14,
    color: '#6A6F7C',
    marginBottom: 15,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    backgroundColor: '#f3efff',
    borderRadius: 10,
  },
  toggleButton: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderRadius: 10,
  },
  activeToggle: {
    backgroundColor: '#4B6CB7',
  },
  activeText: {
    color: '#fff',
    fontWeight: '600',
  },
  inactiveText: {
    color: '#444C5E',
  },
  imagePicker: {
    height: 160,
    backgroundColor: '#fff',
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  imagePickerText: {
    color: '#4B6CB7',
    fontWeight: '600',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderColor: '#B0B9CE',
    borderWidth: 1, 
    color: '#000',
  },
  postButton: {
    backgroundColor: '#4B6CB7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  postingButton: {
    backgroundColor: '#A3AAB8', // gray or any processing color
    opacity: 0.7,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  postingButtonText: {
    color: '#fff', // or a lighter color if you want
  },
  footerNote: {
    fontSize: 12,
    color: '#555',
    marginTop: 10,
    textAlign: 'center',
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    marginTop: 10,
  },
  labelText: {
    marginLeft: 6,
    fontWeight: '600',
    color: '#333',
  },
  removeImageIcon: {
    position: 'absolute',
    top: 6,
    right: 6,
    // backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    width: '80%',
    maxWidth: 350,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#f8f9fa',
  },
  modalOptionText: {
    flex: 1,
    marginLeft: 15,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default PostItemScreen;
