import axios from "axios"

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const axiosClient =  axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});


export default axiosClient;

