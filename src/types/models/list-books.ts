export type ListWithBooks = {
  id: string;
  user_id: string;
  slug: string | null;
  title: string;
  description: string | null;
  is_public: boolean;
  comments_enabled: boolean;
  organization_id: string | null;
  createdAt: string;
  updatedAt: string;
  books: Array<{
    id: string;
    title: string;
    author: string;
    cover_url: string;
    addedAt: string;
  }>;
};