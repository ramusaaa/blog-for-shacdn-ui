import Link from "next/link";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";

type Post = {
  id: string;
  title: string;
  content: string;
  image?: string | null;
  createdAt: Date;
  author: {
    id: string;
    name: string;
    email: string;
  };
};

async function getLatestPosts() {
  const posts = await prisma.post.findMany({
    take: 3,
    orderBy: {
      createdAt: "desc"
    },
    include: {
      author: {
        select: {
          name: true,
          id: true,
          email: true
        }
      }
    }
  });
  return posts;
}

export default async function Home() {
  const posts = await getLatestPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Son Yazılar</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post: Post) => (
          <div key={post.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            {post.image && (
              <div className="relative h-48 w-full">
                <img
                  src={post.image}
                  alt={post.title}
                  className="object-cover w-full h-full"
                />
              </div>
            )}
            <div className="p-4">
              <h2 className="text-xl font-semibold mb-2">{post.title}</h2>
              <p className="text-muted-foreground mb-4 line-clamp-3">{post.content}</p>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>{post.author.name}</span>
                <span>{formatDate(post.createdAt)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link href="/blog" className="text-primary hover:underline">
          Tüm Yazıları Görüntüle
        </Link>
      </div>
    </div>
  );
}
