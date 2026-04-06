import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_URL, authFetch, getAuthToken, getStoredUser } from '../utils/auth';

export const fetchFeed = createAsyncThunk('feed/fetchFeed', async () => {
  const response = await authFetch('/api/posts');
  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Unable to load feed');
  }
  return response.json();
});

export const createPost = createAsyncThunk(
  'feed/createPost',
  async ({ content, privacy, file }, { dispatch }) => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('Session expired. Please log in again.');
    }

    const formData = new FormData();
    formData.append('content', content);
    formData.append('privacy', privacy);
    if (file) {
      formData.append('image', file);
    }

    const response = await fetch(`${API_URL}/api/posts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to create post');
    }

    await dispatch(fetchFeed()).unwrap();
    return data;
  },
);

export const togglePostLike = createAsyncThunk(
  'feed/togglePostLike',
  async (postId) => {
    const response = await authFetch(`/api/posts/${postId}/like`, {
      method: 'POST',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Unable to update like status');
    }

    const currentUser = getStoredUser();
    return { postId, currentUser };
  },
);

export const createComment = createAsyncThunk(
  'feed/createComment',
  async ({ postId, content, parentId = null }) => {
    const response = await authFetch('/api/posts/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        postId,
        parentId,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Unable to create comment');
    }

    const currentUser = getStoredUser();

    return {
      postId,
      parentId,
      comment: {
        ...data,
        User: currentUser
          ? {
              id: currentUser.id,
              firstName: currentUser.firstName,
              lastName: currentUser.lastName,
              profileImage: currentUser.profileImage,
            }
          : undefined,
        CommentLikes: [],
        replies: [],
      },
    };
  },
);

export const toggleCommentLike = createAsyncThunk(
  'feed/toggleCommentLike',
  async (commentId) => {
    const response = await authFetch(`/api/posts/comments/${commentId}/like`, {
      method: 'POST',
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Unable to update comment like status');
    }

    const currentUser = getStoredUser();
    return { commentId, currentUser };
  },
);

const initialState = {
  posts: [],
  loading: false,
  error: '',
};

const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.loading = true;
        state.error = '';
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Unable to load feed';
      })
      .addCase(togglePostLike.fulfilled, (state, action) => {
        const { postId, currentUser } = action.payload;
        const currentUserId = currentUser?.id ?? currentUser?.userId;
        const post = state.posts.find((item) => item.id === postId);
        if (!post || !currentUserId) return;

        const likes = post.PostLikes ?? [];
        const alreadyLiked = likes.some(
          (like) =>
            like.UserId === currentUserId || like.User?.id === currentUserId,
        );

        post.PostLikes = alreadyLiked
          ? likes.filter(
              (like) =>
                like.UserId !== currentUserId &&
                like.User?.id !== currentUserId,
            )
          : [
              ...likes,
              {
                UserId: currentUserId,
                User: {
                  id: currentUserId,
                  firstName: currentUser?.firstName || '',
                  lastName: currentUser?.lastName || '',
                },
              },
            ];
      })
      .addCase(createComment.fulfilled, (state, action) => {
        const { postId, parentId, comment } = action.payload;
        const post = state.posts.find((item) => item.id === postId);
        if (!post) return;

        if (parentId) {
          const parentComment = (post.Comments || []).find(
            (item) => item.id === parentId,
          );
          if (!parentComment) return;
          parentComment.replies = [...(parentComment.replies || []), comment];
          return;
        }

        post.Comments = [...(post.Comments || []), comment];
      })
      .addCase(toggleCommentLike.fulfilled, (state, action) => {
        const { commentId, currentUser } = action.payload;
        const currentUserId = currentUser?.id ?? currentUser?.userId;
        if (!currentUserId) return;

        for (const post of state.posts) {
          const topLevelComment = (post.Comments || []).find(
            (item) => item.id === commentId,
          );
          const replyComment = (post.Comments || []).find((item) =>
            (item.replies || []).some((reply) => reply.id === commentId),
          );

          const comment = topLevelComment
            ? topLevelComment
            : replyComment?.replies?.find((reply) => reply.id === commentId);

          if (!comment) continue;

          const likes = comment.CommentLikes ?? [];
          const alreadyLiked = likes.some(
            (like) =>
              like.UserId === currentUserId || like.User?.id === currentUserId,
          );

          comment.CommentLikes = alreadyLiked
            ? likes.filter(
                (like) =>
                  like.UserId !== currentUserId &&
                  like.User?.id !== currentUserId,
              )
            : [
                ...likes,
                {
                  UserId: currentUserId,
                  User: {
                    id: currentUserId,
                    firstName: currentUser?.firstName || '',
                    lastName: currentUser?.lastName || '',
                  },
                },
              ];

          break;
        }
      });
  },
});

export const selectFeedPosts = (state) => state.feed.posts;
export const selectFeedLoading = (state) => state.feed.loading;
export const selectFeedError = (state) => state.feed.error;

export default feedSlice.reducer;
