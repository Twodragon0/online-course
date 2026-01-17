// app/api/rss/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'https://edu.2twodragon.com';

    const courses = await prisma.course.findMany({
      take: 20, // Limit to 20 latest courses
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const feedItems = courses.map((course) => `
      <item>
        <title>${course.title}</title>
        <link>${baseUrl}/courses/${course.id}</link>
        <guid>${baseUrl}/courses/${course.id}</guid>
        <pubDate>${course.createdAt.toUTCString()}</pubDate>
        <updated>${course.updatedAt.toUTCString()}</updated>
        <description><![CDATA[${course.description || course.title}]]></description>
      </item>
    `).join('');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
      <rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
        <channel>
          <title>Edu Platform Courses</title>
          <link>${baseUrl}</link>
          <atom:link href="${baseUrl}/api/rss" rel="self" type="application/rss+xml" />
          <description>Latest online courses from Edu Platform, converting blog posts into engaging learning experiences.</description>
          <language>ko-kr</language>
          <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
          ${feedItems}
        </channel>
      </rss>`;

    return new NextResponse(rssFeed, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Failed to generate RSS feed:', error);
    return NextResponse.json(
      { error: 'Failed to generate RSS feed' },
      { status: 500 }
    );
  }
}
