const formatDate = (date: string | Date, format?: "time" | "date"): string => {
  const newDate = new Date(date);
  if (format === "date") {
    // Default to "date" if the format is not provided
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Intl.DateTimeFormat("en-US", options).format(newDate);
  } else {
    // Check if the format is "time"
    return newDate.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  
};

export default formatDate;
