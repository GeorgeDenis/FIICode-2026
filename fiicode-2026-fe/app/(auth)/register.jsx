import React, { useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import ThemedText from '../../components/ThemedText';
import Spacer from '../../components/Spacer';
import { useUser } from '../../hooks/useUser';
import { Link, useRouter } from 'expo-router';
import { errorToast } from '../../utils/toast';
import Logo from '../../assets/img/logo.png';
import { Eye, EyeOff } from 'lucide-react-native';
import { useLocation } from '../../hooks/useLocation';

const Register = () => {
  const { register } = useUser();
  const { location, loading: locationLoading } = useLocation();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const router = useRouter();

  const validatePassword = (pw) => {
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*(\W|_)).{8,}$/.test(pw);
  };

  const handleRegister = async () => {
    if (!email || !firstName || !lastName || !password || !confirmPassword) {
      errorToast('Please fill in all fields');
      return;
    }

    if (!validatePassword(password)) {
      errorToast(
        'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character'
      );
      return;
    }

    if (password !== confirmPassword) {
      errorToast('Passwords do not match!');
      return;
    }

    if(!location || locationLoading){
      return;
    }

    try {
      await register(
        email,
        firstName,
        lastName,
        password,
        location.coords.longitude,
        location.coords.longitude
      );
      clearInput();
      router.replace('/login');
    } catch (error) {
      errorToast(error.message);
    }
  };

  const clearInput = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setPassword('');
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        className="flex-1 bg-background"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}>
        <View className="flex-1 items-center justify-center bg-background">
          <Image source={Logo} style={{ width: 200, height: 200 }} />
          <ThemedText title={true} className="text-text text-center text-2xl font-bold">
            Register into UrbanPulse
          </ThemedText>
          <Spacer />
          <TextInput
            className="text-text mb-5 w-[85%] rounded-xl border-2 border-primary px-4 py-4"
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
          <TextInput
            className="text-text mb-5 w-[85%] rounded-xl border-2 border-primary px-4 py-4"
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TextInput
            className="text-text mb-5 w-[85%] rounded-xl border-2 border-primary px-4 py-4"
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <View className="mb-5 w-[85%] flex-row items-center justify-between rounded-xl border-2 border-primary bg-surface px-4 py-1.5">
            <TextInput
              className="text-text flex-1 py-2"
              placeholder="Password"
              secureTextEntry={!passwordVisible}
              value={password}
              onChangeText={setPassword}
            />
            <Pressable onPress={() => setPasswordVisible(!passwordVisible)} className="p-2">
              {!passwordVisible ? (
                <Eye className="color-text" size={20} />
              ) : (
                <EyeOff className="color-text" size={20} />
              )}
            </Pressable>
          </View>
          <View className="mb-8 w-[85%] flex-row items-center justify-between rounded-xl border-2 border-primary bg-surface px-4 py-1.5">
            <TextInput
              className="text-text flex-1 py-2"
              placeholder="Confirm Password"
              secureTextEntry={!confirmPasswordVisible}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <Pressable
              onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
              className="p-2">
              {!confirmPasswordVisible ? (
                <Eye className="color-text" size={20} />
              ) : (
                <EyeOff className="color-text" size={20} />
              )}
            </Pressable>
          </View>
          <Pressable
            className="w-[85%] items-center justify-center rounded-xl bg-primary py-4 shadow-md active:opacity-70"
            onPress={() => handleRegister()}>
            <Text className="text-lg font-bold text-white">Sign up</Text>
          </Pressable>
          <Spacer />
          <Link href="/login" replace asChild>
            <Pressable className="p-2">
              <Text className="text-text text-center font-medium">
                Already have an account? <Text className="text-primary">Sign in</Text>
              </Text>
            </Pressable>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
};

export default Register;
