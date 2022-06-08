async function createNotification({ itemId, receiverAddress }) {
  const res = await fetch("http://localhost:3001/api/notification", {
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
  const res = await fetch(
    `http://localhost:3001/api/notification/${accountAddress}`
  );
  return await res.json();
}

async function updateNotificationById(id) {
  const res = await fetch("http://localhost:3001/api/notification/", {
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
