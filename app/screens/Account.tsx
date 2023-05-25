import { Alert, Appearance, Platform, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import * as Linking from 'expo-linking';
import Dialog from "react-native-dialog";
import theme from '../constants/theme';
import Toast, { BaseToast } from 'react-native-toast-message';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import * as userService from '../services/UserService';
import { useNavigation } from '@react-navigation/native';

const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";

type IconName = keyof typeof Ionicons['glyphMap'];

interface SectionData {
    title: string;
    data: { title: string; icon: IconName; onPress: () => void }[];
}



const Account = () => {
    const navigation = useNavigation();
    const { authState, onLogout } = useAuth();  
    const [changePasswordVisible, setChangePasswordVisible] = useState(false);
    const [password, setPassword] = useState('');
    const [repeatPassword, setRepeatPassword] = useState(''); 
    const [changeEmailVisible, setChangeEmailVisible] = useState(false);
    const [email, setEmail] = useState(''); 
    const [changeNameVisible, setChangeNameVisible] = useState(false);
    const [name, setName] = useState('');

    useEffect(() => {
      const fetchPosts = async () => {
        try {
          const fetchedUser:any = await userService.getUserData();
          setEmail(fetchedUser.email);
          setName(fetchedUser.name);
        } catch (error) {
          console.error('Error fetching posts:', error);
        }
      };
  
      fetchPosts();
    }, []);


    const logout = async () => {
        const result = await logout!();
    }

    const showToast = () => {
      Toast.show({
        type: 'success',
        text1: 'Passwords do not match. Please try again.',
        position:"bottom",
        onPress: () => {Toast.hide();}
      });
    }

    const changePassword = async () => {
        setChangePasswordVisible(false);
        if (!password || !repeatPassword || password !== repeatPassword){

          Toast.show({
            type: 'error',
            text1: 'Passwords do not match. Please try again.',
            position:"bottom",
            onPress: () => {Toast.hide();setChangePasswordVisible(true)}
          });
          return;
        }

        try {
          await userService.updateUser({password:password});
        }
        catch (error) {
          Toast.show({
            type: 'error',
            text1: 'There was an error updating your password.',
            position:"bottom",
            onPress: () => {Toast.hide();setChangePasswordVisible(true)}
          });          
        }

  
        Toast.show({
          type: 'success',
          text1: 'Password changed',
          position:"bottom",
          onPress: () => {Toast.hide()}
        });
      
    }

    const changeEmail = async () => {
      setChangeEmailVisible(false);
      
      try {
        await userService.updateUser({email:email});
      }
      catch (error) {
        Toast.show({
          type: 'error',
          text1: 'There was an error updating your email.',
          position:"bottom",
          onPress: () => {Toast.hide();setChangePasswordVisible(true)}
        });   
      }   

      Toast.show({
        type: 'success',
        text1: 'Email changed',
        position:"bottom",
        onPress: () => {Toast.hide()}
      });

    }

    const changeName = async () => {
      
      setChangeNameVisible(false);

      try {
        await userService.updateUser({name:name});
      }
      catch (error) {
        Toast.show({
          type: 'error',
          text1: 'There was an error updating your name.',
          position:"bottom",
          onPress: () => {Toast.hide();setChangePasswordVisible(true)}
        });  
      }  
      Toast.show({
        type: 'success',
        text1: 'Name changed',
        position:"bottom",
        onPress: () => {Toast.hide()}
      });
    }

    const openLink = (url:string) => {
      Linking.canOpenURL(url).then(() => {
        Linking.openURL(url);
      });
    }
  
    const writeReview = () => {
      const storeUrl = Platform.OS === 'ios'
      ? 'itms-apps://itunes.apple.com/app/[YOUR_APP_ID]?mt=8' 
      : 'market://details?id=[YOUR_PACKAGE_NAME]'; 
  
      openLink(storeUrl);
    }
  
  
    const DATA: SectionData[] = [
      {
        title: 'Support',
        data: [
          { title: 'Rate The App', icon: 'ios-heart', onPress: () => {writeReview()} },
          { title: 'Follow Us', icon: 'logo-facebook', onPress: () => () => {openLink("https://www.facebook.con/eogapp")} },
          { title: 'Contact Us', icon: 'ios-mail', onPress: () => {openLink("mailto:support@orderofgamers.com")} },
        ],
      },
      {
        title: 'Account',
        data: [
          { title: 'View Purchases', icon: 'ios-cash', onPress: () => {navigation.navigate("Purchases" as never) }},
          { title: 'Change Name', icon: 'ios-person', onPress: () => {setChangeNameVisible(true)} }, 
          { title: 'Change Email', icon: 'ios-mail', onPress: () => {setChangeEmailVisible(true)} }, 
          { title: 'Change Password', icon: 'ios-key', onPress: () => {setChangePasswordVisible(true)} },
          { title: 'Logout', icon: 'ios-lock-closed', onPress: () => logout() },
        ],
      }
  
    ];




    return (
    <View style={styles.container}>
        <FocusAwareStatusBar style={"light"} />
        <SectionList contentInsetAdjustmentBehavior="automatic" 
            sections={DATA}
            keyExtractor={(item, index) => item.title + index}
            renderItem={({ item }) => (
                <TouchableOpacity style={styles.item} onPress={item.onPress} activeOpacity={.7}>
                    <Ionicons name={item.icon} size={20} color={theme.colors[colorScheme].black} style={styles.icon} />
                    <Text style={styles.title}>{item.title}</Text>
                    <View style={styles.chevronContainer}>
                        <Ionicons name="chevron-forward" size={24} color={theme.colors[colorScheme].grey} />
                    </View>
                </TouchableOpacity>
            )}
            renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                <Text style={styles.sectionHeaderText}>{title}</Text>
                </View>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            SectionSeparatorComponent={() => <View style={styles.separator} />}
        />


        {(Platform.OS === "ios" || Platform.OS === "android") ? 
          <>
              <Dialog.Container visible={changePasswordVisible} onBackdropPress={() => {setChangePasswordVisible(false)}} onRequestClose={() => {setChangePasswordVisible(false)}}>
                  <Dialog.Title>Change Password</Dialog.Title>
                  <Dialog.Description>
                  Enter your new password below.
                  </Dialog.Description>
                  <Dialog.Input
                  secureTextEntry
                  onChangeText={setPassword}
                  value={password}
                  placeholder="Password"
                  placeholderTextColor={theme.colors[colorScheme].grey}
                  style={{...theme.layout.input, ...styles.textInput}}
                  />    
                  <Dialog.Input
                  secureTextEntry
                  onChangeText={setRepeatPassword}
                  value={repeatPassword}
                  placeholder="Repeat Password"
                  placeholderTextColor={theme.colors[colorScheme].grey}
                  style={{...theme.layout.input, ...styles.textInput}}
                  />    
                  <Dialog.Button color={theme.colors.accent} label="Cancel" onPress={() => {setChangePasswordVisible(false)}} />
                  <Dialog.Button color={theme.colors.accent} label="Change" bold={true} onPress={() => {changePassword()}} />
              </Dialog.Container> 


              <Dialog.Container visible={changeEmailVisible} onBackdropPress={() => {setChangeEmailVisible(false)}} onRequestClose={() => {setChangeEmailVisible(false)}}>
                <Dialog.Title>Change Email</Dialog.Title>
                <Dialog.Description>
                Enter your new email below.
                </Dialog.Description>
                <Dialog.Input
                onChangeText={setEmail}
                value={email}
                placeholder="Email" autoCapitalize="none" clearButtonMode="while-editing" textContentType="emailAddress"   keyboardType="email-address"
                placeholderTextColor={theme.colors[colorScheme].grey}
                style={{...theme.layout.input, ...styles.textInput}}
                />    
                <Dialog.Button color={theme.colors.accent} label="Cancel" onPress={() => {setChangeEmailVisible(false)}} />
                <Dialog.Button color={theme.colors.accent} label="Change" bold={true} onPress={() => {changeEmail()}} />
              </Dialog.Container> 

     

              <Dialog.Container visible={changeNameVisible} onBackdropPress={() => {setChangeNameVisible(false)}} onRequestClose={() => {setChangeNameVisible(false)}}>
                <Dialog.Title>Change Name</Dialog.Title>
                <Dialog.Description>
                Enter your new name below.
                </Dialog.Description>
                <Dialog.Input
                onChangeText={setName}
                value={name}
                placeholder="Name"  clearButtonMode="while-editing" 
                placeholderTextColor={theme.colors[colorScheme].grey}
                style={{...theme.layout.input, ...styles.textInput}}
                />    
                <Dialog.Button color={theme.colors.accent} label="Cancel" onPress={() => {setChangeNameVisible(false)}} />
                <Dialog.Button color={theme.colors.accent} label="Change" bold={true} onPress={() => {changeName()}} />
              </Dialog.Container> 
            </>

            : <></>
        }

  <Toast config={{  
    success: (props:any) => 
    ( <BaseToast {...props} style={
      { backgroundColor:theme.colors[colorScheme].lightgrey, borderLeftColor: theme.colors.secondary }} text1Style={{color:theme.colors[colorScheme].black}}
    />  
    ),
    error: (props:any) => 
    ( <BaseToast {...props} style={
      { backgroundColor:theme.colors[colorScheme].lightgrey, borderLeftColor: theme.colors.accent  }} text1Style={{color:theme.colors[colorScheme].black}}
    />  
    )    
    }} />

</View>
    )
}

export default Account

const styles = StyleSheet.create({container: {
    backgroundColor:theme.colors[colorScheme].white,
    flex: 1
  },
      sectionHeader: {
          paddingVertical: 8,
          paddingHorizontal: 15,
          backgroundColor:theme.colors[colorScheme].white,
          marginTop:30
        },
        sectionHeaderText: {
          fontWeight: 'bold',
          fontSize: 20,
          color:theme.colors[colorScheme].black
        },
        item: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingVertical: 12,
          paddingHorizontal: 16,
        },
        icon: {
          marginRight: 15,
        },
        title: {
          fontSize: 16,
          color:theme.colors[colorScheme].black
        },
      separator: {
        height: 1,
        backgroundColor: theme.colors[colorScheme].lightgrey,
      },
      chevronContainer: {
          flex: 1,
          alignItems: 'flex-end',
        },
        textInput: {
            borderColor:theme.colors[colorScheme].lightgrey, 
            color: theme.colors[colorScheme].black
        },   
    });