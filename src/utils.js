const getDate = () => {
  const date = new Date();
  const month = date.getMonth();
  const day = date.getDate();
  const year = date.getFullYear();
  const hrs = date.getHours();
  const mins = date.getMinutes();

  return `${day}/${month + 1}/${year}  ${hrs}:${mins}`;
};

const removePrefixK = (string) => {
  return string.at(0) === "k" ? string.slice(2) : string;
};

export { getDate, removePrefixK };
