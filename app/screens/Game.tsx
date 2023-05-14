import { Appearance, ImageBackground, StyleSheet, Text, View, Image, Linking, Platform, TouchableOpacity, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import theme from '../constants/theme';
const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";

type RouteParams = {
    id: number;
    name: string;
    owned: boolean;
  };

  type NavProps = {
    navigation: NativeStackNavigationProp<{}>;
  };

  type GameProps = {
    id?:number; 'name':string; 'owned':boolean; 'description'?:string; 'price_tier'?: string; 'rules_file'?: string; 'banner_image'?: string; 'description_image'?: string; 
    'designers'?:string; 'artist'?:string; 'publisher'?: string; 'year_published'?:string; 'number_of_players'?:string; 'ages'?:string; 'playing_time'?:string; 
    'website'?: string; 'notes'?:string; 'created_at'?: Date; 'updated_at'?: Date; 
  }



const Game = ({ navigation }: NavProps) => {

    const route = useRoute();
    const { id, name, owned } = route.params as RouteParams;
    const productId = "com.eogapp.app.game"; //TODO update with product data once inapp products are created
    const priceTiers:any = {
        "tier1" : "$1.99",
        "tier2" : "$2.99",
        "tier3" : "$3.99"
    }


    const [game, setGame] = useState<GameProps>({
        id: id,
        name: name,
        owned: owned,
        created_at: new Date(),
        updated_at: new Date()
    });

    const openWebsite = (url?:string) => {
        if (url){
            Linking.openURL(url); 
        }
      };


    useEffect(() => {
        // Update the stack header options when the component mounts
        navigation.setOptions({
          headerTitle: name
        });
      }, []);


    //TODO hardcoded until API is live
    useEffect(() => {
        setGame({
            id: id,
            name: name,
            owned: owned,
            description: "",
            price_tier:"tier1",
            rules_file: "",
            banner_image: "https://www.orderofgamers.com/wordpress/wp-content/uploads/2018/02/fallout.jpg",
            description_image: "https://www.orderofgamers.com/wordpress/wp-content/uploads/2018/02/fallout_box.png",
            designers: "Andrew Fischer, Nathan I Hajek",
            artist: "?",
            publisher: "Fantasy Flight Games",
            year_published: "2017",
            number_of_players: "1-4",
            ages: "14+",
            playing_time: "120-180 minutes",
            website: "https://www.fantasyflightgames.com/en/news/2017/8/8/fallout/",
            notes: "Includes the Atomic Bonds and New California expansions.",
            created_at: new Date(),
            updated_at: new Date()
        });
    }, []);


    const restoreUpgrade = async () => { 
        // IAPs do not work in Expo Go :(
        if (Platform.OS !== "ios" && Platform.OS !== "android") return false;
    
        const InAppPurchases = await import("expo-in-app-purchases");
    
        try {
          await InAppPurchases.connectAsync();
    
          const { results } = await InAppPurchases.getPurchaseHistoryAsync();
    
          for (const result of results || []) {
            if (result.productId.indexOf(productId) > -1 && result.acknowledged) {
              
                //TODO: update purcahse in DB

              await InAppPurchases.disconnectAsync();
              return true;
            }
          }
          await InAppPurchases.disconnectAsync();
          return false;
        } catch (e) {
          await InAppPurchases.disconnectAsync();
          throw e;
        }
      }    

      const buy = async(
        item: string,
        onSuccess: () => Promise<void> | void
      ) => {
        // IAPs do not work in Expo Go :(
        if (Platform.OS !== "ios" && Platform.OS !== "android") return false;
    
        const InAppPurchases = await import("expo-in-app-purchases"),
          { IAPResponseCode } = await import("expo-in-app-purchases");
    
        try {
          await InAppPurchases.connectAsync();
    
          await InAppPurchases.getProductsAsync([item]);
    
          InAppPurchases.purchaseItemAsync(item).then((_) => {});
    
          return await new Promise((resolve, reject) => {
            InAppPurchases.setPurchaseListener(async (result) => {
              switch (result.responseCode) {
                case IAPResponseCode.OK:
                case IAPResponseCode.DEFERRED:
                  await onSuccess();
                  await InAppPurchases.finishTransactionAsync(
                    result.results![0],
                    false
                  );

                  //TODO: update purchase in DB


                  await InAppPurchases.disconnectAsync();
                  return resolve(true);
                case IAPResponseCode.USER_CANCELED:
                  await InAppPurchases.disconnectAsync();
                  return resolve(false);
                case IAPResponseCode.ERROR:
                  await InAppPurchases.disconnectAsync();
                  return reject(new Error("IAP Error: " + result.errorCode));
              }
            });
          });
        } catch (e) {
          await InAppPurchases.disconnectAsync();
          throw e;
        }
      }


      

    return (
        <ScrollView style={styles.container} contentInsetAdjustmentBehavior="automatic">
            <View style={styles.gameBanner}>
                <ImageBackground source={{ uri: game.banner_image}} resizeMode="cover" style={{...styles.gameBanner, flex:1 }}></ImageBackground>
            </View>

            <View style={styles.gameDescription}>
                <View style={styles.gameDescriptionImage}>
                    <Image source={{uri: game.description_image}} style={styles.gameDescriptionImageFile} resizeMode="contain" />
                </View>
                <View style={styles.gameDescriptionInfo}>

                    {(game.designers ?
                    <Text style={{...styles.gameDescriptionInfoItem}}>
                        <Text style={styles.gameDescriptionInfoItemLabel}>Designers(s):</Text>
                        {game.designers}
                    </Text> : <></>)}

                    {(game.artist ?
                    <Text style={{...styles.gameDescriptionInfoItem}}>
                        <Text style={styles.gameDescriptionInfoItemLabel}>Artist/Graphic Designer:</Text>
                        {game.artist}
                    </Text> : <></>)}

                    {(game.publisher ?
                    <Text style={{...styles.gameDescriptionInfoItem}}>
                        <Text style={styles.gameDescriptionInfoItemLabel}>Publisher:</Text>
                        {game.publisher}
                    </Text> : <></>)}

                    {(game.year_published ?
                    <Text style={{...styles.gameDescriptionInfoItem}}>
                        <Text style={styles.gameDescriptionInfoItemLabel}>Year Published:</Text>
                        {game.year_published}
                    </Text> : <></>)}

                    {(game.number_of_players ?
                    <Text style={{...styles.gameDescriptionInfoItem}}>
                        <Text style={styles.gameDescriptionInfoItemLabel}># of Players:</Text>
                        {game.number_of_players}
                    </Text> : <></>)}

                    {(game.ages ?
                    <Text style={{...styles.gameDescriptionInfoItem}}>
                        <Text style={styles.gameDescriptionInfoItemLabel}>Ages:</Text>
                        {game.ages}
                    </Text> : <></>)}

                    {(game.playing_time ?
                    <Text style={{...styles.gameDescriptionInfoItem}}>
                        <Text style={styles.gameDescriptionInfoItemLabel}>Playing Time:</Text>
                        {game.playing_time}
                    </Text> : <></>)}

                    {(game.website ?
                    <Text style={{...styles.gameDescriptionInfoItem}}>
                        <Text style={styles.gameDescriptionInfoItemLabel}>Website:</Text>
                        <Text style={{color:theme.colors.accent}} onPress={() => openWebsite(game.website)}>{(game.publisher ? game.publisher : "View website")}</Text>
                    </Text> : <></>)}                
                </View>

            </View>


            <View style={styles.gamePurchase}>
                <Text style={styles.gamePurchaseTitle}>Buy the rules & reference</Text>
                <TouchableOpacity style={styles.gamePurchaseButton} activeOpacity={.8} onPress={() => buy} >
                        <Text style={styles.gamePurchaseName}>{game.name}</Text>
                        {(game.price_tier ? 
                        <Text style={styles.gamePurchasePrice}>{priceTiers[game.price_tier]}</Text>
                        : <></>)}
                        
                </TouchableOpacity>        
            </View>

            {(game.notes ?            
            <View style={styles.gameNotes}>
                <Text style={styles.gameNotesTitle}>Notes</Text>
                <Text style={styles.gameNotesNote}>{game.notes}</Text>
            </View>
             : <></>)}


        </ScrollView>

    )
}

export default Game

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors[colorScheme].white,
        flex:1        
    },
    gameBanner:{
        justifyContent: 'center',
        height:180
    },
    gameDescription:{
        flexDirection: 'row',
        marginLeft:15,
        paddingLeft:10,
        marginRight:15,
        paddingRight:10,
        paddingTop:20,
        paddingBottom:20,
        marginBottom:10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors[colorScheme].darkgrey
    },
    gameDescriptionImage: {
        flex: 1,
        width: '45%',
        alignItems:"flex-start"
    },
    gameDescriptionImageFile: {
        flex:1,
        height:"auto",
        width:"100%",
        alignItems:"flex-start"
    },
    gameDescriptionInfo: {
        flex: 2,
        width: '55%'
    },
    gameDescriptionInfoItem: {
        marginBottom:3,
        color: theme.colors[colorScheme].black,
        fontSize: 12,
        paddingRight:5,
        paddingLeft:20
    },
    gameDescriptionInfoItemLabel: {
        color: theme.colors[colorScheme].darkgrey,
        marginRight:5
    },
    gamePurchase: {
        borderBottomWidth:1,
        borderBottomColor:theme.colors[colorScheme].darkgrey,
        marginLeft:15,
        marginRight:15,   
        paddingBottom:15 ,
        marginBottom:10
    },
    gamePurchaseTitle: {
        color: theme.colors[colorScheme].darkgrey,
        textTransform:"uppercase",
        letterSpacing: 2,
        fontSize:12,
        paddingLeft:15,
        paddingRight:15,
        fontWeight:"bold"
    },
    gamePurchaseButton: {
        backgroundColor: theme.colors.accent,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems:"center",
        flex:1,
        paddingLeft:15,
        paddingRight:15,
        paddingTop:6,
        paddingBottom:6,
        marginTop:10
    },
    gamePurchaseName: {
        color:theme.colors.white,
        fontSize:13,
        fontWeight:"500"
        },
    gamePurchasePrice: {
        color: theme.colors.white,
        fontSize:16,
        fontWeight: "500"
    },
    gameNotes: {
        marginLeft:15,
        marginRight:15,   
        paddingBottom:15
    },
    gameNotesTitle: {
        color: theme.colors[colorScheme].darkgrey,
        textTransform:"uppercase",
        letterSpacing: 2,
        fontSize:12,
        paddingLeft:15,
        paddingRight:15,
        fontWeight:"bold",
        marginBottom:15

    },
    gameNotesNote: {
        color: theme.colors[colorScheme].black,
        fontSize: 12,
        paddingLeft:15,
        paddingRight:15,
    }



})