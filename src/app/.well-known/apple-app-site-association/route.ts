import { NextResponse } from "next/server";

export async function GET() {
  const body = {
    applinks: {
      apps: [],
      details: [
        {
          appID: "5C282NCY69.com.radly.app",
          paths: ["/auth/google/callback"]
        }
      ]
    }
  };

  return new NextResponse(JSON.stringify(body), {
    status: 200,
    headers: {
      "Content-Type": "application/json"
    }
  });
}
