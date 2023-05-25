import { Appearance, ImageBackground, StyleSheet, Text, View, Image, Linking, Platform, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import theme from '../../constants/theme';
import * as gameService from '../../services/GameService';
const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
import * as purchaseService from '../../services/PurchaseService';


  type GameProps = {
    id?:number; 'name'?:string; 'owned'?:boolean; 'description'?:string; 'price_tier'?: string; 'rules_file'?: string; 'banner_image'?: string; 'description_image'?: string; 
    'designers'?:string; 'artist'?:string; 'publisher'?: string; 'year_published'?:string; 'number_of_players'?:string; 'ages'?:string; 'playing_time'?:string; 
    'website'?: string; 'notes'?:string; 'created_at'?: Date; 'updated_at'?: Date; 'game_rules'?: any;
  }



const GamePurchase = ({ id }: {id: number}) => {


    const productId = "com.eogapp.app.game"; //TODO update with product data once inapp products are created
    const priceTiers:any = {
        "tier1" : "$1.99",
        "tier2" : "$2.99",
        "tier3" : "$3.99"
    }
    const [loading, setLoading] = useState(true);

    const [game, setGame] = useState<GameProps>({
        id: id
    });

    const openWebsite = (url?:string) => {
        if (url){
            Linking.openURL(url); 
        }
      };

      useEffect(() => {
        const fetchPosts = async () => {
          try {
            const fetchedGame:GameProps = await gameService.getGame(7);
            setGame(fetchedGame);
            setLoading(false);
          } catch (error) {
            console.error('Error fetching posts:', error);
            setLoading(false);
          }
        };
    
        fetchPosts();
      }, []);


    const restorePurchase = async () => { 
        // IAPs do not work in Expo Go :(
        if (Platform.OS !== "ios" && Platform.OS !== "android") return false;
    
        const InAppPurchases = await import("expo-in-app-purchases");
    
        try {
          await InAppPurchases.connectAsync();
    
          const { results } = await InAppPurchases.getPurchaseHistoryAsync();
    
          for (const result of results || []) {
            if (result.productId.indexOf(productId) > -1 && result.acknowledged) {
              
    
                await purchaseService.createPurchase({game_id:id});

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

    
                await purchaseService.createPurchase({game_id:id});


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
        (loading ? 
            <View style={{flex:1, alignItems:"center", justifyContent: "center"}}><ActivityIndicator size="large" color={theme.colors[colorScheme].black} /></View> : 
            (
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
        )

    )
}

export default GamePurchase

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