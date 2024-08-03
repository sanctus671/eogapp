import { Appearance, ImageBackground, StyleSheet, Text, View, Image, Linking, Platform, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions, LogBox, Modal } from 'react-native'
import React, { ReactElement, ReactNode, useEffect, useRef, useState } from 'react'
import theme from '../../constants/theme';
import * as gameService from '../../services/GameService';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, Feather } from '@expo/vector-icons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Accordion from '../../components/Accordian';
import ImageViewer from '../../components/ImageViewer';
const globalColorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
import * as purchaseService from '../../services/PurchaseService';
import Toast, { BaseToast } from 'react-native-toast-message';
import FocusAwareStatusBar from '../../components/FocusAwareStatusBar';
type ThemeOptions = 'dark' | 'light';
LogBox.ignoreLogs(['Non-serializable values', "Each child in a list"]);

  type GameProps = {
    id?:number; 'name'?:string; 'owned'?:boolean; 'description'?:string; 'price_tier'?: string; 'rules_file'?: string; 'banner_image'?: string; 'description_image'?: string; 
    'designers'?:string; 'artist'?:string; 'publisher'?: string; 'year_published'?:string; 'number_of_players'?:string; 'ages'?:string; 'playing_time'?:string; 
    'website'?: string; 'notes'?:string; 'created_at'?: Date; 'updated_at'?: Date; 'game_rules'?: any; 'version'?:number
  }

  type RenderFunction = (child: ReactNode) => ReactNode;


