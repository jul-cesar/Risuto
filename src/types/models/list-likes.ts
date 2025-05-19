export interface LikeWithClerkUser {
  id: string;
  list_id: string;
  user_id: string;
  createdAt: string;
  user: {
    id: string;
    fullName: string;
    username: string;
    profileImageUrl: string;
  };
}