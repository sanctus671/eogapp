import { StyleSheet, Text } from 'react-native';
import { AuthProvider } from './app/context/AuthContext';



import { Navigation } from './app/screens/Navigation';
import { useEffect, useState } from 'react';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';


SplashScreen.preventAutoHideAsync();


export default function App() {

  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    async function loadFont() {
      await Font.loadAsync({
        'NewYorkBold': require('./assets/fonts/NewYorkLargeBold.ttf'),
      });

      setAppReady(true);

      await SplashScreen.hideAsync();
    }
    
    loadFont();
  }, []);


  return (
    <AuthProvider>
      {
        (appReady ? <Navigation></Navigation> : <Text>Loading</Text>)
      }
    </AuthProvider>
  );
}




const styles = StyleSheet.create({
});

