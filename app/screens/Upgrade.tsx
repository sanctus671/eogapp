import { Alert, Appearance, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import theme from '../constants/theme';
const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
import * as userService from '../services/UserService';
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
    ProrationModesAndroid,
    setup,
    IapIosSk2,
    STOREKIT_OPTIONS,
    clearTransactionIOS
} from 'react-native-iap';
import LoadingModal from '../components/LoadingModal';
import { useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import Accordion from '../components/Accordian';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import moment from 'moment';


const productIds = ['com.tabletopcodex.app.premiummonthly', 'com.tabletopcodex.app.premiumyearly'];
const productIdsMap = {'monthly': 'com.tabletopcodex.app.premiummonthly', 'yearly' : 'com.tabletopcodex.app.premiumyearly'}

type RouteParams = {
    setGameOwned:(owned:boolean) => void;
  };

type NavProps = {
    navigation: NativeStackNavigationProp<{}>;
  };
  
const Upgrade = ({ navigation }: NavProps) => {

    const route = useRoute();
    const { setGameOwned } = route.params as RouteParams;

    const insets = useSafeAreaInsets();

     const [subscriptions, setSubscriptions] = useState<Array<Subscription | SubscriptionAndroid | SubscriptionIOS>>([]);

    const [loadingModalVisible, setLoadingModalVisible] = useState(false);

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
                              ],               
                            prorationModeAndroid: ProrationModesAndroid.IMMEDIATE_WITHOUT_PRORATION }); 

                    }

                } catch (error) {
                    console.error('Purchase error:', error);
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
    
            setTimeout(() => {navigation.goBack()}, 500);
 
          }
          catch (error) {
            Alert.alert("Error", "There was an error upgrading your account. Please contact support.");        
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
            });

            if (foundPurchase){
            }
            else{
                Alert.alert("Error", "Could not restore your purchases or they have expired."); 
            }

          } catch (err) {
            //Alert.alert("Error", JSON.stringify(err)); 
            console.warn('restorePurchases error', err);
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
                                return "$8.99";

                            }
                            else if (subscription.productId === productIdsMap['yearly']){
                                return "$89.99";

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
                            return "$8.99";

                        }
                        else if (subscription.productId === productIdsMap['yearly']){
                            return "$89.99";

                        }
                        return "";
                    }
                }
                catch (error){
                    if (subscription.productId === productIdsMap['monthly']){
                        return "$8.99";

                    }
                    else if (subscription.productId === productIdsMap['yearly']){
                        return "$89.99";

                    }
                    return "";
                } 
            }
        }

        if (productId === productIdsMap['monthly']){
            return "$8.99";

        }
        else if (productId === productIdsMap['yearly']){
            return "$89.99";

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
                    await clearTransactionIOS()
                }
                let products:Array<Subscription> = await getSubscriptions({ skus: productIds } );
                

                //Alert.alert("Products", JSON.stringify(products));

           
                setSubscriptions(products);
            } catch (err) {
                //Alert.alert("Error Init", err);
                console.warn(err);
            } 
        };

 
        const purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
            purchase.purchaseStateAndroid
            const receipt = purchase.transactionReceipt;
            if (receipt) {
                try {
                    setLoadingModalVisible(true);

                    await upgradeUser(purchase);

                    setLoadingModalVisible(false);



                    const ackResult = await finishTransaction({ purchase: purchase, isConsumable : false });
                    //console.log('ackResult', ackResult);

                    

                    


                } catch (ackErr) {
                    console.warn('ackErr', ackErr);

                    setLoadingModalVisible(false);
                    //Alert.alert("Error", "Purchase Error: " + ackErr);   
                    //Alert.alert("Error", "There was an error completing your purchase. Please contact support@tootloo.com for further help.");   


                    await finishTransaction({ purchase: purchase as Purchase, isConsumable : false });
                }
            }
        });

        const purchaseErrorSubscription = purchaseErrorListener(async (error: PurchaseError) => {
            console.warn('purchaseErrorListener', error);
            
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
            <View style={styles.subDetailsContainer}>
            <Text style={styles.paragraph}>
            Tabletop Codex is free to use. Should you choose to upgrade to Premium, you can purchase this as a monthly or yearly cost. By purchasing Premium you will be charged to renew the subscription every month or every year for the plan price.
            </Text>
            <Text style={styles.paragraph}>
              Payment will be charged to your credit card through your Google Play account at confirmation of purchase. Subscription renews automatically unless cancelled at least 24 hours prior to the end of the subscription period. There is no increase in price when renewing. Subscriptions can be cancelled via Google Play after purchase. Once purchased, refunds will not be provided for any unused portion of the term. Read our full <Text style={styles.link} onPress={() => openLink('https://www.orderofgamers.com/terms-and-conditions/')}>Terms of Service</Text> and our <Text style={styles.link} onPress={() => openLink('https://www.orderofgamers.com/privacy-policy/')}>Privacy Policy</Text>.
            </Text>
          </View>)
        }
      
        return (
          <View style={styles.subDetailsContainer}>
            <Text style={styles.paragraph}>
              You can purchase Premium as a monthly or yearly cost. By purchasing Tabletop Codex as a monthly or yearly subscription you will be charged to renew the subscription every month or every year for the plan price.
            </Text>
            <Text style={styles.paragraph}>
              Payment will be charged to your credit card through your iTunes account at confirmation of purchase. Subscription renews automatically unless cancelled at least 24 hours prior to the end of the subscription period. There is no increase in price when renewing. Subscriptions can be managed and auto-renewal turned off in Account Settings in iTunes after purchase. Once purchased, refunds will not be provided for any unused portion of the term. Read our full <Text style={styles.link} onPress={() => openLink('https://www.orderofgamers.com/terms-and-conditions/')}>Terms of Service</Text> and our <Text style={styles.link} onPress={() => openLink('https://www.orderofgamers.com/privacy-policy/')}>Privacy Policy</Text>.
            </Text>
          </View>
        );
      };



  return (
    <View style={styles.container}>
      <FocusAwareStatusBar style={"light"} />
    <ScrollView contentContainerStyle={styles.containerInner}>

  

        <View style={[styles.featuresContainer, { backgroundColor: theme.colors.accent }]}>
            <Text style={[styles.featuresHeaderText, { color: theme.colors.white }]}>
                Unlock a growing library of hundreds of rules summaries with one easy subscription 
            </Text>

            <View style={styles.featuresIconRow}>
                <Ionicons name="library-outline" size={34} color={theme.colors.white} />
                <Text style={[styles.featuresIconText, { color: theme.colors.white }]}>
                    Create your own library of game summaries you can easily access
                </Text>
            </View>

            <View style={styles.featuresIconRow}>
                <Ionicons name="build-outline" size={34} color={theme.colors.white} />
                <Text style={[styles.featuresIconText, { color: theme.colors.white }]}>
                    Always be up to date with fixes, updates and new functionality
                </Text>
            </View>

            <View style={styles.featuresIconRow}>
            <MaterialCommunityIcons name="folder-multiple-plus-outline" size={34} color={theme.colors.white}/>
                <Text style={[styles.featuresIconText, { color: theme.colors.white }]}>
                    New summaries added each week - so the value keeps increasing!
                </Text>
            </View>
        </View>



        <View style={{marginTop:20}}>
         
            <Accordion headerText={"Subscription & Payment Details"} outsideColorScheme={colorScheme} key={1} search={""}>
                    {SubscriptionDetails()}
            </Accordion>

        </View>

        <View style={{marginBottom:100}}>
            <Accordion headerText={"Restore Purchases"} outsideColorScheme={colorScheme} key={2} search={""}>

                <View>
             <Text style={styles.paragraph}>Already purchased a premium? You can restore your purchase using the button below.</Text>


             <TouchableOpacity style={styles.restoreButton} activeOpacity={.8} onPress={() => {restorePurchases()}} >
                        <Text style={styles.restoreButtonName}>Restore Purchases</Text>
                        
                </TouchableOpacity>  
                </View>
     
            </Accordion>
        </View>



        
    </ScrollView>




    <View style={{alignItems:"center", justifyContent:"center", marginBottom:20 + insets.bottom, paddingTop:20}}>

<TouchableOpacity activeOpacity={.8} onPress={() => {purchaseProduct(productIdsMap['yearly'])}} style={{backgroundColor:theme.colors.accent, paddingHorizontal:30,paddingVertical:12, width:220}} >
        <Text style={{color:theme.colors.white, fontSize:18,fontWeight:700, textAlign:'center'}}>{getProductPrice(productIdsMap['yearly'])} per year</Text>                        
</TouchableOpacity>   

<TouchableOpacity activeOpacity={.8} onPress={() => {purchaseProduct(productIdsMap['monthly'])}} style={{backgroundColor:'#703a2c', paddingHorizontal:30,paddingVertical:12, width:220, marginTop:5}} >
        <Text style={{color:theme.colors.white, fontSize:18,fontWeight:700, textAlign:'center'}}>{getProductPrice(productIdsMap['monthly'])} per month</Text>                        
</TouchableOpacity>     

<TouchableOpacity activeOpacity={.8} onPress={() => {navigation.goBack()}} style={{paddingTop:10}} >
        <Text style={{color:theme.colors.accent, fontSize:14}}>Not now</Text>                        
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
        marginTop:Platform.OS === "ios" ? 70 : 20,
        marginBottom: 40
    },
    subDetailsContainer: {
      },
      title: {
        fontSize: 18,
        color:theme.colors[colorScheme].black,
        textAlign:'center',
        marginBottom:8
      },
      paragraph: {
        fontSize: 14,
        color:theme.colors[colorScheme].black,
        marginBottom: 8
      },
      link: {
        color: theme.colors.primary,

        textDecorationLine: 'underline',
      },
      restoreButton: {
          backgroundColor: theme.colors.accent,
          flexDirection: "row",
          justifyContent: "center",
          alignItems:"center",
          flex:1,
          paddingLeft:15,
          paddingRight:15,
          paddingTop:16,
          paddingBottom:16,
          marginTop:10
      },
     restoreButtonName: {
          color:theme.colors.white,
          fontSize:14,
          fontWeight:"700"
          },
        
          featuresContainer: {
            marginHorizontal: 20,
            paddingHorizontal: 30,
            paddingTop: 20,
            paddingBottom:40
        },
        featuresHeaderText: {
            fontSize: 20,
            fontWeight: '700',
            textAlign: 'center',
        },
        featuresIconRow: {
            flexDirection: "row",
            alignItems: 'center',
            flex: 1,
            marginTop: 25,
        },
        featuresIconText: {
            marginLeft: 10,
            fontSize: 16,
            lineHeight: 18,
        }
        
        })