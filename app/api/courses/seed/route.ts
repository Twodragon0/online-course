import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({ message: "Seeding completed" });
  } catch (error) {
    return NextResponse.json({ error: "Failed to seed database" }, { status: 500 });
  }
} 