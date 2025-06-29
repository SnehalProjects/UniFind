// screens/DrawerScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// ✅ NEW: Accept closeDrawer prop
const DrawerScreen = ({ closeDrawer })=> {
  const navigation = useNavigation();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const currentUser = auth().currentUser;
      if (!currentUser) return;

      try {
        const doc = await firestore().collection('users').doc(currentUser.uid).get();
        if (doc.exists()) {
          setUserData(doc.data());
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await auth().signOut();
    await GoogleSignin.signOut();  
    navigation.navigate('LoginScreen');
    closeDrawer(); // ✅ NEW: Close drawer on logout
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>My Profile</Text>

      <View style={styles.profileSection}>
        {loading ? (
          <ActivityIndicator size="small" />
        ) : (
          <Image
            source={{
              uri:
                userData?.profileImage ||
                'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_1280.png',
            }}
            style={styles.profileImage}
          />
        )}
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{userData?.name || 'Loading...'}</Text>
          <Text style={styles.profileEmail}>{userData?.email || 'Loading...'}</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        {[
          { icon: 'home-outline', label: 'Home', route: 'HomeScreen' },
          { icon: 'download-outline', label: 'My Posts' },
          { icon: 'heart-outline', label: 'Personal Details', route: 'ProfileScreen' },
          { icon: 'settings-outline', label: 'Settings' ,route: 'SettingScreen'},
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => {
              // 🔄 UPDATED: Handle Home screen separately
              if (item.route === 'HomeScreen') {
                closeDrawer(); // ✅ Just close if already on Home
              } else if (item.route) {
                navigation.navigate(item.route);
                closeDrawer(); // ✅ Close drawer after navigating
              }
            }}
          >
            <Icon name={item.icon} size={22} color="#374151" style={styles.menuIcon} />
            <Text style={styles.menuText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Icon name="log-out-outline" size={22} color="#ef4444" />
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 10,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileEmail: {
    color: '#6b7280',
  },
  menuSection: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    paddingVertical: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#111827',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default DrawerScreen;
