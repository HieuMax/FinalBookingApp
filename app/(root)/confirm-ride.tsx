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
  const carType = [
    {
      id: 1,
      name: "Standard",
      icon: "car",
      seat: 4,
      price: drivers[0].price
    },
    {
      id: 2,
      name: "Luxury",
      icon: "car",
      seat: 4,
      price: drivers[1].price * 1.3
    },
    {
      id: 3,
      name: "Standard",
      icon: "car",
      seat: 7,
      price: drivers[2].price
    },
    {
      id: 4,
      name: "Luxury",
      icon: "car",
      seat: 7,
      price: drivers[3].price * 1.5,
    },
  ]


  return (
    <RideLayout title="Choose a Driver" snapPoints={["10%", "65%", "85%"]}>
      {/* {
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
      } */}

      {/* {
        carType.map((item) => (
          <View key={item.id} className="flex-row items-center justify-between px-5 py-3">
            <Text className="text-lg font-JakartaSemiBold">{item.name}</Text>
            <Text className="text-lg font-JakartaSemiBold">{item.seat} Seats</Text>
          </View>
          <FlatList
          data={item}
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
        ))
      } */}
      {
        carType && 
        <FlatList
        data={carType}
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
      }
      
      
    </RideLayout>
  );
};

export default ConfirmRide;
