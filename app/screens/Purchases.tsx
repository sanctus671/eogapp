import { ActivityIndicator, Appearance, FlatList, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import FocusAwareStatusBar from '../components/FocusAwareStatusBar'
import theme from '../constants/theme'
import { Ionicons } from '@expo/vector-icons';
import * as userService from '../services/UserService';

const colorScheme = Appearance.getColorScheme() === "dark" ? "dark" : "light";

const Purchases = () => {

  const [loading, setLoading] = useState(true);
  const [purchases, setPurchases] = useState<Array<any>>([]);


  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedUser:any = await userService.getUserData();
        setPurchases(fetchedUser.purchases);
        setLoading(false);
      } catch (error) {
        //console.error('Error fetching posts:', error);
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (dateString:string) => {
    const date = new Date(dateString);
    
    const options:any = {
      day: "numeric",
      month: "long",
      year: "numeric"
    };
    
    const formattedDate = date.toLocaleDateString("en-US", options);
    
    // Get the day number without leading zeros
    const day = date.getDate();
    
    // Add the appropriate suffix to the day
    let dayWithSuffix;
    if (day === 1 || day === 21 || day === 31) {
      dayWithSuffix = day + "st";
    } else if (day === 2 || day === 22) {
      dayWithSuffix = day + "nd";
    } else if (day === 3 || day === 23) {
      dayWithSuffix = day + "rd";
    } else {
      dayWithSuffix = day + "th";
    }
    
    // Concatenate the day with the formatted date
    const formattedDateWithSuffix = dayWithSuffix + " " + formattedDate;
    
    return formattedDateWithSuffix;
  };


  return (
    (loading ? 
      <View style={{flex:1, alignItems:"center", justifyContent: "center", backgroundColor:theme.colors[colorScheme].white}}><ActivityIndicator size="large" color={theme.colors[colorScheme].black} /></View> :
    <View style={styles.container}>
        <FocusAwareStatusBar style={"light"} />
        <FlatList
          contentInsetAdjustmentBehavior="automatic" 
          data={purchases}
          keyExtractor={item => item.id}
          renderItem={({item}) => {

              return (
                <View style={styles.item} >
                    <Text style={styles.title}>{item.game.name}</Text>
                    <Text style={styles.subTitle}>Purchased {formatDate(item.purchase_date)} for {item.amount}{item.currency}</Text>
                </View>
            )}}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
    </View>
  )
  )
}

export default Purchases

const styles = StyleSheet.create({container: {
  backgroundColor:theme.colors[colorScheme].white,
  flex: 1
},
    sectionHeader: {
        paddingVertical: 8,
        paddingHorizontal: 15,
        backgroundColor:theme.colors[colorScheme].white,
        marginTop:30
      },
      sectionHeaderText: {
        fontWeight: 'bold',
        fontSize: 20,
        color:theme.colors[colorScheme].black
      },
      item: {
        paddingVertical: 12,
        paddingHorizontal: 16,
      },
      icon: {
        marginRight: 15,
      },
      title: {
        fontSize: 16,
        color:theme.colors[colorScheme].black
      },
      subTitle: {
        fontSize: 16,
        color:theme.colors[colorScheme].black,
        opacity:0.6,
        marginTop:5
      },
    separator: {
      height: 1,
      backgroundColor: theme.colors[colorScheme].lightgrey,
    },
    chevronContainer: {
        flex: 1,
        alignItems: 'flex-end',
      },
      textInput: {
          borderColor:theme.colors[colorScheme].lightgrey, 
          color: theme.colors[colorScheme].black
      },   
  });