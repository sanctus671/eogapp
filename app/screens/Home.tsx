import { View, Text, Appearance, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import theme from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import * as userService from '../services/UserService';
import { useAuth } from '../context/AuthContext';

const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";

const Home = () => {
  
  const navigation = useNavigation();
  
  const { authState, onLogout } = useAuth();


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const fetchedUser:any = await userService.getUserData();
      } catch (error) {
        await onLogout!();
      }
    };

    fetchUserData();
  }, []);  


  return (
    <View style={styles.container}>
      <FocusAwareStatusBar style={colorScheme} />
      <Image style={{width:330,height:240}}  source={require("../../assets/logo.png")}     />
      <Image style={{width:230,height:140, marginTop:15, marginBottom:10}}  source={require("../../assets/apptitle.png")}     />
      <TouchableOpacity
                    activeOpacity={.7}
                    style={{...theme.layout.button, ...styles.button}}
                    onPress={() => navigation.navigate("SearchWrapper" as never)}>
                    <Text style={{textAlign:'center', color:theme.colors.white,fontSize:16}}>Find Games</Text>
                </TouchableOpacity>


      <TouchableOpacity
          activeOpacity={.7}
          style={{...theme.layout.button, ...styles.button}}
          onPress={() => navigation.navigate("GamesWrapper" as never)}>
          <Text style={{textAlign:'center', color:theme.colors.white,fontSize:16}}>My Games</Text>
      </TouchableOpacity>


    </View>
  )
}

export default Home


const styles = StyleSheet.create({    
  
  container: {
    backgroundColor: "#52595D",
    flex: 1, justifyContent: 'center',
    alignItems:'center',
    paddingLeft:15,
    paddingRight:15,
    paddingTop:15,
    paddingBottom:15
  },
    button: {
        backgroundColor:theme.colors.accent,
        maxWidth:"100%",
        width:200,
        flexDirection:"row",
        alignItems: "center",
        justifyContent: "center",
        height: 55,
        marginTop:10
    }

})