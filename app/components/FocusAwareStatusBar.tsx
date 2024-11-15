import React from 'react'
import { StatusBar } from 'expo-status-bar';
import { useIsFocused } from '@react-navigation/native';

const FocusAwareStatusBar = (props:any) => {
  //const isFocused = useIsFocused();

  return <StatusBar {...props} />;
}

export default FocusAwareStatusBar;


