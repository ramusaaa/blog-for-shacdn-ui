import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// Get all comments for a post
export async function GET(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params;
    
    const comments = await prisma.comment.findMany({
      where: {
        postId
      },
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

    return NextResponse.json(comments);
  } catch (error) {
    console.log("[COMMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Create a new comment
export async function POST(
  req: Request,
  { params }: { params: { postId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { postId } = params;
    const body = await req.json();
    const { content } = body;

    if (!content) {
      return new NextResponse("Missing content", { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email
      }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        authorId: user.id
      },
      include: {
        author: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json(comment);
  } catch (error) {
    console.log("[COMMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 