import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../../lib/prisma";
import { randomSlugGenerator, safeSlugLength } from "../../../../../lib/utils";

const POST = async (req: NextRequest) => {
  const body = await req.json();

  if (!body.target) {
    return NextResponse.json(
      { message: "target is required" },
      { status: 400 }
    );
  }

  const stats = await prisma.stats.findFirst();

  if (!stats) {
    NextResponse.json({ message: "Stats not found" }, { status: 404 });
  }

  const linksCount = stats?.links_count || 2;

  const safeLength = safeSlugLength(linksCount);

  let attempts = 0;
  let maxAttempts = 100;
  let slug = "";
  let excludedSlugs: string[] = [];
  let slugConfirmed = false;

  while (attempts < maxAttempts) {
    slug = randomSlugGenerator(safeLength, excludedSlugs);
    const link = await prisma.links.findFirst({
      where: {
        slug: slug,
      },
    });

    if (!link) {
      slugConfirmed = true;
      break;
    }

    excludedSlugs.push(slug);
    attempts++;
  }

  if (!slugConfirmed) {
    return NextResponse.json(
      { message: "Failed to generate unique slug" },
      { status: 500 }
    );
  }

  const link = await prisma.links.create({
    data: {
      target: body.target,
      label: body.label,
      slug: slug,
      date_created: new Date(),
      date_updated: new Date(),
      date_first_opened: null,
      hits: 0,
      is_opened: false,
      status: "active",
    },
  });
};

export { POST };
