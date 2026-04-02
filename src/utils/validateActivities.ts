import type { Activity } from "../types/reindeer";

const VALID_ACTIVITY_TYPES = new Set([
  "meeting",
  "call",
  "email",
  "demo",
  "workshop",
]);

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const COUNTRY_CODE_RE = /^[A-Z]{2}$/;

export interface ValidationResult {
  valid: boolean;
  data: Activity[];
  errors: string[];
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function validatePerson(
  person: unknown,
  role: string,
  activityId: string,
  index: number,
): string[] {
  const errors: string[] = [];
  const prefix = `activity "${activityId}" ${role}[${index}]`;

  if (!isObject(person)) {
    errors.push(`${prefix}: must be an object`);
    return errors;
  }
  if (typeof person.name !== "string" || person.name.trim() === "") {
    errors.push(`${prefix}: "name" must be a non-empty string`);
  }
  if (typeof person.role !== "string" || person.role.trim() === "") {
    errors.push(`${prefix}: "role" must be a non-empty string`);
  }
  if (
    person.country !== undefined &&
    (typeof person.country !== "string" || !COUNTRY_CODE_RE.test(person.country))
  ) {
    errors.push(
      `${prefix}: "country" must be an ISO 3166-1 alpha-2 code (e.g. "US")`,
    );
  }
  return errors;
}

function validateOpportunity(
  opp: unknown,
  activityId: string,
  index: number,
): string[] {
  const errors: string[] = [];
  const prefix = `activity "${activityId}" linkedOpportunities[${index}]`;

  if (!isObject(opp)) {
    errors.push(`${prefix}: must be an object`);
    return errors;
  }
  if (typeof opp.id !== "string" || opp.id.trim() === "") {
    errors.push(`${prefix}: "id" must be a non-empty string`);
  }
  if (opp.name !== undefined && typeof opp.name !== "string") {
    errors.push(`${prefix}: "name" must be a string when provided`);
  }
  if (typeof opp.closeDate !== "string" || !ISO_DATE_RE.test(opp.closeDate)) {
    errors.push(`${prefix}: "closeDate" must be a YYYY-MM-DD string`);
  }
  if (typeof opp.stage !== "string" || opp.stage.trim() === "") {
    errors.push(`${prefix}: "stage" must be a non-empty string`);
  }
  if (typeof opp.revenue !== "number" || opp.revenue < 0) {
    errors.push(`${prefix}: "revenue" must be a non-negative number`);
  }
  if (
    typeof opp.stageAdjustedRevenue !== "number" ||
    opp.stageAdjustedRevenue < 0
  ) {
    errors.push(
      `${prefix}: "stageAdjustedRevenue" must be a non-negative number`,
    );
  }
  return errors;
}

function validateActivity(activity: unknown, index: number): string[] {
  const errors: string[] = [];

  if (!isObject(activity)) {
    errors.push(`activities[${index}]: must be an object`);
    return errors;
  }

  const id =
    typeof activity.id === "string" && activity.id.trim() !== ""
      ? activity.id
      : `(index ${index})`;

  if (typeof activity.id !== "string" || activity.id.trim() === "") {
    errors.push(`activity ${id}: "id" must be a non-empty string`);
  }

  if (
    typeof activity.timestamp !== "string" ||
    isNaN(Date.parse(activity.timestamp))
  ) {
    errors.push(`activity "${id}": "timestamp" must be a valid ISO 8601 string`);
  }

  if (
    activity.type !== undefined &&
    (typeof activity.type !== "string" || !VALID_ACTIVITY_TYPES.has(activity.type))
  ) {
    errors.push(
      `activity "${id}": "type" must be one of: ${[...VALID_ACTIVITY_TYPES].join(", ")}`,
    );
  }

  if (typeof activity.description !== "string") {
    errors.push(`activity "${id}": "description" must be a string`);
  }

  // sellers — required, non-empty
  if (!Array.isArray(activity.sellers) || activity.sellers.length === 0) {
    errors.push(`activity "${id}": "sellers" must be a non-empty array`);
  } else {
    for (let i = 0; i < activity.sellers.length; i++) {
      errors.push(...validatePerson(activity.sellers[i], "sellers", id, i));
    }
  }

  // customers — required (can be empty)
  if (!Array.isArray(activity.customers)) {
    errors.push(`activity "${id}": "customers" must be an array`);
  } else {
    for (let i = 0; i < activity.customers.length; i++) {
      errors.push(...validatePerson(activity.customers[i], "customers", id, i));
    }
  }

  // partners — optional
  if (activity.partners !== undefined) {
    if (!Array.isArray(activity.partners)) {
      errors.push(`activity "${id}": "partners" must be an array when provided`);
    } else {
      for (let i = 0; i < activity.partners.length; i++) {
        errors.push(...validatePerson(activity.partners[i], "partners", id, i));
      }
    }
  }

  // linkedOpportunities — required (empty = free activity)
  if (!Array.isArray(activity.linkedOpportunities)) {
    errors.push(`activity "${id}": "linkedOpportunities" must be an array`);
  } else {
    for (let i = 0; i < activity.linkedOpportunities.length; i++) {
      errors.push(
        ...validateOpportunity(activity.linkedOpportunities[i], id, i),
      );
    }
  }

  return errors;
}

/**
 * Validates an unknown input as an Activity[].
 * Returns typed data on success, or a list of human-readable errors on failure.
 */
export function validateActivities(input: unknown): ValidationResult {
  if (!Array.isArray(input)) {
    return { valid: false, data: [], errors: ["Input must be an array"] };
  }

  const errors: string[] = [];
  for (let i = 0; i < input.length; i++) {
    errors.push(...validateActivity(input[i], i));
  }

  if (errors.length > 0) {
    return { valid: false, data: [], errors };
  }

  return { valid: true, data: input as Activity[], errors: [] };
}
