import { NavigationContainer } from "@react-navigation/native";
import { View, Text, Button, TextInput, Platform, StyleSheet, TouchableOpacity } from 'react-native'
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Tabs from "./Tabs";
import Login from "../screens/Login";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import theme from "../constants/theme";
import Register from "../screens/Register";
import ForgotPassword from "../screens/ForgotPassword";


const Stack = createNativeStackNavigator();

export const Navigation = () => {
  
    const { authState, onRegisterAnonymous } = useAuth();

    if (!authState?.ready){
      return (<View><Text></Text></View>)
    }

    const registerAnonymous = async () => {
      const result = await onRegisterAnonymous!();
    }

  
    return (<NavigationContainer>
        <Stack.Navigator screenOptions={{headerLargeTitleStyle:{fontFamily:theme.fonts.headings, color: theme.colors.white}, headerLargeTitle:true, headerLargeStyle: {backgroundColor:theme.colors.primary}, 
              headerStyle: {backgroundColor:theme.colors.primary}, headerTitleStyle:{color:theme.colors.white}, headerTransparent: true, headerTintColor: theme.colors.white}}>
  
          { authState?.authenticated || true ? 
            (<>
            <Stack.Screen name="Tabs" component={Tabs} options={{headerShown:false}}></Stack.Screen>
            </> )
            :
            (
              <>
            <Stack.Screen name="Login" component={Login} options={{headerRight:() => (
              <View style={{flexDirection:"row", alignItems:"center"}}>
                  <TouchableOpacity onPress={registerAnonymous}><Text style={{color:theme.colors.white, paddingRight:5, fontSize:16}}>Skip</Text></TouchableOpacity>
              </View>
              )}}></Stack.Screen>
              <Stack.Screen name="Register" component={Register} ></Stack.Screen>
              <Stack.Screen name="Forgot Password" component={ForgotPassword} ></Stack.Screen>
              </>
              
          
          
          )
          }
  
  
        </Stack.Navigator>
    </NavigationContainer>);
  }