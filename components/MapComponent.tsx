import React from "react";
import { StyleSheet, View } from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import "../global.css";
import { useDriverStore, useLocationStore, useMarkerStore } from "@/store";
import {
  calculateRegion,
} from "@/lib/map";

import { icons } from "@/constants";

interface Coordinate {
  latitude: number;
  longitude: number;
}

const MapComponent: React.FC = () => {
  const {
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
    routeMap,
  } = useLocationStore();

  const { markers } = useMarkerStore();
  const { selectedDriver } = useDriverStore();
 
  const region = calculateRegion({
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationLongitude,
  });

  const startPoint: Coordinate | null = {
    latitude: userLatitude!,
    longitude: userLongitude!,
  };
  const endPoint: Coordinate | null = {
    latitude: destinationLatitude!,
    longitude: destinationLongitude!,
  };

  return (
    <View style={styles.container}>
      {/* Bản đồ */}
      <MapView
        provider={PROVIDER_DEFAULT}
        className="w-full h-full rounded-2xl"
        tintColor="black"
        showsPointsOfInterest={false}
        style={styles.map}
        //key={0} // Thay đổi key để ép render
        key={routeMap ? routeMap.length : 0} // Thay đổi key để ép render
        region={region}
        initialRegion={region}
        userInterfaceStyle="light"
      >
        {markers &&
          markers.map((marker) => (
            <Marker
              key={marker.id}
              coordinate={{
                latitude: marker.latitude,
                longitude: marker.longitude,
              }}
              title={marker.title}
              image={
                selectedDriver === marker.id
                  ? icons.selectedMarker
                  : icons.marker
              }
            />
          ))}
        {userLatitude && userLongitude && (
          <Marker coordinate={startPoint} title="Điểm bắt đầu" pinColor="red" />
        )}
        {destinationLatitude && destinationLongitude && (
          <Marker coordinate={endPoint} title="Điểm kết thúc" pinColor="green" />
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
  },
});

export default MapComponent;
