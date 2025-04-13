import { create } from "zustand";

import {
  DriverStore,
  LocationStore,
  MarkerData,
  Coordinate,
  MarkerStore,
  AuthStore,
} from "@/types/type";

export const useAuthStore = create<AuthStore>((set) => ({
  role: null,
  setRole: (role) => set(() => ({ role })),
  setRoleOut: () => set(() => ({ role: null })),
}));

export const useLocationStore = create<LocationStore>((set) => ({
  userAddress: null,
  userLongitude: null,
  userLatitude: null,
  destinationLongitude: null,
  destinationLatitude: null,
  destinationAddress: null,
  routeMap: null,
  setUserLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => { 
    set(() => ({
      userLatitude: latitude,
      userLongitude: longitude,
      userAddress: address,
    }));

    // if driver is selected and now new location is set, clear the selected driver
    const { selectedDriver, clearSelectedDriver } = useDriverStore.getState();
    if (selectedDriver) clearSelectedDriver();
  },
  setDestinationLocation: ({
    latitude,
    longitude,
    address,
  }: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    set(() => ({
      destinationLatitude: latitude,
      destinationLongitude: longitude,
      destinationAddress: address,
    }));
  },
  setRoutes: (routes: Coordinate[]) => {
    set(() => ({
      routeMap: routes,
    }));
  },
  clearAllUserStore: () => {(
    set(() => ({
      userLatitude: null,
      userLongitude: null,
      userAddress: null,
      destinationLatitude: null,
      destinationLongitude: null,
      destinationAddress: null,
      routeMap: null,
    }))
  )},
}));

export const useDriverStore = create<DriverStore>((set) => ({
  drivers: [] as MarkerData[],
  selectedDriver: null,
  bookedDriver: null,
  setSelectedDriver: (driveId: number) =>
    set(() => ({ selectedDriver: driveId })),
  setDrivers: (drivers: MarkerData[]) => set(() => ({ drivers: drivers })),
  clearSelectedDriver: () => set(() => ({ selectedDriver: null })),
  setDriverId: (updatedDriver: MarkerData) =>
    set((state) => ({
      drivers: state.drivers.map((driver) =>
        driver.id === updatedDriver.id ? updatedDriver : driver,
      ),
    })),
  setBookedDriver: (driver: MarkerData) =>
    set(() => ({ bookedDriver: driver })),
  clearAllDriverStore: () =>
    set(() => ({
      drivers: [] as MarkerData[],
      selectedDriver: null,
    })),
  // setDriverPickup: (driversPickUp: MarkerData[]) => 
  //   set(() => ({
  //     drivers: driversPickUp, 
  //   }))
}));

// export const useRideStore = create<DriverStore>((set) => ({
//   rides: [] as MarkerData[],
//   setRides: (rides: MarkerData[]) => set(() => ({ rides: rides })),
// }));

export const useMarkerStore = create<MarkerStore>((set) => ({
  markers: [] as MarkerData[],
  setMarkers: (markers: MarkerData[]) => set(() => ({ markers })),
  clearMarkers: () => set(() => ({ markers: [] })),
}));
