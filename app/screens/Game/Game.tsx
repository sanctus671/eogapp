import { Appearance, ImageBackground, StyleSheet, Text, View, Image, Linking, Platform, TouchableOpacity, ScrollView, KeyboardAvoidingView, LogBox, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import GameRules from './GameRules';
import GamePurchase from './GamePurchase';
import { StatusBar } from 'expo-status-bar';
import theme from '../../constants/theme';
import FocusAwareStatusBar from '../../components/FocusAwareStatusBar';
import { useGameOwnership } from '../../context/GameOwnershipContext';
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
    const { state, dispatch } = useGameOwnership();

    const [gameOwned, setGameOwned] = useState<boolean>(owned);

/*     useEffect(() => {
        setGameOwned(state.ownedGames.has(id));
    }, [state.ownedGames, id]); */

    const toggleGameOwnership = (isOwned: boolean) => {
        dispatch({ type: 'TOGGLE_OWNERSHIP', gameId: id });
        setGameOwned(isOwned);
    };

    const windowWidth = Dimensions.get("screen").width;


    useEffect(() => {
        // Update the stack header options when the component mounts
        navigation.setOptions({
          headerTitle: Platform.OS === "ios" ? name : () => <View style={{width:gameOwned ? windowWidth - 270 : windowWidth - 100}}>
            <Text numberOfLines={1} 
          style={{fontSize:20, fontWeight:500, color: gameOwned ? theme.colors[colorScheme].black : theme.colors.white}}>{name}
          </Text>
          </View>,
          
          headerLargeStyle: {
            
            backgroundColor: (gameOwned ? theme.colors[colorScheme].gameHeaderBackground : theme.colors.primary)}, 
          headerLargeTitleStyle: {fontFamily:theme.fonts.headings, color: (gameOwned ? theme.colors[colorScheme].black : theme.colors.white)},
          headerStyle: {backgroundColor:(gameOwned ? theme.colors[colorScheme].gameHeaderBackground : theme.colors.primary), },
          headerTitleStyle:{color:(gameOwned ? theme.colors[colorScheme].black : theme.colors.white)}, 
          headerTintColor: (gameOwned ? theme.colors[colorScheme].black : theme.colors.white)
        });
      }, [gameOwned]);


    return (
      <KeyboardAvoidingView
      behavior={'height'} style={styles.container}>
        <FocusAwareStatusBar style={(gameOwned ? (colorScheme === "dark" ? "light" : "dark") : colorScheme)} />
        {(gameOwned || state.ownedGames.has(id) ? 
          <GameRules id={id}></GameRules> :
          <GamePurchase id={id} setGameOwned={toggleGameOwnership}></GamePurchase>)}
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