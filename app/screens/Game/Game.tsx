import { Appearance, ImageBackground, StyleSheet, Text, View, Image, Linking, Platform, TouchableOpacity, ScrollView, KeyboardAvoidingView, LogBox } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import GameRules from './GameRules';
import GamePurchase from './GamePurchase';
import { StatusBar } from 'expo-status-bar';
import theme from '../../constants/theme';
import FocusAwareStatusBar from '../../components/FocusAwareStatusBar';
const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
LogBox.ignoreLogs(['Non-serializable values', 'Task orphaned']);

type RouteParams = {
    id: number;
    name: string;
    owned: boolean;
  };

  type NavProps = {
    navigation: NativeStackNavigationProp<{}>;
  };


const Game = ({ navigation }: NavProps) => {

    const route = useRoute();
    const { id, name, owned } = route.params as RouteParams;


    useEffect(() => {
        // Update the stack header options when the component mounts
        navigation.setOptions({
          headerTitle: name,
          headerLargeStyle: {
            backgroundColor: (owned ? theme.colors[colorScheme].gameHeaderBackground : theme.colors.primary)}, 
          headerLargeTitleStyle: {fontFamily:theme.fonts.headings, color: (owned ? theme.colors[colorScheme].black : theme.colors.white)},
          headerStyle: {backgroundColor:(owned ? theme.colors[colorScheme].gameHeaderBackground : theme.colors.primary)},
          headerTitleStyle:{color:(owned ? theme.colors[colorScheme].black : theme.colors.white)}, 
          headerTintColor: (owned ? theme.colors[colorScheme].black : theme.colors.white)
        });
      }, []);


    return (
      <KeyboardAvoidingView
      behavior={'height'} style={styles.container}>
        <FocusAwareStatusBar style={(owned ? 'light' : colorScheme)} />
        {(owned ? 
          <GameRules id={id}></GameRules> :
          <GamePurchase id={id}></GamePurchase>)}
      </KeyboardAvoidingView>
    )
}

export default Game

const styles = StyleSheet.create({
  
  container: {
    backgroundColor: theme.colors[colorScheme].white,
    flex:1

  }

})