import { Appearance, KeyboardAvoidingView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, useRoute } from '@react-navigation/native';
import theme from '../../constants/theme';
const globalColorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Accordion from '../../components/Accordian';

type ThemeOptions = 'dark' | 'light';

type RouteParams = {
  innerItem:any;
  outsideColorScheme:ThemeOptions;
  changeColorScheme:() => void;
};

type NavProps = {
  navigation: NativeStackNavigationProp<{}>;
};

const GameRulesInner = ({ navigation }: NavProps) => {

  const route = useRoute();
  const { innerItem, outsideColorScheme, changeColorScheme } = route.params as RouteParams;
  const [ preItems, setPreItems ] = useState([]);
  const [colorScheme, setColorScheme] = React.useState<ThemeOptions>(outsideColorScheme)


  let preContentItems = [...innerItem.contentItems];


  let subItemCount = 0;
console.log(innerItem);
  for (let contentSubItem of innerItem.contentSubItems){
    subItemCount += contentSubItem.contentItems.length;
  }

  console.log(subItemCount)

  preContentItems.splice(-(subItemCount + innerItem.contentSubItems.length));



  const [search, setSearch] = React.useState('');
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
          barTintColor:theme.colors[globalColorScheme].searchBarBackground, tintColor:theme.colors.white, textColor: theme.colors[globalColorScheme].black, headerIconColor: theme.colors[globalColorScheme].lightgrey,
          placeholder: "Search rules",
          hideWhenScrolling:false
        },
        headerRight: () => (

          <TouchableOpacity onPress={() => {toggleColorScheme()}} activeOpacity={0.7} style={{paddingLeft:20, paddingVertical:10, paddingRight:0}}>
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
  
      return React.cloneElement(
        node,
        {
          children: React.Children.map(node.props.children, renderHighlightedText),
        }
      );
    }
  
    return node;
    };


  return (
    <KeyboardAvoidingView
    behavior={'height'} style={styles.container}>    
    <ScrollView style={{...styles.container, backgroundColor: theme.colors[colorScheme].white}} contentInsetAdjustmentBehavior="automatic">
        { (
          preContentItems.length > 0 ?
        <View style={{...styles.contentContainer, backgroundColor: theme.colors[colorScheme].accordianBackground }} >
            <Text style={{...styles.contentText, color:theme.colors[colorScheme].black}}>
              {preContentItems.map((preContentItem:any, preContentIndex:number) => (
                  <Text key={preContentIndex}>{(search ? renderHighlightedText(preContentItem) : preContentItem)}</Text>
              ))}
            </Text>
        </View>
        : <></>
        )
              }
      


    {filteredGameRules.map((item:any, index:number) => (
      
        
        (item.specialHeading ? 
          <View key={index} style={{...styles.specialHeading, borderColor: theme.colors[colorScheme].accordianSeperator}}>
            <Text style={styles.specialHeadingText}>{(search ? renderHighlightedText(item.title) : item.title)}</Text>
          </View> 

        :

        <Accordion headerText={item.title} outsideColorScheme={colorScheme} key={index} search={search}>
          {item.contentItems.map((contentItem:any, contentIndex:number) => (
            (contentIndex > 1 ? <Text key={contentIndex}>{contentItem}</Text> : <></>)
        ))}               
        </Accordion>
        )
          
      
    ))}

  </ScrollView>
  </KeyboardAvoidingView>
  )
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