import { View, Text, Appearance, StyleSheet, Image, TouchableOpacity } from 'react-native'
import React, { useEffect } from 'react'
import { StatusBar } from 'expo-status-bar';
import theme from '../constants/theme';
import { useNavigation } from '@react-navigation/native';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import * as userService from '../services/UserService';
import { useAuth } from '../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { getAvailablePurchases } from 'react-native-iap';
import moment from 'moment';

const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";

const Home = () => {
  
  const navigation = useNavigation();
  
  const { authState, onLogout } = useAuth();

  const productIdsMap = {'monthly': 'com.tabletopcodex.app.premiummonthly', 'yearly' : 'com.tabletopcodex.app.premiumyearly'}
	

  const checkForSubscriptionUpdates = async (fetchedUser: any) => {
    const currentDate = moment();
    const oneMonthAgo = moment().subtract(1, 'months'); 
    const oneYearAgo = moment().subtract(1, 'years'); 

	if (!fetchedUser.premium || (fetchedUser.premium_date && moment(fetchedUser.premium_date).isAfter(currentDate))) return;

    try {
        const purchases = await getAvailablePurchases();
        let foundLevel = "";

        purchases.forEach(async (purchase) => {
            if (purchase.productId === productIdsMap["monthly"]) {
                const transactionDate = moment(purchase.transactionDate); 
                if (foundLevel !== "yearly" && transactionDate.isAfter(oneMonthAgo, "day")) {
                    foundLevel = "monthly";
                }
            } else if (purchase.productId === productIdsMap["yearly"]) {
                const transactionDate = moment(purchase.transactionDate);

                if (transactionDate.isAfter(oneYearAgo, "day")) {
                    foundLevel = "yearly";
                }
            }
        })

        if (foundLevel !== "monthly" && foundLevel !== "yearly") {
            await userService.updateUser({ premium: 0, premium_date: "" });
        } else {
            const duration = foundLevel === "monthly" ? "month" : "year";
            const updateUser = {
            premium: true,
            premium_date: moment().add(1, duration).format("YYYY-MM-DD"),
            };
            await userService.updateUser(updateUser);
        }
    } catch (err) {
        //console.error("Error checking subscription updates:", err);
    }
    
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const fetchedUser:any = await userService.getUserData();
        checkForSubscriptionUpdates(fetchedUser);
      } catch (error) {
        await onLogout!();
      }
    };

    fetchUserData();
  }, []);  


  return (
    <View style={styles.container}>
      <FocusAwareStatusBar style={colorScheme} />
      <Image style={{width:230,height:280, marginBottom:10}}  source={require("../../assets/tabletopcodex.png")}     />
      <TouchableOpacity
                    activeOpacity={.7}
                    style={{...theme.layout.button, ...styles.button,backgroundColor:theme.colors.accent}}
                    onPress={() => navigation.navigate("SearchWrapper" as never)}>
                        <Ionicons name="search-outline" size={18} color={theme.colors.white} />
                    <Text style={{marginLeft:5, textAlign:'center', color:theme.colors.white,fontSize:16, fontWeight:"700"}}>Find Games</Text>
                </TouchableOpacity>


      <TouchableOpacity
          activeOpacity={.7}
          style={{...theme.layout.button, ...styles.button, backgroundColor:theme.colors.accent}}
          onPress={() => navigation.navigate("GamesWrapper" as never)}>
            
            <Ionicons name="library-outline" size={18} color={theme.colors.white} />
          <Text style={{marginLeft:5, textAlign:'center', color:theme.colors.white,fontSize:16, fontWeight:"700"}}>My Games</Text>
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
        maxWidth:"100%",
        width:200,
        flexDirection:"row",
        alignItems: "center",
        justifyContent: "center",
        height: 55,
        marginTop:10
    }

})