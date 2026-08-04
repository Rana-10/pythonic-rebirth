import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const predictDelay = async (flightData) => {
    const response = await axios.post(`${API_BASE_URL}/predict`, flightData);
    return response.data;
};

export const getAirports = async () => {
    const response = await axios.get(`${API_BASE_URL}/airports`);
    return response.data.airports;
};

export const getCarriers = async () => {
    const response = await axios.get(`${API_BASE_URL}/carriers`);
    return response.data.carriers;
};

export const getDistance = async (origin, dest) => {
    const response = await axios.get(`${API_BASE_URL}/distance`, {params: {origin, dest}});
    return response.data;
};