import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  navigation,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const LostItemsScreen = () => {
  const navigation = useNavigation();
  const [lostItems, setLostItems] = useState([]);

  useEffect(() => {
    firestore()
      .collection('items')
      .where('itemType', '==', 'Lost')
      .orderBy('createdAt', 'desc')
      .get({ source: 'server' })
      .then(snapshot => {
        const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLostItems(items);
      })
      .catch(error => {
        console.error('Error fetching from server:', error);
      });
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ItemDetail', { item })}
    >
      <View style={styles.card}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={{ color: '#999', textAlign: 'center', marginTop: 70 }}>
              No Image
            </Text>
          </View>
        )}
        <View style={styles.info}>
          <Text style={styles.title}>{item.itemName}</Text>
          <Text style={styles.meta}>Posted by {item.email}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="search-outline" size={28} color={'#d97706'} />
        <Text style={styles.title}>Lost Items</Text>
      </View>
      <Text style={styles.subtitle}>
        Help people find their lost belongings
      </Text>
      {lostItems.length === 0 && (
        <Text style={{ textAlign: 'center', marginTop: 50 }}>
          No lost items found or you're offline.
        </Text>
      )}
      <FlatList
        data={lostItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default LostItemsScreen;