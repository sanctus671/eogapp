import { Alert, Appearance, Dimensions, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import theme from '../constants/theme';
const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
import * as userService from '../services/UserService';
import * as purchaseService from '../services/PurchaseService';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
 import {
    initConnection,
    getSubscriptions,
    requestSubscription,
    purchaseUpdatedListener,
    purchaseErrorListener,
    finishTransaction,
    type ProductPurchase,
    type PurchaseError,
    flushFailedPurchasesCachedAsPendingAndroid,
    Purchase,
    withIAPContext,
    SubscriptionPurchase,
    getAvailablePurchases,
    Subscription,
    SubscriptionAndroid,
    SubscriptionIOS,
    setup,
    IapIosSk2,
    STOREKIT_OPTIONS,
    clearTransactionIOS,
    Product,
    getProducts,
    ProductIOS,
    ProductAndroid,
    requestPurchase,
    RequestPurchase
} from 'react-native-iap';
import LoadingModal from '../components/LoadingModal';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import Accordion from '../components/Accordian';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import moment from 'moment';


const productIds:any = Platform.select({
    ios: ['com.tabletopcodex.app.premiummonthly', 'com.tabletopcodex.app.premiumyearly'],
    android: ['com.tabletopcodex.app.premiummonthly', 'com.tabletopcodex.app.premiumyearly'],
});


const tierProductIds:any = Platform.select({
    ios: ['com.tabletopcodex.app.tierone', 'com.tabletopcodex.app.tiertwo', 'com.tabletopcodex.app.tierthree'],
    android: ['com.tabletopcodex.app.tierone', 'com.tabletopcodex.app.tiertwo', 'com.tabletopcodex.app.tierthree'],
});


const productIdsMap = {
    'monthly': 'com.tabletopcodex.app.premiummonthly', 
    'yearly' : 'com.tabletopcodex.app.premiumyearly', 
    'tier1' : 'com.tabletopcodex.app.tierone', 
    'tier2' : 'com.tabletopcodex.app.tiertwo', 
    'tier3' : 'com.tabletopcodex.app.tierthree'
}

type RouteParams = {
    setGameOwned:(owned:boolean) => void;
    game?: any;
  };

type NavProps = {
    navigation: NativeStackNavigationProp<{}>;
  };
  
const Upgrade = ({ navigation }: NavProps) => {

    const route = useRoute();
    const { setGameOwned, game } = route.params as RouteParams;

    const insets = useSafeAreaInsets();
    const navigationStack = useNavigation<NativeStackNavigationProp<any>>();

     const [subscriptions, setSubscriptions] = useState<Array<Subscription | SubscriptionAndroid | SubscriptionIOS>>([]);

     const [tierProducts, setTierProducts] = useState<Array<Product | ProductAndroid | ProductIOS>>([]);

    const [loadingModalVisible, setLoadingModalVisible] = useState(false);

    const [hasPurchased, setHasPurchased] = useState(false);

    const lastTransactionReceipt = useRef<string>('');

    useFocusEffect(
        React.useCallback(() => {
          if (hasPurchased) {
            navigationStack.goBack();
          }
          return () => {};
        }, [hasPurchased])
      );



    const purchaseProduct = async (productId: string) => {



        for (let subscription of subscriptions){
            if (subscription.productId && subscription.productId === productId){

           

                try {

                    if (Platform.OS === "ios"){
              
                        await requestSubscription({ sku: productId }); 

                    }
                    else if (Platform.OS === "android"){

                        let offerToken = "";
                        for (let subscription of subscriptions){
                            if (subscription.productId && subscription.productId === productId){
                                                           
                                offerToken = (subscription as SubscriptionAndroid).subscriptionOfferDetails[0]?.offerToken;
                            } 
                        }
                        
                        
                        await requestSubscription({ sku: productId,
                            subscriptionOffers: [
                                {sku: productId, offerToken: offerToken},
                              ]}); 

                    }

                } catch (error) {
                    //console.error('Purchase error:', error);
                    //Alert.alert("Purchase Product Error", JSON.stringify(error));

                    //Alert.alert("Error", "There was an error with your purchase request. Please contact support@tootloo.com for further help.");  
                }     
            
            
            }
        }
     
        
    }

     const upgradeUser = async (purchase: Purchase) => {


        try {
     
            setLoadingModalVisible(true);
            let updateUser:any = {}
            updateUser.premium = true;
            const duration = purchase.productId === productIdsMap["monthly"] ? "month" : "year";
            updateUser.premium_date = moment().add("1", duration).format("YYYY-MM-DD");
            setGameOwned(true);
            await userService.updateUser(updateUser);
        
            setLoadingModalVisible(false);
            setHasPurchased(true);

            Alert.alert("Thank you!", "Now that you've unlocked Tabletop Codex, be sure to set your name, email, and password on the My Account screen to personalize the app so you can access your games on other devices.", [
                {
                    text: 'Dismiss',
                    onPress: () => { },
                    style: 'cancel',
                  },
                  { text: 'Update Account', onPress: () => navigationStack.navigate("Account Modal") },
                ]); 
    
            //setTimeout(() => {navigation.goBack()}, 500);
 
          }
          catch (error) {
            Alert.alert("Error", "There was an error upgrading your account. Please contact support.");        
          }
    }



    const purchaseTierProduct = async (productId: string) => {


        try {
            let purchaseParams: RequestPurchase = {
                sku: productId,
                andDangerouslyFinishTransactionAutomaticallyIOS: false,
            };
            if (Platform.OS === 'android') {
                purchaseParams = { skus: [productId] };
            }
                
            await requestPurchase(purchaseParams);


        } catch (error) {
            //console.error('Purchase error:', error);
            //Alert.alert("Purchase Product Error", JSON.stringify(error));

        }     
            
     
        
    }



    const unlockGame = async () => {



        try {
     
            setLoadingModalVisible(true);            

            setGameOwned(true);

            if (game){
                await purchaseService.createGamePurchase({game_id:game.id});
            }
        
            setLoadingModalVisible(false);
            setHasPurchased(true);

            Alert.alert("Thank you!", "Now that you've unlocked " + (game ? game.name : "this game") + ", be sure to set your name, email, and password on the My Account screen to personalize the app so you can access your games on other devices.", [
                {
                    text: 'Dismiss',
                    onPress: () => { },
                    style: 'cancel',
                  },
                  { text: 'Update Account', onPress: () => navigationStack.navigate("Account Modal") },
                ]);
    
            //setTimeout(() => {navigation.goBack()}, 500);
 
          }
          catch (error) {
            Alert.alert("Error", "There was an error unlocking this game. Please contact support.");        
          }
    }


 

    const restorePurchases = async () => {
        try {
            const purchases = await getAvailablePurchases();
            //Alert.alert("Purchases: ", JSON.stringify(purchases));
            const currentDate = moment();
            const oneMonthAgo = currentDate.clone().subtract(1, 'months');
            const oneYearAgo = currentDate.clone().subtract(1, 'years');
            let foundPurchase: any = null;
            purchases.forEach(async (purchase) => {
                if (purchase.productId && productIds.includes(purchase.productId)){
                    const transactionDate = moment(purchase.transactionDate);
                    if (purchase.productId === productIdsMap["monthly"] && transactionDate.isAfter(oneMonthAgo)){
                        foundPurchase = true;
                        await upgradeUser(purchase);  
                        return;                      
                    }
                    else if (purchase.productId === productIdsMap["yearly"] && transactionDate.isAfter(oneYearAgo)){
                        foundPurchase = true;
                        await upgradeUser(purchase);
                        return;
                    }
                }
/*                 else if (purchase.productId && tierProductIds.includes(purchase.productId)){
                    if (purchase.productId === productIdsMap["tier1"]){
                        foundPurchase = true;
                        await unlockGame(purchase);
                        return;
                    }
                    else if (purchase.productId === productIdsMap["tier2"]){

                    }
                    else if (purchase.productId === productIdsMap["tier3"]){
                        
                    }
                } */
            });

            if (foundPurchase){
            }
            else{
                Alert.alert("Error", "Could not restore your purchases or they have expired."); 
            }

          } catch (err) {
            //Alert.alert("Error", JSON.stringify(err)); 
            //console.warn('restorePurchases error', err);
            Alert.alert("Error", "Could not fetch purchases."); 
          }
    }


    const getProductPrice = (productId: string) => {


        for (let subscription of subscriptions){
            if (subscription.productId && subscription.productId === productId){
                try {

                    if (Platform.OS === "ios"){
                        let planSubscription: any = subscription;
                        if (planSubscription.localizedPrice){
                            return planSubscription.localizedPrice;
                        }
                        else{
                            if (subscription.productId === productIdsMap['monthly']){
                                return "$3.99";

                            }
                            else if (subscription.productId === productIdsMap['yearly']){
                                return "$39.99";

                            }
                            return "";
                        }
                        
        
                    }
                    else if (Platform.OS === "android"){
                        let planSubscription: any = subscription;
                        if (planSubscription.subscriptionOfferDetails && 
                            planSubscription.subscriptionOfferDetails.length > 0 &&
                            planSubscription.subscriptionOfferDetails[0].pricingPhases &&
                            planSubscription.subscriptionOfferDetails[0].pricingPhases.pricingPhaseList && 
                            planSubscription.subscriptionOfferDetails[0].pricingPhases.pricingPhaseList.length > 0 && 
                            planSubscription.subscriptionOfferDetails[0].pricingPhases.pricingPhaseList[0].formattedPrice
                        )
                        return planSubscription.subscriptionOfferDetails[0].pricingPhases.pricingPhaseList[0].formattedPrice;
                    }  
                    else {
                        if (subscription.productId === productIdsMap['monthly']){
                            return "$3.99";

                        }
                        else if (subscription.productId === productIdsMap['yearly']){
                            return "$39.99";

                        }
                        return "";
                    }
                }
                catch (error){
                    if (subscription.productId === productIdsMap['monthly']){
                        return "$3.99";

                    }
                    else if (subscription.productId === productIdsMap['yearly']){
                        return "$39.99";

                    }
                    return "";
                } 
            }
        }

        if (productId === productIdsMap['monthly']){
            return "$3.99";

        }
        else if (productId === productIdsMap['yearly']){
            return "$39.99";

        }
        return "";
    }




    const getTierProductPrice = (productId: string) => {


        for (let product of tierProducts){
            if (product.productId && product.productId === productId){
                try {

                    if (Platform.OS === "ios"){
                        if (product.localizedPrice){
                            return product.localizedPrice;
                        }
                        else{
                            if (product.productId === productIdsMap['tier1']){
                                return "$0.99";

                            }
                            else if (product.productId  === productIdsMap['tier2']){
                                return "$2.99";

                            }
                            else if (product.productId  === productIdsMap['tier3']){
                                return "$2.99";

                            }
                            return "";
                        }
                        
        
                    }
                    else if (Platform.OS === "android"){

                        if (product.localizedPrice){
                            return product.localizedPrice;
                        }
                        else{
                            if (product.productId === productIdsMap['tier1']){
                                return "$0.99";

                            }
                            else if (product.productId  === productIdsMap['tier2']){
                                return "$2.99";

                            }
                            else if (product.productId  === productIdsMap['tier3']){
                                return "$2.99";

                            }
                            return "";
                        }


                    }  
                    else {

                        if (product.productId === productIdsMap['tier1']){
                            return "$0.99";

                        }
                        else if (product.productId  === productIdsMap['tier2']){
                            return "$2.99";

                        }
                        else if (product.productId  === productIdsMap['tier3']){
                            return "$2.99";

                        }
                        return "";
                    }
                }
                catch (error){

                    if (product.productId === productIdsMap['tier1']){
                        return "$0.99";

                    }
                    else if (product.productId  === productIdsMap['tier2']){
                        return "$2.99";

                    }
                    else if (product.productId  === productIdsMap['tier3']){
                        return "$2.99";

                    }
                    return "";
                } 
            }
        }


        if (productId === productIdsMap['tier1']){
            return "$0.99";

        }
        else if (productId  === productIdsMap['tier2']){
            return "$2.99";

        }
        else if (productId  === productIdsMap['tier3']){
            return "$2.99";

        }
        return "";
    }


    useEffect(() => {
        const initializeIAP = async () => {
             try {
        
                setup({storekitMode: 'STOREKIT_HYBRID_MODE'})
                const result = await initConnection();
                //console.log('IAP Connection: ', result);
          
                if (Platform.OS === 'android') {
                    await flushFailedPurchasesCachedAsPendingAndroid();
                }
                else if (Platform.OS === "ios"){
                    //await clearTransactionIOS()
                }
                let products:Array<Subscription> = await getSubscriptions({ skus: productIds } );

                let tierProducts:Array<Product> = await getProducts({skus:tierProductIds})
         
                //Alert.alert("Getting products", JSON.stringify(productIds));
                //Alert.alert("Products", JSON.stringify(products));

           
                setSubscriptions(products);
                setTierProducts(tierProducts);
            } catch (err) {
                //Alert.alert("Error Init", err);
                //console.warn(err);
            } 
        };

 
        const purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
     
            let receipt = Platform.OS === "ios" ? purchase.transactionId : purchase.transactionReceipt;
            if (receipt) {

                if(lastTransactionReceipt.current === receipt) return;
                lastTransactionReceipt.current = receipt;

                
                try {
                    
                    if (productIds.includes(purchase.productId)){
                        await upgradeUser(purchase);
                    }
                    else if (tierProductIds.includes(purchase.productId)){
                        await unlockGame();
                    }



                    const ackResult = await finishTransaction({ purchase: purchase, isConsumable : tierProductIds.includes(purchase.productId) });
                    //console.log('ackResult', ackResult);


                } catch (ackErr) {
                    //console.warn('ackErr', ackErr);

                    setLoadingModalVisible(false);
                    //Alert.alert("Error", "Purchase Error: " + ackErr);   
                    //Alert.alert("Error", "There was an error completing your purchase. Please contact support@tootloo.com for further help.");   


                    await finishTransaction({ purchase: purchase as Purchase, isConsumable : tierProductIds.includes(purchase.productId) });
                }
            }
        });

        const purchaseErrorSubscription = purchaseErrorListener(async (error: PurchaseError) => {
            //console.warn('purchaseErrorListener', error);
            
        }); 

        initializeIAP();

        return () => {
             purchaseUpdateSubscription.remove();
            purchaseErrorSubscription.remove(); 
        };
    }, []);  




    const SubscriptionDetails = () => {
        const isIos = Platform.OS === 'ios';
      
        const openLink = (url:string) => {
          Linking.openURL(url);
        };
      
        if (!isIos) {

            return (
            <>
            <Text style={styles.paragraph}>
              Tabletop Codex is free to use. You have multiple options to unlock more content. You can choose to subscribe, which is available as a monthly or yearly subscription cost, or you can unlock a single game with a one-time purchase. By subscribing, you will be charged to renew the subscription every month or every year for the plan price.
            </Text>
            <Text>{"\n"}</Text>
            <Text style={styles.paragraph}>
              Payment will be charged to your credit card through your Google Play account at confirmation of purchase. Subscription renews automatically unless cancelled at least 24 hours prior to the end of the subscription period. There is no increase in price when renewing. Subscriptions can be cancelled via Google Play after purchase. Once purchased, refunds will not be provided for any unused portion of the term. For one-time purchases, access to the selected game will remain available indefinitely. Read our full <Text style={styles.link} onPress={() => openLink('https://www.tabletopcodex.com/terms')}>Terms of Service</Text> and our <Text style={styles.link} onPress={() => openLink('https://www.tabletopcodex.com/privacy')}>Privacy Policy</Text>.
            </Text>
            </>)
        }
        
        return (
          <View style={styles.subDetailsContainer}>
            <Text style={{...styles.paragraph, marginBottom:8}}>
              You have multiple options to unlock more content in Tabletop Codex. You can choose subscribe as a monthly or yearly subscription cost, or unlock a single game with a one-time purchase. By purchasing a subscription, you will be charged to renew it every month or every year for the plan price.
            </Text>
            <Text style={styles.paragraph}>
              Payment will be charged to your credit card through your iTunes account at confirmation of purchase. Subscription renews automatically unless cancelled at least 24 hours prior to the end of the subscription period. There is no increase in price when renewing. Subscriptions can be managed and auto-renewal turned off in Account Settings in iTunes after purchase. Once purchased, refunds will not be provided for any unused portion of the term. For one-time purchases, access to the selected game will remain available indefinitely. Read our full <Text style={styles.link} onPress={() => openLink('https://www.tabletopcodex.com/terms')}>Terms of Service</Text> and our <Text style={styles.link} onPress={() => openLink('https://www.tabletopcodex.com/privacy')}>Privacy Policy</Text>.
            </Text>
          </View>
        );
      };



  return (
    <View style={styles.container}>
      <FocusAwareStatusBar style={"light"} />
        <ScrollView contentContainerStyle={styles.containerInner}>

        <View style={[styles.upgradeContainer, {minHeight: Dimensions.get("screen").height - insets.top - insets.bottom - 104}]}>
            <View>
                {game && game.price_tier ? (
                <View style={{alignItems:"center"}}>

                    <Text style={[styles.featuresHeaderText, { color: theme.colors.white, marginBottom:5 }]}>
                        Buy this game rulebook now!
                    </Text>

                    <Text style={[styles.featuresHeaderSubText, { color: theme.colors.white, marginBottom:15 }]}>
                        Unlock this one rulebook forever for a one-time cost.
                    </Text>


                    <TouchableOpacity activeOpacity={.8} onPress={() => { purchaseTierProduct(productIdsMap[game.price_tier as 'tier1' | 'tier2' | 'tier3']) }} style={{ backgroundColor: theme.colors.white, paddingHorizontal: 30, paddingVertical: 12, width: 220, marginTop: 5 }} >
                    <Text style={{ color: theme.colors.accent, fontSize: 18, fontWeight: 700, textAlign: 'center' }}>{getTierProductPrice(productIdsMap[game.price_tier as 'tier1' | 'tier2' | 'tier3'])} once</Text>
                    </TouchableOpacity>

                    <View style={styles.orContainer}>
                        <View style={styles.line} />
                        <Text style={styles.orText}>OR</Text>
                        <View style={styles.line} />
                    </View>

                </View>
                ) : null}
                
                <View style={{alignItems:"center"}}>
                    <Text style={[styles.featuresHeaderText, { color: theme.colors.white, marginBottom:5 }]}>
                        Unlock the entire library!
                    </Text>

                    <Text style={[styles.featuresHeaderSubText, { color: theme.colors.white, marginBottom:15 }]}>
                        Subscribe to unlock all rulebooks. Choose a monthly or yearly subscription.
                    </Text>

         
                    <TouchableOpacity activeOpacity={.8} onPress={() => { purchaseProduct(productIdsMap['monthly']) }} style={{ backgroundColor: theme.colors.white, paddingHorizontal: 30, paddingVertical: 12, width: 220, marginTop: 5 }} >
                    <Text style={{ color: theme.colors.accent, fontSize: 18, fontWeight: 700, textAlign: 'center' }}>{getProductPrice(productIdsMap['monthly'])} per month</Text>
                    </TouchableOpacity>




                    <View style={{backgroundColor:"#cb5f4c", width:220, paddingHorizontal:10, paddingVertical:5, marginTop:20, marginBottom:5}}>
                            <Text style={styles.annualText}>Get 2 months free!</Text>
                        </View>
                    <TouchableOpacity activeOpacity={.8} onPress={() => { purchaseProduct(productIdsMap['yearly']) }} style={{ backgroundColor: theme.colors.white, paddingHorizontal: 30, paddingVertical: 12, width: 220 }} >
                        <Text style={{ color: theme.colors.accent, fontSize: 18, fontWeight: 700, textAlign: 'center' }}>{getProductPrice(productIdsMap['yearly'])} per year</Text>

                    </TouchableOpacity>

                    { Platform.OS === "android" ? 
                    <View style={{marginTop:20,marginBottom:0}}>
                        <Text style={styles.disclaimerText}>Billing starts at confirmation of purchase. Subscription renews automatically. Cancel via Google Play.</Text>
                    </View>
                    : null }


                </View>


                <View style={[styles.featuresContainer]}>

                    <Text style={[styles.featuresHeaderSubText, { color: theme.colors.white }, {marginBottom:15}]}>
                        Subscription benefits
                    </Text>


                    <View style={styles.featuresIconRow}>
                        <Ionicons name="person-circle-outline" size={34} color={theme.colors.white} />
                        <Text style={[styles.featuresIconText, { color: theme.colors.white, fontWeight:'bold' }]}>
                        Get hundreds of game rules with one easy subscription
                        </Text>
                    </View>

                    <View style={styles.featuresIconRow}>
                        <Ionicons name="library-outline" size={34} color={theme.colors.white} />
                        <Text style={[styles.featuresIconText, { color: theme.colors.white }]}>
                        Create your own library of game summaries you can easily access
                        </Text>
                    </View>

                    <View style={styles.featuresIconRow}>
                        <MaterialCommunityIcons name="folder-multiple-plus-outline" size={34} color={theme.colors.white} />
                        <Text style={[styles.featuresIconText, { color: theme.colors.white }]}>
                        New summaries constantly added - so the value keeps increasing!
                        </Text>
                    </View>
                </View>
            </View>

        </View>

        <View style={{  }}>
         
            <Accordion headerText={"Subscription & Payment Details"} outsideColorScheme={colorScheme} key={1} search={""}>
                    {SubscriptionDetails()}
            </Accordion>

        </View>

        <View style={{marginBottom:100}}>
            <Accordion headerText={"Restore Purchases"} outsideColorScheme={colorScheme} key={2} search={""}>

            { Platform.OS === "android" ? 
                <>
             <Text style={styles.paragraph}>Already subscribed? Restore your subscription using the button below.</Text>

            { Platform.OS === "android" ? <Text>{"\n"}{"\n"}{"\n"}</Text> : ""}

             <TouchableOpacity style={styles.restoreButton} activeOpacity={.8} onPress={() => {restorePurchases()}} >
                        <Text style={styles.restoreButtonName}>Restore Purchases</Text>
                        
                </TouchableOpacity>  
                </>

                : 

                <View>
             <Text style={{...styles.paragraph, marginBottom:8}}>Already subscribed? Restore your subscription using the button below.</Text>


                <TouchableOpacity style={styles.restoreButton} activeOpacity={.8} onPress={() => {restorePurchases()}} >
                            <Text style={styles.restoreButtonName}>Restore Purchases</Text>
                            
                    </TouchableOpacity>                     
                </View>
            }
     
            </Accordion>
        </View>



        
    </ScrollView>




    <View style={{ alignItems: "center", justifyContent: "center", marginBottom: 10 + insets.bottom, paddingTop: 10 }}>
        <TouchableOpacity activeOpacity={.8} onPress={() => { navigation.goBack() }}  >
          <Text style={{ color: theme.colors.accent, fontSize: 14, fontWeight:500 }}>Not now</Text>
        </TouchableOpacity>
      </View>



    <LoadingModal modalVisible={loadingModalVisible} color={theme.colors.primary} task={"Loading..."}  darkMode={colorScheme === "dark" ? true : false} />


    
</View>
  )
}

