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
} from 'react-native';
import firestore, { firebase } from '@react-native-firebase/firestore';
import {
  launchCamera,
  launchImageLibrary,
  ImagePickerResponse,
} from 'react-native-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';
import NetInfo from '@react-native-community/netinfo';

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
    return data.data.url;
  } catch (error) {
    console.error('Image upload failed:', error);
    return null;
  }
};

const PostItemScreen = () => {
  const [itemType, setItemType] = useState('Lost');
  const [imageUri, setImageUri] = useState(null);
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [email, setEmail] = useState('');

  const pickImage = () => {
    launchImageLibrary({ mediaType: 'photo' }, response => {
      const assets = response?.assets;

      if (assets && assets.length > 0 && assets[0]?.uri) {
        console.log('Image URI:', assets[0].uri); // ✅ Log this
        setImageUri(assets[0].uri);
      } else {
        console.warn('Image not selected or cancelled.');
      }
    });
  };

  // const uploadImage = async () => {
  //   if (!imageUri) {
  //     console.warn("No image selected");
  //     return null;
  //   }

  //   try {
  //     // Remove file:// prefix on iOS
  //     const filePath = Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;
  //     const filename = filePath.substring(filePath.lastIndexOf('/') + 1);

  //     const ref = storage().ref(`items/${filename}`);
  //     await ref.putFile(filePath); // error occurs here if filePath is wrong

  //     const downloadUrl = await ref.getDownloadURL();
  //     return downloadUrl;
  //   } catch (err) {
  //     console.error('Image upload failed:', err);
  //     throw err;
  //   }
  // };


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

  try {
    // Upload image to imgbb
    const imageUrl = imageUri ? await uploadImageToImgbb(imageUri) : null;

    await firestore().collection('items').add({
      itemType,
      itemName,
      category,
      description,
      location,
      date: date.toISOString(),
      email,
      imageUrl,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
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
  }
};

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Post Item</Text>
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
              <Icon name="close-circle" size={24} color="#fff" />
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity onPress={pickImage}>
            <Text style={styles.imagePickerText}>Add Photo * </Text>
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
        placeholder="e.g., Blue iPhone 13, Black Wallet"
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
        placeholder="Select a category"
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
        placeholder="e.g., Central Park near the fountain"
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
        />
      )}

      <View style={styles.labelRow}>
        <Icon name="mail-outline" size={18} color="#444" />
        <Text style={styles.labelText}>Contact Email *</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholder="user@charusat.edu.in"
        placeholderTextColor="#A3AAB8"
        value={email}
        keyboardType="email-address"
        onChangeText={setEmail}
      />

      <TouchableOpacity style={styles.postButton} onPress={handleSubmit}>
        <Text style={styles.postButtonText}>
          {itemType === 'Lost' ? 'Post Lost Item' : 'Post Found Item'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.footerNote}>
        * Required fields. By posting, you agree to share your contact
        information with interested parties.
      </Text>
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
  },
  postButton: {
    backgroundColor: '#4B6CB7',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  postButtonText: {
    color: '#fff',
    fontWeight: 'bold',
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
});

export default PostItemScreen;