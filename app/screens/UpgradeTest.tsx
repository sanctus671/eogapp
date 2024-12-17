import { Alert, Appearance, Dimensions, Linking, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import theme from '../constants/theme';
const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
import * as userService from '../services/UserService';
import * as purchaseService from '../services/PurchaseService';
import { Ionicons } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import LoadingModal from '../components/LoadingModal';
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import Accordion from '../components/Accordian';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import moment from 'moment';

// Mock data and functions to replace react-native-iap
const mockSubscriptions = [
  { productId: 'com.tabletopcodex.app.premiummonthly', localizedPrice: '$3.99' },
  { productId: 'com.tabletopcodex.app.premiumyearly', localizedPrice: '$39.99' }
];

const mockTierProducts = [
  { productId: 'com.tabletopcodex.app.tierone', localizedPrice: '$0.99' },
  { productId: 'com.tabletopcodex.app.tiertwo', localizedPrice: '$2.99' },
  { productId: 'com.tabletopcodex.app.tierthree', localizedPrice: '$2.99' }
];

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

const UpgradeTest = ({ navigation }: NavProps) => {
  const route = useRoute();
  const { setGameOwned, game } = route.params as RouteParams;

  const insets = useSafeAreaInsets();
  const navigationStack = useNavigation<NativeStackNavigationProp<any>>();

  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [tierProducts, setTierProducts] = useState(mockTierProducts);
  const [loadingModalVisible, setLoadingModalVisible] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      if (hasPurchased) {
        navigationStack.goBack();
      }
      return () => {};
    }, [hasPurchased])
  );

  const purchaseProduct = async (productId: string) => {
    Alert.alert("Mock Purchase", `Attempting to purchase product: ${productId}`);
  };

  const upgradeUser = async (purchase: any) => {
    try {
      setLoadingModalVisible(true);
      let updateUser: any = {};
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
    } catch (error) {
      Alert.alert("Error", "There was an error upgrading your account. Please contact support.");
    }
  };

  const purchaseTierProduct = async (productId: string) => {
    Alert.alert("Mock Purchase", `Attempting to purchase tier product: ${productId}`);
  };

  const unlockGame = async (purchase: any) => {
    try {
      setLoadingModalVisible(true);
      setGameOwned(true);
      if (game) {
        await purchaseService.createGamePurchase({ game_id: game.id });
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
    } catch (error) {
      Alert.alert("Error", "There was an error upgrading your account. Please contact support.");
    }
  };

  const restorePurchases = async () => {
    Alert.alert("Mock Restore", "Attempting to restore purchases.");
  };

  const getProductPrice = (productId: string) => {
    const product = subscriptions.find(sub => sub.productId === productId);
    return product ? product.localizedPrice : "";
  };

  const getTierProductPrice = (productId: string) => {
    const product = tierProducts.find(prod => prod.productId === productId);
    return product ? product.localizedPrice : "";
  };

  const SubscriptionDetails = () => {
    const isIos = Platform.OS === 'ios';
    const openLink = (url: string) => {
      Linking.openURL(url);
    };

    if (!isIos) {
      return (
        <>
          <Text style={styles.paragraph}>
            Tabletop Codex is free to use. You have multiple options to unlock more content. You can choose to upgrade to Premium, which is available as a monthly or yearly subscription, or you can unlock a single game with a one-time purchase. By purchasing Premium, you will be charged to renew the subscription every month or every year for the plan price.
          </Text>
          <Text>{"\n"}</Text>
          <Text style={styles.paragraph}>
            Payment will be charged to your credit card through your Google Play account at confirmation of purchase. Subscription renews automatically unless cancelled at least 24 hours prior to the end of the subscription period. There is no increase in price when renewing. Subscriptions can be cancelled via Google Play after purchase. Once purchased, refunds will not be provided for any unused portion of the term. For one-time purchases, access to the selected game will remain available indefinitely. Read our full <Text style={styles.link} onPress={() => openLink('https://www.tabletopcodex.com/terms')}>Terms of Service</Text> and our <Text style={styles.link} onPress={() => openLink('https://www.tabletopcodex.com/privacy')}>Privacy Policy</Text>.
          </Text>
        </>
      );
    }

    return (
      <View style={styles.subDetailsContainer}>
        <Text style={{ ...styles.paragraph, marginBottom: 8 }}>
          You have multiple options to unlock more content in Tabletop Codex. You can choose Premium as a monthly or yearly subscription, or unlock a single game with a one-time purchase. By purchasing a subscription, you will be charged to renew it every month or every year for the plan price.
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


                    <TouchableOpacity activeOpacity={.8} onPress={() => { unlockGame({}) }} style={{ backgroundColor: theme.colors.white, paddingHorizontal: 30, paddingVertical: 12, width: 220, marginTop: 5 }} >
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

        <View style={{ marginBottom: 100 }}>
          <Accordion headerText={"Restore Purchases"} outsideColorScheme={colorScheme} key={2} search={""}>
            {Platform.OS === "android" ? (
              <>
                <Text style={styles.paragraph}>Already purchased this game or upgraded to premium? You can restore your purchase using the button below.</Text>
                {Platform.OS === "android" ? <Text>{"\n"}{"\n"}{"\n"}</Text> : ""}
                <TouchableOpacity style={styles.restoreButton} activeOpacity={.8} onPress={() => { restorePurchases() }} >
                  <Text style={styles.restoreButtonName}>Restore Purchases</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View>
                <Text style={{ ...styles.paragraph, marginBottom: 8 }}>Already purchased this game or upgraded to premium? You can restore your purchase using the button below.</Text>
                <TouchableOpacity style={styles.restoreButton} activeOpacity={.8} onPress={() => { restorePurchases() }} >
                  <Text style={styles.restoreButtonName}>Restore Purchases</Text>
                </TouchableOpacity>
              </View>
            )}
          </Accordion>
        </View>
      </ScrollView>

      <View style={{ alignItems: "center", justifyContent: "center", marginBottom: 10 + insets.bottom, paddingTop: 10 }}>
        <TouchableOpacity activeOpacity={.8} onPress={() => { navigation.goBack() }}  >
          <Text style={{ color: theme.colors.accent, fontSize: 14, fontWeight:500 }}>Not now</Text>
        </TouchableOpacity>
      </View>

      <LoadingModal modalVisible={loadingModalVisible} color={theme.colors.primary} task={"Loading..."} darkMode={colorScheme === "dark"} />
    </View>
  );
}

export default UpgradeTest

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
