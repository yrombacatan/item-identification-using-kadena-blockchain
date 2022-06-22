import { host } from "./config";

async function createNotification({ itemId, receiverAddress }) {
  const res = await fetch(`${host}/api/notification`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      item_id: itemId,
      account_address: receiverAddress,
    }),
  });

  return await res.json();
}

async function getNotification(accountAddress) {
  const res = await fetch(`${host}/api/notification/${accountAddress}`);
  return await res.json();
}

async function updateNotificationById(id) {
  const res = await fetch(`${host}/api/notification`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: id,
    }),
  });

  return await res.json();
}

async function updateNotificationAll() {}

export {
  createNotification,
  getNotification,
  updateNotificationAll,
  updateNotificationById,
};
