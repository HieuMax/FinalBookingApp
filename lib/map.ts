import {
  Coordinate,
  Driver,
  GraphHopperResponse,
  MarkerData,
} from "@/types/type";
import polyline from "@mapbox/polyline";

export const generateMarkersFromData = ({
  data,
  userLatitude,
  userLongitude,
}: {
  data: Driver[];
  userLatitude: number;
  userLongitude: number;
}): MarkerData[] => {
  return data.map((driver) => {
    const latOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005
    const lngOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005

    return {
      latitude: userLatitude + latOffset,
      longitude: userLongitude + lngOffset,
      title: `${driver.first_name} ${driver.last_name}`,
      ...driver,
    };
  });
};

export const calculateRegion = ({
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude?: number | null;
  destinationLongitude?: number | null;
}) => {
  if (!userLatitude || !userLongitude) {
    return {
      latitude: 10.8275396, // DH VL
      longitude: 106.7000258, // DH VL
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  if (!destinationLatitude || !destinationLongitude) {
    return {
      latitude: userLatitude,
      longitude: userLongitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
  }

  const minLat = Math.min(userLatitude, destinationLatitude);
  const maxLat = Math.max(userLatitude, destinationLatitude);
  const minLng = Math.min(userLongitude, destinationLongitude);
  const maxLng = Math.max(userLongitude, destinationLongitude);

  const latitudeDelta = (maxLat - minLat) * 1.3; // Adding some padding
  const longitudeDelta = (maxLng - minLng) * 1.3; // Adding some padding

  const latitude = (userLatitude + destinationLatitude) / 2;
  const longitude = (userLongitude + destinationLongitude) / 2;

  return {
    latitude,
    longitude,
    latitudeDelta,
    longitudeDelta,
  };
};

export const calculateDriverTimes = async ({
  markers,
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  markers: MarkerData[];
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}) => {
  if (
    !userLatitude ||
    !userLongitude ||
    !destinationLatitude ||
    !destinationLongitude
  )
    return;

  const start = `${userLatitude},${userLongitude}`;
  const end = `${destinationLatitude},${destinationLongitude}`;

  const url = `https://graphhopper.com/api/1/route?point=${start}&point=${end}&vehicle=car&locale=en&key=${process.env.EXPO_PUBLIC_GRAPH_HOOKER_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = (await response.json()) as GraphHopperResponse;
    if (!data.paths || data.paths.length === 0) {
      return null;
    }
    const path = data.paths[0];
    const distance = path.distance / 1000;
    const time = Math.round(parseFloat(path.time / 1000 / 60 + ""));

    // If dev with GOOGLE API
    const timesPromises = markers.map(async (marker) => {

      return { ...marker, time: time, distance };
    });

    return await Promise.all(timesPromises);
  } catch (error) {
    console.error("Error fetching route:", error);
  }
};

export const calculatePickUpTimes = async ({
  marker,
  userLatitude,
  userLongitude,
}: {
  marker: MarkerData;
  userLatitude: number | null;
  userLongitude: number | null;
}) => {
  if (!userLatitude || !userLongitude) return;

  const start = `${marker.latitude},${marker.longitude}`;
  const end = `${userLatitude},${userLongitude}`;
  // console.log(start);
  // console.log(end);
  const url = `https://graphhopper.com/api/1/route?point=${start}&point=${end}&vehicle=car&locale=en&key=${process.env.EXPO_PUBLIC_GRAPH_HOOKER_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = (await response.json()) as GraphHopperResponse;
    if (!data.paths || data.paths.length === 0) {
      return null;
    }
    const path = data.paths[0];
    const distance = path.distance / 1000;
    const time = Math.round(parseFloat(path.time / 1000 / 60 + ""));
    // console.log("called");
    return { ...marker, time: time, distance };
  } catch (error) {
    console.error("Error fetching route:", error);
  }
};

export const calculateCost = async ({
  startLat,
  startLog,
  endLat,
  endLog,
}: {
  startLat: number | null;
  startLog: number | null;
  endLat: number | null;
  endLog: number | null;
}) => {
  console.log(`startLat: ${startLat}, startLog: ${startLog}, endLat: ${endLat}, endLog: ${endLog}`);
  if (!startLat || !startLog || !endLat || !endLog) return;
  const start = `${startLat},${startLog}`;

  const end = `${endLat},${endLog}`;

  
  const NhaTrang = { lat: 12.2388, lng: 109.1967, name: "Nha Trang" };
  const DaNang = { lat: 15.8801, lng: 108.3380, name: "Da Nang" };
  const TamDiep = { lat: 20.236438, lng: 105.803874, name: "Tam Diep" };
  const Hanoi = { lat: 21.0278, lng: 105.8342, name: "Hanoi" };
  const HoChiMinh = { lat: 10.8231, lng: 106.6297, name: "Ho Chi Minh City" };
  const DakNong = { lat: 12.004476, lng: 107.674539, name: "Dak Nong" };
  const BuonMe = { lat: 12.628157, lng: 108.125542, name: "Buon Me" };
  const Pleiku = { lat: 13.968291, lng: 108.016791, name: "Pleiku" };
  
  const waypoints = [];
  let url = "";
  // Nam ra Bac
  if (endLat > startLat) { 

      if (endLat >= NhaTrang.lat) {
          if (endLat <= DaNang.lat) {
              const DesToPleiku = Math.abs(endLog - Pleiku.lng);
              const DesToNhaTrang = Math.abs(endLog - NhaTrang.lng);
              if (DesToPleiku < DesToNhaTrang) {
                  waypoints.push(`${DakNong.lat},${DakNong.lng}`);
                  waypoints.push(`${BuonMe.lat},${BuonMe.lng}`);
              } else {
                  waypoints.push(`${NhaTrang.lat},${NhaTrang.lng}`);
              }
          } 
          
          else if (startLat <= NhaTrang.lat) {
              waypoints.push(`${NhaTrang.lat},${NhaTrang.lng}`);
          }
      }

      if (endLat >= TamDiep.lat) {
          waypoints.push(`${TamDiep.lat},${TamDiep.lng}`);
      } 

      const waypointString = waypoints.join('&point=');
      console.log(waypointString);

      url = `https://graphhopper.com/api/1/route?point=${start}${waypointString.length > 0 ? `&point=${waypointString}` : ""}&point=${end}&vehicle=car&locale=en&key=${process.env.EXPO_PUBLIC_GRAPH_HOOKER_API_KEY}&weighting=fastest`;
  } 
  // Bac vao Nam
  else {
      if (endLat <= TamDiep.lat && startLat >= TamDiep.lat) {
          waypoints.push(`${TamDiep.lat},${TamDiep.lng}`);
      } 

      if (endLat <= DaNang.lat && startLat >= DaNang.lat) {
          waypoints.push(`${DaNang.lat},${DaNang.lng}`);
      } 

      if (endLat <= BuonMe.lat && startLat >= BuonMe.lat) {
          const DesToPleiku = Math.abs(endLog - Pleiku.lng);
          const DesToNhaTrang = Math.abs(endLog - NhaTrang.lng);
          if (DesToPleiku < DesToNhaTrang) {
              waypoints.push(`${BuonMe.lat},${BuonMe.lng}`);
              if (endLat <= DakNong.lat) {
                  waypoints.push(`${DakNong.lat},${DakNong.lng}`);
              }
          } else {
              waypoints.push(`${NhaTrang.lat},${NhaTrang.lng}`);
          }
      }

      const waypointString = waypoints.join('&point=');
      console.log(waypointString);
      url = `https://graphhopper.com/api/1/route?point=${start}${waypointString.length > 0 ? `&point=${waypointString}` : ""}&point=${end}&vehicle=car&locale=en&key=${process.env.EXPO_PUBLIC_GRAPH_HOOKER_API_KEY}&weighting=fastest`;
      // url = `https://graphhopper.com/api/1/route?point=${start}&point=${end}&vehicle=car&locale=en&key=${process.env.EXPO_PUBLIC_GRAPH_HOOKER_API_KEY}&weighting=fastest`;
  }

  // const url = `https://graphhopper.com/api/1/route?point=${start}&point=${end}&vehicle=car&locale=en&key=${process.env.EXPO_PUBLIC_GRAPH_HOOKER_API_KEY}`;
  try {
    const response = await fetch(url);
    const data = (await response.json()) as GraphHopperResponse;
    if (!data.paths || data.paths.length === 0) {
      return null;
    }
    console.log(`data: ${JSON.stringify(data)}`);
    const path = data.paths[0];
    const distance = path.distance / 1000;
    const time = path.time / 1000 / 60;
    const decodedPoints = polyline.decode(path.points, 5);
    // console.log(`decodedPoints: ${JSON.stringify(decodedPoints)}`);
    const coordinates: Coordinate[] = decodedPoints.map(([lat, lng]) => ({
      latitude: lat,
      longitude: lng,
    }));
    return {
      distance: distance,
      time: time,
      coordinates: coordinates,
    };
  } catch (error) {
    console.error(error);
    return;
  }
};

export const calculateDriverTimes__ = async ({
  markers,
  userLatitude,
  userLongitude,
  destinationLatitude,
  destinationLongitude,
}: {
  markers: MarkerData[];
  userLatitude: number | null;
  userLongitude: number | null;
  destinationLatitude: number | null;
  destinationLongitude: number | null;
}) => {
  if (
    !userLatitude ||
    !userLongitude ||
    !destinationLatitude ||
    !destinationLongitude
  )
    return;

  try {
    const timesPromises = markers.map(async (marker) => {

      const driver = `${marker.latitude},${marker.longitude}`;
      const user = `${userLatitude},${userLongitude}`;
      const destination = `${destinationLatitude},${destinationLongitude}`;
      // console.log("Driver:map.ts: ", driver);
      const url_DriverUser = `https://graphhopper.com/api/1/route?point=${driver}&point=${user}&vehicle=car&locale=en&key=${process.env.EXPO_PUBLIC_GRAPH_HOOKER_API_KEY}`;
      const url_UserDestination = `https://graphhopper.com/api/1/route?point=${user}&point=${destination}&vehicle=car&locale=en&key=${process.env.EXPO_PUBLIC_GRAPH_HOOKER_API_KEY}`;
      
      const responseToUser = await fetch(url_DriverUser);
      const dataToUser = (await responseToUser.json()) as GraphHopperResponse;
      if (!dataToUser.paths || dataToUser.paths.length === 0) {
        return null;
      }
      const pathToUser = dataToUser.paths[0];
      const distanceToUser = pathToUser.distance / 1000;
      const timeToUser = Math.round(parseFloat(pathToUser.time / 1000 / 60 + ""));

      const responseToDes = await fetch(url_UserDestination);
      const dataToDes = (await responseToDes.json()) as GraphHopperResponse;
      if (!dataToDes.paths || dataToDes.paths.length === 0) {
        return null;
      }
      const pathToDes = dataToDes.paths[0];
      const distanceToDes = pathToDes.distance / 1000;
      const timeToDes = Math.round(parseFloat(pathToDes.time / 1000 / 60 + ""));


      const totalTime = (timeToUser + timeToDes); // Total time in minutes
      const price = (totalTime * 0.5).toFixed(2); // Calculate price based on time
      // console.log("Price: ", price);
      // console.log("Time to user: ", timeToUser);
      // console.log("Time to destination: ", timeToDes);
      return { ...marker, time: { timeToUser, timeToDes }, distance: { distanceToUser, distanceToDes }, price };

    });


    return await Promise.all(timesPromises);
  } catch (error) {
    console.error("Error calculating driver times:", error);
  }
};