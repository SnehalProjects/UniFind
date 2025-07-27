import React, { useState } from 'react';
import { Dimensions, Platform, Alert } from 'react-native';
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
import firestore from '@react-native-firebase/firestore';

fontSize: RFValue(16)

const { width, height } = Dimensions.get('window');

const SettingScreen = () => {
  const navigation = useNavigation();

   const handleLogout = async () => {
    await auth().signOut();
    await GoogleSignin.signOut();  
    navigation.navigate('LoginScreen');
    // closeDrawer(); // ✅ NEW: Close drawer on logout
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: '#cfd8ee' }]}>
      <View style={styles.header}>    
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="chevron-back" size={28} color="#374151" />
        </TouchableOpacity>    
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.title}>Settings</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.section}>
        <SettingItem icon="person-circle-outline" title="Your Profile" subtitle="Update your details" onPress={() => navigation.navigate('ProfileScreen')} />
        <SettingItem icon="key-outline" title="Manage Password" subtitle="Change your password" onPress={() => navigation.navigate('ChangePassScreen')}/>
        <SettingItem icon="lock-open-outline" title="Forgot Password" subtitle="Recover your password" onPress={() => navigation.navigate('ForgotPassScreen')} />
        <SettingItem icon="create-outline" title="Manage Posts" subtitle="Edit or delete posts" onPress={() => navigation.navigate('MyPostsScreen')} />
      </View>

      <View style={styles.section}>
        <SettingItem icon="reader-outline" title="FAQs" subtitle="Frequently asked questions" onPress={() => navigation.navigate('FAQScreen')} />
        <SettingItem icon="help-circle-outline" title="Help & Support" subtitle="FAQs, Contact support" onPress={() => navigation.navigate('HelpSupportScreen')} />
        
      </View>

      <View style={styles.section}>
        
      <SettingItem icon="information-circle-outline" title="About Us" subtitle="Version 1.0, Terms & Conditions" onPress={() => navigation.navigate('AboutUsScreen')}/>
        <SettingItem icon="trash-outline" title="Delete Account" subtitle="Read our terms and policies" onPress={() => navigation.navigate('DeleteAccountScreen')} />
        
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