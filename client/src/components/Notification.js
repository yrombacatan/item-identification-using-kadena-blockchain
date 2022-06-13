import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNotification, updateNotificationById } from "../api/notification";
import { ToastifyContainer, toastError } from "../components/Toastify";
import { v4 as uuidv4 } from "uuid";

const Notification = ({ setIsOpen, children, setHasNotification }) => {
  const [notifications, setNotification] = useState(null);
  const navigate = useNavigate();
  const toastId = uuidv4();

  const handleClick = async (notification, index) => {
    setIsOpen(false);

    if (notification.seen) {
      return navigate(`/items/${notification.item_id}`);
    }

    try {
      await updateNotificationById(notification._id);

      const newNotifications = notifications
        .map((notif, _i) => {
          if (_i == index) {
            notif.seen = true;
            return notif;
          }
          return notif;
        })
        .sort((a, b) => a.seen - b.seen);

      if (newNotifications[0].seen == true) {
        setHasNotification(false);
      }

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

        if (notifications.length > 0) {
          const notificationList = notifications.sort(
            (a, b) => a.seen - b.seen
          );

          if (notificationList[0].seen == false) {
            setHasNotification(true);
          }
          setNotification(notificationList);
        }
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
        <div
          className={`${
            notifications ? "h-96" : ""
          } overflow-auto scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-gray-100 mt-14`}
        >
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

          {!notifications && (
            <p className="pl-2 text-gray-500">No notification</p>
          )}
        </div>
        {children}
      </div>

      <ToastifyContainer key={toastId} />
    </>
  );
};

export default Notification;
