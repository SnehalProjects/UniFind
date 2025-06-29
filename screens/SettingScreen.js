import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useNavigation } from '@react-navigation/native';

const SettingScreen = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const navigation = useNavigation();

   const handleLogout = async () => {
    await auth().signOut();
    await GoogleSignin.signOut();  
    navigation.navigate('LoginScreen');
    closeDrawer(); // ✅ NEW: Close drawer on logout
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>        
        <View style={styles.greetingContainer}>
          <Text style={styles.title}>Settings</Text>
        </View>
        <View style={styles.iconRow}>
          <TouchableOpacity>
            <Icon name="notifications-outline" size={22} color="black" />
          </TouchableOpacity>
          <TouchableOpacity style={{ marginLeft: 15 }}>
            <Icon name="settings-outline" size={22} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <SettingItem icon="person-circle-outline" title="AccountPassword Settings" subtitle="Update your details" />
        <SettingItem icon="key-outline" title="Password Settings" subtitle="Manage cards & UPI" />
        <SettingItem icon="shield-checkmark" title="Security & Privacy" subtitle="Change password, enable 2FA" />
        <SettingItem icon="language" title="Language" subtitle="Change app language" />
      </View>

      <View style={styles.section}>
        <ToggleSettingItem
          icon="moon"
          title="Dark Mode"
          value={darkMode}
          onValueChange={setDarkMode}
        />
        <ToggleSettingItem
          icon="notifications"
          title="Push Notifications"
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
        />
      </View>

      <View style={styles.section}>
        <SettingItem icon="information-circle" title="Help & Support" subtitle="FAQs, Contact support" />
        <SettingItem icon="people-outline" title="About Us" subtitle="Version 1.0, Terms & Conditions" />
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Icon name="log-out-outline" size={22} color="#ef4444" />
              <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

    </ScrollView>
  );
};

const SettingItem = ({ icon, title, subtitle }) => (
  <TouchableOpacity style={styles.itemRow}>
    <View style={styles.iconCircle}>
      <Icon name={icon} size={20} color="#4b6cb7" />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.itemTitle}>{title}</Text>
      <Text style={styles.itemSubtitle}>{subtitle}</Text>
    </View>
    <Icon name="chevron-forward" size={20} color="#ccc" />
  </TouchableOpacity>
);

const ToggleSettingItem = ({ icon, title, value, onValueChange }) => (
  <View style={styles.itemRow}>
    <View style={styles.iconCircle}>
      <Icon name={icon} size={20} color="#4b6cb7" />
    </View>
    <Text style={styles.itemTitle}>{title}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: '#ccc', true: '#4b6cb7' }}
      thumbColor={value ? '#ffffff' : '#f4f3f4'}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#cfd8ee',
    padding: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginLeft: 10,
    fontFamily: 'serif',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop:20
  },
  greetingContainer: {
    flexDirection: 'column',
  },
  greetingText: {
    fontSize: 16,
    color: '#4b6cb7',
    fontWeight: '600',
  },
  greetingSubText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  iconRow: {
    flexDirection: 'row',
  },
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e1e8fb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTitle: {
    flex: 1,
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: 13,
    color: '#6b7280',
  },
  logoutButton: {
    flexDirection: 'row',
    padding:50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutText: {
    color: '#ef4444',
    fontSize: 16,
    fontWeight: 'Bold',
    marginLeft: 8,
  },
  wave: {
    fontSize: 18,
  },
});

export default SettingScreen;
