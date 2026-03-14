import { NextResponse } from "next/server";

export async function POST() {
  return new NextResponse("success", {
    status: 200,
    headers: {
      "content-type": "text/plain",
    },
  });
}
