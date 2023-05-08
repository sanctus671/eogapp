import { Appearance, FlatList, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { StatusBar } from 'expo-status-bar'
import theme from '../constants/theme';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useNavigation } from '@react-navigation/native';
const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
import { Ionicons } from '@expo/vector-icons';

//hard coded data for iOS testing as API isn't live yet
const DATA = [
  {
    id: '1',
    name: 'Fallout v3',
    publisher: 'Fantasy Flight Games',
    bannerImage: 'https://www.orderofgamers.com/wordpress/wp-content/uploads/2018/02/fallout.jpg',
    owned:true
  },
  {
    id: '2',
    name: 'Fate of the Elder Gods v1',
    publisher: 'Fabled Nexus',
    bannerImage: 'https://www.orderofgamers.com/wordpress/wp-content/uploads/2019/04/fateoftheeldergods.jpg',
    owned:false
  },
  {
    id: '3',
    name: 'Fire & Axe: A Viking Saga v1.2',
    publisher: 'Asmodee',
    bannerImage: 'https://www.orderofgamers.com/wordpress/wp-content/uploads/2013/04/fireandaxe.jpg',
    owned:false
  },
  {
    id: '4',
    name: 'Firefight v1.1',
    publisher: 'Mantic Games',
    bannerImage: 'https://www.orderofgamers.com/wordpress/wp-content/uploads/2022/05/firefight.jpg',
    owned:false
  },
  {
    id: '5',
    name: 'Firefly: The Game v5',
    publisher: 'Gale Force Nine',
    bannerImage: 'https://www.orderofgamers.com/wordpress/wp-content/uploads/2014/01/firefly.jpg',
    owned:false
  },
  {
    id: '6',
    name: 'Firefly: Misbehavin v1',
    publisher: 'Gale Force Nine',
    bannerImage: 'https://www.orderofgamers.com/wordpress/wp-content/uploads/2022/10/fireflymisbehavin.jpg',
    owned:false
  },
  {
    id: '7',
    name: 'Firestorm: Planetfall v1.1',
    publisher: 'Spartan Games',
    bannerImage: 'https://www.orderofgamers.com/wordpress/wp-content/uploads/2016/03/firestormplanetfall.jpg',
    owned:false
  },
  {
    id: '8',
    name: 'Fireteam Zero v2',
    publisher: 'Emergent Games',
    bannerImage: 'https://www.orderofgamers.com/wordpress/wp-content/uploads/2016/03/fireteamzero.jpg',
    owned:false
  },
  {
    id: '9',
    name: 'Flip Ships v1',
    publisher: 'Renegade Game Studios',
    bannerImage: 'https://www.orderofgamers.com/wordpress/wp-content/uploads/2018/05/flipships.jpg',
    owned:false
  },
];

const Search = () => {

  const [segmentIndex, setSegmentIndex] = useState(0);

  const [search, setSearch] = React.useState('');
  const navigation = useNavigation();


  const dataFiltered = DATA.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );


  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerSearchBarOptions: {
        onChangeText: (event:any) => setSearch(event.nativeEvent.text),
        barTintColor:theme.colors[colorScheme].searchBarBackground, tintColor:theme.colors.white, textColor: theme.colors[colorScheme].black, headerIconColor: theme.colors[colorScheme].lightgrey
      },
    });
  }, [navigation]);


  return (

    <View style={styles.container}>
      <StatusBar style={colorScheme} />
      

      <FlatList
      contentInsetAdjustmentBehavior="automatic" 
        data={dataFiltered}
        renderItem={({item}) => {
          return (
            <TouchableOpacity style={{...styles.item, height: (segmentIndex === 0 ? 180 : "auto")}} activeOpacity={.8}>
              <View style={{...styles.itemImage, display:(segmentIndex === 0 ? "flex" : "none")}} >
                <ImageBackground source={{ uri: item.bannerImage}} resizeMode="cover" style={{...styles.itemImage }}></ImageBackground>
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
}

export default Search

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