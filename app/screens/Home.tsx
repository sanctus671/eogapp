import { View, Text, Appearance, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React from 'react'
import { StatusBar } from 'expo-status-bar';
import theme from '../constants/theme';
import { useNavigation } from '@react-navigation/native';

const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";

const Home = () => {
  
  const navigation = useNavigation();


  return (
    <View style={styles.container}>
      <StatusBar style={colorScheme} />
      <Image style={{width:330,height:240}}  source={require("../../assets/logo.png")}     />
      <Text style={{color:theme.colors.white, fontFamily:theme.fonts.headings, fontSize:40, textAlign:"center", marginTop:15, marginBottom:10}}>Universal Rulebook</Text>
      <TouchableOpacity
                    activeOpacity={.7}
                    style={{...theme.layout.button, ...styles.button}}
                    onPress={() => navigation.navigate("SearchWrapper" as never)}>
                    <Text style={{textAlign:'center', color:theme.colors.white}}>Find Games</Text>
                </TouchableOpacity>


      <TouchableOpacity
          activeOpacity={.7}
          style={{...theme.layout.button, ...styles.button}}
          onPress={() => navigation.navigate("GamesWrapper" as never)}>
          <Text style={{textAlign:'center', color:theme.colors.white}}>My Games</Text>
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
    paddingBottom:60
  },
    button: {
        backgroundColor:theme.colors.accent,
        maxWidth:"100%",
        width:200,
        flexDirection:"row",
        alignItems: "center",
        justifyContent: "center",
        height: 49,
        marginTop:10
    }

})