const GameRules = ({ id }: {id: number}) => {




    const navigation = useNavigation<NativeStackNavigationProp<any>>();
    const [search, setSearch] = React.useState('');
    const [colorScheme, setColorScheme] = React.useState<ThemeOptions>(globalColorScheme);

    const isTablet:boolean = Dimensions.get('window').width > 700;
    const [showFirstColumn, setShowFirstColumn] = React.useState<boolean>(true);
    const [columnRules, setColumnRules] = React.useState<any | null>(null);
    const [columnRulesInner, setColumnRulesInner] = React.useState("");
    const [selectedRulesIndex, setSelectedRulesIndex] = React.useState<number | null>(null);
    const [selectedRulesInnerIndex, setSelectedRulesInnerIndex] = React.useState<number | null>(null);
    const [selectedRulesInnerPreContentItems, setSelectedRulesInnerPreContentItems] = React.useState<Array<any>>([]);

    const [owned, setOwned] = useState(false);


    const toggleColumn = () => {

      setShowFirstColumn(!showFirstColumn);
      
    }

    React.useLayoutEffect(() => {
        navigation.setOptions({
          headerSearchBarOptions: {
            onChangeText: (event:any) => {doSearch(event.nativeEvent.text)},
            barTintColor:theme.colors[globalColorScheme].searchBarBackground, tintColor:theme.colors[globalColorScheme].black, textColor: theme.colors[globalColorScheme].black, headerIconColor: (Platform.OS === "android" ? theme.colors[globalColorScheme].tabBarIcon : theme.colors[globalColorScheme].lightgrey),
            placeholder: "Search rules",
            hideWhenScrolling:false
          },
          headerBackVisible:true  ,
          headerRight: () => (   
            <View style={{display:'flex', flexDirection:"row"}}>
                
            <TouchableOpacity onPress={async () => {
                if (owned){
                    setOwned(false);
                    Toast.show({
                        type: 'success',
                        text1: 'Game removed from your library.',
                        position:"bottom",
                        onPress: () => {Toast.hide();}
                      }); 
                    await purchaseService.removePurchase({game_id:id});                   
                }
                else{
                    
                    setOwned(true);
                    Toast.show({
                        type: 'success',
                        text1: 'Game added to your library.',
                        position:"bottom",
                        onPress: () => {Toast.hide();}
                      }); 
                    await purchaseService.createPurchase({game_id:id});
                }
                }} activeOpacity={0.7} style={{paddingLeft:20, paddingVertical:8, paddingRight: Platform.OS === "ios" ? 0 : 10}}>
         
                    <MaterialCommunityIcons name={owned ? 'checkbox-marked-circle' : 'folder-multiple-plus-outline'} color={theme.colors[globalColorScheme].tabBarIcon} size={25} />
            </TouchableOpacity>


              <TouchableOpacity onPress={() => {navigation.navigate("GameInfo", {id:game.id} as never) }} activeOpacity={0.7} style={{paddingLeft:20, paddingVertical:8, paddingRight: Platform.OS === "ios" ? 0 : 10}}>
                  <Ionicons name={'information-circle-outline'} color={theme.colors[globalColorScheme].tabBarIcon} size={26}></Ionicons>
              </TouchableOpacity>


              <TouchableOpacity onPress={() => {toggleColorScheme()}} activeOpacity={0.7} style={{paddingLeft:20, paddingVertical:10, paddingRight: Platform.OS === "ios" ? 0 : 10}}>
                  <Ionicons name={colorScheme === 'dark' ? 'bulb-outline' : 'bulb'} color={theme.colors[globalColorScheme].tabBarIcon} size={22}></Ionicons>
              </TouchableOpacity>
            </View>
        ),
        headerLeft: () => (    

        (isTablet ? <TouchableOpacity onPress={() => {toggleColumn()}} activeOpacity={0.7} style={{paddingRight:10, marginLeft:(Platform.OS === "web" ? 0 : 0)}}>
              <Feather name={'sidebar'} color={theme.colors[globalColorScheme].tabBarIcon} size={22}/>
          </TouchableOpacity> : <></>)
          
        )      
        });
      }, [navigation, colorScheme, showFirstColumn, owned]);


    const [loading, setLoading] = useState(true);

    const [game, setGame] = useState<GameProps>({
        id: id
    });

    const doSearch = (searchText:string) => {
      setSearch(searchText);

    }

  

    const openWebsite = (url?:string) => {
      if (url){
          Linking.openURL(url); 
      }
    };

    const getItemHeight = () => {
      const windowWidth = Dimensions.get('window').width;
      if (windowWidth > 1200){
        return 500;
      }
      if (windowWidth > 1000){
        return 400;
      }
      else if (windowWidth > 700){
        return 300;
      }
      return 180;
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

    const filterInnerItem = (innerItem:any) => {

      if (innerItem.title.toLowerCase().includes(search.toLowerCase())) {
        return true;
      }

      for (let contentItem of innerItem.contentItems) {
        let contentItemString: string | string[] = getNodeText(contentItem);
        if (
          typeof contentItemString === 'string' &&
          contentItemString.toLowerCase().includes(search.toLowerCase())
        ) {
          return true;
        }
      }

      return false;      
    }


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


    const renderRulesHighlightedText = (node: React.ReactNode): React.ReactNode => {
      
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
    
        return updateElementWithChildren(node, renderRulesHighlightedText);
  
      }
    
      return node;
    };
  
    const updateElementWithChildren = (element: ReactElement,
      renderFunction: RenderFunction): ReactElement => {
      const { children, ...otherProps } = element.props;
  
      const updatedChildren = React.Children.map(children, renderFunction);
  
      return React.createElement(element.type, otherProps, updatedChildren);
    } 





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
          if (fetchedGame.owned){
            setOwned(fetchedGame.owned);
          }
          
       
          let game = fetchedGame;
          if (game.game_rules){
          let rules = game.game_rules.rules;
          let formattedRules = gameService.formatGameRules(rules);
       
          setGameRules(formattedRules);
          }
          setLoading(false);
        } catch (error) {
          console.error('Error fetching posts:', error);
          console.log(error);
          setLoading(false);
        }
      };
  
      fetchPosts();
    }, []);



    const openRulesInnerItem = (innerItem:any, innerIndex:number) => {

        
      if (innerIndex === selectedRulesInnerIndex){
        setSelectedRulesIndex(null);
        setSelectedRulesInnerIndex(null);
        setColumnRulesInner("") ;   
        return;

      }

      setColumnRulesInner("") ; 


      setSelectedRulesInnerIndex(innerIndex);


        let children = 
        innerItem.contentItems.map((contentItem:any, contentIndex:number) => (
          <Text  key={innerIndex + "-" + contentIndex} >{contentItem}</Text>
        ))    

        setTimeout(() => {setColumnRulesInner(children)});


    }


    const openRulesInner = (item:any, index:number) => {

      if (isTablet){

        openRules(item, index);




      }
      else{
        navigation.navigate("GameRulesInner", {innerItem:item, outsideColorScheme: colorScheme, changeColorScheme: toggleColorScheme, outsideSearch: search} as never) 
      }


             
    }

 

    const openRules = (item:any, index:number) => {



      if (index === selectedRulesIndex && selectedRulesInnerIndex === null){
        setSelectedRulesIndex(null);
        setSelectedRulesInnerIndex(null);
        setColumnRulesInner("") ;  
        setColumnRules(null);     
        return;

      }

      setSelectedRulesIndex(null);



      setTimeout(() => {setSelectedRulesIndex(index)});
      setSelectedRulesInnerIndex(null);
      setColumnRulesInner("");
      setColumnRules(item);  



      let preContentItems = [];

      if (item.contentSubItems && item.contentSubItems.length > 0){
    
        let firstTitle = item.contentSubItems[0].title;
    
        for (let innerItemNode of item.contentItems){
          let nodeText = getNodeText(innerItemNode);
          if (nodeText === firstTitle){
            break;
          }
          preContentItems.push(innerItemNode);
        }
    
      }
      else{
        preContentItems = [...item.contentItems];
      }


/*
      let preContentItems = [...item.contentItems];


      let subItemCount = 0;
    
      for (let contentSubItem of item.contentSubItems){
        subItemCount += contentSubItem.contentItems.length;
      }

      preContentItems.splice(-(subItemCount + item.contentSubItems.length));
      */

      setSelectedRulesInnerPreContentItems(preContentItems);


 

    }




    return (
      (loading ? 
        <View style={{flex:1, alignItems:"center", justifyContent: "center"}}><ActivityIndicator size="large" color={theme.colors[colorScheme].black} /></View> :
      
       <View style={{flex:1, flexDirection:"row"}}>

   
      <ScrollView style={{...styles.container, backgroundColor:(isTablet ? theme.colors[colorScheme].accordianHeaderBackground :  theme.colors[colorScheme].white), maxWidth: (isTablet ? ( showFirstColumn ? "33%" : "0%") : undefined)}} contentInsetAdjustmentBehavior="automatic">
  
          {filteredGameRules.map((item, index) => (
            
            (
              item.fullPage ? 
              <View key={index}>
                <TouchableOpacity onPress={() => openRulesInner(item, index)}  activeOpacity={.8}>
                  <View style={{...styles.headerContainer, backgroundColor: selectedRulesIndex === index && (selectedRulesInnerIndex === null || !isTablet) ? theme.colors.accent : theme.colors[colorScheme].accordianHeaderBackground, borderColor: theme.colors[colorScheme].accordianSeperator}}>
                    <Text style={{...styles.headerText, color: selectedRulesIndex === index && (selectedRulesInnerIndex === null || !isTablet) ? theme.colors.white : theme.colors[colorScheme].black }}>{(search ? renderHighlightedText(item.title) : item.title)}</Text>
                    
                    <View style={[styles.arrowIcon]}>
                      <Ionicons name={
                        isTablet && columnRules &&  columnRules.contentSubItems && columnRules.contentSubItems.length > 0  && selectedRulesIndex === index ? 'chevron-down' : 'chevron-forward'
                        } 
                        size={20} color={selectedRulesIndex === index && (selectedRulesInnerIndex === null || !isTablet) ? theme.colors.white : theme.colors[colorScheme].tabBarIcon} />
                    </View>
                  </View>
                </TouchableOpacity>

                {isTablet && columnRules &&  columnRules.contentSubItems && columnRules.contentSubItems.length > 0 && selectedRulesIndex === index && (


                  <View style={{}}>

                      {columnRules.contentSubItems
                      .filter((innerItem:any) => {
      

                        return filterInnerItem(innerItem);


                      }

                      )                      
                      .map((innerItem: any, innerIndex: number) => (
                      !innerItem.specialHeading && (
                        <TouchableOpacity key={innerIndex} onPress={() => openRulesInnerItem(innerItem, innerIndex)} activeOpacity={.8} style={{ display: "flex" }}>
                          <View style={{ ...styles.headerContainer, backgroundColor: selectedRulesInnerIndex === innerIndex ? theme.colors.accent : theme.colors[colorScheme].accordianBackground, borderColor: theme.colors[colorScheme].accordianSeperator }}>
                            <Text style={{ ...styles.headerText, color: selectedRulesInnerIndex === innerIndex ? theme.colors.white : theme.colors[colorScheme].black, fontWeight: "normal" }}>{search ? renderHighlightedText(innerItem.title) : innerItem.title}</Text>
                            <View style={[styles.arrowIcon]}>
                              <Ionicons name={'chevron-forward'} size={20} color={selectedRulesInnerIndex === innerIndex ? theme.colors.white : theme.colors[colorScheme].tabBarIcon} />
                            </View>
                          </View>
                        </TouchableOpacity>
                      )
                    ))}

                  </View>

                )}



              </View>
              :
               
                (item.specialHeading ? 
                  <View key={index} style={{...styles.specialHeading, borderColor: theme.colors[colorScheme].accordianSeperator}}>
                    <Text style={styles.specialHeadingText}>{(search ? renderHighlightedText(item.title) : item.title)}</Text>
                  </View> 

                :
                
                (
                  isTablet ? 
                  <TouchableOpacity key={index} onPress={() => openRules(item, index)}  activeOpacity={.8}>
                  <View style={{...styles.headerContainer, backgroundColor: selectedRulesIndex === index ? theme.colors.accent : theme.colors[colorScheme].accordianHeaderBackground, borderColor: theme.colors[colorScheme].accordianSeperator}}>
                    <Text style={{...styles.headerText, color: selectedRulesIndex === index ? theme.colors.white : theme.colors[colorScheme].black, fontWeight:"normal"}}>{(search ? renderHighlightedText(item.title) : item.title)}</Text>
                    
                    <View style={[styles.arrowIcon]}>
                      <Ionicons name={'chevron-forward'} size={20} color={selectedRulesIndex === index ? theme.colors.white : theme.colors[colorScheme].tabBarIcon} />
                    </View>
                  </View>
                </TouchableOpacity>

                :
                    
                    <Accordion headerText={item.title} outsideColorScheme={colorScheme} key={index} search={search}>
                    {item.contentItems.map((contentItem:any, contentIndex:number) => (
                      <Text key={contentIndex}>{contentItem}</Text>
                  ))}               
                  </Accordion>
                )
                )
                
            )
          ))}
 
        </ScrollView>


        {isTablet  && !columnRulesInner && !selectedRulesInnerIndex && selectedRulesIndex !== null ? (
  <ScrollView      
    style={{
      ...styles.container,
      backgroundColor: theme.colors[colorScheme].accordianBackground,
      borderLeftWidth: 1,
      borderColor: theme.colors[colorScheme].accordianSeperator
    }}
    contentInsetAdjustmentBehavior="automatic"
  >
    {columnRules ? (
      columnRules.fullPage ? (

        <View style={{paddingBottom:30  }}>

          {(selectedRulesInnerPreContentItems && selectedRulesInnerPreContentItems.length > 0 && (
            <View style={{paddingHorizontal: 15, paddingTop:15  }} key="preContent">
              <Text style={{ ...styles.contentText, color: theme.colors[colorScheme].black }}>
                {selectedRulesInnerPreContentItems.map((preContentItem: any, preContentIndex: number) => (
                  <Text key={preContentIndex}>{search ? renderRulesHighlightedText(preContentItem) : preContentItem}</Text>
                ))}
              </Text>
            </View>
          ))}


          {columnRules.contentSubItems

          .filter((innerItem:any) => {

            return filterInnerItem(innerItem);



          })           
          
          .map((innerItem: any, innerIndex: number) => (
            innerItem.specialHeading ? (
              <View key={innerIndex} style={{ ...styles.specialHeading, borderColor: theme.colors[colorScheme].accordianSeperator }}>
                <Text style={styles.specialHeadingText}>{search ? renderHighlightedText(innerItem.title) : innerItem.title}</Text>
              </View>
            ) : (
              <TouchableOpacity key={innerIndex} onPress={() => openRulesInnerItem(innerItem, innerIndex)} activeOpacity={.8} style={{ display: "flex" }}>
                <View style={{ ...styles.headerContainer, backgroundColor: selectedRulesInnerIndex === innerIndex ? theme.colors.accent : theme.colors[colorScheme].accordianBackground, borderColor: theme.colors[colorScheme].accordianSeperator }}>
                  <Text style={{ ...styles.headerText, color: selectedRulesInnerIndex === innerIndex ? theme.colors.white : theme.colors[colorScheme].black, fontWeight: "normal" }}>{search ? renderHighlightedText(innerItem.title) : innerItem.title}</Text>
                  <View style={[styles.arrowIcon]}>
                    <Ionicons name={'chevron-forward'} size={20} color={selectedRulesInnerIndex === innerIndex ? theme.colors.white : theme.colors[colorScheme].tabBarIcon} />
                  </View>
                </View>
              </TouchableOpacity>
            )
          ))}

        </View>
      ) : (
          <View style={{ paddingHorizontal: 15, paddingVertical:15 }}>
            <Text style={{ ...styles.contentText, color: theme.colors[colorScheme].black }}>        
              {columnRules.contentItems             
              .map((contentItem: any, contentIndex: number) => (
                <Text key={contentIndex}>{(search ? renderRulesHighlightedText(<Text>{contentItem}</Text>) : contentItem)}</Text>
              ))}
        </Text>
        </View>
      )
    ) : null}
  </ScrollView>
) : null}




{isTablet  && ((!columnRulesInner && selectedRulesInnerIndex) || (!columnRulesInner && !selectedRulesInnerIndex && selectedRulesIndex === null)) ? (
  <View
  style={{
    ...styles.container,
    backgroundColor: theme.colors[colorScheme].accordianBackground,
    borderLeftWidth: 1,
    borderColor: theme.colors[colorScheme].accordianSeperator
  }}>
    </View>  
    
) : null}

      {columnRulesInner ? (
        <ScrollView
          style={{
            ...styles.container,
            backgroundColor: theme.colors[colorScheme].accordianBackground,
            borderLeftWidth: 1,
            borderColor: theme.colors[colorScheme].accordianSeperator
          }}
          contentInsetAdjustmentBehavior="automatic"
    >
          <View style={{ paddingHorizontal: 15, paddingVertical:15 }}>
            <Text style={{ ...styles.contentText, color: theme.colors[colorScheme].black }}>

      
              
              {search ? renderRulesHighlightedText(<Text>{columnRulesInner}</Text>) : columnRulesInner}

              
            </Text>
          </View>
        </ScrollView>
      ) : null}




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
    borderColor:theme.colors.primary,
    backgroundColor:theme.colors.primary

  },
  specialHeadingText: {
    fontSize: 14,
    fontWeight:"bold",
    color:theme.colors.white
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
    fontWeight:"bold"


  },
  arrowIcon: {
    width: 20,
    height: 20,
  },
  contentText: {
    fontSize: 14,
    lineHeight:22
  }  ,

  gameBanner:{
    justifyContent: 'center'
},
gameDescription:{
    flexDirection: 'row',
    marginLeft:15,
    paddingLeft:10,
    marginRight:15,
    paddingRight:10,
    paddingTop:20,
    paddingBottom:20,
    marginBottom:10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors[globalColorScheme].darkgrey
},
gameDescriptionImage: {
    flex: 1,
    width: '45%',
    alignItems:"flex-start"
},
gameDescriptionImageFile: {
    flex:1,
    height:"auto",
    width:"100%",
    alignItems:"flex-start"
},
gameDescriptionInfo: {
    flex: 2,
    width: '55%'
},
gameDescriptionInfoItem: {
    marginBottom:3,
    color: theme.colors[globalColorScheme].black,
    fontSize: 12,
    paddingRight:5,
    paddingLeft:20
},
gameDescriptionInfoItemLabel: {
    color: theme.colors.primary,
    marginRight:5
},
gameNotes: {
    marginLeft:15,
    marginRight:15,   
    paddingBottom:15
},
gameNotesTitle: {
    color: theme.colors[globalColorScheme].darkgrey,
    textTransform:"uppercase",
    letterSpacing: 2,
    fontSize:12,
    paddingLeft:15,
    paddingRight:15,
    fontWeight:"bold",
    marginBottom:15

},
gameNotesNote: {
    color: theme.colors[globalColorScheme].black,
    fontSize: 12,
    paddingLeft:15,
    paddingRight:15,
}

})