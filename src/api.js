// src/apiService.js
import axios from 'axios';

const API_URL = 'https://leadcal-ig26.vercel.app/';

export const fetchUsers = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};
