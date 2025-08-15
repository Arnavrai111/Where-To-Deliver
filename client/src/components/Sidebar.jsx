import React from "react";

function Sidebar({
  users,
  onSelectedUser,
  selectedUserId,
  isOpen,
  setIsOpen,
  windowWidth,
}) {
  console.log('Sidebar users:',users);
  
  const handleUserSelect = (user) => {
    if (!user.isMe) {
      onSelectedUser(user);
      if (windowWidth < 768) setIsOpen(false);
    }
  };

  // Close button
  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div
      className={`
                    fixed top-0 left-0 z-40 h-full w-4/5 max-w-xs md:static md:z-10 md:w-80
                    transition-transform duration-300 ease-in-out
                    ${isOpen ? "translate-x-0" : "-translate-x-full"}
                    bg-white shadow-2xl md:shadow-md border-r border-blue-200
                    p-5 rounded-r-2xl md:rounded-none flex flex-col
                `}
      style={{ height: "100vh" }}
    >
      {/* Header with close button on mobile */}
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-bold text-blue-700">Users</h2>
        {windowWidth < 768 && (
          <button
            className="md:hidden bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow"
            onClick={handleClose}
            aria-label="Close sidebar"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
      {/* User list */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {users.map((user) => (
          <div
            key={user.userId}
            onClick={() => handleUserSelect(user)}
            className={`
                                ${user.isMe && "hidden"}
                                ${
                                  selectedUserId === user.userId
                                    ? "bg-white-100 ring-2 rounded-2xl ring-green-800 scale-[1.02]"
                                    : "hover:bg-blue-50"
                                }
                                rounded-xl transition-all duration-200 shadow-sm hover:shadow-md
                            `}
          >
            <div className="p-3 bg-green-500 rounded-2xl">
              <h2 className="text-md font-semibold mb-1 truncate">
                User: {user.userId.slice(0, 15)}...
              </h2>
              <div>
                {user.distance && (
                  <div className="text-xs text-gray-600">
                    {user.distance} • {user.eta}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
       {/* Overlay for mobile */}
            {isOpen && windowWidth < 768 && (
                <div
                    className="absolute bottom-0 left-0 w-full bg-white p-3 border-t border-blue-200 rounded-b-2xl"
                    onClick={handleClose}
                />
            )}
    </div>
  );
}

export default Sidebar;
