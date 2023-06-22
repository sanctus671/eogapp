import React, { useState } from 'react';
import { View, Image, Modal, TouchableOpacity, StyleSheet } from 'react-native';

interface ImageViewerProps {
    imageUrl: string;
    width?:number;
    height?:number;
  }

const ImageViewer: React.FC<ImageViewerProps>= ({ imageUrl, width, height }) => {
    const [modalVisible, setModalVisible] = useState(false);
  
    const handleImagePress = () => {
      setModalVisible(true);
    };
  
    const closeModal = () => {
      setModalVisible(false);
    };
  
    return (
      <View>
        <TouchableOpacity onPress={handleImagePress}>
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