import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { put } from '@vercel/blob';

const prisma = new PrismaClient();

interface eventvid {
  id: number;
  videoUrl: string;
  thumbnail: string;
  title: string;
}

export async function GET() {
  try {
    const eventvids = await prisma.eventvid.findMany();
    return NextResponse.json(eventvids);
  } catch (error) {
    console.error('Error fetching eventvids:', error);
    return NextResponse.json({ error: 'Failed to fetch eventvids' }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  const data = await request.formData();
  const videoFile = data.get('videoUrl') as File;
  const thumbnailFile = data.get('thumbnailUrl') as File;
  const title = data.get('title') as string;

  if (!videoFile || !thumbnailFile || !title) {
    return NextResponse.json({ error: 'Video, thumbnail, and client name are required' }, { status: 400 });
  }

  try {
    const videoBlob = await put(`videos/${videoFile.name}`, await videoFile.arrayBuffer(), {
      access: 'public',
      contentType: videoFile.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const thumbnailBlob = await put(`thumbnails/${thumbnailFile.name}`, await thumbnailFile.arrayBuffer(), {
      access: 'public',
      contentType: thumbnailFile.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    const newEventVid: eventvid = await prisma.eventvid.create({
      data: { videoUrl: videoBlob.url, thumbnail: thumbnailBlob.url, title },
    });

    return NextResponse.json(newEventVid, { status: 201 });
  } catch (error) {
    console.error('Error creating testimonial:', error);
    return NextResponse.json({ error: 'Failed to create video testimonial' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  const data = await request.formData();
  const videoFile = data.get('videoUrl') as File | undefined;
  const thumbnailFile = data.get('thumbnailUrl') as File | undefined;
  const title = data.get('title') as string | undefined;

  const updateData: Partial<eventvid> = {};

  if (title) {
    updateData.title = title;
  }

  try {
    // Check if videoFile is a valid File object
    if (videoFile && videoFile instanceof File) {
      const videoBlob = await put(`videos/${videoFile.name}`, await videoFile.arrayBuffer(), {
        access: 'public',
        contentType: videoFile.type,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      updateData.videoUrl = videoBlob.url;
    }

    // Check if thumbnailFile is a valid File object
    if (thumbnailFile && thumbnailFile instanceof File) {
      const thumbnailBlob = await put(`thumbnails/${thumbnailFile.name}`, await thumbnailFile.arrayBuffer(), {
        access: 'public',
        contentType: thumbnailFile.type,
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
      updateData.thumbnail = thumbnailBlob.url;
    }

    // If no valid data to update, return error
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'No valid data to update' }, { status: 400 });
    }

    const updatedTestimonial: eventvid = await prisma.eventvid.update({
      where: { id: Number(id) },
      data: updateData,
    });

    return NextResponse.json(updatedTestimonial, { status: 200 });
  } catch (error) {
    console.error('Error updating testimonial:', error);
    return NextResponse.json({ error: 'Failed to update video testimonial' }, { status: 500 });
  }
}



export async function DELETE(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'ID is required' }, { status: 400 });
  }

  try {
    await prisma.eventvid.delete({
      where: { id: Number(id) },
    });
    return NextResponse.json({ message: 'Video testimonial deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return NextResponse.json({ error: 'Failed to delete video testimonial' }, { status: 500 });
  }
}
