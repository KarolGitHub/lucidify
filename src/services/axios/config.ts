import axios from "axios";

const apiClient = axios.create({
  // baseURL: "http://localhost:5173/",
  headers: {
    "Content-Type": "application/json",
  },
});

export { apiClient };
