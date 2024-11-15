import { Appearance, ImageBackground, StyleSheet, Text, View, Image, Linking, Platform, TouchableOpacity, ScrollView, ActivityIndicator, Dimensions } from 'react-native'
import React, { useEffect, useState } from 'react'
import theme from '../../constants/theme';
import * as gameService from '../../services/GameService';
const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";
import * as purchaseService from '../../services/PurchaseService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation, useRoute } from '@react-navigation/native';
import ImageViewer from '../../components/ImageViewer';
import FocusAwareStatusBar from '../../components/FocusAwareStatusBar';


  type GameProps = {
    id?:number; 'name'?:string; 'owned'?:boolean; 'description'?:string; 'price_tier'?: string; 'rules_file'?: string; 'banner_image'?: string; 'description_image'?: string; 
    'designers'?:string; 'artist'?:string; 'publisher'?: string; 'year_published'?:string; 'number_of_players'?:string; 'ages'?:string; 'playing_time'?:string; 
    'website'?: string; 'notes'?:string; 'created_at'?: Date; 'updated_at'?: Date; 'game_rules'?: any; 'version'?:number
  }

  type RouteParams = {
    id:number
  };
  type NavProps = {
    navigation: NativeStackNavigationProp<any>;
  };


const GameInfo = ({ navigation }: NavProps) => {

    const route = useRoute();
    const { id } = route.params as RouteParams;

    useEffect(() => {
        // Update the stack header options when the component mounts
        navigation.setOptions({
            headerRight: () => (
                (Platform.OS === "ios" ? 
                <TouchableOpacity
                onPress={() => {
                    navigation.navigate("Game", {id: id, owned:true, name: ""})
                }}
                style={{ paddingTop:10,paddingBottom:10, paddingLeft:10, paddingRight:0 }}
                >
                <Text style={{color:theme.colors.accent, fontSize:16}}>Close</Text>
                </TouchableOpacity> :
                <></>)
            )});
      }, []);




    const [loading, setLoading] = useState(true);

    const [game, setGame] = useState<GameProps>({
        id: id
    });

    const openWebsite = (url?:string) => {
        if (url){
            Linking.openURL(url); 
        }
      };

      useEffect(() => {
        const fetchPosts = async () => {
          try {
            const fetchedGame:GameProps = await gameService.getGame(id);
            setGame(fetchedGame);
            setLoading(false);
          } catch (error) {
            //console.error('Error fetching posts:', error);
            setLoading(false);
          }
        };
    
        fetchPosts();
      }, []);




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


      

    return (
        (loading ? 
            <View style={{flex:1, alignItems:"center", justifyContent: "center", backgroundColor: theme.colors[colorScheme].white}}><ActivityIndicator size="large" color={theme.colors[colorScheme].black} /></View> : 
            (
        <ScrollView style={styles.container} contentInsetAdjustmentBehavior="automatic">
      {Platform.OS === "ios" ? <FocusAwareStatusBar style={"light"} /> : null }
            <View style={{...styles.gameBanner, height: getItemHeight()}}>
                <ImageBackground source={{ uri: game.banner_image}} resizeMode="cover" style={{...styles.gameBanner, flex:1 }}></ImageBackground>
            </View>

            <View style={{...styles.gameDescription, borderBottomWidth: (game.description ? 0 : 1), paddingBottom: (game.description ? 5 : 20)}}>
                <View style={styles.gameDescriptionImage}>
                <ImageViewer imageUrl={game.description_image ? game.description_image : ""} width={"100%"} height={"auto"}  style={styles.gameDescriptionImageFile} styleInner={{flex:1, flexDirection:"row"}}   />
                </View>
                <View style={styles.gameDescriptionInfo}>

                    {(game.designers ?
                    <Text style={{...styles.gameDescriptionInfoItem}}>
                        <Text style={styles.gameDescriptionInfoItemLabel}>Designers(s): </Text>
                        {game.designers}
                    </Text> : <></>)}

                    {(game.artist ?
                    <Text style={{...styles.gameDescriptionInfoItem}}>
                        <Text style={styles.gameDescriptionInfoItemLabel}>Artist/Graphic Designer: </Text>
                        {game.artist}
                    </Text> : <></>)}

                    {(game.publisher ?
                    <Text style={{...styles.gameDescriptionInfoItem}}>
                        <Text style={styles.gameDescriptionInfoItemLabel}>Publisher: </Text>
                        {game.publisher}
                    </Text> : <></>)}

                    {(game.year_published ?
                    <Text style={{...styles.gameDescriptionInfoItem}}>
                        <Text style={styles.gameDescriptionInfoItemLabel}>Year Published: </Text>
                        {game.year_published}
                    </Text> : <></>)}

                    {(game.number_of_players ?
                    <Text style={{...styles.gameDescriptionInfoItem}}>
                        <Text style={styles.gameDescriptionInfoItemLabel}># of Players: </Text>
                        {game.number_of_players}
                    </Text> : <></>)}

                    {(game.ages ?
                    <Text style={{...styles.gameDescriptionInfoItem}}>
                        <Text style={styles.gameDescriptionInfoItemLabel}>Ages: </Text>
                        {game.ages}
                    </Text> : <></>)}

                    {(game.playing_time ?
                    <Text style={{...styles.gameDescriptionInfoItem}}>
                        <Text style={styles.gameDescriptionInfoItemLabel}>Playing Time: </Text>
                        {game.playing_time}
                    </Text> : <></>)}

                    {(game.website ?
                    <Text style={{...styles.gameDescriptionInfoItem}}>
                        <Text style={styles.gameDescriptionInfoItemLabel}>Website: </Text>
                        <Text style={{color:theme.colors.accent}} onPress={() => openWebsite(game.website)}>{(game.publisher ? game.publisher : "View website")}</Text>
                    </Text> : <></>)}     
{/* 
                    {(game.version ?
                    <Text style={{...styles.gameDescriptionInfoItem}}>
                        <Text style={styles.gameDescriptionInfoItemLabel}>Rules Version:</Text>
                        {game.version}
                    </Text> : <></>)}  */}           
                </View>

            </View>



{(game.description ?            
<View style={{...styles.gameNotes,  borderBottomWidth: 1}}>
    <Text style={styles.gameNotesNote}>{game.description}</Text>
</View>
 : <></>)}

{(game.version ?            
            <View style={{...styles.gameNotes, marginTop: 15, marginBottom: (game.notes ? 15 : 0),  borderBottomWidth: game.notes ? 1 : 0}}>
                <Text style={{...styles.gameNotesNote, fontWeight:"bold"}}>Tabletop Codex Version {game.version}</Text>
            </View>
             : <></>)}

            {(game.notes ?            
            <View style={styles.gameNotes}>
                <Text style={styles.gameNotesTitle}>Notes</Text>
                <Text style={styles.gameNotesNote}>{game.notes}</Text>
            </View>
             : <></>)}


        </ScrollView>
            )
        )

    )
}

