import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet,TouchableOpacity} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const FoundItemsScreen = () => {
  const navigation = useNavigation();
  const [foundItems, setFoundItems] = useState([]);

  useEffect(() => {
    firestore()
      .collection('items')
      .where('itemType', '==', 'Found')
      .orderBy('createdAt', 'desc')
      .get({ source: 'server' })
      .then(snapshot => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFoundItems(items);
      })
      .catch(error => {
        console.error('Error fetching from server:', error);
      });
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ItemDetail', { item })}
      activeOpacity={0.9}
    >
      <View style={styles.cardNew}>
        <View style={styles.topRow}>
          <View style={styles.badgeFound}><Text style={styles.badgeText}>Found</Text></View>
          <Text style={styles.dateText}>{item.createdAt ? new Date(item.createdAt.seconds ? item.createdAt.seconds * 1000 : item.createdAt).toISOString().slice(0, 10) : ''}</Text>
        </View>
        <View style={styles.imageWrapper}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.cardImageNew} />
          ) : (
            <View style={styles.imagePlaceholderNew}>
              <Text style={{ color: '#999', textAlign: 'center' }}>No Image</Text>
            </View>
          )}
        </View>
        <View style={styles.infoNew}>
          <Text style={styles.itemNameNew}>{item.itemName}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location-outline" size={16} color="#888" style={{ marginRight: 4 }} />
            <Text style={styles.locationText}>{item.location || 'Unknown'}</Text>
          </View>
          <View style={styles.bottomRow}>
            <View style={styles.postedByRow}>
              <Ionicons name="person-circle-outline" size={16} color="#888" style={{ marginRight: 4 }} />
              <Text style={styles.metaNew}>Posted by <Text style={styles.emailBold}>{item.email}</Text></Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 8 }}>
          <Ionicons name="chevron-back" size={28} color="#059669" />
        </TouchableOpacity>
        <Ionicons name='cube-outline' size={28} color={"#059669"}/>
        <Text style={styles.title}>Found Items</Text>
      </View>
      <Text style={styles.subtitle}>Items waiting to be reunited with their owners</Text>
      {foundItems.length === 0 && (
        <Text style={{ textAlign: 'center', marginTop: 50 }}>
          No items found or you're offline.
        </Text>
      )}
      <FlatList
        data={foundItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  cardNew: {
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 22,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
    padding: 0,
    overflow: 'hidden',
  },
  container: { flex: 1, backgroundColor: '#CFD8EE', padding: 16 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  title: { fontSize: 28, fontWeight: '700', color: '#374151', marginLeft: 12 },
  subtitle: { fontSize: 16, color: '#6b7280', marginBottom: 24 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: 180,
  },
  imagePlaceholder: {
    height: 180,
    backgroundColor: '#eee',
  },
  info: { padding: 10 },
  meta: { fontSize: 12, color: '#777' },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
    marginBottom: 2,
  },
  badgeFound: {
    backgroundColor: '#e0f7e9',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 3,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#22a06b',
    fontWeight: '700',
    fontSize: 15,
  },
  cardImageNew: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginTop: 0,
  },
  imagePlaceholderNew: {
    width: '100%',
    height: 180,
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginTop: 0,
  },
  infoNew: {
    padding: 16,
  },
  itemNameNew: {
    fontSize: 20,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
    textTransform: 'capitalize',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationText: {
    fontSize: 15,
    color: '#888',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  postedByRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaNew: {
    fontSize: 13,
    color: '#777',
  },
  emailBold: {
    fontWeight: 'bold',
    color: '#888',
    fontSize: 13,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingTop: 14,
  },
  dateText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  imageWrapper: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FoundItemsScreen;
