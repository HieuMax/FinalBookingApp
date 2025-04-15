import { useAuth, useUser } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import {
  FlatList,
  Text,
  View,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import RideCard from "@/components/RideCard";
import { icons, images } from "@/constants";
import GoogleTextInput from "@/components/GoogleTextInput";
import { useAuthStore, useDriverStore, useLocationStore, useMarkerStore } from "@/store";
import { useEffect, useState } from "react";
import MapComponent from "@/components/MapComponent";
import { router } from "expo-router";
import { useFetch } from "@/lib/fetch";
import { Coordinate, Driver, MarkerData, Ride } from "@/types/type";
import MapComponentGoing from "@/components/MapComponentGoing";
import { calculateCost, calculateDriverTimes__, generateMarkersFromData } from "@/lib/map";
import { baseURL, baseURL_2 } from '../../index';
import HomeDriver from "@/components/driver/HomeDriver";
import { getSocket } from "@/app/socket";

// const role = "driver"


export default function Page() {
  const { role } = useAuthStore()
  const { setUserLocation, setDestinationLocation, setRoutes, clearAllUserStore, userLongitude, userLatitude, destinationLatitude, destinationLongitude, } = useLocationStore();
  const { setDrivers, clearAllDriverStore } = useDriverStore();
  const { markers, setMarkers } = useMarkerStore();
  const { user } = useUser();
  const { signOut } = useAuth();

  const [hasPermissions, setHasPermissions] = useState(false);

  // const socket = io(`${baseURL_server}`); // Replace with your WebSocket server URL
  useEffect(() => {
    const socket = getSocket(); // Use the singleton socket instance
  
    // Listen for the pickupSuccess event
    socket.on("pickupSuccess", (updatedRide) => {
      // console.log("Pickup updated:", updatedRide);
      refetch();
    });
  
    return () => {
      // Remove the event listener to avoid memory leaks
      socket.off("pickupSuccess");
    };
  }, []);

  const {
    data: recentRides,
    loading,
    error,
    refetch
  // } = useFetch<Ride[]>(`http://localhost:8081/(api)/ride/${user?.id}`);
  } = useFetch<Ride[]>(`${role === "driver" ? baseURL_2 : baseURL}/(api)/ride/${user?.id}`);
  // if ()

  const {
    data: driversFetch,
    loading2,
    error2,
  } = useFetch<Driver[]>(`${role === "driver" ? baseURL_2 : baseURL}/(api)/driver`);



  useEffect(() => {
    if (Array.isArray(driversFetch)) {
      if (!userLatitude || !userLongitude) return;

      const newMarkers = generateMarkersFromData({
        data: driversFetch,
        userLatitude,
        userLongitude,
      });
      const sameData = JSON.stringify(newMarkers) === JSON.stringify(markers);
      if (!sameData) setMarkers(newMarkers);
    }
  }, [driversFetch, userLatitude, userLongitude]);

  // useEffect(() => {
    // console.log("driver::home");
    // console.log(driversFetch);
  // }, [driversFetch])

  useEffect(() => {
    if (markers.length > 0 && destinationLatitude && destinationLongitude) {
      calculateDriverTimes__({
        markers,
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
      }).then((drivers) => {
        // console.log("drivers:calc:");
        // console.log(drivers);
        setDrivers(drivers as MarkerData[]);
      });
    }
  }, [markers, destinationLatitude, destinationLongitude]);

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
    clearAllUserStore();
    clearAllDriverStore();
  };

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {

    setDestinationLocation(location);
    router.push("/(root)/find-ride");
  };

  useEffect(() => {
    const requestLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasPermissions(false);
        return;
      }
      let location = await Location.getCurrentPositionAsync({});

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      });

      if (!address[0]) return;
      // console.log("home:location:")
      // console.log(location)

      setUserLocation({
        
        // Dynamic location based on user
        // latitude: location.coords?.latitude,
        // longitude: location.coords?.longitude,

        // HARD LOCATION
        latitude: 10.8275396, // hard location
        longitude: 106.7000258, // hard location

        // address: `${address[0].name}, ${address[0].region}`,
        address: `Van Lang University Campus 3, Binh Thanh District, Ho Chi Minh City, Viet Nam`,
      });
    };

    requestLocation();
  }, []);

  useEffect(() => {
    // console.log(`recentRides::`);
    // console.log(recentRides);
    if (!recentRides || recentRides[0]?.status !== "going") return

    const startLat: number | null = recentRides[0].origin_latitude;
    const startLog: number | null = recentRides[0].origin_longitude;
    const endLat = recentRides[0].destination_latitude;
    const endLog = recentRides[0].destination_longitude;
    // const calc = async () =>
    if (!startLat || !startLog || !endLat || !endLog) return;
    calculateCost({
      startLat,
      startLog,
      endLat,
      endLog,
    }).then((item) => {

      if (item === undefined || !item) return;
      setRoutes(item.coordinates);
      // setDistance(item?.distance || null);
      // setTime(Math.ceil(item.time) || null);
    });

  }, [recentRides])

  if (role == "driver") return <HomeDriver/>

  return (
    <SafeAreaView className="bg-general-500">
      <FlatList
        data={recentRides?.slice(0, 5)}
        // data={[]}
        className="px-5s"
        renderItem={({ item }) => <RideCard ride={item} />}
        keyboardShouldPersistTaps={"handled"}
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No rencent ride found"
                  resizeMode="contain"
                />
                <Text className="text-sm">No recent rides found</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={() => (
          <>
            <View className="flex flex-row items-center justify-between my-5 mx-3">
              <Text className="text-2xl capitalize font-JakartaExtraBold">
                Welcome{", "}
                {/* {user?.firstName || user?.emailAddresses[0].emailAddress.split("@")[0]}{" "}  */}
                👋
              </Text>
              <TouchableOpacity
                onPress={handleSignOut}
                className="justify-center items-center w-10 h-10 rounded-full bg-white"
              >
                <Image source={icons.out} className="w-4 h-4" />
              </TouchableOpacity>
            </View>

            {/* GoogleTextInput */}
            {
              recentRides && recentRides.length > 0 && recentRides[0]?.status !== "complete" ? (
                <View>
                  <Text className="mx-5 gap-y-5 text-xl font-JakartaSemiBold mb-3 mr-3">
                    {/* Arriving in{" "} */}

                    {
                      recentRides[0]?.status === "pickup" ? (
                        <Text className="text-[#0CC25F]">
                          Driver is going to pick up, wait few minutes
                        </Text>
                      ) : (
                        <Text className="text-[#0CC25F]">
                          You are going to destination !!!
                        </Text>
                      )
                    }
                  </Text>
                  <View className="flex flex-row items-center justify-between">
                    <View className="flex flex-col mx-5 gap-y-5 flex-1">
                      <View className="flex flex-row items-center gap-x-2">
                        <Image source={icons.to} className="w-5 h-5" />
                        <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                          {recentRides[0].origin_address}
                        </Text>
                      </View>
            
                      <View className="flex flex-row items-center gap-x-2">
                        <Image source={icons.point} className="w-5 h-5" />
                        <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                          {recentRides[0].destination_address}
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              )
              : (
                <GoogleTextInput
                  icon={icons.search}
                  containerStyle="shadow-md shadow-neutral-300"
                  handlePress={handleDestinationPress}
                />
              )
            }


            <>
              <Text className="text-xl font-JakartaBold mt-5 mb-3 mx-3">
                Your Current Location
              </Text>

              <View className="flex flex-row items-center bg-transparent h-[500px] mx-3">
                {
                  recentRides && recentRides[0]?.status !== "complete" ? (
                    // <MapComponent 
                    //   desLatInit={recentRides && recentRides[0]?.destination_latitude}
                    //   desLogInit={recentRides && recentRides[0]?.destination_longitude}
                    // />     
                    <MapComponentGoing 
                      desLatInit={recentRides && recentRides[0]?.destination_latitude}
                      desLogInit={recentRides && recentRides[0]?.destination_longitude}
                      // routes={recentRides && recentRides[0]?.status === "going" ? rout : []}
                    />
                  ) : (
                    <MapComponent />
                  )
                }
              </View>
            </>

            <Text className="text-xl font-JakartaBold mt-5 mb-3 mx-3">
              Recent Rides
            </Text>
          </>
        )}
      />
    </SafeAreaView>
  );
}