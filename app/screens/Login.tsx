import { View, Text, TextInput, Platform, StyleSheet, TouchableOpacity, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Appearance, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { useAuth } from '../context/AuthContext';
import theme from "../constants/theme";


import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";

const Login = () => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setLoading] = useState(false);

    const { onLogin } = useAuth();

    const navigation = useNavigation();

    const insets = useSafeAreaInsets();


    const login = async () => {

        setError('');

        setLoading(true);

        const result = await onLogin!(email, password);

        if (result && result.error){
            setError(result.msg);
        }

        setLoading(false);

    };






  return (
    <TouchableWithoutFeedback onPress={() => {if (Platform.OS === "android" || Platform.OS === "ios"){Keyboard.dismiss()}}} accessible={false}>
        <View style={{...styles.container, paddingBottom:15 + insets.bottom}}>
            <StatusBar style={colorScheme} />

            <KeyboardAvoidingView behavior="padding" >

                <TextInput placeholder="Email" autoCapitalize="none" clearButtonMode="while-editing" onChangeText={(text:string) => setEmail(text)} value={email} textContentType="emailAddress"   keyboardType="email-address"
                style={{...theme.layout.input, ...styles.textInput}} placeholderTextColor={theme.colors[colorScheme].grey} />
                
                
                <TextInput placeholder="Password" clearTextOnFocus={true} autoCapitalize="none" clearButtonMode="while-editing" secureTextEntry={true} onChangeText={(text:string) => setPassword(text)} value={password} 
                style={{...theme.layout.input, ...styles.textInput}} placeholderTextColor={theme.colors[colorScheme].grey} />

                <TouchableOpacity
                    activeOpacity={.7}
                    style={{...theme.layout.button, ...styles.button, marginTop:20, opacity: (isLoading ? 0.7 : 1)}}
                    onPress={login}
                    disabled={isLoading}>
                    <Text style={{textAlign:'center', color:theme.colors.white, fontSize:16,lineHeight:16,fontWeight:700}}>Login</Text>
                    {isLoading && <ActivityIndicator style={styles.loadingIndicator} size="small" color={theme.colors.white} />}
                </TouchableOpacity>

                {error ? (
                    <Text style={styles.error}>{error}</Text>
                ) : null}

                <TouchableOpacity onPress={() => navigation.navigate("Forgot Password" as never)} activeOpacity={.7} style={{width:150}}>
                    <Text style={{color:theme.colors.accent, marginTop:10}}>Forgot Password</Text>
                </TouchableOpacity>

            

            </KeyboardAvoidingView>


            <View style={{backgroundColor:theme.colors[colorScheme].white, paddingTop:15}}>
                <Text style={{color:theme.colors[colorScheme].black, marginBottom:15, fontSize:16,lineHeight:16}}>Don't have an account?</Text>
                <TouchableOpacity
                    activeOpacity={.7}
                    style={{...theme.layout.button, ...styles.button}}
                    onPress={() => navigation.navigate("Register" as never)}>
                    <Text style={{textAlign:'center', color:theme.colors.white, fontSize:16,lineHeight:16,fontWeight:700}}>Sign Up</Text>
                </TouchableOpacity>

            </View>


        </View>
    </TouchableWithoutFeedback>
  )
}

export default Login


const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors[colorScheme].white,
        flex: 1, justifyContent: 'space-between',
        paddingLeft:15,
        paddingRight:15,
        paddingTop:30
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