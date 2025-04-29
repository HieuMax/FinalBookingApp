import { Redirect } from "expo-router";

const Home = () => {
  return <Redirect href="/(auth)/welcome" />;
};

// export const baseURL = "http://192.168.51.105:8081";
export const baseURL = "http://192.168.1.7:8081";
export const baseURL_2 = "http://192.168.1.7:8082";
export const baseURL_server = "http://192.168.51.105:3005";
export const baseURL_serverChat = "http://192.168.51.105:3000";

export default Home;