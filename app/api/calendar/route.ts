import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const accessToken = (session as any).accessToken;

  if (!accessToken) {
    return NextResponse.json(
      { error: "No access token — please sign in again" },
      { status: 401 }
    );
  }

  try {
    // Fetch today's events
    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);

    const url = new URL(
      "https://www.googleapis.com/calendar/v3/calendars/primary/events"
    );
    url.searchParams.set("timeMin", startOfDay.toISOString());
    url.searchParams.set("timeMax", endOfDay.toISOString());
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("maxResults", "50");

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Google Calendar API error:", errorData);
      return NextResponse.json(
        { error: "Failed to fetch calendar events", details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Transform events into a cleaner format
    const events = (data.items || []).map(
      (event: {
        id: string;
        summary?: string;
        start?: { dateTime?: string; date?: string };
        end?: { dateTime?: string; date?: string };
        description?: string;
        location?: string;
        colorId?: string;
        htmlLink?: string;
      }) => ({
        id: event.id,
        title: event.summary || "(No title)",
        start: event.start?.dateTime || event.start?.date || "",
        end: event.end?.dateTime || event.end?.date || "",
        description: event.description || "",
        location: event.location || "",
        colorId: event.colorId || "0",
        link: event.htmlLink || "",
        isAllDay: !event.start?.dateTime,
      })
    );

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Calendar fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
