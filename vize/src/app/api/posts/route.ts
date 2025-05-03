import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// Get all posts
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            name: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(posts);
  } catch (error) {
    console.log("[POSTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Create a new post
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, content, image } = body;

    if (!title || !content) {
      return new NextResponse("Missing title or content", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const post = await prisma.post.create({
      data: {
        title,
        content,
        image,
        authorId: user.id
      }
    });

    return NextResponse.json(post);
  } catch (error) {
    console.log("[POSTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 