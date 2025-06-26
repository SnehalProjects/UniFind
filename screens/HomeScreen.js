import React, { useEffect, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore';

const { width } = Dimensions.get('window');

const HomeScreen = () => {
  const navigation = useNavigation();
  const [recentPosts, setRecentPosts] = useState([]);

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {}}>
          <Ionicons name="menu" size={30} color={'#333'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <Image
            source={require('../assets/Images/profile.png')}
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
        />
      </View>
      <View>
        <Text style={styles.sectionTitle}>Browse Categories</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Lost / Found Buttons */}
        <View style={styles.cardRow}>
          <TouchableOpacity
            style={styles.imageCard}
            onPress={() => navigation.navigate('LostItems')}
          >
            <Image
              source={require('../assets/Images/lost.png')}
              style={styles.cardImage}
            />
            <View style={styles.categoryOverlay}>
                  <Text style={styles.categoryTitle}>Lost Items</Text>
              </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageCard}
            onPress={() => navigation.navigate('FoundItems')}
          >
            <Image
              source={require('../assets/Images/found.png')}
              style={styles.cardImage}
            />
            <View style={styles.categoryOverlay}>
                  <Text style={styles.categoryTitle}>Found Items</Text>
              </View>
          </TouchableOpacity>
        </View>

        {/* Recent Posts */}
        <Text style={styles.sectionTitle}>Recent Posts</Text>
        <View style={styles.cardRowWrap}>
          {recentPosts.length === 0 ? (
            <View style={styles.noPostsContainer}>
              <Text style={styles.noPostsTitle}>No posts found</Text>
              <Text style={styles.noPostsSubtitle}>
                Be the first to post an item!
              </Text>
            </View>
          ) : (
            <View style={styles.cardRowWrap}>
              {recentPosts.map((item, index) => (
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
  imageCard: {
    width: (width - 60) / 2,
    height: 130,
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius:12,
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 10,
    elevation: 3,
  },
  cardImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
   categoryOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    padding: 5,
  },
  categoryTitle: { fontSize: 15, fontWeight: '700', color: '#ffffff', marginBottom: 4 },
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
