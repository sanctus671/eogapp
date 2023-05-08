import React, { useState, useEffect, useRef } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity, Animated, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type SearchBarProps = {
  placeholder: string;
  onSearch: (text: string) => void;
};

const usePrevious = (value: string) => {
  const ref = useRef<string | undefined>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const containerFullWidth = Dimensions.get('window').width;

const SearchBar = ({ placeholder, onSearch }: SearchBarProps) => {
  const [searchText, setSearchText] = useState('');
  const [showCancel, setShowCancel] = useState(false);
  const inputContainerWidth = useRef(new Animated.Value(containerFullWidth)).current;
  const prevSearchText = usePrevious(searchText);

  useEffect(() => {
    if ((prevSearchText === '' && searchText.length === 1) || (prevSearchText?.length === 1 && searchText === '')) {
      setShowCancel(!showCancel);
      Animated.timing(inputContainerWidth, {
        toValue: showCancel ? containerFullWidth : containerFullWidth - 80,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  }, [searchText, showCancel]);

  const handleSearch = () => {
    onSearch(searchText);
  };

  const handleCancel = () => {
    Animated.timing(inputContainerWidth, {
      toValue: containerFullWidth,
      duration: 200,
      useNativeDriver: false,
    }).start(() => {
      setSearchText('');
      setShowCancel(false);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.inputContainerWrapper}>
        <Animated.View style={[styles.inputContainer, { width: inputContainerWidth }]}>
          <Ionicons name="ios-search" size={20} color="#8e8e93" style={styles.searchIcon} />
          <TextInput
          key="searchInput"
            style={styles.searchInput}
            placeholder={placeholder}
            placeholderTextColor="#8e8e93"
            onChangeText={(text) => setSearchText(text)}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCorrect={false}
            clearButtonMode="while-editing"
            value={searchText}
          />
        </Animated.View>
        {showCancel && (
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Animated.Text style={styles.cancelButtonText}>Cancel</Animated.Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 10,
  },
  inputContainerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  inputContainer: {
    backgroundColor: '#f0f0f5',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    color: '#000',
    fontSize: 16,
  },
  cancelButton: {
    paddingHorizontal: 10,
    height: '100%',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: '#007aff',
    fontSize: 16,
  },
});

export default SearchBar;
