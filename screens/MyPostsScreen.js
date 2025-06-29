import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const MyPostsScreen = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const navigation = useNavigation();

  const currentUserEmail = auth().currentUser?.email?.trim().toLowerCase();

  useEffect(() => {
    const fetchMyPosts = async () => {
      try {
        if (!currentUserEmail) return;

        const snapshot = await firestore()
          .collection('items')
          .where('email', '==', currentUserEmail)
          .get();

        const allPosts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts(allPosts);
      } catch (error) {
        console.error('Error fetching my posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMyPosts();
  }, []);

  const filteredPosts = posts.filter(item =>
    filter === 'All'
      ? true
      : filter === 'Show All'
      ? true
      : item.itemType === filter
  );

  const handlePostItem = () => {
    navigation.navigate('PostItem');
  };

  const handleBack = () => {
    navigation.goBack();
  };

const renderItem = ({ item }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => navigation.navigate('ItemDetail', { item })}
  >
    <Image
      source={{ uri: item.imageUrl }}
      style={styles.image}
    />
    <View style={styles.info}>
      <Text style={styles.title}>{item.itemName}</Text>
      <Text style={styles.subtitle}>{item.itemType}</Text>
      <Text style={styles.status}>
        {item.status || 'Active'}
      </Text>
      {item.createdAt?.toDate && (
        <Text style={styles.date}>
          {item.createdAt.toDate().toLocaleDateString()}
        </Text>
      )}
    </View>
  </TouchableOpacity>
);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#222" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>My Posts</Text>
          <Text style={styles.headerSubtitle}>Manage your lost and found items</Text>
        </View>
      </View>

      {/* FILTERS */}
      <View style={styles.filters}>
        {['All', 'Lost', 'Found', 'Show All'].map(tab => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.filterButton,
              filter === tab && styles.activeFilter,
            ]}
            onPress={() => setFilter(tab)}
          >
            <Text style={filter === tab ? styles.activeFilterText : styles.filterText}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#4B6CB7" />
        </View>
      ) : filteredPosts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons
            name="document-text-outline"
            size={64}
            color="#CBD5E1"
            style={{ marginBottom: 16 }}
          />
          <Text style={styles.emptyTitle}>No Posts Found</Text>
          <Text style={styles.emptySubtitle}>
            You haven't posted any items yet. Start by reporting a lost or found item!
          </Text>
          <TouchableOpacity style={styles.postButton} onPress={handlePostItem}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.postButtonText}>Post an Item</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

export default MyPostsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EAF0F8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FAFAFA',
    elevation: 2,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#222',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#555',
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#FAFAFA',
    paddingVertical: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#E6EAF0',
  },
  activeFilter: {
    backgroundColor: '#4B6CB7',
  },
  filterText: {
    color: '#333',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#fff',
    fontWeight: '600',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#475569',
    marginBottom: 20,
  },
  postButton: {
    flexDirection: 'row',
    backgroundColor: '#4B6CB7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  postButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
  },
  card: {
  flexDirection: 'row',
  marginBottom: 12,
  backgroundColor: '#FAFAFA',
  borderRadius: 12,
  overflow: 'hidden',
  elevation: 1,
  padding: 8,
},
image: {
  width: 110,
  height: 110,
  backgroundColor: '#E2E8F0',
  borderRadius: 8,
},
info: {
  flex: 1,
  paddingLeft: 12,
  justifyContent: 'center',
},
title: {
  fontSize: 17,
  fontWeight: '700',
  color: '#1E293B',
},
subtitle: {
  fontSize: 14,
  color: '#475569',
  marginTop: 4,
},
status: {
  fontSize: 14,
  color: '#4B6CB7',
  marginTop: 4,
  fontWeight: '600',
},
date: {
  fontSize: 13,
  color: '#64748B',
  marginTop: 2,
},
});
