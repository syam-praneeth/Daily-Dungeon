// import axios from "axios";

// const instance = axios.create({
//   baseURL: "http://localhost:5000/api",
// });

// instance.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export default instance;


import axios from "axios";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL + "/api", // ✅ dynamic URL
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default instance;
