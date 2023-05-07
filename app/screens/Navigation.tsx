import { NavigationContainer } from "@react-navigation/native";
import { useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import Home from "./Home";
import Login from "./Login";
import { createNativeStackNavigator } from "@react-navigation/native-stack";


const Stack = createNativeStackNavigator();

export const Navigation = () => {


  
  
    const { authState, onLogout } = useAuth();
  
    return (<NavigationContainer>
        <Stack.Navigator screenOptions={{headerLargeTitleStyle:{fontFamily:'NewYorkBold', color: 'white'}, headerLargeTitle:true, headerLargeStyle: {backgroundColor:'#C0AB99'}, 
              headerStyle: {backgroundColor:'#C0AB99'}, headerTitleStyle:{color:'white'}}}>
  
          { authState?.authenticated ? 
            (<Stack.Screen name="Home" component={Home} ></Stack.Screen> )
            :
            (<Stack.Screen name="Login" component={Login}></Stack.Screen>)
          }
  
  
        </Stack.Navigator>
    </NavigationContainer>);
  }