import { format } from "date-fns";
import { useState, useEffect } from "react";

interface CustomDatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
}

export function CustomDatePicker({ selectedDate, onDateChange }: CustomDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayDate, setDisplayDate] = useState(format(selectedDate, "yyyy-MM-dd"));

  useEffect(() => {
    setDisplayDate(format(selectedDate, "yyyy-MM-dd"));
  }, [selectedDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = new Date(e.target.value);
    if (!isNaN(newDate.getTime())) {
      setDisplayDate(e.target.value);
      onDateChange(newDate);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <input
          type="date"
          value={displayDate}
          onChange={handleInputChange}
          className="px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}