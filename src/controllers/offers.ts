import type { PrismaClient } from '@prisma/client';
import { CreateOfferType } from './../schemas/offers';

export async function getFilteredOffers(
  prisma: PrismaClient,
  options: {
    before?: Date;
    after?: Date;
    tags?: string[];
    category?: string;
    take?: number;
  },
) {
  const offers = await prisma.internshipOffer.findMany({
    orderBy: { createdAt: 'desc' },
    where: {
      AND: [
        { createdAt: { lt: options.before } },
        { createdAt: { gt: options.after } },
        { category: { name: options.category } },
        { tags: { some: { name: { in: options.tags } } } },
      ],
    },
    include: {
      tags: true,
      category: true,
    },
    take: options.take || 10,
  });

  return offers.map((offer) => ({
    ...offer,
    startDate: offer.startDate.toISOString(),
    endDate: offer.endDate.toISOString(),
    createdAt: offer.createdAt.toISOString(),
    updatedAt: offer.updatedAt.toISOString(),
  }));
}

export async function createOffer(prisma: PrismaClient, data: CreateOfferType) {
  const offer = await prisma.internshipOffer.create({
    data: {
      title: data.title,
      content: data.content,
      authorId: data.authorId,
      visibility: data.visibility,
      categoryId: data.categoryId,
      tags: {
        connect: data.tags.map((tag) => ({ id: tag })),
      },
      startDate: data.startDate,
      endDate: data.endDate,
      duration: data.duration,
      location: data.location,
      link: data.link,
    },
    include: {
      tags: true,
      category: true,
    },
  });

  return {
    ...offer,
    startDate: offer.startDate.toISOString(),
    endDate: offer.endDate.toISOString(),
    createdAt: offer.createdAt.toISOString(),
    updatedAt: offer.updatedAt.toISOString(),
  };
}

export async function getTags(prisma: PrismaClient) {
  return prisma.tag.findMany();
}

export async function getCategories(prisma: PrismaClient) {
  return prisma.category.findMany();
}
