import functions from '@react-native-firebase/functions';

export const sendOtpEmail = async (email, otp) => {
  return functions().httpsCallable('sendOtpEmail')({ email, otp });
};
