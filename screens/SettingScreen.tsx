import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

const settings = [
  { title: 'Account', icon: 'person-outline' },
  { title: 'Password', icon: 'person-outline' },
  { title: 'Notifications', icon: 'notifications-outline' },
  { title: 'Appearance', icon: 'eye-outline' },
  { title: 'Privacy & Security', icon: 'lock-closed-outline' },
  { title: 'Help and Support', icon: 'headset-outline' },
  { title: 'About', icon: 'information-circle-outline' },
];

const SettingScreen = () => {
  const navigation = useNavigation();

  const handlePress = (title: string) => {
    // You can navigate or handle logic here
    console.log(`Pressed: ${title}`);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="chevron-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.title}>Settings</Text>
        <View style={{ width: 24 }} /> {/* Placeholder for symmetry */}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search for a setting..."
          style={styles.searchInput}
          placeholderTextColor="#999"
        />
      </View>

      {/* Setting Options */}
      <ScrollView style={{marginLeft:20,marginRight:20}}>
        {settings.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.item}
            onPress={() => handlePress(item.title)}
          >
            <View style={styles.itemContent}>
              <Icon name={item.icon} size={22} color="#000" style={styles.icon} />
              <Text style={styles.itemText}>{item.title}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default SettingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 30,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#1f2937',
    fontFamily:'serif'
  },
  searchContainer: {
    backgroundColor: '#cfd8ee',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 20,
  },
  searchInput: {
    fontSize: 16,
    color: '#000',
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#cfd8ee',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 16,
  },
  itemText: {
    fontSize: 16,
    color: '#000',
  },
});
