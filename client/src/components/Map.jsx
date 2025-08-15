import React, { useEffect, useState } from "react";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

function Map({ users, mySocketId, route, selectedUser, selectedUserId }) {
  const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation([
            position.coords.latitude,
            position.coords.longitude,
          ]);
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);
  console.log(currentLocation);

  function FitBounds({ me, selectedUser }) {
    const map = useMap();
    useEffect(() => {
      if (
        me &&
        selectedUser &&
        me.lat &&
        me.lng &&
        selectedUser.lat &&
        selectedUser.lng
      ) {
        const bounds = [
          [me.lat, me.lng],
          [selectedUser.lat, selectedUser.lng],
        ];
        map.fitBounds(bounds, { padding: [80, 80] });
      } else if (me && me.lat && me.lng) {
        map.setView([me.lat, me.lng], 17);
      }
    }, [me, selectedUser, map]);
    return null;
  }

  const me = users.find((user) => user.userId === mySocketId);
  let polylineCoords = [];
  if (route && route.features && route.features[0]) {
    polylineCoords = route.features[0].geometry.coordinates.map(
      ([lan, lat]) => [lat, lan] //Convert to [lat, lan] format
    );
  }

  return (
    <MapContainer
      center={currentLocation || [28.6621696, 77.2767744]}
      zoom={17}
      scrollWheelZoom={false}
      style={{ height: "100vh", width: "100%" }}
    >
      <FitBounds me={me} selectedUser={selectedUser} />

      <TileLayer
        attribution="Map data"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Your marker */}
      {me && me.lat && me.lng && (
        <Marker
          position={[me.lat, me.lng]}
          // icon={new L.Icon({ iconUrl: "/mypin.png", iconSize: [50, 70] })}
        >
          <Popup>
            <span className="font-bold text-green-700">
              You: {mySocketId.slice(0, 15)}...
            </span>
          </Popup>
        </Marker>
      )}
      {/* Other users */}
      {users
        .filter((user) => user.userId !== mySocketId)
        .map(
          (user) =>
            user.lat &&
            user.lng && (
              <Marker key={user.userId} position={[user.lat, user.lng]}>
                <Popup>
                  <span
                    className={
                      selectedUserId === user.userId
                        ? "font-bold text-green-600"
                        : ""
                    }
                  >
                    User: {user.userId.slice(0, 15)}...
                  </span>
                  <br />
                  {user.distance && (
                    <span className="text-xs text-gray-600">
                      Distance: {user.distance} | ETA: {user.eta}
                    </span>
                  )}
                </Popup>
              </Marker>
            )
        )}
      {polylineCoords.length > 0 && (
        <Polyline
          positions={polylineCoords}
          color="#F9A825"
          weight={6}
          opacity={0.8}
        />
      )};
    </MapContainer>
  );
}

export default Map;
