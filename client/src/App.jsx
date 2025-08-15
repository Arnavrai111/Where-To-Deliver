import Lottie from "lottie-react";
import React, { useEffect, useState } from "react";
import Map from "./components/Map"; // Your React component
import axios from "axios";

import deliveryAnimation from "./assets/delivery.json"; //Adjust the path as necessary
import socket, {
  emitLocationUpdate,
  joinRoom,
  listenForLocationUpdates,
} from "./socket";

import Sidebar from "./components/Sidebar";

const getRoomIdFromUrl = () => {
  const match = window.location.pathname.match(/room\/([^/]+)/);
  return match ? match[1] : null;
};

function App() {
  const [users, setUsers] = useState([]);
  const [roomId, setRoomId] = useState(getRoomIdFromUrl());
  const [roomInput, setRoomInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [copied, setCopied] = useState(false);
  const [loadingRoute, setLoadingRoute] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [route, setRoute] = useState(null);

  const handleCreateRoom = (e) => {
    e.preventDefault();
    if (roomInput.trim()) {
      window.location.pathname = `/room/${encodeURIComponent(
        roomInput.trim()
      )}`;
    }
  };
  useEffect(() => {
    const currentRoomId = getRoomIdFromUrl();
    if (!currentRoomId) return;
    setRoomId(currentRoomId);
    joinRoom(currentRoomId);

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    const handleLocation = (position) => {
      const { latitude, longitude } = position.coords;
      emitLocationUpdate({ lat: latitude, lng: longitude });
    };

    const handleError = (error) => {
      alert(
        `Location Permission Denied. Please allow location access to use this features.`
      );
    };

    navigator.geolocation.getCurrentPosition(handleLocation, handleError, {
      enableHighAccuracy: true,
      maximumAge: 0,
      timeout: 5000,
    });

    listenForLocationUpdates(setUsers);

    return () => {
      socket.off("user-offline");
    };
  }, [window.location.pathname]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!selectedUser) {
        setRoute(null);
        setLoadingRoute(false);
        return;
      }
      const me = users.find((u) => u.userId === socket.id);
      if (!me) return;
      setLoadingRoute(true);
      try {
        const res = await axios.post(
          "http://localhost:4000/api/locations/route",
          {
            start: { lat: me.lat, lng: me.lng },
            end: { lat: selectedUser.lat, lng: selectedUser.lng },
          }
        );
        setRoute(res.data);
        setLoadingRoute(false);
      } catch (error) {
        setLoadingRoute(false);
        console.error("Error fetching route:", error);
      }
      setLoadingRoute(false);
    };
    fetchRoute();
  }, [selectedUser, users]);

  const mySocketId = socket.id;
  const usersWithMe = users.map((user) => ({
    ...user,
    isMe: user.userId === mySocketId,
  }));

  if (!roomId) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-white to-blue-100 text-gray-800">
        {/* Header Section */}
        <header className="w-full bg-white shadow-md p-4 px-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Where-To-Deliver</h1>
        </header>
        {/* hero Section */}
        <main className="flex-grow flex flex-col-reverse lg:flex-row items-center justify-between px-6  py-16 max-w-7xl mx-auto gap-12">
          {/* Text and Form */}
          <div className="w-full lg:w-1/2 space-y-8">
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight">
              Track Deliveries in Real-Time <br />
              Map <span className="text-blue-600">Easy & Fast</span>
            </h2>
            <p className="text-gray-600 text-lg">
              Where-To-Deliver is a real-time delivery tracking application that
              allows users to share their location with others in a specific
              room.
            </p>
            <form
              onSubmit={handleCreateRoom}
              className="flex flex-col sm:flex-row gap-4"
            >
              <input
                type="text"
                value={roomInput}
                onChange={(e) => setRoomInput(e.target.value)}
                placeholder="Enter Room ID"
                className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300"
              >
                Create / Join Room
              </button>
            </form>
          </div>
          {/* Image / Animation Placeholder */}
          <div className="w-full lg:w-1/2">
            <Lottie animationData={deliveryAnimation} loop={true} />
          </div>
        </main>

        {/* YouTube CTA Section */}
        <section
          id="tutorial"
          className="bg-white py-12 px-6 text-center shadow-inner"
        >
          <div className="max-w-3xl mx-auto">
            <h3 className="text-3xl font-bold mb-4">
              Want to Learn How It Works?
            </h3>
            <p className="text-gray-600 mb-6">
              Watch our full YouTube tutorial on building this feature in food
              delivery and logistics apps.
            </p>
            <a
              href="https://www.youtube.com/@slr_tech"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition"
            >
              📺 Watch on YouTube
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full bg-gray-900 text-white py-8 px-6 mt-12">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} Where-To-Deliver. All rights
              reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0 text-sm">
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>
              <a href="#" className="hover:underline">
                Terms
              </a>
              <a href="#" className="hover:underline">
                Support
              </a>
            </div>
          </div>
        </footer>
      </div>
    );
  }
  // If roomId is present, render the map or other components
  // Show the room URL for sharing
  const roomUrl = `${window.location.origin}/room/${encodeURIComponent(
    roomId
  )}`;
  return (
    <div className="relative flex flex-col h-screen overflow-hidden">
      {/* Top Bar */}
      <div className="sticky top-0 z-30 bg-gradient-to-r from-green-600 to-yellow-600 p-2 text-white shadow-lg">
        <div className="flex flex-col md:flex-row items-center justify-between ">
          <div className="flex items-center w-full md:w-auto">
            {windowWidth < 768 && !isSidebarOpen && (
              <button
                className="md:hidden mr-3 bg-white/10 hover:bg-white/20 p-2 rounded-full border border-white/20 transition"
                onClick={() => setIsSidebarOpen(true)}
                aria-label="Open sidebar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}
            <span className="font-semibold tracking-wide text-white ">
              Room:
            </span>
            <span className="ml-2 px-2 py-1 bg-white text-purple-700 rounded-md font-mono text-sm">
              {roomId}
            </span>
          </div>

          <div className="flex flex-col justify-center self-center sm:flex-row items-center gap-2 mt-2 md:mt-0 w-full md:w-auto">
            <div className="flex items-center w-full sm:w-auto max-w-md">
              <input
                type="text"
                value={roomUrl}
                readOnly
                className="flex-1 border-none px-3 py-2 rounded-l-md text-sm text-gray-700 bg-white focus:outline-none"
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(roomUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                }}
                className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-r-md text-sm font-medium transition"
                id="copyBtn"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Main Content */}
      <div className="relative flex flex-1 overflow-hidden">
        {isSidebarOpen && (
          <Sidebar
            users={usersWithMe}
            onSelectedUser={setSelectedUser}
            selectedUserId={selectedUser?.userId}
            isOpen={isSidebarOpen}
            setIsOpen={setIsSidebarOpen}
            windowWidth={windowWidth}
          />
        )}

        <div className="flex-1 relative z-0 bg-gradient-to-br from-blue-50 to-purple-100">
          {loadingRoute && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-70 backdrop-blur-sm">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid"></div>
            </div>
          )}
          <Map
            users={usersWithMe}
            mySocketId={socket.id}
            route={route}
            selectedUser={selectedUser}
            selectedUserId={selectedUser?.userId}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
