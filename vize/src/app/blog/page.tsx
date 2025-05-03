import Link from "next/link";
import { prisma } from "@/lib/db";

type Post = {
  id: string;
  title: string;
  content: string;
  image?: string | null;
  author: {
    name: string | null;
    image?: string | null;
  };
};

async function getAllPosts() {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc"
    },
    include: {
      author: {
        select: {
          name: true,
          image: true
        }
      }
    }
  });
  return posts;
}

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Blog Yazıları</h1>
        <Link
          href="/admin/posts/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90 transition-colors"
        >
          Yeni Yazı Ekle
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post: Post) => (
          <Link
            key={post.id}
            href={`/blog/${post.id}`}
            className="bg-card rounded-lg shadow-md overflow-hidden border hover:shadow-lg transition-all duration-300 hover:scale-105 transform"
          >
            <article>
              {post.image && (
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
                <p className="text-muted-foreground mb-4">
                  {post.content.substring(0, 150)}...
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {post.author.image && (
                      <img
                        src={post.author.image}
                        alt={post.author.name || ""}
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <span className="text-sm text-muted-foreground">
                      {post.author.name}
                    </span>
                  </div>
                  <span className="text-primary hover:text-primary/80 transition-colors">
                    Devamını Oku →
                  </span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
} 