import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/db";
import { authOptions } from "@/lib/auth";

// Get a single comment
export async function GET(
  req: Request,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    const { commentId } = params;
    
    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId
      },
      include: {
        author: {
          select: {
            name: true
          }
        }
      }
    });

    if (!comment) {
      return new NextResponse("Comment not found", { status: 404 });
    }

    return NextResponse.json(comment);
  } catch (error) {
    console.log("[COMMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Update a comment
export async function PUT(
  req: Request,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { commentId } = params;
    const body = await req.json();
    const { content } = body;

    if (!content) {
      return new NextResponse("Missing content", { status: 400 });
    }

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId
      },
      include: {
        author: true
      }
    });

    if (!comment) {
      return new NextResponse("Comment not found", { status: 404 });
    }

    if (comment.author.email !== session.user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const updatedComment = await prisma.comment.update({
      where: {
        id: commentId
      },
      data: {
        content
      },
      include: {
        author: {
          select: {
            name: true
          }
        }
      }
    });

    return NextResponse.json(updatedComment);
  } catch (error) {
    console.log("[COMMENT_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Delete a comment
export async function DELETE(
  req: Request,
  { params }: { params: { postId: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { commentId } = params;

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId
      },
      include: {
        author: true
      }
    });

    if (!comment) {
      return new NextResponse("Comment not found", { status: 404 });
    }

    if (comment.author.email !== session.user.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.comment.delete({
      where: {
        id: commentId
      }
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.log("[COMMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 