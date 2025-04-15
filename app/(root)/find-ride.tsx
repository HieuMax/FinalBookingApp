import CustomButton from "@/components/CustomButton";
import GoogleTextInput from "@/components/GoogleTextInput";
import RideLayout from "@/components/RideLayout";
import { fetchAndCalcFerryInfo } from "@/components/ValidRoute";
import { icons, images } from "@/constants";
import { useLocationStore } from "@/store";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { View, Text, Image,
} from "react-native";

import { ReactNativeModal } from "react-native-modal";


const FindRide = () => {
  const {
    userAddress,
    destinationAddress,
    setDestinationLocation,
    setUserLocation,
    userLatitude,
    userLongitude,
    destinationLongitude,
    destinationLatitude
  } = useLocationStore();

  const [isValid, setIsValid] = useState(true);
  const [openForm, setOpenForm] = useState(false);

  useEffect(() => {
    if (!destinationLatitude || !destinationLongitude || !userLatitude || !userLongitude) return;
    // console.log(`FindRide::`);

    const getValidRoute = async () => {
      try {
        const ferry = await fetchAndCalcFerryInfo([userLatitude,userLongitude],[destinationLatitude,destinationLongitude])
        // console.log(`FindRide::ferry: ${ferry}`);
        if (ferry) {
          setIsValid(false);
          setOpenForm(true);
          return;
        }
        setIsValid(true);
      } catch (error) {
        setIsValid(false);
        setOpenForm(true);
      }
    }
    getValidRoute();
  }, [destinationLongitude,destinationLatitude])

  useEffect(() => {
    // console.log(`FindRide::openForm: ${openForm}`);
  }, [openForm])

  return (
    <RideLayout title="Ride" snapPoints={["20%", "85%"]}>
      <View className="my-3 relative z-50">
        <Text className="text-lg font-JakartaSemiBold mb-3">From</Text>
        <GoogleTextInput
          icon={icons.target}
          initialLocation={userAddress}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="#f5f5f5"
          handlePress={(location) => setUserLocation(location)}
        />
      </View>

      <View className="my-3 relative z-10">
        <Text className="text-lg font-JakartaSemiBold mb-3">To</Text>
        <GoogleTextInput
          icon={icons.map}
          initialLocation={destinationAddress}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="transparent"
          handlePress={(location) => setDestinationLocation(location)}
        />
      </View>

      <ReactNativeModal isVisible={openForm}>
        <View className={"bg-white px-7 py-9 rounded-2xl min-h-[300px]"}>
          <Image
            source={icons.close}
            resizeMode={"contain"}
            className={"w-[70px] h-[70px] mx-auto my-5"}
          />
          <Text className={"text-3xl font-JakartaBold text-center"}>
            {" "}
            Hiện tại chưa có lộ trình nào khả thi cho chuyến đi này
          </Text>

          <CustomButton
            title={"OK!"}
            onPress={() => {
              setOpenForm(false);
            }}
            className={"mt-5"}
          />
        </View>
      </ReactNativeModal>

      <CustomButton
        title="Book Now"
        onPress={() => router.push("/(root)/confirm-ride")}
        disabled={!isValid}
        bgVariant={isValid ? "primary" : "secondary"}
        className="mt-5"
      />
    </RideLayout>
  );
};

export default FindRide;
