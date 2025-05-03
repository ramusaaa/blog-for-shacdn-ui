import Link from "next/link";
import { prisma } from "@/lib/db";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

type Post = {
  id: string;
  title: string;
  content: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  imageUrl?: string | null;
};

type PostWithAuthor = Post & {
  author: {
    name: string;
  };
};

async function getAdminPosts() {
  const session = await getServerSession();
  
  if (!session?.user?.email) {
    redirect("/auth/login");
  }

  const posts = await prisma.post.findMany({
    where: {
      author: {
        email: session.user.email
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      author: {
        select: {
          name: true
        }
      }
    }
  });

  return posts;
}

export default async function AdminPage() {
  const posts = await getAdminPosts();

  return (
    <div className="space-y-6 p-6 bg-background">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-foreground">Admin Panel</h1>
        <Link
          href="/admin/posts/new"
          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          Yeni Yazı Ekle
        </Link>
      </div>

      <div className="bg-card rounded-lg shadow-md overflow-hidden border border-border">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Başlık
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Yazar
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Tarih
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {posts.map((post: PostWithAuthor) => (
              <tr key={post.id} className="bg-card hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-foreground">
                    {post.title}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">
                    {post.author.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-muted-foreground">
                    {new Date(post.createdAt).toLocaleDateString("tr-TR")}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      post.published
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                        : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100"
                    }`}
                  >
                    {post.published ? "Yayında" : "Taslak"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="text-primary hover:text-primary/80 mr-4 transition-colors"
                  >
                    Düzenle
                  </Link>
                  <Link
                    href={`/admin/posts/${post.id}/delete`}
                    className="text-destructive hover:text-destructive/80 transition-colors"
                  >
                    Sil
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 