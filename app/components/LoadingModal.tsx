import React from 'react';
import { View, Modal, StyleSheet, Text, ActivityIndicator, StyleProp, ViewStyle, Appearance } from 'react-native';
const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
import theme from '../constants/theme';

interface Props {
    /**
     * Toggles the visibilty of modal 
     * @param bool modalVisible
    */
    modalVisible: boolean;

    /**
     * Color of Activity Indicator (loading circle)
     * @param string color
    */
    color?: string;

    /**
     * Text to display with the loading circle
     * @param string task
    */
    task?: string;


    /**
     * Text to display with the  Loading....
     * @param string title
    */
    title?: string;


    /**
     * Font family of the loading text ( task or label )
     * @param string fontFamily
    */
    fontFamily?: string;

    /**
     * Dark mode of the loading modal, default is false
     * @param boolean darkMode
    */
   darkMode?: boolean;

   /**
     * Style of the loading modal container
     * @param string fontFamily
    */
   modalStyle?: StyleProp<ViewStyle>;

    /**
     * Style of the loading modal Text
     * @param string fontFamily
    */
    textStyle?: object;

}

const LoadingModal = ({modalVisible = false, color, task = "", title = "", fontFamily, darkMode = false, modalStyle = {}, textStyle = {}} : Props) => {


    
    return (
        <Modal 
            animationType="fade"
            transparent={true}
            visible={modalVisible}
            statusBarTranslucent={true}>
                
            <View style={styles.centeredView}>
                <View style={[styles.modalView ,modalStyle, darkMode && {backgroundColor:'#121212'}]}>
                    <ActivityIndicator size="large" color={color} />
                    {task ?
                        <Text style={[styles.modalText,{fontFamily:fontFamily}]}>{task}</Text>
                        :
                        <Text style={[styles.modalText, {fontFamily:fontFamily} ,textStyle]}>{title} Loading..</Text>
                    }
                </View>
            </View>
        </Modal>
    )
}



export default LoadingModal


const styles = StyleSheet.create({
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: '#0008'

    },
    modalView: {
        margin: 20,
        width: 200,
        height: 70,
        backgroundColor: "white",
        borderRadius: 5,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,

    },

    modalText: {
        marginVertical: 15,
        textAlign: "center",
        fontSize: 17,
        marginLeft: 15,
        color:theme.colors[colorScheme].black
    }
});