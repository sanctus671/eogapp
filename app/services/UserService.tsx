import React from 'react';
import { Text, Image, View } from 'react-native';
import axios from 'axios';
import environment from "../constants/environment";

const API_URL = environment.API_URL;



const handleApiError = (error:any) => {
  console.error('API Error:', error);
  throw error;
};


export const getUserData = async () => {
    try {
      const response = await axios.get(API_URL + '/me');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  };


  export const updateUser = async (user:any) => {
    try {
      const response = await axios.put(API_URL + '/me', user);
      return response;
    } catch (error) {
      handleApiError(error);
    }
  };