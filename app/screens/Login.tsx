import { View, Text, Button, TextInput, Platform } from 'react-native'
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext';

import {
    SafeAreaProvider,
    useSafeAreaInsets,
  } from 'react-native-safe-area-context';

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { onLogin, onRegister } = useAuth();

    const login = async () => {
        const result = await onLogin!(email, password);
        if (result && result.error){
            alert(result.msg);
        }
    };

    const register = async () => {
        const result = await onRegister!(email, password);
        if (result && result.error){
            alert(result.msg);
        }
        else{
            login();
        }
    }
    const insets = useSafeAreaInsets();


  return (
    <View style={{
        // Paddings to handle safe area
        paddingTop: insets.top + (Platform.OS === 'ios' ? 100 : 0),
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,


    }}>
        <TextInput placeholder="Email" onChangeText={(text:string) => setEmail(text)} value={email} />
        <TextInput placeholder="Password" secureTextEntry={true} onChangeText={(text:string) => setPassword(text)} value={password} />

        <Button onPress={login} title="Sign in" />

    </View>
  )
}

export default Login