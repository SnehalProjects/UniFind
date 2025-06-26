import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  Linking,
  Alert,
  TouchableOpacity
} from 'react-native';

const ItemDetailScreen = ({ route }) => {
  const { item } = route.params;

  return (
    <ScrollView style={styles.container}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.noImageText}>No Image Available</Text>
        </View>
      )}
      <View style={styles.details}>
        <Text style={styles.itemName}>{item.itemName}</Text>
        <Text style={styles.label}>Type:</Text>
        <Text style={styles.value}>{item.itemType}</Text>

        <Text style={styles.label}>Description:</Text>
        <Text style={styles.value}>
          {item.description || 'No description provided.'}
        </Text>

        <Text style={styles.label}>Location:</Text>
        <Text style={styles.value}>{item.location || 'Not specified'}</Text>

        <Text style={styles.label}>Date:</Text>
        <Text style={styles.value}>
          {item.date ||
            item.createdAt?.toDate?.().toLocaleDateString?.() ||
            'Not available'}
        </Text>

        <Text style={styles.label}>Posted by:</Text>
        <Text style={styles.value}>{item.email}</Text>
      </View>
      <TouchableOpacity
        style={styles.contactButton}
        onPress={() => {
          const email = item.email;
          if (email) {
            Linking.openURL(
              `mailto:${email}?subject=Regarding your lost/found item&body=Hello, I saw your post about "${item.itemName}"`,
            );
          } else {
            Alert.alert('No email found for this user.');
          }
        }}
      >
        <Text style={styles.contactButtonText}>Contact</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F4F8' },
  image: {
    width: '100%',
    height: 400,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ccc',
  },
  noImageText: {
    color: '#555',
    fontStyle: 'italic',
  },
  details: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    elevation: 3,
  },
  itemName: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginTop: 10,
  },
  value: {
    fontSize: 15,
    color: '#555',
    marginTop: 2,
  },
  contactButton: {
  marginTop: 20,
  backgroundColor: '#4A90E2',
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: 'center',
},
contactButtonText: {
  color: '#fff',
  fontWeight: '600',
  fontSize: 16,

},

});

export default ItemDetailScreen;
