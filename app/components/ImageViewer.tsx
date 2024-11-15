
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { View, Image, Modal, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native';

interface ImageViewerProps {
    imageUrl: string;
    width?:any;
    height?:any;
    style?:any;
    styleInner?:any;
  }

const ImageViewer: React.FC<ImageViewerProps>= ({ imageUrl, width, height, style, styleInner }) => {
    const [modalVisible, setModalVisible] = useState(false);
    const navigation = useNavigation<NativeStackNavigationProp<any>>();
  
    const handleImagePress = () => {
        navigation.navigate("Image", {image: imageUrl})
    };
  
    const closeModal = () => {
      setModalVisible(false);
    };

    const styleObj = style ? style : {};
    const styleObjInner = styleInner ? styleInner : {};
    
  
    return (
      <View style={styleObj}>
        <TouchableOpacity onPress={handleImagePress} style={styleInner}>
          <Image source={{ uri: imageUrl }} style={{ width: (width ? width : 20), height: (height ? height : 20) }} resizeMode="contain" />
        </TouchableOpacity>
        <Modal visible={modalVisible} onRequestClose={closeModal} transparent={true}>
        <TouchableOpacity style={styles.modalBackground} onPress={closeModal}>
          <Image source={{ uri: imageUrl }} style={{ width: '100%', height: '100%' }} resizeMode="contain" />
        </TouchableOpacity>
      </Modal>
      </View>
    );
  };

  const styles = StyleSheet.create({
    modalBackground: {
      flex: 1,
      backgroundColor: 'white',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex:99,
      padding:30
    },
  });
  

  export default ImageViewer;