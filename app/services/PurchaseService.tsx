import React from 'react';
import { Text, Image, View } from 'react-native';
import axios from 'axios';
import environment from "../constants/environment";

const API_URL = environment.API_URL;



const handleApiError = (error:any) => {
  console.error('API Error:', error);
  throw error;
};




export const createPurchase = async (purchase:any) => {
    try {
      const response = await axios.post(API_URL + '/purchases', purchase);
      return response;
    } catch (error) {
      handleApiError(error);
    }
  };