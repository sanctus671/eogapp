import { View, Text, TextInput, Platform, StyleSheet, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Appearance, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext';
import theme from "../constants/theme";


import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';

const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";

const Register = () => {


  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(false);

  const { onRegister } = useAuth();

 


  const register = async () => {

    setError('');

    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    else if (password.length < 8) {
      setError('Please enter a password with at least 8 characters.');
      return;
    }

    else if (password !== repeatPassword){
      setError('Passwords do not match.');
      return;

    }



    setLoading(true);

    const result = await onRegister!(name, email, password);

    if (result && result.error){
        setError(result.msg);
    }

    setLoading(false);

  };


  const validateEmail = (email:string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };



  return (
    <TouchableWithoutFeedback onPress={() => {if (Platform.OS === "android" || Platform.OS === "ios"){Keyboard.dismiss()}}} accessible={false}>
        <View style={styles.container}>
            <StatusBar style={colorScheme} />

            <KeyboardAvoidingView behavior="padding" >

            <TextInput placeholder="Name" clearButtonMode="while-editing" onChangeText={(text:string) => setName(text)} value={name} 
                style={{...theme.layout.input, ...styles.textInput}} placeholderTextColor={theme.colors[colorScheme].grey} />


                <TextInput placeholder="Email" autoCapitalize="none" clearButtonMode="while-editing" onChangeText={(text:string) => setEmail(text)} value={email} textContentType="emailAddress"   keyboardType="email-address"
                style={{...theme.layout.input, ...styles.textInput}} placeholderTextColor={theme.colors[colorScheme].grey} />
                
                
                <TextInput placeholder="Password" clearTextOnFocus={true} autoCapitalize="none" clearButtonMode="while-editing" secureTextEntry={true} onChangeText={(text:string) => setPassword(text)} value={password} 
                style={{...theme.layout.input, ...styles.textInput}} placeholderTextColor={theme.colors[colorScheme].grey} />
                
                <TextInput placeholder="Repeat Password" clearTextOnFocus={true} autoCapitalize="none" clearButtonMode="while-editing" secureTextEntry={true} onChangeText={(text:string) => setRepeatPassword(text)} value={repeatPassword} 
                style={{...theme.layout.input, ...styles.textInput}} placeholderTextColor={theme.colors[colorScheme].grey} />



                <TouchableOpacity
                    activeOpacity={.7}
                    style={{...theme.layout.button, ...styles.button, marginTop:20, opacity: (isLoading ? 0.7 : 1)}}
                    onPress={register}
                    disabled={isLoading}>
                    <Text style={{textAlign:'center', color:theme.colors.white}}>Sign Up</Text>
                    {isLoading && <ActivityIndicator style={styles.loadingIndicator} size="small" color={theme.colors.white} />}
                </TouchableOpacity>

                {error ? (
                    <Text style={styles.error}>{error}</Text>
                ) : null}

            

            </KeyboardAvoidingView>




        </View>
    </TouchableWithoutFeedback>
  )
}

export default Register

const styles = StyleSheet.create({
  container: {
      backgroundColor: theme.colors[colorScheme].white,
      flex: 1,
      paddingLeft:15,
      paddingRight:15,
      paddingTop:30,
      paddingBottom:15
  },
  textInput: {
      borderColor:theme.colors[colorScheme].lightgrey, 
      color: theme.colors[colorScheme].black,
      marginTop:15
  },
  button: {
      backgroundColor:theme.colors.accent,
      maxWidth:250,
      flexDirection:"row",
      alignItems: "center",
      justifyContent: "center",
      height: 49
  },
  loadingIndicator:{
      marginLeft:5
  },
  error: {
      color: 'red',
      marginTop:10,
      marginBottom: 10,        
  }
})