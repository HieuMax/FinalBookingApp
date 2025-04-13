import React, { useEffect, useState } from "react";
import { StyleSheet, View, Text, ActivityIndicator } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import "../global.css";
import { useDriverStore, useLocationStore } from "@/store";
import {
  calculateRegion,
} from "@/lib/map";

import { Driver } from "@/types/type";
import { useFetch } from "@/lib/fetch";
import { icons } from "@/constants";
import { baseURL, baseURL_2 } from '../app/index';

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface MapComponentProps {
  desLatInit?: number | null;
  desLogInit?: number | null;
  routes?: Coordinate[] | null;
}

const MapComponentGoing: React.FC<MapComponentProps> = ({ desLatInit, desLogInit }) => {
  const { role } = useDriverStore();

  const {
    data: drivers,
    loading,
    error,
  // } = useFetch<Driver[]>("http://localhost:8081/(api)/driver");
  } = useFetch<Driver[]>(`${role === "driver" ? baseURL_2 :baseURL}/(api)/driver`);


  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
    setUserLocation,
    routeMap,
    setRoutes
  } = useLocationStore();

  const {
    bookedDriver
  } = useDriverStore();
  
  const region = calculateRegion({
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  });


  const [startPoint, setStartPoint] = useState<Coordinate | null>(null);
  const [endPoint, setEndPoint] = useState<Coordinate | null>(null);
  const [locationIdx, setLocationIdx] = useState<number>(0);

  useEffect(() => {
    if (!userLatitude || !userLongitude) return;
    const startPoint: Coordinate = {
      latitude: userLatitude,
      longitude: userLongitude,
    };
    setStartPoint(startPoint);
  }, [userLatitude, userLongitude]);

  useEffect(() => {
    if (!desLatInit || !desLogInit) return;
    const endPoint: Coordinate = {
      latitude: parseFloat(desLatInit.toString()),
      longitude: parseFloat(desLogInit.toString()),
    };
    setEndPoint(endPoint);
  }, [desLatInit, desLogInit]);

  // useEffect(() => {
  //   if (!bookedDriver) return;
  //   if (bookedDriver) {
  //     if (!userLatitude || !userLongitude) return;

  //     const newMarkers = generateMarkersFromData({
  //       data: drivers,
  //       userLatitude,
  //       userLongitude,
  //     });
  //     setMarkers(newMarkers);
  //   }
  // }, [bookedDriver])

    useEffect(() => {
    if (!routeMap) return;
    let isMounted = true;
    const simulator = setInterval( () => {
      setLocationIdx((prevIdx) => {
        if (prevIdx + 1 >= routeMap.length) {
          clearInterval(simulator);
          return prevIdx;
        }
  
        const nextIdx = prevIdx + 1;
        const nextPoint = routeMap[nextIdx];
        setStartPoint(nextPoint);
  
        return nextIdx;
      });
    }, 1000);
  
    return () => {
      isMounted = false;
      clearInterval(simulator);
    };
  }, []);

  if (loading || !userLatitude || !userLongitude) {
    return (
      <View className="flex justify-between items-center w-full">
        <ActivityIndicator size="small" color="#000" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex justify-between items-center w-full">
        <Text>Error: {error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Bản đồ */}
      <MapView
        provider={PROVIDER_DEFAULT}
        className="w-full h-full rounded-2xl"
        tintColor="black"
        showsPointsOfInterest={false}
        style={styles.map}
        key={0} // Thay đổi key để ép render
        // key={routeMap ? routeMap.length : 0} // Thay đổi key để ép render

        initialRegion={region}
        userInterfaceStyle="light"
      >
        {bookedDriver && <Marker
          key={bookedDriver?.id}
          coordinate={{
            latitude: bookedDriver.latitude,
            longitude: bookedDriver.longitude,
          }}
          title={bookedDriver.title}
          image={ icons.selectedMarker }
        />}
        {startPoint && (
          <Marker coordinate={startPoint} title="Điểm bắt đầu" pinColor="red" key={startPoint.latitude}/>
        )}
        {endPoint && (
          <Marker
            coordinate={endPoint}
            title="Điểm kết thúc"
            pinColor="green"
          />
        )}
        {routeMap && (
          <Polyline
            coordinates={routeMap}
            strokeColor="#FF0000"
            strokeWidth={3}
            zIndex={2}
          />
        )}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  autocompleteContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    zIndex: 1000, // Tăng zIndex để nằm trên bản đồ
  }
});

export default MapComponentGoing;
