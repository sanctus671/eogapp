import { StyleSheet, Text } from 'react-native';
import { AuthProvider } from './app/context/AuthContext';



import { Navigation } from './app/navigation/Navigation';
import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GameOwnershipProvider } from './app/context/GameOwnershipContext';


SplashScreen.preventAutoHideAsync();


export default function App() {

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        'NewYorkBold': require('./assets/fonts/NewYorkLargeBold.ttf'),
      });

      setAppReady(true);

      //delay for storage load
      await new Promise(resolve => setTimeout(resolve, 500));

      await SplashScreen.hideAsync();

    }
    
    loadFont();
  }, []);


  return (
    <AuthProvider>
      {
        (appReady ? <GameOwnershipProvider><Navigation></Navigation></GameOwnershipProvider> : <Text></Text>)
      }
    </AuthProvider>
  );
}




const styles = StyleSheet.create({
});

