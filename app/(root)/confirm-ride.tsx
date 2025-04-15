import RideLayout from "@/components/RideLayout";
import { View, FlatList, Text } from "react-native";
import DriverCard from "@/components/DriverCard";
import CustomButton from "@/components/CustomButton";
import { router } from "expo-router";
import { useDriverStore, useLocationStore, useMarkerStore } from "@/store";
import { useEffect } from "react";
import { calculateDriverTimes__ } from "@/lib/map";
import { MarkerData } from "@/types/type";

const ConfirmRide = () => {
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();
  // useEffect(() => {
    // console.log(`Confirm-ride:Driver::`)
    // console.log(drivers)
  // }, [])



  return (
    <RideLayout title="Choose a Driver" snapPoints={["10%", "65%", "85%"]}>
      {
        drivers.length < 1 ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-lg font-JakartaSemiBold mb-3">
              No Drivers Available
            </Text>
          </View>
        ) :
        (
          drivers[0] != null && <FlatList
            data={drivers}
            renderItem={({ item }) => (
              item && 
              <DriverCard
                selected={selectedDriver!}
                setSelected={() => setSelectedDriver(Number(item.id)!)}
                item={item}
              />
            )}
            keyExtractor={(item) => item.id.toString()}
            ListFooterComponent={() => (
              <View className="mx-5 mt-10">
                <CustomButton
                  title="Select Ride"
                  onPress={() => router.push("/(root)/book-ride")}
                />
              </View>
            )}
          />
        )
      }
      
    </RideLayout>
  );
};

export default ConfirmRide;
