import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';


const { width } = Dimensions.get('window');

const FAQ_DATA = [
  {
    section: 'Account related questions:',
    questions: [
      {
        q: 'How do I create an account?',
        a: 'Go to the Sign Up screen, enter your details, and follow the instructions to create your account.'
      },
      {
        q: 'How do I reset my password?',
        a: 'On the login screen, tap on "Forgot Password" and follow the instructions to reset your password.'
      },
      {
        q: 'How do I update my profile information?',
        a: 'Navigate to the Settings > Your Profile section to update your personal information.'
      },
    ]
  },
  {
    section: 'App related questions:',
    questions: [
      {
        q: 'How do I post a lost or found item?',
        a: 'Tap the "+" button on the home screen or go to Manage Posts in Settings to add a new lost or found item.'
      },
      {
        q: 'How do I edit or delete my posts?',
        a: 'Go to Settings > Manage Posts to view, edit, or delete your posted items.'
      },
      {
        q: 'How do I search for items?',
        a: 'Use the search bar on the home screen to look for lost or found items.'
      },
    ]
  },
  {
    section: 'Support related questions:',
    questions: [
      {
        q: 'How do I contact support?',
        a: 'Go to Settings > Help & Support to submit your issue or contact us directly.'
      },
      {
        q: 'How long does it take to get a response?',
        a: 'We aim to respond to all queries within 24-48 hours.'
      },
      {
        q: 'Can I submit feedback or suggestions?',
        a: 'Yes! Use the Help & Support section to submit your feedback or suggestions.'
      },
    ]
  },
];

const FAQScreen = () => {
  const [openSection, setOpenSection] = useState(null);
  const [openQuestion, setOpenQuestion] = useState({});
  const navigation = useNavigation();

  const handleSectionPress = (idx) => {
    setOpenSection(openSection === idx ? null : idx);
    setOpenQuestion({});
  };

  const handleQuestionPress = (sectionIdx, qIdx) => {
    setOpenQuestion((prev) => ({
      ...prev,
      [sectionIdx]: prev[sectionIdx] === qIdx ? null : qIdx
    }));
  };

  return (
    <View style={styles.bg}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={28} color="#374151" />
        </TouchableOpacity>
      </View>
      <View style={styles.lottieWrap}>
        <Icon name="help-circle-outline" size={width * 0.32} color="#4B6CB7" style={{ textShadowColor: '#b0b8c1', textShadowRadius: 8 }} />
      </View>
      <Text style={styles.header}>Frequently Asked Questions</Text>
      <View style={styles.divider} />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {FAQ_DATA.map((section, sIdx) => (
          <View key={section.section} style={styles.sectionWrap}>
            <TouchableOpacity
              style={styles.sectionCard}
              activeOpacity={0.85}
              onPress={() => handleSectionPress(sIdx)}
            >
              <Text style={styles.sectionTitle}>{section.section}</Text>
              <Icon
                name={openSection === sIdx ? 'chevron-up-outline' : 'chevron-down-outline'}
                size={22}
                color="#888"
                style={styles.arrowIcon}
              />
            </TouchableOpacity>
            {openSection === sIdx && (
              <View style={styles.qList}>
                {section.questions.map((q, qIdx) => (
                  <View key={q.q}>
                    <TouchableOpacity
                      style={styles.qCard}
                      activeOpacity={0.85}
                      onPress={() => handleQuestionPress(sIdx, qIdx)}
                    >
                      <Text style={styles.qText}>{q.q}</Text>
                      <Icon
                        name={openQuestion[sIdx] === qIdx ? 'chevron-up-outline' : 'chevron-down-outline'}
                        size={20}
                        color="#aaa"
                        style={styles.arrowIcon}
                      />
                    </TouchableOpacity>
                    {openQuestion[sIdx] === qIdx && (
                      <View style={styles.aCard}>
                        <Text style={styles.aText}>{q.a}</Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: '#f7f8fa',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 0,
    paddingHorizontal: width * 0.04,
  },
  backButton: {
    padding: 4,
    borderRadius: 20,
    marginRight: 8,
  },
  lottieWrap: {
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 0,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    color: '#23272f',
    marginBottom: 10,
    paddingHorizontal: width * 0.07,
    marginTop: 8,
    textAlign: 'left',
    alignSelf: 'flex-start',
    letterSpacing: 0.2,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e3e6ee',
    marginBottom: 18,
  },
  scrollContent: {
    padding: 18,
    paddingBottom: 32,
    alignItems: 'center',
  },
  sectionWrap: {
    width: '100%',
    marginBottom: 22,
  },
  sectionCard: {
    backgroundColor: '#eaf0f8',
    borderRadius: 16,
    paddingVertical: 15,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    shadowColor: '#b0b8c1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#23272f',
    letterSpacing: 0.1,
  },
  arrowIcon: {
    marginLeft: 10,
  },
  qList: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    marginBottom: 4,
    marginTop: 2,
  },
  qCard: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 7,
    shadowColor: '#b0b8c1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  qText: {
    fontSize: 15,
    color: '#23272f',
    fontWeight: '500',
    flex: 1,
  },
  aCard: {
    backgroundColor: '#f3f4f8',
    borderRadius: 10,
    padding: 13,
    marginBottom: 8,
    marginTop: -2,
    shadowColor: '#b0b8c1',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 2,
    elevation: 1,
  },
  aText: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
  },
});

export default FAQScreen;