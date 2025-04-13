import { Redirect } from "expo-router";

const Home = () => {
  return <Redirect href="/(auth)/welcome" />;
};

// export const baseURL = "http://192.168.1.75:8081";
export const baseURL = "http://172.39.0.195:8081";
export const baseURL_2 = "http://172.39.0.195:8082";
export const baseURL_server = "http://172.39.0.195:3000";

export default Home;
