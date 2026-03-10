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
import Spacer from '../../components/Spacer';
import { useUser } from '../../hooks/useUser';
import { Link } from 'expo-router';
import { errorToast } from '../../utils/toast';
import { Eye, EyeOff } from 'lucide-react-native';
import Logo from '../../assets/img/logo.png'

const Login = () => {
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  const clearInput = () => {
    setEmail('');
    setPassword('');
  };

  const handleLogin = async () => {
    if (!email || !password) {
      errorToast('Please fill in all fields');
      return;
    }
    try {
      await login(email, password);
      clearInput();
    } catch (error) {
      errorToast(error.message);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="flex-1 items-center justify-center bg-background">
        <Image source={Logo} style={{width: 200, height:200}} />
        <Text title={true} className="mb-8 text-center text-2xl font-bold text-text">
          Login to UrbanPulse
        </Text>

        <TextInput
          className="bg-surface mb-5 w-[85%] rounded-xl border-2 border-primary px-4 py-3.5 text-text"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <View className="bg-surface border-primary mb-8 w-[85%] flex-row items-center justify-between rounded-xl border-2 px-4 py-1.5">
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

        <Pressable
          className="w-[85%] items-center justify-center rounded-xl bg-primary py-4 shadow-md active:opacity-70"
          onPress={() => handleLogin()}>
          <Text className="text-lg font-bold text-white">Sign in</Text>
        </Pressable>

        <Spacer />

        <Link href="/register" replace asChild>
          <Pressable className="mt-6 p-2">
            <Text className="text-center font-medium text-text">
              Don&#39;t have an account? <Text className="text-primary">Sign up</Text>
            </Text>
          </Pressable>
        </Link>
      </View>
    </TouchableWithoutFeedback>
  );
};

export default Login;
