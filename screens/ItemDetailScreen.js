import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  TouchableOpacity,
  Modal,
  Share,
  ActivityIndicator,
  ImageBackground,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import Dialog from 'react-native-dialog';
import { useNavigation } from '@react-navigation/native';

const ItemDetailScreen = ({ route }) => {
  const { item, postId } = route.params;
  const [itemData, setItemData] = useState(item);
  const [posterData, setPosterData] = useState(null);
  const [status, setStatus] = useState(item?.status || 'Active');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [claimEmail, setClaimEmail] = useState('');
  const currentUserEmail = auth().currentUser?.email;
  const [claimedUserData, setClaimedUserData] = useState(null);
  const navigation = useNavigation();
  const [showFullImage, setShowFullImage] = useState(false);
  const [loading, setLoading] = useState(!item);

  // Fetch item data if accessed via deep link
  useEffect(() => {
    const fetchItemData = async () => {
      if (postId && !item) {
        try {
          setLoading(true);
          const doc = await firestore().collection('items').doc(postId).get();
          if (doc.exists) {
            const data = { id: doc.id, ...doc.data() };
            setItemData(data);
            setStatus(data.status || 'Active');
          } else {
            Alert.alert('Error', 'Post not found');
            navigation.goBack();
          }
        } catch (error) {
          console.error('Error fetching item:', error);
          Alert.alert('Error', 'Failed to load post');
          navigation.goBack();
        } finally {
          setLoading(false);
        }
      }
    };

    fetchItemData();
  }, [postId, item]);

  useEffect(() => {
    const fetchPoster = async () => {
      if (!itemData?.email) return;
      try {
        const snapshot = await firestore()
          .collection('users')
          .where('email', '==', itemData.email)
          .get();

        if (!snapshot.empty) {
          setPosterData(snapshot.docs[0].data());
        }
      } catch (err) {
        console.log('Error fetching poster info:', err);
      }
    };

    fetchPoster();
  }, [itemData?.email]);

  useEffect(() => {
    const fetchClaimedUser = async () => {
      if (!itemData?.claimedBy) return;
      try {
        const snapshot = await firestore()
          .collection('users')
          .where('email', '==', itemData.claimedBy)
          .get();

        if (!snapshot.empty) {
          setClaimedUserData(snapshot.docs[0].data());
        }
      } catch (err) {
        console.log('Error fetching claimed/returned user info:', err);
      }
    };

    fetchClaimedUser();
  }, [itemData?.claimedBy]);

  const handleConfirmClaim = async () => {
    if (!claimEmail || !claimEmail.includes('@')) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    try {
      // Check if this email exists in users
      const snapshot = await firestore()
        .collection('users')
        .where('email', '==', claimEmail.trim())
        .get();

      if (snapshot.empty) {
        Alert.alert('User Not Found', 'No user with this email exists.');
        return;
      }

      // Update status in Firestore
      await firestore()
        .collection('items') // or your collection name
        .doc(itemData.id)
        .update({
          status: itemData.itemType === 'Lost' ? 'Claimed' : 'Returned',
          claimedBy: claimEmail.trim(),
        });

      // Update local state
      setStatus(itemData.itemType === 'Lost' ? 'Claimed' : 'Returned');
      setDialogVisible(false);
      Alert.alert('Success', 'Status updated successfully!');
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  const handleSharePost = async () => {
    try {
      // Create a shareable web link for the post
      // This will be recognized as clickable by WhatsApp and other messaging apps
      const postLink = `https://campusfind.app/post/${itemData.id}`;
      
      // Fallback to custom scheme for direct app opening
      const appDeepLink = `campusfind://post/${itemData.id}`;

      const shareMessage = `🔍 ${itemData.itemType} Item: ${itemData.itemName}\n\nDescription: ${itemData.description || 'No description provided'}\nLocation: ${itemData.location || 'Unknown location'}\nCategory: ${itemData.category || 'Not specified'}\nPosted by: ${itemData.email}\n\nCheck out this post on CampusFind!\n${postLink}\n\nImage: ${itemData.imageUrl ? itemData.imageUrl : 'No image available'}`;

      await Share.share({
        message: shareMessage,
        title: `${itemData.itemType} Item: ${itemData.itemName}`,
        url: itemData.imageUrl || postLink, // Prefer image URL if available
      });
    } catch (error) {
      console.error('Error sharing post:', error);
    }
  };

  return (
    <>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4B6CB7" />
          <Text style={styles.loadingText}>Loading post...</Text>
        </View>
      ) : (
        <> 
          <Modal
            visible={showFullImage}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowFullImage(false)}
          >
            <ImageBackground
              source={{ uri: itemData.imageUrl }}
              style={styles.fullImageContainer}
              blurRadius={20}
              resizeMode="cover"
            >
              <View style={styles.backgroundOverlay} />
              <Image
                source={{ uri: itemData.imageUrl }}
                style={styles.fullImage}
                resizeMode="contain"
              />
              <TouchableOpacity
                style={styles.closeIcon}
                onPress={() => setShowFullImage(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={38} color="#fff" style={{ textShadowColor: '#000', textShadowRadius: 6 }} />
              </TouchableOpacity>
            </ImageBackground>
          </Modal>
          <ScrollView style={styles.container}>
            <View style={styles.imageContainer}>
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={{ position: 'absolute', top: 18, left: 16, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: 2 }}
              >
                <Ionicons name="chevron-back" size={28} color="#374151" />
              </TouchableOpacity>
              {itemData.imageUrl ? (
                <TouchableOpacity onPress={() => setShowFullImage(true)} activeOpacity={0.8}>
                  <Image source={{ uri: itemData.imageUrl }} style={styles.image} />
                </TouchableOpacity>
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.noImageText}>No Image Available</Text>
                </View>
              )}
              <View
                style={[ 
                  styles.badge,
                  itemData.itemType === 'Lost' ? styles.lostBadge : styles.foundBadge,
                ]}
              >
                <Text style={styles.badgeText}>{itemData.itemType?.toUpperCase()}</Text>
              </View>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.itemNameRow}>
                <Text style={styles.itemName}>{itemData.itemName}</Text>
                <TouchableOpacity
                  onPress={handleSharePost}
                  style={styles.shareButton}
                  activeOpacity={0.7}
                >
                  <Ionicons name="share-social" size={24} color="#4B6CB7" />
                </TouchableOpacity>
              </View>

              <View style={styles.chipsRow}>
                {itemData.createdAt?.toDate && (
                  <View style={styles.chip}>
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color="#555"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.dateText}>
                      {itemData.createdAt.toDate().toLocaleDateString()}
                    </Text>
                  </View>
                )}

                {itemData.location && (
                  <View style={styles.chip}>
                    <Ionicons
                      name="location-outline"
                      size={16}
                      color="#555"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.chipText}>{itemData.location}</Text>
                  </View>
                )}

                {itemData.category && (
                  <View style={styles.chip}>
                    <Ionicons
                      name="pricetag-outline"
                      size={16}
                      color="#555"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.chipText}>
                      {itemData.category.charAt(0).toUpperCase() + itemData.category.slice(1)}
                    </Text>
                  </View>
                )}
                <View style={styles.chipsRow}>
                  <View
                    style={[
                      styles.chip,
                      status === 'Active'
                        ? styles.activeStatus
                        : status === 'Claimed'
                        ? styles.claimedStatus
                        : styles.returnedStatus,
                    ]}
                  >
                    <Ionicons
                      name={
                        status === 'Active'
                          ? 'flash-outline'
                          : status === 'Claimed'
                          ? 'checkmark-done-outline'
                          : 'return-up-back-outline'
                      }
                      size={16}
                      color="#555"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.chipText}>{status}</Text>
                  </View>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Description</Text>
              <View style={styles.descriptionBox}>
                <Text style={styles.descriptionText}>
                  {itemData.description || 'No description provided.'}
                </Text>
              </View>

              <Text style={styles.sectionTitle}>Posted By</Text>
              <View style={styles.posterBox}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>
                    {posterData?.name?.charAt(0) || itemData.email?.charAt(0) || 'U'}
                  </Text>
                </View>
                <View style={styles.posterInfo}>
                  <Text style={styles.posterName}>
                    {posterData?.name || 'Unknown User'}
                  </Text>
                  <Text style={styles.posterEmail}>{itemData.email}</Text>
                </View>
              </View>

              {itemData.claimedBy && claimedUserData && (
                <>
                  <Text style={styles.sectionTitle}>
                    {itemData.itemType === 'Lost' ? 'Claimed By' : 'Returned To'}
                  </Text>
                  <View style={styles.posterBox}>
                    <View style={styles.avatarCircle}>
                      <Text style={styles.avatarLetter}>
                        {claimedUserData?.name?.charAt(0) ||
                          itemData.claimedBy?.charAt(0) ||
                          'U'}
                      </Text>
                    </View>
                    <View style={styles.posterInfo}>
                      <Text style={styles.posterName}>
                        {claimedUserData?.name || 'Unknown User'}
                      </Text>
                      <Text style={styles.posterEmail}>{itemData.claimedBy}</Text>
                    </View>
                  </View>
                </>
              )}

              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => {
                  if (itemData.email) {
                    Linking.openURL(
                      `mailto:${itemData.email}?subject=Regarding your ${itemData.itemType} item&body=Hello, I saw your post about "${itemData.itemName}".`,
                    );
                  } else {
                    Alert.alert('No email found for this user.');
                  }
                }}
              >
                <Text style={styles.contactButtonText}>Contact Poster</Text>
              </TouchableOpacity>
              {currentUserEmail === itemData.email && status === 'Active' && (
                <TouchableOpacity
                  style={[
                    styles.contactButton,
                    { backgroundColor: '#059669', marginTop: 12 },
                  ]}
                  onPress={() => setDialogVisible(true)}
                >
                  <Text style={styles.contactButtonText}>
                    {itemData.itemType === 'Lost'
                      ? 'Mark as Claimed'
                      : 'Mark as Returned'}
                  </Text>
                </TouchableOpacity>
              )}
              <Dialog.Container visible={dialogVisible}>
                <Dialog.Title>Enter Email</Dialog.Title>
                <Dialog.Description>
                  Please enter the email of the person you{' '}
                  {itemData.itemType === 'Lost'
                    ? 'claimed the item from'
                    : 'returned the item to'}
                  .
                </Dialog.Description>
                <Dialog.Input
                  placeholder="user@charusat.edu.in"
                  value={claimEmail}
                  onChangeText={setClaimEmail}
                />
                <Dialog.Button
                  label="Cancel"
                  onPress={() => setDialogVisible(false)}
                />
                <Dialog.Button label="Confirm" onPress={handleConfirmClaim} />
              </Dialog.Container>
            </View>
          </ScrollView>
        </>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF0F8' },
  imageContainer: {
    position: 'relative',
    width: '100%',
    height: 310,
    backgroundColor: '#ccc',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#555',
    fontStyle: 'italic',
  },
  badge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  lostBadge: { backgroundColor: '#F9DDA4' },
  foundBadge: { backgroundColor: '#A4F9A6' },
  badgeText: {
    color: '#333',
    fontWeight: 'bold',
    fontSize: 12,
  },
  detailsContainer: {
    padding: 20,
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -14,
    elevation: 4,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
    flex: 1,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  chip: {
    backgroundColor: '#E6EAF0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 13,
    color: '#444',
  },
  sectionTitle: {
    marginTop: 20,
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
  },
  descriptionBox: {
    backgroundColor: '#f8f9fb',
    padding: 14,
    borderRadius: 10,
    marginTop: 8,
    elevation: 0.5,
  },
  descriptionText: {
    color: '#444',
    fontSize: 15,
  },
  posterBox: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    elevation: 1,
  },
  avatarCircle: {
    backgroundColor: '#4A90E2',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarLetter: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  posterInfo: {
    marginLeft: 12,
  },
  posterName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  posterEmail: {
    fontSize: 14,
    color: '#555',
  },
  contactButton: {
    marginTop: 24,
    backgroundColor: '#4B6CB7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  contactButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  statusLabel: {
    fontWeight: '600',
    marginRight: 8,
    fontSize: 16,
    color: '#333',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  activeStatus: {
    color: '#4B6CB7',
  },
  claimedStatus: {
    color: '#D97706',
  },
  returnedStatus: {
    color: '#059669',
  },
  fullImageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImage: {
    width: '95%',
    height: '80%',
    borderRadius: 12,
    backgroundColor: '#222',
  },
  closeIcon: {
    position: 'absolute',
    top: 40,
    right: 24,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
    padding: 2,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#EAF0F8',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4B6CB7',
    fontWeight: '500',
  },
  shareButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#F0F4FF',
    marginLeft: 12,
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
});

export default ItemDetailScreen;
