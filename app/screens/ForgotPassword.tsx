import { View, Text, Button, TextInput, Platform, StyleSheet, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, useColorScheme, Appearance, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext';
import theme from "../constants/theme";

import {
    SafeAreaProvider,
    useSafeAreaInsets,
  } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import Toast, { BaseToast } from 'react-native-toast-message';

const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";



const ForgotPassword = () => {

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setLoading] = useState(false);

  const { onResetPassword } = useAuth();

  const requestReset = async () => {

    setError('');

    setLoading(true);

    const result = await onResetPassword!(email);

    setLoading(false);

    if (result && result.error){
        setError(result.msg);
        return;
    }

    Toast.show({
        type: 'success',
        text1: 'Recovery email has been sent.',
        position:"bottom",
        onPress: () => {Toast.hide()}
      });

      setEmail("");

};

  return (
    <TouchableWithoutFeedback onPress={() => {if (Platform.OS === "android" || Platform.OS === "ios"){Keyboard.dismiss()}}} accessible={false}>
        <View style={styles.container}>
            <StatusBar style={colorScheme} />

            <KeyboardAvoidingView behavior="padding" >

                <TextInput placeholder="Email" autoCapitalize="none" clearButtonMode="while-editing" onChangeText={(text:string) => setEmail(text)} value={email} textContentType="emailAddress"   keyboardType="email-address"
                style={{...theme.layout.input, ...styles.textInput}} placeholderTextColor={theme.colors[colorScheme].grey} />
                
   
                <TouchableOpacity
                    activeOpacity={.7}
                    style={{...theme.layout.button, ...styles.button, marginTop:20, opacity: (isLoading ? 0.7 : 1)}}
                    onPress={requestReset}
                    disabled={isLoading}>
                    <Text style={{textAlign:'center', color:theme.colors.white, fontSize:16,lineHeight:16, fontWeight: "700"}}>Reset</Text>
                    {isLoading && <ActivityIndicator style={styles.loadingIndicator} size="small" color={theme.colors.white} />}
                </TouchableOpacity>

                {error ? (
                    <Text style={styles.error}>{error}</Text>
                ) : null}

            

            </KeyboardAvoidingView>

            <Toast config={{  
                success: (props:any) => 
                ( <BaseToast {...props} style={
                { backgroundColor:theme.colors[colorScheme].lightgrey, borderLeftColor: theme.colors.secondary }} text1Style={{color:theme.colors[colorScheme].black}}
                />  
                )   
                }} />


        </View>
    </TouchableWithoutFeedback>
  )
}

export default ForgotPassword

const styles = StyleSheet.create({
  container: {
      backgroundColor: theme.colors[colorScheme].white,
      paddingLeft:15,
      paddingRight:15,
      paddingTop:30,
      paddingBottom:15,
      flex:1
  },
  textInput: {
      borderColor:theme.colors[colorScheme].lightgrey, 
      color: theme.colors[colorScheme].black,
      marginTop:15,
      fontSize:16
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