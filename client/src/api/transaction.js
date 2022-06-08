async function createTransaction({
  result,
  reqKey,
  metaData,
  gas,
  accountAddress,
  eventType,
  to,
}) {
  const body = {
    item_id: result.data.split(" ").at(1),
    request_key: reqKey,
    gas: gas,
    meta_data: metaData,
    from: accountAddress,
    to: to,
    event: eventType,
  };

  const res = await fetch("http://localhost:3001/api/transaction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  return await res.json();
}

export { createTransaction };
