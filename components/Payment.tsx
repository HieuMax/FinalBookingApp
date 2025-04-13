import {
  StyleSheet,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomButton from "./CustomButton";
import { icons, images } from "@/constants";
import { router } from "expo-router";
import { ReactNativeModal } from "react-native-modal";
import { useState } from "react";
import { fetchAPI } from "@/lib/fetch";
import { useAuth } from "@clerk/clerk-expo";
import { useLocationStore } from "@/store";
import { PaymentProps } from "@/types/type";
import { baseURL, baseURL_server } from '../app/index';
import { io } from "socket.io-client";

const paymentMethods = ["Cash", "Momo"];

const socket = io(`${baseURL_server}`); // Replace with your WebSocket server URL

const Payment = ({ actionButton, timeToDestion, price, driverId } : PaymentProps) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPaymentMethod, setShowPaymentMethod] = useState(false);
  const openPaymentSheet = () => {
    setShowPaymentMethod(true);
  };

  const handleConfrim = () => actionButton.handleConfirm();

  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();

  const { userId } = useAuth();

  const createRide = async () => {
    try{
      const response = await fetchAPI(`${baseURL}/(api)/ride/create`, {
      // await fetchAPI("http://localhost:8081/(api)/ride/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          origin_address: userAddress,
          destination_address: destinationAddress,
          origin_latitude: userLatitude,
          origin_longitude: userLongitude,
          destination_latitude: destinationLatitude,
          destination_longitude: destinationLongitude,
          ride_time: timeToDestion,
          fare_price: price,
          payment_status: "pending",
          driver_id: driverId,
          user_id: userId,
          status: "pickup",
        }),
      });

      // const newRide = await response.json();

      // Emit the event to the server
      socket.emit("booked_sender", {
        rideId: "10",
      });  

      // console.log("Ride created and event emitted:", newRide);
    } catch (error) {
      console.error("Error creating ride:", error);
    }
  }

  return (
    <View>
      <ReactNativeModal isVisible={showPaymentMethod}>
        <View className={"bg-white px-7 py-9 rounded-2xl min-h-[300px]"}>
          <Image
            source={icons.dollar}
            resizeMode={"contain"}
            className={"w-[70px] h-[70px] mx-auto my-5"}
          />
          <Text className={"text-3xl font-JakartaBold text-center"}>
            {" "}
            Payment method
          </Text>

          <FlatList
            className="z-50"
            data={paymentMethods}
            renderItem={({ item }) => (
              <TouchableOpacity>
                <Text style={styles.suggestionText}>{item}</Text>
              </TouchableOpacity>
            )}
            style={styles.suggestionList}
          />

          <CustomButton
            title={"OK!"}
            onPress={() => {
              setShowPaymentMethod(false);
              setShowPaymentModal(true);
              createRide();
            }}
            className={"mt-5"}
          />
        </View>
      </ReactNativeModal>

      <ReactNativeModal isVisible={showPaymentModal}>
        <View className={"bg-white px-7 py-9 rounded-2xl min-h-[300px]"}>
          <Image
            source={images.check}
            className={"w-[110px] h-[110px] mx-auto my-5"}
          />
          <Text className={"text-3xl font-JakartaBold text-center"}>
            {" "}
            Book car successfully
          </Text>

          <CustomButton
            title={"Go track"}
            onPress={() => {
              setShowPaymentModal(false);
              handleConfrim()
              // router.push("/(root)/(tabs)/home");
            }}
            className={"mt-5"}
          />
          <CustomButton
            title={"OK!"}
            bgVariant={"outline"}
            textVariant="primary"
            onPress={() => {
              setShowPaymentModal(false);
              router.push("/(root)/(tabs)/home");
            }}
            className={"mt-5 shadow-neutral-100 shadow-sm"}
          />
        </View>
      </ReactNativeModal>

      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={openPaymentSheet}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  suggestionList: {
    maxHeight: 200,
    overflow: "scroll",
    backgroundColor: "white",
    borderRadius: 5,
    elevation: 5,
    zIndex: 1200,
    margin: 12,
    left: 0,
    right: 0,
  },
  suggestionText: {
    padding: 10,
    color: "#333",
  },
});

export default Payment;
