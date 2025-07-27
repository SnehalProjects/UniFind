import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

const HelpSupportScreen = ({ navigation }) => {
  const [title, setTitle] = useState('');
  const [problem, setProblem] = useState('');

  const handleSubmit = () => {
    if (!title.trim() || !problem.trim()) {
      Alert.alert('Please fill in all fields');
      return;
    }
    Alert.alert('Thank you!', 'Your support request has been submitted.');
    setTitle('');
    setProblem('');
  };

  return (
    <View style={styles.bg}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-back" size={28} color="#374151" />
        </TouchableOpacity>
      </View>
      <Text style={styles.title}>Help & Support</Text>
      <View style={styles.bottomSheetContainer}>
        <View style={styles.card}>
          <Text style={styles.desc}>If you are experiencing any issues, please let us know. We will try to solve them as soon as possible.</Text>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Add your grievance title here"
            placeholderTextColor="#888"
            value={title}
            onChangeText={setTitle}
          />
          <Text style={styles.label}>Explain the problem</Text>
          <TextInput
            style={styles.textarea}
            placeholder="Type your query here"
            placeholderTextColor="#888"
            value={problem}
            onChangeText={setProblem}
            multiline
            numberOfLines={4}
          />
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitBtnText}>SUBMIT</Text>
          </TouchableOpacity>
          <Text style={styles.footerNote}>We appreciate your feedback and will get back to you as soon as possible.</Text>
        </View>
      </View>
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
    marginBottom: 0,
    paddingHorizontal: width * 0.03,
  },
  backButton: {
    padding: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'left',
    color: '#22223b',
    marginLeft: width * 0.07,
    marginTop: 35,
    marginBottom: 18,
  },
  bottomSheetContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 50,
    borderTopRightRadius: 50,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    padding: 28,
    shadowColor: '#4b6cb7',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 8,
    width: '100%',
    minHeight: height * 0.80,
  },
  desc: {
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 18,
    marginTop: 10,
    lineHeight: 20,
    color: '#22223b',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
    color: '#22223b',
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginBottom: 8,
    backgroundColor: '#f3f4f6',
    color: '#22223b',
    borderColor: '#cfd8ee',
  },
  textarea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    minHeight: 130,
    textAlignVertical: 'top',
    marginBottom: 14,
    backgroundColor: '#f3f4f6',
    color: '#22223b',
    borderColor: '#cfd8ee',
  },
  submitBtn: {
    backgroundColor: '#4b6cb7',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 2,
    elevation: 2,
    width: '100%',
    alignSelf: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 17,
    letterSpacing: 1,
  },
  footerNote: {
    textAlign: 'center',
    color: '#7b7b7b',
    fontSize: 13,
    marginTop: 20,
  },
});

export default HelpSupportScreen;