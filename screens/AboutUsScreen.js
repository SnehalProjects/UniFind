import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

const AboutUsScreen = ({ navigation }) => {
  return (
    <View style={styles.bg}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={28} color="#374151" />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={styles.title}>About Us</Text>
        </View>
        <View style={{ width: 28 }} />
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          {/* What is CampusFind? */}
          <View style={styles.sectionRow}>
            <Icon name="school-outline" size={22} color="#4b6cb7" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>What is CampusFind?</Text>
          </View>
          <Text style={styles.text}>
            CampusFind is a smart platform for students to post and locate lost or found items within their campus. Our goal is to connect owners and finders quickly and easily.
          </Text>

          {/* Our Mission */}
          <View style={styles.sectionRow}>
            <Icon name="rocket-outline" size={22} color="#4b6cb7" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Our Mission</Text>
          </View>
          <Text style={styles.text}>
            To foster a responsible and helpful campus community by making item recovery fast, stress-free, and secure.
          </Text>

          {/* Developed By */}
          <View style={styles.sectionRow}>
            <Icon name="people-outline" size={22} color="#4b6cb7" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Developed By</Text>
          </View>
          <Text style={styles.text}>
            Yashvi Gadhiya & Snehal Mishra{"\n"}Charotar University of Science & Technology (DEPSTAR)
          </Text>

          {/* Version */}
          <View style={styles.sectionRow}>
            <Icon name="information-circle-outline" size={22} color="#4b6cb7" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Version</Text>
          </View>
          <Text style={styles.text}>CampusFind v1.0.0 (Released: July 2025)</Text>

          {/* Contact Us */}
          <View style={styles.sectionRow}>
            <Icon name="mail-outline" size={22} color="#4b6cb7" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Contact Us</Text>
          </View>
          <Text style={styles.text}>For feedback or support: campusfind.help@gmail.com</Text>

          {/* Community Guidelines */}
          <View style={styles.sectionRow}>
            <Icon name="heart-outline" size={22} color="#4b6cb7" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>Community Guidelines</Text>
          </View>
          <Text style={styles.text}>
            Thanks to:{'\n'}- Be honest when posting items.{'\n'}- Don’t post unrelated content.{'\n'}- Respect user privacy. {'\n'}- Report inappropriate behavior.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#f6f7fa',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    paddingHorizontal: width * 0.04,
  },
  backButton: {
    padding: 4,
    borderRadius: 20,
  },
  title: {
    fontSize: width * 0.065,
    fontWeight: 'bold',
    color: '#374151',
    textAlign: 'center',
    marginTop: 0,
    marginBottom: 0,
    paddingHorizontal: width * 0.07,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 24,
    padding: 24,
    shadowColor: '#b0b8c1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 4,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 4,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#23272f',
  },
  text: {
    fontSize: 14.5,
    lineHeight: 21,
    color: '#4b5563',
    marginBottom: 4,
  },
});

export default AboutUsScreen;
