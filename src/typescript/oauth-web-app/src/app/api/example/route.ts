/**
 * API Routes Example
 *
 * This file demonstrates how to add serverless functions
 * You can add more routes by creating files in src/app/api/
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "API route example",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  return NextResponse.json({
    message: "POST received",
    data: body,
    timestamp: new Date().toISOString(),
  });
}
