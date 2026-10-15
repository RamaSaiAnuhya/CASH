import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const createTrip = (data) => API.post("/trips", data);
export const getTrips = () => API.get("/trips");
export const getTripById = (id) => API.get(`/trips/${id}`);
