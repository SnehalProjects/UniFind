import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import firestore from '@react-native-firebase/firestore';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import DrawerModal from '../screens/DrawerModal'
import auth from '@react-native-firebase/auth';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [recentPosts, setRecentPosts] = useState([]);
  const [isDrawerVisible, setDrawerVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

useFocusEffect(
    useCallback(() => {
      const fetchProfileImage = async () => {
        const user = auth().currentUser;
        if (!user) return;

        try {
          const doc = await firestore().collection('users').doc(user.uid).get();
          if (doc.exists) {
            const data = doc.data();
            setProfileImage(data?.profileImage || null);
          }
        } catch (err) {
          console.error('Failed to fetch profile image:', err);
        }
      };

      fetchProfileImage();
    }, [])
  );

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('items')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .onSnapshot(snapshot => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setRecentPosts(items);
      });

    return () => unsubscribe(); 
  }, []);

  // Filter posts based on search query (case-insensitive)
  const filteredPosts = recentPosts.filter(item =>
    item.itemName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Ionicons name="menu" size={32} color={'#333'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('ProfileScreen')}>
          <Image
            source={{
              uri:
                profileImage ||
                'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            }}
            style={styles.profile}
          />
        </TouchableOpacity>
      </View>

      {/* Title */}
        <Text style={styles.title}>Get Your{'\n'}Belongings Back!</Text>
      
      {/* Search */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          placeholder="search here"
          placeholderTextColor="#999"
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>
      <View>
        <Text style={styles.sectionTitle}>Browse Categories</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Lost / Found Buttons */}
        <View style={styles.cardRow}>
          <TouchableOpacity
            style={styles.categoryCardLost}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('LostItems')}
          >
            <View style={styles.categoryIconCircleLost}>
              <Image
                source={require('../assets/Images/lost.png')}
                style={styles.categoryIconImage}
              />
            </View>
            <Text style={styles.categoryTitleNew}>Lost Items</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.categoryCardFound}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('FoundItems')}
          >
            <View style={styles.categoryIconCircleFound}>
              <Image
                source={require('../assets/Images/found.png')}
                style={styles.categoryIconImage}
              />
            </View>
            <Text style={styles.categoryTitleNew}>Found Items</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Posts */}
        <Text style={styles.sectionTitle}>Recent Posts</Text>
        <View style={styles.cardRowWrap}>
          {filteredPosts.length === 0 ? (
            <View style={styles.noPostsContainer}>
              <Text style={styles.noPostsTitle}>No posts found</Text>
              <Text style={styles.noPostsSubtitle}>
                Be the first to post an item!
              </Text>
            </View>
          ) : (
            <View style={styles.cardRowWrap}>
              {filteredPosts.map((item, index) => (
                <TouchableOpacity
      key={item.id}
      onPress={() => navigation.navigate('ItemDetail', { item })}
    >
                <View key={index} style={styles.postCard}>
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.postImage}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.noImageText}>No Image</Text>
                    </View>
                  )}
                  <View style={styles.postInfo}>
                    <Text style={styles.postTitle} numberOfLines={1}>
                      {item.itemName}
                    </Text>
                    <Text style={styles.postEmail} numberOfLines={1}>
                      Posted by {item.email}
                    </Text>
                  </View>
                </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('PostItem')}
      >
        <Ionicons name="add" size={32} color="#000" />
      </TouchableOpacity>
        <DrawerModal visible={isDrawerVisible} onClose={() => setDrawerVisible(false)} />
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#CFD8EE',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profile: {
    height: 40,
    width: 40, 
    borderRadius: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#374151',
    marginLeft: 5,
    marginTop: 10,
    lineHeight: 38
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    paddingHorizontal: 15,
    paddingVertical: 5,
    marginBottom: 20,
  },
  searchInput: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
    color: '#000',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: '600', 
    color: '#374151', 
    marginBottom: 16 
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  cardRowWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  categoryCardLost: {
    flex: 1,
    backgroundColor: '#e5ebff', // soft purple
    borderRadius: 18,
    marginRight: 10,
    alignItems: 'center',
    paddingVertical: 18,
    elevation: 5,
    shadowColor: '#a5b4fc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  categoryCardFound: {
    flex: 1,
    backgroundColor: '#e5ebff', // pastel light green
    borderRadius: 18,
    marginLeft: 10,
    alignItems: 'center',
    paddingVertical: 18,
    elevation: 5,
    shadowColor: '#a7f3d0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
  },
  categoryIconCircleLost: {
    backgroundColor: '#c7d2fe', // lighter purple
    borderRadius: 32,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  categoryIconCircleFound: {
    backgroundColor: '#c7d2fe', // lighter pastel green
    borderRadius: 32,
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  categoryIconImage: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
  categoryTitleNew: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#374151',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  postCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 15,
  },
  postImage: {
    height: 100,
    width: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    height: 100,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#888',
    fontSize: 14,
    fontStyle: 'italic',
  },
  postInfo: {
    padding: 8,
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  postEmail: {
    fontSize: 12,
    color: '#666',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 25,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 30,
    width: 55,
    height: 55,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  noPostsContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  marginVertical: 30,
},
noPostsTitle: {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#555',
},
noPostsSubtitle: {
  fontSize: 14,
  color: '#777',
  marginTop: 4,
},

});

export default HomeScreen;