export default GameInfo

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors[colorScheme].white,
        flex:1        
    },
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
        marginBottom:10,
        borderBottomColor: theme.colors[colorScheme].darkgrey
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
        color: theme.colors[colorScheme].black,
        fontSize: 12,
        paddingRight:5,
        paddingLeft:20
    },
    gameDescriptionInfoItemLabel: {
        color: theme.colors.primary,
        marginRight:5
    },
    gamePurchase: {
        borderBottomWidth:1,
        borderBottomColor:theme.colors[colorScheme].darkgrey,
        marginLeft:15,
        marginRight:15,   
        paddingBottom:15 ,
        marginBottom:10
    },
    gamePurchaseTitle: {
        color: theme.colors[colorScheme].darkgrey,
        textTransform:"uppercase",
        letterSpacing: 2,
        fontSize:12,
        paddingLeft:15,
        paddingRight:15,
        fontWeight:"bold"
    },
    gamePurchaseButton: {
        backgroundColor: theme.colors.accent,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems:"center",
        flex:1,
        paddingLeft:15,
        paddingRight:15,
        paddingTop:6,
        paddingBottom:6,
        marginTop:10
    },
    gamePurchaseName: {
        color:theme.colors.white,
        fontSize:13,
        fontWeight:"500"
        },
    gamePurchasePrice: {
        color: theme.colors.white,
        fontSize:16,
        fontWeight: "500"
    },
    gameNotes: {
        marginLeft:15,
        marginRight:15,   
        paddingBottom:15,
        borderBottomColor: theme.colors[colorScheme].darkgrey
    },
    gameNotesTitle: {
        color: theme.colors[colorScheme].darkgrey,
        textTransform:"uppercase",
        letterSpacing: 2,
        fontSize:12,
        paddingLeft:15,
        paddingRight:15,
        fontWeight:"bold",
        marginBottom:15

    },
    gameNotesNote: {
        color: theme.colors[colorScheme].black,
        fontSize: 12,
        paddingLeft:15,
        paddingRight:15,
    }



})