import React from "react";
import FeatherIcon from "feather-icons-react";

const ErrorContainer = ({ errors, setError }) => {
  return (
    <div className="relative border border-red-400 rounded shadow p-5 text-left my-5 ">
      <ul className="text-red-500 list-disc pl-5">
        {errors.map((error, _i) => (
          <li key={_i}>{error}</li>
        ))}
      </ul>

      <FeatherIcon
        icon="x-circle"
        className="text-red-500 cursor-pointer absolute top-2 right-2 hover:text-red-400"
        onClick={() => setError(false)}
      />
    </div>
  );
};

export default ErrorContainer;
