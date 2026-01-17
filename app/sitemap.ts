import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma'; // Import prisma client

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = 'https://edu.2twodragon.com';

    const courses = await prisma.course.findMany({
        select: {
            id: true,
            updatedAt: true,
        },
    });

    const courseEntries: MetadataRoute.Sitemap = courses.map((course) => ({
        url: `${baseUrl}/courses/${course.id}`,
        lastModified: course.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.9,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/courses`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/pricing`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/features`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/get-started`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/register`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/login`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.5,
        },
        ...courseEntries, // Add dynamic course entries
    ];
}
