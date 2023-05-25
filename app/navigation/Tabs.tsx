import { Appearance, Platform, TouchableOpacity, Text } from 'react-native'
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import theme from "../constants/theme";

import Home from "../screens/Home";
import Search from "../screens/Search";
import Games from "../screens/Games";
import Game from "../screens/Game/Game";
import Account from "../screens/Account";
import { Ionicons } from '@expo/vector-icons';
import GameRulesInner from '../screens/Game/GameRulesInner';
import Purchases from '../screens/Purchases';
import { useNavigation } from '@react-navigation/native';

const Tab = createBottomTabNavigator();

const screenOptions = {headerLargeTitleStyle:{fontFamily:theme.fonts.headings, color: theme.colors.white}, headerLargeTitle:true, headerLargeStyle: {backgroundColor:theme.colors.primary}, 
headerStyle: {backgroundColor:theme.colors.primary}, headerTitleStyle:{color:theme.colors.white}, headerTransparent: false, headerTintColor: theme.colors.white};


const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";

const SearchWrapper = () => {
    
    const SearchStack = createNativeStackNavigator();
    return (
        <SearchStack.Navigator screenOptions={screenOptions}>
            <SearchStack.Screen options={{title: "Search Games", headerLargeTitle: true,headerTransparent: Platform.OS === "ios"}}
                name="Search"
                component={Search}
            />            
            <SearchStack.Screen options={{title: "Game", headerLargeTitle: true,headerTransparent: Platform.OS === "ios"}}
            name="Game"
            component={Game}
            />          
            <SearchStack.Screen options={{title: "Game Rules", headerLargeTitle: true,headerTransparent: Platform.OS === "ios"}}
            name="GameRulesInner"
            component={GameRulesInner}
            />
        </SearchStack.Navigator>        
    )
}

const GamesWrapper = () => {
    const GameStack = createNativeStackNavigator();
    return (
        <GameStack.Navigator screenOptions={screenOptions}>
            <GameStack.Screen options={{title: "My Games", headerLargeTitle: true,headerTransparent: Platform.OS === "ios", 
            headerLargeStyle: {backgroundColor:theme.colors.secondary}, headerStyle: {backgroundColor:theme.colors.secondary}} }
                name="Games"
                component={Games}
            />          
            <GameStack.Screen options={{title: "Game", headerLargeTitle: true,headerTransparent: Platform.OS === "ios"}}
            name="Game"
            component={Game}
            />          
            <GameStack.Screen options={{title: "Game Rules", headerLargeTitle: true,headerTransparent: Platform.OS === "ios"}}
            name="GameRulesInner"
            component={GameRulesInner}
            />
        </GameStack.Navigator>        
    )
}


const AccountWrapper = () => {
    const navigation = useNavigation();
    const AccountStack = createNativeStackNavigator();
    return (
        <AccountStack.Navigator screenOptions={screenOptions}>
            <AccountStack.Screen options={{title: "My Account", headerLargeTitle: true,headerTransparent: Platform.OS === "ios", 
            headerLargeStyle: {backgroundColor:theme.colors.darkgrey}, headerStyle: {backgroundColor:theme.colors.darkgrey}} }
                name="Account"
                component={Account}
            />
            <AccountStack.Screen options={{title: "My Purchases", presentation:"modal",headerLargeTitle:false, headerLargeStyle: {backgroundColor:theme.colors.darkgrey}, headerStyle: {backgroundColor:theme.colors.darkgrey},
                headerRight: () => (
                    (Platform.OS === "ios" ? 
                    <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('Account' as never);
                    }}
                    style={{ paddingTop:10,paddingBottom:10, paddingLeft:10, paddingRight:0 }}
                    >
                    <Text style={{color:theme.colors.accent, fontSize:16}}>Close</Text>
                    </TouchableOpacity> :
                    <></>)
                )} }
                name="Purchases"
                component={Purchases}
            />
        </AccountStack.Navigator>        
    )
}


const Tabs = () => {
  return (
    <Tab.Navigator screenOptions={{headerShown:false, tabBarShowLabel:false, tabBarActiveTintColor: theme.colors.accent, tabBarInactiveTintColor: theme.colors[colorScheme].tabBarIcon, 
    tabBarStyle:{backgroundColor: theme.colors[colorScheme].tabBarBackground, height: 60, borderTopWidth:0}}} sceneContainerStyle={{backgroundColor:theme.colors[colorScheme].white}} >
      <Tab.Screen name="HomeWrapper" component={Home} options={{headerShown:false, title: "About",
      tabBarIcon:({ focused, color, size }) => {return <Ionicons name="help-circle-outline" size={size + 8} color={color} />; }}} />
      <Tab.Screen name="SearchWrapper" component={SearchWrapper} options={{headerShown:false, 
      tabBarIcon:({ focused, color, size }) => {return <Ionicons name="search-outline" size={size + 5} color={color} />; }}} />
      <Tab.Screen name="GamesWrapper" component={GamesWrapper} options={{headerShown:false, 
      tabBarIcon:({ focused, color, size }) => {return <Ionicons name="library-outline" size={size + 5} color={color} />; }}} />
      <Tab.Screen name="AccountWrapper" component={AccountWrapper} options={{headerShown:false, 
      tabBarIcon:({ focused, color, size }) => {return <Ionicons name="person-circle-outline" size={size + 5} color={color} />; }}} />
    </Tab.Navigator>
  )
}

export default Tabs