export default Upgrade


const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors[colorScheme].white,
    },
    containerInner: {
      marginBottom: 40
    },
    subDetailsContainer: {
      flex: 1,
      width: "100%"
    },
    upgradeContainer: {
      backgroundColor: theme.colors.accent,
      paddingHorizontal: 30,
      paddingTop: 40,
      paddingBottom: 40,
      justifyContent:'center'
    },
    annualText: {
      fontSize: 14,
      lineHeight: 16,
      color:theme.colors.white,
      textAlign:"center"
    },
    disclaimerText: {
      fontSize: 12,
      lineHeight: 14,
      color:theme.colors.white,
      textAlign:"center"
    },
  
    title: {
      fontSize: 18,
      color: theme.colors[colorScheme].black,
      textAlign: 'center',
      marginBottom: 8
    },
    paragraph: {
      fontSize: 14,
      lineHeight: 20,
      color: theme.colors[colorScheme].black,
    },
    link: {
      color: theme.colors.primary,
      textDecorationLine: 'underline',
    },
    restoreButton: {
      backgroundColor: theme.colors.accent,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      flex: 1,
      paddingLeft: 15,
      paddingRight: 15,
      paddingTop: 16,
      paddingBottom: 16,
      marginTop: 10
    },
    restoreButtonName: {
      color: theme.colors.white,
      fontSize: 14,
      fontWeight: "700"
    },
    featuresContainer: {
      marginTop:30,
      alignItems:'center'
    },
    featuresHeaderText: {
      fontSize: 22,
      fontWeight: '700',
      textAlign: 'center',
    },
    featuresHeaderSubText: {
      fontSize: 16,
      fontWeight: '500',
      textAlign: 'center',
    },
    featuresIconRow: {
      flexDirection: "row",
      alignItems: 'center',
      flex: 1,
      marginBottom: 25,
      maxWidth:290,
      paddingHorizontal:10
    },
    featuresIconText: {
      marginLeft: 10,
      fontSize: 16,
      lineHeight: 18,
      flex: 1,
      flexWrap: 'wrap'
    },
    orContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 40,
      marginBottom: 30,
      width:"100%"
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.white,
      opacity: 0.6
    },
    orText: {
      marginHorizontal: 10,
      color: theme.colors.white,
      fontSize: 22,
      fontWeight: '700',
      textAlign: 'center',
    },
  });
  