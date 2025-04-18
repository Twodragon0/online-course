import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

type Params = {
  params: {
    videoId: string;
  }
}

export async function GET(
  req: NextRequest,
  { params }: Params
): Promise<NextResponse> {
  try {
    const videoId = params.videoId;

    if (!videoId) {
      return NextResponse.json({ error: "Video ID is required" }, { status: 400 });
    }

    const video = await prisma.video.findUnique({
      where: {
        id: videoId,
      },
      include: {
        course: true,
      },
    });

    if (!video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    return NextResponse.json(video);
  } catch (error) {
    console.error("Error fetching video:", error);
    return NextResponse.json(
      { error: "Error fetching video" },
      { status: 500 }
    );
  }
} 