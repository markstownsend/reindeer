export function parseCloseDate(closeDate: string): Date | null {
  if (!closeDate || typeof closeDate !== "string") {
    return null;
  }

  const date = new Date(closeDate);
  if (isNaN(date.getTime())) {
    return null;
  }

  return date;
}

export function getMonthName(month: number): string {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  return monthNames[month] || "";
}

export function getMonthYearLabel(year: number, month: number): string {
  const shortMonth = getMonthName(month);
  const shortYear = year.toString().slice(-2);
  return `${shortMonth} '${shortYear}`;
}
