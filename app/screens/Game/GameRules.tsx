import { Appearance, ImageBackground, StyleSheet, Text, View, Image, Linking, Platform, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native'
import React, { useEffect, useState } from 'react'
import theme from '../../constants/theme';
import * as gameService from '../../services/GameService';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Accordion from '../../components/Accordian';
import ImageViewer from '../../components/ImageViewer';
const globalColorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
type ThemeOptions = 'dark' | 'light';

  type GameProps = {
    id?:number; 'name'?:string; 'owned'?:boolean; 'description'?:string; 'price_tier'?: string; 'rules_file'?: string; 'banner_image'?: string; 'description_image'?: string; 
    'designers'?:string; 'artist'?:string; 'publisher'?: string; 'year_published'?:string; 'number_of_players'?:string; 'ages'?:string; 'playing_time'?:string; 
    'website'?: string; 'notes'?:string; 'created_at'?: Date; 'updated_at'?: Date; 'game_rules'?: any;
  }



const GameRules = ({ id }: {id: number}) => {




    const navigation = useNavigation();
    const [search, setSearch] = React.useState('');
    const [colorScheme, setColorScheme] = React.useState<ThemeOptions>(globalColorScheme)

    React.useLayoutEffect(() => {
        navigation.setOptions({
          headerSearchBarOptions: {
            onChangeText: (event:any) => {doSearch(event.nativeEvent.text)},
            barTintColor:theme.colors[globalColorScheme].searchBarBackground, tintColor:theme.colors[colorScheme].black, textColor: theme.colors[globalColorScheme].black, headerIconColor: theme.colors[globalColorScheme].lightgrey,
            placeholder: "Search rules",
            hideWhenScrolling:false
          },
          headerRight: () => (
            <TouchableOpacity onPress={() => {toggleColorScheme()}} activeOpacity={0.7} style={{paddingLeft:20, paddingVertical:10, paddingRight: Platform.OS === "ios" ? 0 : 10}}>
                <Ionicons name={colorScheme === 'dark' ? 'bulb-outline' : 'bulb'} color={theme.colors[globalColorScheme].tabBarIcon} size={22}></Ionicons>
            </TouchableOpacity>
        )          
        });
      }, [navigation, colorScheme]);


    const [loading, setLoading] = useState(true);

    const [game, setGame] = useState<GameProps>({
        id: id
    });

    const doSearch = (searchText:string) => {
      setSearch(searchText);

    }

    const [gameRules, setGameRules] = useState<Array<any>>([]);
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
          const filteredRules = gameRules.filter((item) => {
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
        }, 500);
      };
  
      filterGameRules(search);
  
      return () => {
        clearTimeout(debounceTimer);
      };
    }, [search, gameRules]);


    const renderHighlightedText = (node: string): React.ReactNode => {

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
    };




    const toggleColorScheme = () => {
      setColorScheme((prevColorScheme) =>
        prevColorScheme === "dark" ? "light" : "dark"
      );
    };
    

    useEffect(() => {
      const fetchPosts = async () => {
        try {
          const fetchedGame:GameProps = await gameService.getGame(id);
          setGame(fetchedGame);
       
          let game = fetchedGame;
          let rules = game.game_rules.rules;
          let formattedRules = gameService.formatGameRules(rules);
       
          setGameRules(formattedRules);
          setLoading(false);
        } catch (error) {
          console.error('Error fetching posts:', error);
          setLoading(false);
        }
      };
  
      fetchPosts();
    }, []);




    return (
      (loading ? 
        <View style={{flex:1, alignItems:"center", justifyContent: "center"}}><ActivityIndicator size="large" color={theme.colors[colorScheme].black} /></View> :
      
      <ScrollView style={{...styles.container, backgroundColor:theme.colors[colorScheme].white}} contentInsetAdjustmentBehavior="automatic">
  
          {filteredGameRules.map((item, index) => (
            
            (
              item.fullPage ? 
              <TouchableOpacity key={index} onPress={() => navigation.navigate("GameRulesInner" as never, {innerItem:item, outsideColorScheme: colorScheme, changeColorScheme: toggleColorScheme} as never)}  activeOpacity={.8}>
                <View style={{...styles.headerContainer, backgroundColor: theme.colors[colorScheme].accordianHeaderBackground, borderColor: theme.colors[colorScheme].accordianSeperator}}>
                  <Text style={{...styles.headerText, color: theme.colors[colorScheme].black}}>{(search ? renderHighlightedText(item.title) : item.title)}</Text>
                  
                  <View style={[styles.arrowIcon]}>
                    <Ionicons name={'chevron-forward'} size={20} color={theme.colors[colorScheme].tabBarIcon} />
                  </View>
                </View>
              </TouchableOpacity>

              :
               
                (item.specialHeading ? 
                  <View key={index} style={{...styles.specialHeading, borderColor: theme.colors[colorScheme].accordianSeperator}}>
                    <Text style={styles.specialHeadingText}>{(search ? renderHighlightedText(item.title) : item.title)}</Text>
                  </View> 

                :

                <Accordion headerText={item.title} outsideColorScheme={colorScheme} key={index} search={search}>
                  {item.contentItems.map((contentItem:any, contentIndex:number) => (
                    <Text key={contentIndex}>{contentItem}</Text>
                ))}               
                </Accordion>
                )
                
            )
          ))}
 
        </ScrollView>
       
      )
    )
}

export default GameRules

const styles = StyleSheet.create(   { 
  container: {
  flex:1   
  } ,
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
  },
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
    textTransform:"capitalize",
    fontWeight:"bold"


  },
  arrowIcon: {
    width: 20,
    height: 20,
  },    
})