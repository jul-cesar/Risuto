export interface LikeWithClerkUser {
  id: string;
  list_id: string;
  user_id: string;
  createdAt: string;
  reaction: {
    id: string;
    code: string;
    label: string;
    icon: string;
  };
  user: {
    id: string;
    fullName: string;
    username: string;
    profileImageUrl: string;
  };
}