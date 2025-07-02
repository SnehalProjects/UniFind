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
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import Ionicons from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import Dialog from 'react-native-dialog';
import { useNavigation } from '@react-navigation/native';

const ItemDetailScreen = ({ route }) => {
  const { item } = route.params;
  const [posterData, setPosterData] = useState(null);
  const [status, setStatus] = useState(item.status || 'Active');
  const [dialogVisible, setDialogVisible] = useState(false);
  const [claimEmail, setClaimEmail] = useState('');
  const currentUserEmail = auth().currentUser?.email;
  const [claimedUserData, setClaimedUserData] = useState(null);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchPoster = async () => {
      try {
        const snapshot = await firestore()
          .collection('users')
          .where('email', '==', item.email)
          .get();

        if (!snapshot.empty) {
          setPosterData(snapshot.docs[0].data());
        }
      } catch (err) {
        console.log('Error fetching poster info:', err);
      }
    };

    fetchPoster();
  }, [item.email]);
  useEffect(() => {
    const fetchClaimedUser = async () => {
      if (!item.claimedBy) return;
      try {
        const snapshot = await firestore()
          .collection('users')
          .where('email', '==', item.claimedBy)
          .get();

        if (!snapshot.empty) {
          setClaimedUserData(snapshot.docs[0].data());
        }
      } catch (err) {
        console.log('Error fetching claimed/returned user info:', err);
      }
    };

    fetchClaimedUser();
  }, [item.claimedBy]);

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
        .doc(item.id)
        .update({
          status: item.itemType === 'Lost' ? 'Claimed' : 'Returned',
          claimedBy: claimEmail.trim(),
        });

      // Update local state
      setStatus(item.itemType === 'Lost' ? 'Claimed' : 'Returned');
      setDialogVisible(false);
      Alert.alert('Success', 'Status updated successfully!');
    } catch (err) {
      console.log(err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ position: 'absolute', top: 18, left: 16, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: 20, padding: 2 }}
        >
          <Ionicons name="chevron-back" size={28} color="#374151" />
        </TouchableOpacity>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.noImageText}>No Image Available</Text>
          </View>
        )}
        <View
          style={[ 
            styles.badge,
            item.itemType === 'Lost' ? styles.lostBadge : styles.foundBadge,
          ]}
        >
          <Text style={styles.badgeText}>{item.itemType?.toUpperCase()}</Text>
        </View>
      </View>

      <View style={styles.detailsContainer}>
        <Text style={styles.itemName}>{item.itemName}</Text>

        <View style={styles.chipsRow}>
          {item.createdAt?.toDate && (
            <View style={styles.chip}>
              <Ionicons
                name="time-outline"
                size={16}
                color="#555"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.dateText}>
                {item.createdAt.toDate().toLocaleDateString()}
              </Text>
            </View>
          )}

          {item.location && (
            <View style={styles.chip}>
              <Ionicons
                name="location-outline"
                size={16}
                color="#555"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.chipText}>{item.location}</Text>
            </View>
          )}

          {item.category && (
            <View style={styles.chip}>
              <Ionicons
                name="pricetag-outline"
                size={16}
                color="#555"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.chipText}>
                {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
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
            {item.description || 'No description provided.'}
          </Text>
        </View>

        <Text style={styles.sectionTitle}>Posted By</Text>
        <View style={styles.posterBox}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarLetter}>
              {posterData?.name?.charAt(0) || item.email?.charAt(0) || 'U'}
            </Text>
          </View>
          <View style={styles.posterInfo}>
            <Text style={styles.posterName}>
              {posterData?.name || 'Unknown User'}
            </Text>
            <Text style={styles.posterEmail}>{item.email}</Text>
          </View>
        </View>

        {item.claimedBy && claimedUserData && (
          <>
            <Text style={styles.sectionTitle}>
              {item.itemType === 'Lost' ? 'Claimed By' : 'Returned To'}
            </Text>
            <View style={styles.posterBox}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarLetter}>
                  {claimedUserData?.name?.charAt(0) ||
                    item.claimedBy?.charAt(0) ||
                    'U'}
                </Text>
              </View>
              <View style={styles.posterInfo}>
                <Text style={styles.posterName}>
                  {claimedUserData?.name || 'Unknown User'}
                </Text>
                <Text style={styles.posterEmail}>{item.claimedBy}</Text>
              </View>
            </View>
          </>
        )}

        <TouchableOpacity
          style={styles.contactButton}
          onPress={() => {
            if (item.email) {
              Linking.openURL(
                `mailto:${item.email}?subject=Regarding your ${item.itemType} item&body=Hello, I saw your post about "${item.itemName}".`,
              );
            } else {
              Alert.alert('No email found for this user.');
            }
          }}
        >
          <Text style={styles.contactButtonText}>Contact Poster</Text>
        </TouchableOpacity>
        {currentUserEmail === item.email && status === 'Active' && (
          <TouchableOpacity
            style={[
              styles.contactButton,
              { backgroundColor: '#059669', marginTop: 12 },
            ]}
            onPress={() => setDialogVisible(true)}
          >
            <Text style={styles.contactButtonText}>
              {item.itemType === 'Lost'
                ? 'Mark as Claimed'
                : 'Mark as Returned'}
            </Text>
          </TouchableOpacity>
        )}
        <Dialog.Container visible={dialogVisible}>
          <Dialog.Title>Enter Email</Dialog.Title>
          <Dialog.Description>
            Please enter the email of the person you{' '}
            {item.itemType === 'Lost'
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
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 10,
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
});

export default ItemDetailScreen;
