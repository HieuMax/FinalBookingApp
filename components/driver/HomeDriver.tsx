import React, { useEffect, useState } from 'react'
import { useFetch } from '@/lib/fetch';
import { Ride } from '@/types/type';
import { baseURL, baseURL_2, baseURL_server } from '../../app/index';
import { ReactNativeModal } from "react-native-modal";

import {
    FlatList,
    Text,
    View,
    Image,
    ActivityIndicator,
    TouchableOpacity,
    Modal,
    Button,
    Alert,
  } from "react-native";
  import { SafeAreaView } from "react-native-safe-area-context";
import { icons, images } from '@/constants';
import MapComponent from '../MapComponent';
import MapComponentGoing from '../MapComponentGoing';
import RideCard from '../RideCard';
import { useNavigation } from '@react-navigation/native';
import CustomButton from '../CustomButton';
import { useAuthStore } from '@/store';
import { io } from 'socket.io-client';
import { getSocket } from '@/app/socket';
  
const role_id = 4
const socket = getSocket(); // Use the singleton socket instance

export default function HomeDriver() {
    const [isPopupVisible, setPopupVisible] = useState(false);
    const [isPopupCompleteVisible, setPopupCompleteVisible] = useState(false);

    const { role } = useAuthStore();

    const navigation = useNavigation();

    useEffect(() => {
      const socket = getSocket(); // Use the singleton socket instance
    
      // Listen for the pickupSuccess event
      socket.on("bookedSucess", (updatedRide) => {
        console.log("Pickup updated:", updatedRide);
        refetch();
      });

      socket.on("pickupSuccess", (updatedRide) => {
        console.log("Pickup updated:", updatedRide);
        refetch();
      });
    
      return () => {
        // Remove the event listener to avoid memory leaks
        socket.off("bookedSucess");
        socket.off("pickupSuccess");
      };
    }, []);

    const handlePickupSuccess = () => {
      setPopupVisible(true);

    };

    const {
    data: recentRides,
    loading,
    error,
    refetch
    // } = useFetch<Ride[]>(`http://localhost:8081/(api)/ride/${user?.id}`);
    } = useFetch<Ride[]>(`${role == "driver" ? baseURL_2 : baseURL}/(api)/driver-ride/${role_id}`);


    const handleConfirmPickup = async () => {
      try {
        const rideId = recentRides[0]?.ride_id; // Assuming the ride ID is available
        console.log(rideId)
        const response = await fetch(`${role == "driver" ? baseURL_2 : baseURL}/(api)/ride/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ride_id: rideId,
            status: "going",
          }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to update ride status");
        }
  
        const data = await response.json();
        console.log("Ride status updated:", data);
  
        // Close the popup and update the UI
        setPopupVisible(false);
        Alert.alert("Success", "Ride status updated to 'going'");
        if (socket.connected) {
          console.log("Emitting pickupSuccess_sender event...");
          socket.emit("pickupSuccess_sender", {
            rideId: "10",
          });
          console.log("Event emitted: pickupSuccess_sender");
        } else {
          console.error("Socket is not connected. Cannot emit event.");
        }
      } catch (error) {
        console.error("Error updating ride status:", error);
        Alert.alert("Error", "Failed to update ride status");
      }
    };

    const handleConfirmComplete = async () => {
      try {
        const rideId = recentRides[0]?.ride_id; // Assuming the ride ID is available
        console.log(rideId)
        const response = await fetch(`${role == "driver" ? baseURL_2 : baseURL}/(api)/ride/update`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ride_id: rideId,
            status: "complete",
          }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to update ride status");
        }
  
        const data = await response.json();
        console.log("Ride status updated:", data);
  
        // Close the popup and update the UI
        setPopupCompleteVisible(false);
        Alert.alert("Success", "Ride status updated to 'complete'");
        if (socket.connected) {
          console.log("Emitting pickupSuccess_sender event...");
          socket.emit("pickupSuccess_sender", {
            rideId: "10",
          });
          console.log("Event emitted: pickupSuccess_sender");
        } else {
          console.error("Socket is not connected. Cannot emit event.");
        }
      } catch (error) {
        console.error("Error updating ride status:", error);
        Alert.alert("Error", "Failed to update ride status");
      }
    };


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
                Welcome{", Driver"}
                {/* {user?.firstName || user?.emailAddresses[0].emailAddress.split("@")[0]}{" "}  */}
                👋
              </Text>
            </View>

            {
              recentRides && recentRides.length > 0 && recentRides[0]?.status !== "complete" && 
                <View>
                  <Text className="mx-5 gap-y-5 text-xl font-JakartaSemiBold mb-3 mr-3">
                    {/* Arriving in{" "} */}

                    {
                      recentRides[0]?.status === "pickup" ? (
                        <Text className="text-[#0CC25F]">
                          Customer is waiting for you !!!
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
            }

            {recentRides && recentRides.length > 0 && recentRides[0]?.status === "pickup" && (
              <ReactNativeModal isVisible={isPopupVisible}>
                <View className={"bg-white px-7 py-9 rounded-2xl min-h-[300px]"}>
                  <Image
                    source={icons.marker}
                    resizeMode={"contain"}
                    className={"w-[70px] h-[70px] mx-auto my-5"}
                  />
                  <Text className={"text-3xl font-JakartaBold text-center"}>
                    {" "}
                    Ride information
                    
                  </Text>
                  <Text className="text-base font-JakartaMedium mt-5">
                    Pick up at: {recentRides[0]?.origin_address}
                  </Text>
                  <Text className="text-base font-JakartaMedium mt-5">
                    Destination: {recentRides[0]?.destination_address}
                  </Text>

                  <CustomButton
                    title={"Confirm pick up"}
                    onPress={() => {
                      setPopupVisible(false);
                      handleConfirmPickup();
                      // handlePickupSuccess();
                    }}
                    className={"mt-5"}
                  />
                  <CustomButton
                    title={"Cancel"}
                    bgVariant="secondary"
                    onPress={() => {
                      setPopupVisible(false);
                      // handlePickupSuccess();
                    }}
                    className={"mt-5"}
                  />
                </View>
              </ReactNativeModal>
            )}
            {recentRides && recentRides.length > 0 && recentRides[0]?.status === "going" && (
              <ReactNativeModal isVisible={isPopupCompleteVisible}>
                <View className={"bg-white px-7 py-9 rounded-2xl min-h-[300px]"}>
                  <Image
                    source={icons.marker}
                    resizeMode={"contain"}
                    className={"w-[70px] h-[70px] mx-auto my-5"}
                  />
                  <Text className={"text-3xl font-JakartaBold text-center"}>
                    {" "}
                    Complete ride
                    
                  </Text>
                  <Text className="text-base font-JakartaMedium mt-5">
                    Pick up at: {recentRides[0]?.origin_address}
                  </Text>
                  <Text className="text-base font-JakartaMedium mt-5">
                    Destination: {recentRides[0]?.destination_address}
                  </Text>

                  <CustomButton
                    title={"Confirm complete"}
                    onPress={() => {
                      setPopupCompleteVisible(false);
                      handleConfirmComplete();
                      // handlePickupSuccess();
                    }}
                    className={"mt-5"}
                  />
                  <CustomButton
                    title={"Cancel"}
                    bgVariant="secondary"
                    onPress={() => {
                      setPopupVisible(false);
                      // handlePickupSuccess();
                    }}
                    className={"mt-5"}
                  />
                </View>
              </ReactNativeModal>
            )}


            <>
              <Text className="text-xl font-JakartaBold mt-5 mb-3 mx-3">
                Your Current Location
              </Text>

              <View className="flex flex-row items-center bg-transparent h-[500px] mx-3 relative">
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

                  {/* Absolute bar at the bottom right */}
                {recentRides && recentRides[0]?.status === "pickup" ? (
                    <View
                    style={{
                        position: "absolute",
                        bottom: 20,
                        right: 20,
                        backgroundColor: "#0CC25F",
                        borderRadius: 10,
                        padding: 10,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                    }}
                    >
                    <TouchableOpacity onPress={handlePickupSuccess}>
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>Picked Up</Text>
                    </TouchableOpacity>
                    </View>
                )
                : (
                  <View
                    style={{
                        position: "absolute",
                        bottom: 20,
                        right: 20,
                        backgroundColor: "#0CC25F",
                        borderRadius: 10,
                        padding: 10,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                        elevation: 5,
                    }}
                    >
                    <TouchableOpacity onPress={() => setPopupCompleteVisible(true)}>
                        <Text style={{ color: "#fff", fontWeight: "bold" }}>Complete</Text>
                    </TouchableOpacity>
                  </View>
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
  )
}