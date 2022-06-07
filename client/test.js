async function checkRequest() {
  const res = await fetch(
    "https://explorer.chainweb.com/testnet/tx/mAFvLeBFipWOfTqnjy3HkX26-FAXDmZonsDVY9EuHpE"
  );
  const data = await res.json();
  console.log(data);
}

checkRequest();
