import React from "react";
import Flatpickr from "react-flatpickr";

import "flatpickr/dist/themes/dark.css";

const DatePicker = ({ value, onChange }) => {
  return (
    <Flatpickr
      value={value}
      onChange={([date]) => {
        if (date) {
          onChange(date.toISOString().split("T")[0]);
        }
      }}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm dark:bg-gray-700 dark:text-white"
    />
  );
};

export default DatePicker;
