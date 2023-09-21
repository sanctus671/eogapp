import { Appearance, KeyboardAvoidingView, LogBox, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { ReactElement, ReactNode, useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native';
import theme from '../../constants/theme';
const globalColorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Accordion from '../../components/Accordian';
LogBox.ignoreLogs(['Non-serializable values']);

type ThemeOptions = 'dark' | 'light';

type RouteParams = {
  innerItem:any;
  outsideColorScheme:ThemeOptions;
  changeColorScheme:() => void;
  outsideSearch:string;
};

type NavProps = {
  navigation: NativeStackNavigationProp<{}>;
};
type RenderFunction = (child: ReactNode) => ReactNode;
const GameRulesInner = ({ navigation }: NavProps) => {

  const route = useRoute();
  const { innerItem, outsideColorScheme, changeColorScheme, outsideSearch } = route.params as RouteParams;
  const [ preItems, setPreItems ] = useState([]);
  const [colorScheme, setColorScheme] = React.useState<ThemeOptions>(outsideColorScheme);

  const [search, setSearch] = React.useState(outsideSearch ? outsideSearch : '');
  const [filteredGameRules, setFilteredGameRules] = useState<Array<any>>([]);


  const getNodeText = (node: React.ReactNode): string | string[] => {
    if (typeof node === 'string') {
      return node;
    } else if (React.isValidElement(node)) {
      const children = React.Children.toArray(node.props.children);
      return children.map(getNodeText).flat().toString();
    }
  
    return "";
  };


  let preContentItems = [];

  if (innerItem.contentSubItems && innerItem.contentSubItems.length > 0){

    let firstTitle = innerItem.contentSubItems[0].title;

    for (let innerItemNode of innerItem.contentItems){
      let nodeText = getNodeText(innerItemNode);
      if (nodeText === firstTitle){
        break;
      }
      preContentItems.push(innerItemNode);
    }

  }
  else{
    preContentItems = [...innerItem.contentItems];
  }






     // Define the filter logic


    useEffect(() => {
      let debounceTimer: NodeJS.Timeout;
  
      const filterGameRules = (searchTerm: string) => {
        clearTimeout(debounceTimer);
  
        debounceTimer = setTimeout(() => {
          const filteredRules = innerItem.contentSubItems.filter((item:any) => {
            if (item.title.toLowerCase().includes(searchTerm.toLowerCase())) {
              return true;
            }
  
            for (let contentItem of item.contentItems) {
              let contentItemString: string | string[] = getNodeText(contentItem);
              if (
                typeof contentItemString === 'string' &&
                contentItemString.toLowerCase().includes(searchTerm.toLowerCase())
              ) {
                return true;
              }
            }
  
            return false;
          });
  
          setFilteredGameRules(filteredRules);
        }, 700);
      };
  
      filterGameRules(search);
  
      return () => {
        clearTimeout(debounceTimer);
      };
    }, [search, innerItem]);



  React.useLayoutEffect(() => {
      navigation.setOptions({
        headerTitle: innerItem.title,
        headerLargeStyle: {
          backgroundColor: theme.colors[globalColorScheme].gameHeaderBackground}, 
        headerLargeTitleStyle: {fontFamily:theme.fonts.headings, color: theme.colors[globalColorScheme].black},
        headerStyle: {backgroundColor:theme.colors[globalColorScheme].gameHeaderBackground},
        headerTitleStyle:{color:theme.colors[globalColorScheme].black}, 
        headerTintColor: theme.colors[globalColorScheme].black ,       
        headerSearchBarOptions: {
          onChangeText: (event:any) => setSearch(event.nativeEvent.text),
          barTintColor:theme.colors[globalColorScheme].searchBarBackground, tintColor:theme.colors[colorScheme].black, textColor: theme.colors[globalColorScheme].black, headerIconColor: (Platform.OS === "android" ? theme.colors[globalColorScheme].tabBarIcon : theme.colors[globalColorScheme].lightgrey),
          placeholder: "Search rules",
          hideWhenScrolling:false
        },
        headerRight: () => (

          <TouchableOpacity onPress={() => {toggleColorScheme()}} activeOpacity={0.7} style={{paddingLeft:20, paddingVertical:10, paddingRight:Platform.OS === "ios" ? 0 : 10}}>
            <Ionicons name={colorScheme === 'dark' ? 'bulb-outline' : 'bulb'} color={theme.colors[globalColorScheme].tabBarIcon} size={22}></Ionicons>
          </TouchableOpacity>


      )          
      });
    }, [navigation, colorScheme]);


    const toggleColorScheme = () => {
      setColorScheme((prevColorScheme) =>
        prevColorScheme === "dark" ? "light" : "dark"
      );
      changeColorScheme();
    };


    const renderHighlightedText = (node: React.ReactNode): React.ReactNode => {
      if (typeof node === 'string') {
        const regex = new RegExp(`(${search})`, 'gi');
        const parts = node.split(regex);
  
        return parts.map((part, index) => {
          if (regex.test(part.toLowerCase())) {
            return (
              <Text key={index} style={{ backgroundColor: theme.colors.accent, textTransform:"none", color: theme.colors.white }}>
                {part}
              </Text>
            );
          }
  
          return (
            <Text key={index} style={{ textTransform:"none" }}>
              {part}
            </Text>
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
      <KeyboardAvoidingView behavior={'height'} style={styles.container}>
        <ScrollView style={{ ...styles.container, backgroundColor: theme.colors[colorScheme].white }} contentInsetAdjustmentBehavior="automatic">
          {preContentItems.length > 0 && (
            <View style={{ paddingTop:15,paddingBottom:0,paddingHorizontal:15, backgroundColor: theme.colors[colorScheme].accordianBackground }} key="preContent">
              <Text style={{ ...styles.contentText, color: theme.colors[colorScheme].black }}>
                {preContentItems.map((preContentItem: any, preContentIndex: number) => (
                  <Text key={preContentIndex}>{search ? renderHighlightedText(preContentItem) : preContentItem}</Text>
                ))}
              </Text>
            </View>
          )}
    
          {filteredGameRules.map((item: any, index: number) => (
            item.specialHeading ? (
              <View key={index} style={{ ...styles.specialHeading, borderColor: theme.colors[colorScheme].accordianSeperator }}>
                <Text style={styles.specialHeadingText}>{search ? renderHighlightedText(item.title) : item.title}</Text>
              </View>
            ) : (
              <Accordion headerText={item.title} outsideColorScheme={colorScheme} key={index} search={search}>
                {item.contentItems.map((contentItem: any, contentIndex: number) => (
                  contentIndex > 1 ? <Text key={contentIndex}>{contentItem}</Text> : null
                ))}
              </Accordion>
            )
          ))}
        </ScrollView>
      </KeyboardAvoidingView>
    );
}

export default GameRulesInner

const styles = StyleSheet.create(   { 
  container: {
  flex:1   
  }  ,
  contentContainer: {
    paddingHorizontal: 15,
    paddingVertical: 15
  },
  contentText: {
    fontSize: 14,
    lineHeight:22
  },
  specialHeading: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderTopWidth:1,
    borderColor:"#d1d1d6"

  },
  specialHeadingText: {
    fontSize: 14,
    textTransform:"capitalize",
    fontWeight:"bold",
    color:theme.colors.primary
  }
})