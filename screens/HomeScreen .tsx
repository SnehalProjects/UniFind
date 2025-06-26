import React, { useState } from 'react';
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
import { DrawerActions, useNavigation } from '@react-navigation/native';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import DrawerModal from '../screens/DrawerModal';


const { width } = Dimensions.get('window');

const HomeScreen = () => {
  type DrawerParamList = {
  Home: undefined;
};
const [isDrawerVisible, setDrawerVisible] = useState(false);
const navigation = useNavigation<DrawerNavigationProp<DrawerParamList>>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDrawerVisible(true)}>
          <Ionicons name="menu" size={30} color={'#333'} />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => {}}>
          <Image
            //source={require('../assets/Images/profile.png')}
            style={styles.profile}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Get Your{'\n'}Belongings Back!</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#999" />
        <TextInput
          placeholder="search here"
          placeholderTextColor="#999"
          style={styles.searchInput}
        />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.cardRow}>
          <TouchableOpacity
            style={styles.imageCard}
            //onPress={() => navigation.navigate('LostItems')}
          >
            <Image
              //source={require('../assets/Images/lost.png')}
              style={styles.cardImage}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageCard}
            //onPress={() => navigation.navigate('FoundItems')}
          >
            <Image
              //source={require('../assets/Images/found.png')}
              style={styles.cardImage}
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Posted Items</Text>

        <View style={styles.cardRow}>
          <View style={styles.itemCard}>
            <View style={styles.itemImagePlaceholder} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Wallet</Text>
              <Text style={styles.itemMeta}>Posted by John</Text>
            </View>
          </View>
          <View style={styles.itemCard}>
            <View style={styles.itemImagePlaceholder} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Keys</Text>
              <Text style={styles.itemMeta}>Posted by Alex</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardRow}>
          <View style={styles.itemCard}>
            <View style={styles.itemImagePlaceholder} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Backpack</Text>
              <Text style={styles.itemMeta}>Posted by Maria</Text>
            </View>
          </View>
          <View style={styles.itemCard}>
            <View style={styles.itemImagePlaceholder} />
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>Phone</Text>
              <Text style={styles.itemMeta}>Posted by Sam</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity
        style={styles.floatingButton}
        //onPress={() => navigation.navigate('PostItem')}
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
    fontWeight: '600',
    marginBottom: 20,
    color: '#000',
    marginLeft: 5,
    marginTop: 10,
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
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 10,
    color: '#000',
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  imageCard: {
    width: (width - 60) / 2,
    height: 110,
    backgroundColor: '#fff',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    elevation: 3,
  },
  cardImage: {
    width: 80,
    height: 80,
    resizeMode: 'contain',
  },
  itemCard: {
    width: (width - 60) / 2,
    backgroundColor: '#fff',
    borderRadius: 15,
    overflow: 'hidden',
    elevation: 3,
  },
  itemImagePlaceholder: {
    height: 80,
    backgroundColor: '#e6e6e6',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  itemInfo: {
    padding: 10,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  itemMeta: {
    fontSize: 12,
    color: '#888',
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
});

export default HomeScreen;