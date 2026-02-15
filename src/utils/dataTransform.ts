import { Activity, Opportunity } from "../types/reindeer";

export interface MonthlyBucket {
  bucketId: string;
  year: number;
  month: number;
  opportunities: Opportunity[];
  totalRevenue: number;
}

export interface YearGroup {
  year: number;
  buckets: MonthlyBucket[];
}

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

export function getBucketId(year: number, month: number): string {
  return `${year}-${String(month + 1).padStart(2, "0")}`;
}

export function extractOpportunitiesFromActivities(
  activities: Activity[],
): Opportunity[] {
  const opportunities: Opportunity[] = [];

  for (const activity of activities) {
    if (
      activity.linkedOpportunities &&
      activity.linkedOpportunities.length > 0
    ) {
      opportunities.push(...activity.linkedOpportunities);
    }
  }

  return opportunities;
}

export function groupOpportunitiesByMonth(activities: Activity[]): YearGroup[] {
  const opportunities = extractOpportunitiesFromActivities(activities);

  const bucketMap = new Map<string, MonthlyBucket>();

  for (const opp of opportunities) {
    const date = parseCloseDate(opp.closeDate);
    if (!date) {
      continue;
    }

    const year = date.getFullYear();
    const month = date.getMonth();
    const bucketId = getBucketId(year, month);

    if (!bucketMap.has(bucketId)) {
      bucketMap.set(bucketId, {
        bucketId,
        year,
        month,
        opportunities: [],
        totalRevenue: 0,
      });
    }

    const bucket = bucketMap.get(bucketId)!;
    bucket.opportunities.push(opp);
    bucket.totalRevenue += opp.revenue;
  }

  for (const bucket of bucketMap.values()) {
    bucket.opportunities.sort((a, b) => b.revenue - a.revenue);
  }

  const yearMap = new Map<number, MonthlyBucket[]>();

  for (const bucket of bucketMap.values()) {
    if (!yearMap.has(bucket.year)) {
      yearMap.set(bucket.year, []);
    }
    yearMap.get(bucket.year)!.push(bucket);
  }

  for (const buckets of yearMap.values()) {
    buckets.sort((a, b) => a.month - b.month);
  }

  const yearGroups: YearGroup[] = [];
  const sortedYears = Array.from(yearMap.keys()).sort((a, b) => a - b);

  for (const year of sortedYears) {
    yearGroups.push({
      year,
      buckets: yearMap.get(year)!,
    });
  }

  return yearGroups;
}

export function getMaxRevenue(yearGroups: YearGroup[]): number {
  let maxRevenue = 0;

  for (const yearGroup of yearGroups) {
    for (const bucket of yearGroup.buckets) {
      for (const opp of bucket.opportunities) {
        if (opp.revenue > maxRevenue) {
          maxRevenue = opp.revenue;
        }
      }
    }
  }

  return maxRevenue;
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
