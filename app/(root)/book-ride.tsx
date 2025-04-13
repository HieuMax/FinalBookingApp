import { useUser } from "@clerk/clerk-expo";
import { Image, Text, View } from "react-native";

import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { formatTime } from "@/lib/utils";
import { useDriverStore, useLocationStore } from "@/store";
import Payment from "@/components/Payment";
import React, { useEffect, useState } from "react";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import { calculateCost } from "@/lib/map";

const BookRide = () => {
  const { user } = useUser();
  const {
    userAddress,
    destinationAddress,
    userLatitude,
    userLongitude,
    destinationLatitude,
    destinationLongitude,
    setRoutes,
  } = useLocationStore();
  const { drivers, selectedDriver, setBookedDriver } = useDriverStore();
  const [confirm, setConfirm] = useState(false);

  const [distance, setDistance] = useState<number | null>(null);
  const [time, setTime] = useState<number | null>(null);

  const driverDetails = drivers?.filter(
    (driver) => +driver.id === selectedDriver,
  )[0];

  useEffect(() => {
    console.log(`driverDetails::`);
    console.log(driverDetails)
  }, [])

  const actionButton = {
    handleConfirm: () => {
      setConfirm(true);

      // const markers:MarkerData[] = [driverDetails]
      const startLat: number | null = driverDetails.latitude;
      const startLog: number | null = driverDetails.longitude;
      const endLat = userLatitude;
      const endLog = userLongitude;
      // const calc = async () =>
      setBookedDriver(driverDetails);
      if (!startLat || !startLog || !endLat || !endLog) return;
      calculateCost({
        startLat,
        startLog,
        endLat,
        endLog,
      }).then((item) => {

        if (item === undefined || !item) return;
        setRoutes(item.coordinates);
        setDistance(item?.distance || null);
        setTime(Math.ceil(item.time) || null);
      });
    },
  };

  useEffect(() => {
    console.log(`time::${time}`);
  }
  , [time]);

  return (
    <RideLayout title="Book Ride" snapPoints={["10%", "65%", "85%"]}>
      <View className={`${confirm ? "hidden" : ""}`}>
        <Text className="text-xl font-JakartaSemiBold mb-3">
          Ride Information
        </Text>

        <View className="flex flex-col w-full items-center justify-center mt-10">
          <Image
            source={{ uri: driverDetails?.profile_image_url }}
            className="w-28 h-28 rounded-full"
          />

          <View className="flex flex-row items-center justify-center mt-5 space-x-2">
            <Text className="text-lg font-JakartaSemiBold">
              {driverDetails?.title}
            </Text>

            <View className="flex flex-row items-center space-x-0.5">
              <Image
                source={icons.star}
                className="w-5 h-5"
                resizeMode="contain"
              />
              <Text className="text-lg font-JakartaRegular">
                {driverDetails?.rating}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex flex-col w-full items-start justify-center py-3 px-5 rounded-3xl bg-general-600 mt-5">
          <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
            <Text className="text-lg font-JakartaRegular">Ride Price</Text>
            <Text className="text-lg font-JakartaRegular text-[#0CC25F]">
              ${driverDetails?.price}
            </Text>
          </View>

          <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
            <Text className="text-lg font-JakartaRegular">Pickup Time</Text>
            <Text className="text-lg font-JakartaRegular">
              {formatTime(driverDetails?.time?.timeToUser!) || 5}
            </Text>
          </View>

          <View className="flex flex-row items-center justify-between w-full py-3">
            <Text className="text-lg font-JakartaRegular">Car Seats</Text>
            <Text className="text-lg font-JakartaRegular">
              {driverDetails?.car_seats}
            </Text>
          </View>
        </View>

        <View className="flex flex-col w-full items-start justify-center mt-5">
          <View className="flex flex-row items-center justify-start mt-3 border-t border-b border-general-700 w-full py-3">
            <Image source={icons.to} className="w-6 h-6" />
            <Text className="text-lg font-JakartaRegular ml-2">
              {userAddress}
            </Text>
          </View>

          <View className="flex flex-row items-center justify-start border-b border-general-700 w-full py-3">
            <Image source={icons.point} className="w-6 h-6" />
            <Text className="text-lg font-JakartaRegular ml-2">
              {destinationAddress}
            </Text>
          </View>
        </View>

        <Payment 
          actionButton={actionButton}  
          driverId={driverDetails?.id}
          timeToDestion={driverDetails?.time?.timeToDes}
          price={parseFloat(driverDetails?.price!)}
        />
      </View>

      <View className={`${!confirm ? "hidden" : ""}`}>
        <Text className="text-xl font-JakartaSemiBold mb-3 mr-3">
          Arriving in{" "}
          <Text className="text-[#0CC25F]">
            {/* {driverDetails ? " " + driverDetails.time?.timeToUser : "5"} min */}
            {time ? " " + time : "5"} min
          </Text>
        </Text>

        <View className="flex flex-col w-full items-start justify-center py-3 px-5 rounded-3xl bg-general-600 mt-5">
          <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
            <View className="flex flex-col justify-center items-center">
              <Image
                source={{ uri: driverDetails?.profile_image_url }}
                className="w-28 h-28 rounded-full"
              />
              <Text className="text-lg font-JakartaSemiBold">
                {driverDetails?.title}
              </Text>
            </View>

            <Image
              source={{ uri: driverDetails?.car_image_url }}
              className="h-full w-full"
              resizeMode="contain"
            />
          </View>
        </View>

        <View className="flex flex-col w-full items-start justify-center mt-5">
          <View className="flex flex-row items-center justify-start mt-3 border-t border-b border-general-700 w-full py-3">
            <Image source={icons.to} className="w-6 h-6" />
            <Text className="text-lg font-JakartaRegular ml-2">
              {userAddress}
            </Text>
          </View>

          <View className="flex flex-row items-center justify-start border-b border-general-700 w-full py-3">
            <Image source={icons.point} className="w-6 h-6" />
            <Text className="text-lg font-JakartaRegular ml-2">
              {destinationAddress}
            </Text>
          </View>

          <CustomButton
            title="Back home"
            onPress={() => router.push("/(root)/(tabs)/home")}
            className="mt-5"
          />
        </View>
      </View>
    </RideLayout>
  );
};

export default BookRide;
