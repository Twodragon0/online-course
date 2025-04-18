import { NextResponse } from 'next/server';

// 임시 POST 응답 핸들러
export async function POST(request: Request) {
  return NextResponse.json({ message: "Payment feature coming soon" });
}

// 임시 GET 응답 핸들러
export async function GET() {
  return NextResponse.json({ message: "Pricing feature coming soon" });
}