import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import Image from "next/image";

type Comment = {
  id: string;
  content: string;
  createdAt: Date;
  author: {
    name: string | null;
    image?: string | null;
  };
};

type Post = {
  id: string;
  title: string;
  content: string;
  image?: string | null;
  createdAt: Date;
  author: {
    name: string | null;
    image?: string | null;
  };
  comments: Comment[];
};

async function getPost(postId: string) {
  const post = await prisma.post.findUnique({
    where: {
      id: postId
    },
    include: {
      author: {
        select: {
          name: true,
          image: true
        }
      },
      comments: {
        include: {
          author: {
            select: {
              name: true,
              image: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      }
    }
  });

  if (!post) {
    notFound();
  }

  return post;
}

export default async function BlogPostPage({
  params
}: {
  params: { postId: string };
}) {
  const { postId } = await Promise.resolve(params);
  const post = await getPost(postId);

  return (
    <article className="max-w-4xl mx-auto">
      {post.image && (
        <div className="relative w-full h-[400px] mb-8">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover rounded-lg"
          />
        </div>
      )}

      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>

      <div className="flex items-center space-x-4 mb-8">
        {post.author.image && (
          <Image
            src={post.author.image}
            alt={post.author.name || ""}
            width={40}
            height={40}
            className="rounded-full"
          />
        )}
        <div>
          <p className="font-semibold">{post.author.name}</p>
          <p className="text-sm text-muted-foreground">
            {new Date(post.createdAt).toLocaleDateString("tr-TR", {
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </p>
        </div>
      </div>

      <div className="prose dark:prose-invert max-w-none mb-12">{post.content}</div>

      {/* Comments Section */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold mb-6">Yorumlar</h2>
        <div className="space-y-6">
          {post.comments.map((comment) => (
            <div key={comment.id} className="bg-muted p-4 rounded-lg">
              <div className="flex items-center space-x-4 mb-2">
                {comment.author.image && (
                  <Image
                    src={comment.author.image}
                    alt={comment.author.name || ""}
                    width={32}
                    height={32}
                    className="rounded-full"
                  />
                )}
                <div>
                  <p className="font-semibold">{comment.author.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(comment.createdAt).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              </div>
              <p className="text-foreground">{comment.content}</p>
            </div>
          ))}
        </div>
      </section>
    </article>
  );
} 