import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNotification, updateNotificationById } from "../api/notification";
import { ToastifyContainer, toastError } from "../components/Toastify";

const Notification = ({ setIsOpen, children }) => {
  const [notifications, setNotification] = useState(null);
  const navigate = useNavigate();

  const handleClick = async (notification, index) => {
    setIsOpen(false);

    if (notification.seen) {
      return navigate(`/items/${notification.item_id}`);
    }

    try {
      const res = await updateNotificationById(notification._id);

      const newNotifications = notifications.map((notif, _i) => {
        if (_i == index) {
          notif.seen = true;
          return notif;
        }
        return notif;
      });

      setNotification(newNotifications);

      navigate(`/items/${notification.item_id}`);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    async function listen() {
      try {
        const notifications = await getNotification(
          localStorage.getItem("accountAddress")
        );

        const notificationList = notifications.sort((a, b) => a.seen - b.seen);

        console.log("<--- notification ---");
        console.log(notificationList);
        console.log("<--- notification end --->");
        setNotification(notificationList);
      } catch (error) {
        toastError(error.message);
      }
    }

    listen();
  }, []);

  return (
    <>
      <div>
        <p className="w-full absolute mb-2 top-0 left-0 py-5 pl-7 border-b border-b-blue-500">
          Notifications
        </p>
        <div className="h-96 overflow-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100 mt-14">
          {notifications && (
            <ul className="flex flex-col gap-2">
              {notifications.map((notification, _i) => {
                const style = notification.seen
                  ? "font-normal text-gray-500"
                  : "font-semibold text-gray-600";

                return (
                  <li
                    key={_i}
                    className={`relative flex gap-5 items-center p-2 rounded shadow cursor-pointer transition-all hover:bg-gray-100 ${style}`}
                    onClick={() => handleClick(notification, _i)}
                  >
                    <div className="flex-auto">
                      New Item {notification.item_id}
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        notification.seen ? "bg-gray-300" : "bg-blue-400"
                      }`}
                    ></div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        {children}
      </div>

      <ToastifyContainer />
    </>
  );
};

export default Notification;
