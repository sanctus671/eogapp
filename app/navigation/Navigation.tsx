import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { View, Text, Button, TextInput, Platform, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native'
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import Tabs from "./Tabs";
import Login from "../screens/Login";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import theme from "../constants/theme";
import Register from "../screens/Register";
import ForgotPassword from "../screens/ForgotPassword";
import Upgrade from "../screens/Upgrade";
import UpgradeTest from "../screens/UpgradeTest";
import Account from "../screens/Account";
import { ImageScreen } from "../screens/Image";


const Stack = createNativeStackNavigator();

export const Navigation = () => {
  
    const { authState, onRegisterAnonymous } = useAuth();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authState?.ready) {
            setIsLoading(false);
        } else {
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 10000); // 10 seconds timeout

            return () => clearTimeout(timer);
        }
    }, [authState]);

    if (isLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    const registerAnonymous = async () => {
      const result = await onRegisterAnonymous!();
    }

  
    return (<NavigationContainer>
        <Stack.Navigator screenOptions={{headerLargeTitleStyle:{fontFamily:theme.fonts.headings, color: theme.colors.white}, headerLargeTitle:true, headerLargeStyle: {backgroundColor:theme.colors.primary}, 
              headerStyle: {backgroundColor:theme.colors.primary}, headerTitleStyle:{color:theme.colors.white}, headerTransparent: true, headerTintColor: theme.colors.white}}>
  
          { authState?.authenticated ? 
            (<>
            <Stack.Screen name="Tabs" component={Tabs} options={{headerShown:false}}></Stack.Screen>
            <Stack.Screen 
                            name="Upgrade" 
                            component={Upgrade} 
                            options={({ navigation }) => ({

                                headerBackTitle: 'Back',

                                animation: (Platform.OS === "android" ? "fade_from_bottom" : "default"),
                                title:"Unlock",
                        /*         presentation: "modal", */
                                headerLargeTitle: false,
                                headerTransparent: false,
                                headerLargeStyle: { backgroundColor: theme.colors.darkgrey },
                                headerStyle: { backgroundColor: theme.colors.darkgrey },
/*                                 headerRight: () => (
                                    Platform.OS === "ios" ? 
                                        <TouchableOpacity
                                            onPress={() => navigation.goBack()}
                                            style={{ paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 0 }}
                                        >
                                            <Text style={{ color: theme.colors.accent, fontSize: 16 }}>Close</Text>
                                        </TouchableOpacity> 
                                        : <></>
                                ) */
                            })} 
                        />

                    <Stack.Screen 
                            name="Account Modal" 
                            component={Account} 
                            options={({ navigation }) => ({

                                headerBackTitle: 'Back',

                                animation: (Platform.OS === "android" ? "fade_from_bottom" : "default"),
                                title:"My Account",
                        /*         presentation: "modal", */
                                headerLargeTitle: false,
                                headerTransparent: false,
                                headerLargeStyle: { backgroundColor: theme.colors.darkgrey },
                                headerStyle: { backgroundColor: theme.colors.darkgrey },
/*                                 headerRight: () => (
                                    Platform.OS === "ios" ? 
                                        <TouchableOpacity
                                            onPress={() => navigation.goBack()}
                                            style={{ paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 0 }}
                                        >
                                            <Text style={{ color: theme.colors.accent, fontSize: 16 }}>Close</Text>
                                        </TouchableOpacity> 
                                        : <></>
                                ) */
                            })} 
                        />

                        <Stack.Screen 
                                name="Image" 
                                component={ImageScreen} 
                                options={({ navigation }) => ({
    
                                    headerBackTitle: 'Back',
    
                                    animation: (Platform.OS === "android" ? "fade_from_bottom" : "default"),
                                    title:"",
                                    presentation: "modal",
                                    headerLargeTitle: false,
                                    headerTransparent: false,
                                    headerLargeStyle: { backgroundColor: theme.colors.darkgrey },
                                    headerStyle: { backgroundColor: theme.colors.darkgrey },
                                 headerRight: () => (
                                    Platform.OS === "ios" ? 
                                        <TouchableOpacity
                                            onPress={() => navigation.goBack()}
                                            style={{ paddingTop: 10, paddingBottom: 10, paddingLeft: 10, paddingRight: 0 }}
                                        >
                                            <Text style={{ color: theme.colors.accent, fontSize: 16 }}>Close</Text>
                                        </TouchableOpacity> 
                                        : <></>
                                ) 
                                })} 
                            />




            </> )
            :
            (
              <>
            <Stack.Screen name="Login" component={Login} options={{headerTransparent: false, headerRight:() => (
              <View style={{flexDirection:"row", alignItems:"center"}}>
                  <TouchableOpacity onPress={registerAnonymous}><Text style={{color:theme.colors.white, paddingRight:5, fontSize:16}}>Skip Registration</Text></TouchableOpacity>
              </View>
              )}}></Stack.Screen>
              <Stack.Screen name="Register" component={Register} options={{headerTransparent: false}}></Stack.Screen>
              <Stack.Screen name="Forgot Password" component={ForgotPassword} options={{headerTransparent: false}}></Stack.Screen>
              </>
              
          
          
          )
          }
  
  
        </Stack.Navigator>
    </NavigationContainer>);
  }


  
const styles = StyleSheet.create({    
  
    container: {
      backgroundColor: "#52595D",
      flex: 1, justifyContent: 'center',
      alignItems:'center'
    }
  })