import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {

  const { slug } = params;

  const link = await prisma.links.findFirst({
    where: {
      slug: {
        equals: slug
      }
    }
  });

  if(!link) {
    return NextResponse.json({ error: 'Link not found' }, { status: 404 });
  }

  const event = await prisma.events.create({
    data: {
      date_created: new Date(),
      date_updated: new Date(),
      slug: link.slug,
      ip_address: req.headers.get('x-real-ip') || req.headers.get('x-forwarded-for'),
      referrer: req.headers.get('referer'),
      user_agent: req.headers.get('user-agent'),
      status: 'active',
    }
  })

  if(!event) {
    return NextResponse.json({ error: 'Error updating event' }, { status: 500 });
  }

  if(!link.is_opened){
    const updatedLink = await prisma.links.update({
      where: {
        id: link.id
      },
      data: {
        is_opened: true,
        date_first_opened: new Date()
      }
    });

    if(!updatedLink) {
      return NextResponse.json({ error: 'Error updating link' }, { status: 500 });
    }
  }

  return NextResponse.redirect(`${link.target}`);

}