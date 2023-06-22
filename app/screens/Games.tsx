import { ActivityIndicator, Appearance, FlatList, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import theme from '../constants/theme';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useNavigation } from '@react-navigation/native';
const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
import { Ionicons } from '@expo/vector-icons';
import FocusAwareStatusBar from '../components/FocusAwareStatusBar';
import * as gameService from '../services/GameService';



const Games = () => {
  const [segmentIndex, setSegmentIndex] = useState(0);

  const [search, setSearch] = React.useState('');
  const navigation = useNavigation();

  const [games, setGames] = useState<Array<any>>([]);
  const [filteredGames, setFilteredGames] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedGames = await gameService.getGames();
        setGames(fetchedGames.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setLoading(false);
      }
    };
  
    fetchPosts();
  }, []);
  
  useEffect(() => {
    const filterGames = games.filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) && item.owned
    );
  
    setFilteredGames(filterGames);
  }, [search, games]);





  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        onChangeText: (event:any) => setSearch(event.nativeEvent.text),
        barTintColor:theme.colors[colorScheme].searchBarBackground, tintColor:theme.colors.white, textColor: theme.colors[colorScheme].black, headerIconColor: theme.colors[colorScheme].lightgrey,
        placeholder: "Search my games",
        hideWhenScrolling:false
      },
      
    });
  }, [navigation]);


  return (
    (loading ? 
      <View style={{flex:1, alignItems:"center", justifyContent: "center", backgroundColor:theme.colors[colorScheme].white}}><ActivityIndicator size="large" color={theme.colors[colorScheme].black} /></View> :
    <View style={styles.container}>
      <FocusAwareStatusBar style={colorScheme} />
      

      <FlatList
      contentInsetAdjustmentBehavior="automatic" 
        data={filteredGames}
        renderItem={({item}) => {
          return (
            <TouchableOpacity style={{...styles.item, height: (segmentIndex === 0 ? 180 : "auto")}} activeOpacity={.8}
            onPress={() => navigation.navigate("Game" as never, {id:item.id, name: item.name, owned:item.owned} as never)}>
              <View style={{...styles.itemImage, display:(segmentIndex === 0 ? "flex" : "none")}} >
                <ImageBackground source={{ uri: item.banner_image}} resizeMode="cover" style={{...styles.itemImage }}></ImageBackground>
                <View style={{...styles.itemListOwned, right:15, bottom:15, display: (item.owned ? "flex" : "none")}}>
                  <Ionicons name="checkmark" size={30} color={theme.colors.white} />
                </View>                
              </View>
              <View style={{...styles.itemList, display:(segmentIndex === 0 ? "none" : "flex")}} >
                <Text style={styles.itemListName} >{item.name}</Text>
                <Text style={styles.itemListPublisher} >{item.publisher}</Text>
                <Ionicons name="chevron-forward" size={20} color={theme.colors[colorScheme].black} style={styles.itemListArrow} />
                <View style={{...styles.itemListOwned, right:45, top:15, display: (item.owned ? "flex" : "none")}}>
                  <Ionicons name="checkmark" size={30} color={theme.colors.white} />
                </View>
              </View>
          </TouchableOpacity>
          )
        }}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          () => {
  
            return (
              <SegmentedControl
              style={{
                marginTop:15,
                marginBottom:15,
                marginLeft:15,
                marginRight:15
              }}
              values={['Image', 'List']}
              selectedIndex={segmentIndex}
              onChange={(event) => {
                setSegmentIndex(event.nativeEvent.selectedSegmentIndex);
              }}
            /> 
            )
          }          


        }
      />
    </View>
    )
  )
}

export default Games

const styles = StyleSheet.create({    
  
  container: {
    backgroundColor: theme.colors[colorScheme].white,
    flex:1

  },
  item: {
    
  },
  itemImage:{
    flex: 1,
    justifyContent: 'center'
  },
  itemList: {
    paddingLeft:15,
    paddingRight:15,
    paddingTop:15,
    paddingBottom:15,
    borderTopWidth: 1,
    borderTopColor:theme.colors[colorScheme].lightgrey
  },
  itemListName: {
    fontSize:18,
    color:theme.colors[colorScheme].black
  },
  itemListPublisher: {
    color:theme.colors[colorScheme].black,
    opacity:0.6,
    marginTop:5
  },
  itemListArrow: {
    position:"absolute", right:15, top:25,
    opacity:0.6

  },
  itemListOwned: {
    position:"absolute",
    backgroundColor:theme.colors.accent,
    borderRadius:20,
    width:40,
    height:40,
    textAlign:"center",
    display:"flex",
    alignItems:"center",
    justifyContent:"center"
  }

})