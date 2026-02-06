// services/searchService.ts
import axios from 'axios';

const API_URL = 'http://localhost:8088/api/v1';

export interface SearchParams {
  query?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  region?: string;
  minRating?: number;
  creatorEmail?: string;
  difficulty?: string;
  minDistance?: number;
  maxDistance?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: string;
}

export const searchSpots = async (params: SearchParams) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/spots/search`, params
  );
  return response.data;
};

export const searchHikingSpots = async (params: SearchParams) => {
  const token = localStorage.getItem('token');
  const response = await axios.post(`${API_URL}/hikingspot/search`, params);
  return response.data;
};