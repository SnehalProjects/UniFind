import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const screenWidth = Dimensions.get('window').width;

const DrawerScreen = ({ closeDrawer }) => {
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
    closeDrawer();
  };

  return (
    <View style={styles.container}>
      {/* Profile Section */}
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
        <View style={styles.profileTextContainer}>
          <Text style={styles.profileName}>{userData?.name || 'Demo Student'}</Text>
          <View style={styles.profileRow}>
            <Icon name="mail-outline" size={15} color="#6b7280" style={styles.profileIcon} />
            <Text style={styles.profileEmail}>{userData?.email || 'demo.student@charusat.edu.in'}</Text>
          </View>
          <View style={styles.profileRow}>
            <Icon name="school-outline" size={15} color="#6b7280" style={styles.profileIcon} />
            <Text style={styles.profileCollege}>{userData?.college || 'Charusat University'}</Text>
          </View>
        </View>
      </View>

      <View>
      <Text style={styles.navTitle}>NAVIGATION</Text>
      <View style={styles.menuSection}>
        {[
          { icon: 'home-outline', label: 'Home', route: 'HomeScreen' },
          { icon: 'person-outline', label: 'My Profile', route: 'ProfileScreen' },
          { icon: 'document-text-outline', label: 'My Posts', route: 'MyPostsScreen' },
          { icon: 'settings-outline', label: 'Settings', route: 'SettingScreen' },
        ].map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => {
              if (item.route) {
                navigation.navigate(item.route);
              }
              closeDrawer();
            }}
          >
            <View style={styles.iconCircle}>
              <Icon name={item.icon} size={20} color="#374151" />
            </View>
            <Text style={styles.menuText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      </View>

      <View>
      <Text style={styles.abtTitle}>ABOUT</Text>
      <View style={styles.aboutBox}>
        <Text style={styles.aboutTitle}>CampusFind</Text>
        <Text style={styles.aboutSub}>Version 1.0.0</Text>
        <Text style={styles.aboutSub}>Campus Lost & Found Platform</Text>
      </View>
      </View>

      {/* Logout */}
      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
        <Icon name="log-out-outline" size={20} color="#ef4444" />
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: screenWidth * 0.06,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 33,
    backgroundColor: '#ccc',
  },
  profileTextContainer: {
    marginLeft: 14,
    flex: 1,
    justifyContent: 'center',
  },
  profileName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  profileIcon: {
    marginRight: 6,
  },
  profileEmail: {
    fontSize: 13,
    color: '#6b7280',
  },
  profileCollege: {
    fontSize: 13,
    color: '#6b7280',
  },
  navTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#9ca3af',
  },
  abtTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 15,
    marginTop: 89,
    color: '#9ca3af',
  },
  menuSection: {
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  iconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuText: {
    fontSize: 16.5,
    color: '#111827',
  },
  aboutBox: {
    backgroundColor: '#f9fafb',
    borderWidth:1,
    borderRadius: 10,
    borderColor: '#dde1ea',
    padding: 20,
  },
  aboutTitle: {
    fontWeight: 'bold',
    color: '#111827',
    fontSize: 17,
  },
  aboutSub: {
    fontSize: 13,
    padding:3,
    color: '#6b7280',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth:1,
    borderColor: '#fee2e2',
    backgroundColor: '#fef2f2',
    paddingVertical: 13,
    borderRadius: 10,
    justifyContent: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default DrawerScreen;