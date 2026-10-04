import { NextRequest } from "next/server";

const CRON_SECRET = process.env.CRON_SECRET;

export function validateCronAuth(request: NextRequest): boolean {
  if (!CRON_SECRET) {
    console.error("CRON_SECRET environment variable is not set");
    return false;
  }

  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.replace("Bearer ", "");

  if (!bearerToken) {
    console.error("Missing authorization header");
    return false;
  }

  if (bearerToken !== CRON_SECRET) {
    console.error("Invalid cron secret");
    return false;
  }

  return true;
}

export function createCronAuthResponse(message: string, status: number = 401): Response {
  return new Response(
    JSON.stringify({ error: message }),
    {
      status,
      headers: { "Content-Type": "application/json" },
    }
  );
}
