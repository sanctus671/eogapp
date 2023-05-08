import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { useAuth } from '../context/AuthContext';
import { StatusBar } from 'expo-status-bar';

const Account = () => {

    const { authState, onLogout } = useAuth();

    const logout = async () => {
        const result = await logout!();
      }


    return (
    <View>
        <StatusBar style="dark" />
        <Text>Account</Text>


    <TouchableOpacity onPress={() => logout}>
        <Text>Logout</Text>
    </TouchableOpacity>
    </View>
    )
}

export default Account

const styles = StyleSheet.create({})