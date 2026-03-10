import React, { useState } from 'react';
import {
  Image,
  Keyboard,
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

const Register = () => {
  const { register } = useUser();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const router = useRouter();
  const handleRegister = async () => {
    if(!email || !firstName || !lastName || !password || !confirmPassword){
      errorToast('Please fill in all fields');
      return;
    }

    if(password !== confirmPassword){
      errorToast("Passwords do not match!");
      return;
    }

    try {
      await register(email, firstName, lastName, password);
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
      <View className="flex-1 items-center justify-center bg-background">
        <Image source={Logo} style={{ width: 200, height: 200 }} />
        <ThemedText title={true} className="text-center text-2xl font-bold text-text">
          Register into UrbanPulse
        </ThemedText>
        <Spacer />
        <TextInput
          className="mb-5 w-[85%] rounded-xl border-2 border-primary px-4 py-4 text-text"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          className="mb-5 w-[85%] rounded-xl border-2 border-primary px-4 py-4 text-text"
          placeholder="First Name"
          value={firstName}
          onChangeText={setFirstName}
        />
        <TextInput
          className="mb-5 w-[85%] rounded-xl border-2 border-primary px-4 py-4 text-text"
          placeholder="Last Name"
          value={lastName}
          onChangeText={setLastName}
        />
        <View className="bg-surface mb-5 w-[85%] flex-row items-center justify-between rounded-xl border-2 border-primary px-4 py-1.5">
          <TextInput
            className="flex-1 py-2 text-text"
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
        <View className="bg-surface mb-8 w-[85%] flex-row items-center justify-between rounded-xl border-2 border-primary px-4 py-1.5">
          <TextInput
            className="flex-1 py-2 text-text"
            placeholder="Confirm Password"
            secureTextEntry={!confirmPasswordVisible}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
          <Pressable onPress={() => setConfirmPasswordVisible(!confirmPasswordVisible)} className="p-2">
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
            <Text className="text-center font-medium text-text">
              Already have an account? <Text className="text-primary">Sign in</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Register;
