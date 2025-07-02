import React, { useState } from 'react';
import { Dimensions, Platform} from 'react-native';
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
import { RFPercentage, RFValue } from "react-native-responsive-fontsize";

fontSize: RFValue(16)

const { width, height } = Dimensions.get('window');

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={28} color="#374151" />
        </TouchableOpacity>    
        <View style={styles.greetingContainer}>
          <Text style={styles.title}>Settings</Text>
        </View>
        <View style={styles.iconRow}>
          <TouchableOpacity>
            <Icon name="notifications-outline" size={22} color="black" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.section}>
        <SettingItem icon="person-circle-outline" title="Profile" subtitle="Update your details" onPress={() => navigation.navigate('ProfileScreen')} />
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
        <SettingItem icon="help-circle-outline" title="Help & Support" subtitle="FAQs, Contact support" />
        <SettingItem icon="information-circle-outline" title="About Us" subtitle="Version 1.0, Terms & Conditions" />
        
        <TouchableOpacity onPress={handleLogout} style={styles.logoutRow}>
          <Icon name="log-out-outline" size={22} color="#ef4444" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const SettingItem = ({ icon, title, subtitle, onPress }) => (
  <TouchableOpacity style={styles.itemRow} activeOpacity={0.7} onPress={onPress}>
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
  <View style={styles.toggleItemRow}>
    <View style={styles.iconCircle}>
      <Icon name={icon} size={20} color="#4b6cb7" />
    </View>
    <Text style={styles.itemTitle}>{title}</Text>
    
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.customSwitch,
        { backgroundColor: value ? '#4b6cb7' : '#ccc' }
      ]}
      onPress={() => onValueChange(!value)}
    >
      <View
        style={[
          styles.customThumb,
          { alignSelf: value ? 'flex-end' : 'flex-start' }
        ]}
      />
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#cfd8ee',
    paddingHorizontal: width * 0.04, // 4% padding
    paddingTop: Platform.OS === 'android' ? 22 : 42,
  },
  title: {
    fontSize: width * 0.065, // ~24-28 depending on screen
    fontWeight: 'bold',
    color: '#374151',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: height * 0.02,
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
    padding: width * 0.045,
    marginBottom: height * 0.035,
    elevation:2,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: height * 0.012,
  },
  iconCircle: {
    width: width * 0.085,
    height: width * 0.085,
    borderRadius: width * 0.0425,
    backgroundColor: '#e1e8fb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.03,
  },
  itemTitle: {
    flex: 1,
    fontSize: width * 0.045,
    color: '#1f2937',
    fontWeight: '500',
  },
  itemSubtitle: {
    fontSize: width * 0.035,
    color: '#6b7280',
  },
  logoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: height * 0.01,
    marginLeft:5
  },
  logoutText: {
    color: '#ef4444',
    fontSize: width * 0.045,
    fontWeight: 'Bold',
    marginLeft: 8,
  },
  wave: {
    fontSize: 18,
  },
  customSwitch: {
  width: 50,
  height: 28,
  borderRadius: 20,
  padding: 3,
  backgroundColor: '#ccc',
  justifyContent: 'center',
},

customThumb: {
  width: 22,
  height: 22,
  borderRadius: 11,
  backgroundColor: '#fff',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 1 },
  shadowOpacity: 0.2,
  shadowRadius: 1.41,
  elevation: 2,
},

toggleItemRow: {
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  marginVertical: height * 0.012,
}
});

export default SettingScreen;