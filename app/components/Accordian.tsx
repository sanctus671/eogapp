import React, { useState, useRef, PropsWithChildren, useMemo, ReactElement, ReactNode } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Button,
  Platform,
  Animated,
  UIManager,
  LayoutAnimation
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import theme from '../constants/theme';

type AccordionProps = PropsWithChildren<{
    headerText: string;
    outsideColorScheme: string;
    search:string;
  }>;
  type RenderFunction = (child: ReactNode) => ReactNode;
const Accordion: React.FC<AccordionProps> = ({ children, headerText, outsideColorScheme, search }) => {
  const [expanded, setExpanded] = useState(false);
  const arrowRotation = useState(new Animated.Value(expanded ? 1 : 0))[0];
  const colorScheme = outsideColorScheme === "dark" ? "dark" : "light";

  const toggleAccordion = () => {
    Animated.timing(arrowRotation, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();


    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);


  };

  const rotateArrow = arrowRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });





  
  const renderHighlightedText = (node: React.ReactNode): React.ReactNode => {
    if (typeof node === 'string') {
      const regex = new RegExp(`(${search})`, 'gi');
      const parts = node.split(regex);
  
      return parts.map((part, index) => {
        if (regex.test(part.toLowerCase())) {
          return (
            <Text key={index} style={{ backgroundColor: theme.colors.accent, color: theme.colors.white, textTransform:"none" }}>
              {part}
            </Text>
          );
        }
  
        return (
          <Text key={index} style={{ textTransform:"none" }}>{part}</Text>
        );
      });
    }
  
    if (React.isValidElement(node)) {
      if (node.type === 'img' || node.type === 'Image') {
        return node; // Return the Image node as is
      }
  
      return updateElementWithChildren(node, renderHighlightedText);

    }
  
    return node;
  };

  const updateElementWithChildren = (element: ReactElement,
    renderFunction: RenderFunction): ReactElement => {
    const { children, ...otherProps } = element.props;

    const updatedChildren = React.Children.map(children, renderFunction);

    return React.createElement(element.type, otherProps, updatedChildren);
  }  
  
  
  
  
  
  
  








  return (
    <View style={styles.accordContainer}>
      <TouchableOpacity onPress={toggleAccordion} activeOpacity={.8}>
        <View style={{...styles.headerContainer, 
          backgroundColor: ((expanded) ? theme.colors[colorScheme].accordianHeaderBackgroundExpanded : theme.colors[colorScheme].accordianHeaderBackground),
          borderColor: theme.colors[colorScheme].accordianSeperator}}>
          <Text style={{...styles.headerText, color: ((expanded) ? theme.colors.accent : theme.colors[colorScheme].black),
          fontWeight: ((expanded) ? "bold" : "400")}}>{(search ? renderHighlightedText(headerText) : headerText )}</Text>
          <Animated.View style={[styles.arrowIcon, { transform: [{ rotate: rotateArrow }] }]}>
            <Ionicons name={'chevron-down'} size={20} color={((expanded) ? theme.colors.accent : theme.colors[colorScheme].tabBarIcon)} />
          </Animated.View>        
        </View>
      </TouchableOpacity>
      { (expanded) && (<View style={[styles.contentContainer, ((expanded) ? { backgroundColor: theme.colors[colorScheme].accordianBackground } : null), {borderColor: theme.colors[colorScheme].accordianSeperator}]} >
                    <Text style={{...styles.contentText, color: theme.colors[colorScheme].black}}>
                        { (search ? renderHighlightedText(<Text>{children}</Text>) : children ) }
                    </Text>
                </View>) }
    </View>
  );
};

const styles = StyleSheet.create({
    accordContainer: {
    }  ,
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth:1,
    borderColor:"#d1d1d6"
  },
  headerText: {
    fontSize: 14,
    textTransform:"capitalize"


  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  contentContainer: {
    padding: 12,
    backgroundColor: '#f1f1f1',
    borderTopWidth:1,
    borderColor:"#d1d1d6"
  },
  contentText: {
    fontSize: 14,
    lineHeight:22
  },
});

if(Platform.OS === 'android') {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

export default Accordion;