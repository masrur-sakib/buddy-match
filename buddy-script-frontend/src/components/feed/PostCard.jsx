import { useMemo, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getStoredUser } from '../../utils/auth';
import UserAvatar from './UserAvatar';
import {
  createComment,
  toggleCommentLike,
  togglePostLike,
} from '../../store/feedSlice';

export default function PostCard({ post }) {
  const dispatch = useDispatch();
  const currentUser = getStoredUser();
  const createdAt = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Just now';

  const authorName = post.User
    ? `${post.User.firstName} ${post.User.lastName}`
    : 'Anonymous';

  const [isLiking, setIsLiking] = useState(false);
  const [showLikesDrawer, setShowLikesDrawer] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [replyTexts, setReplyTexts] = useState({});
  const [showReplyInputByComment, setShowReplyInputByComment] = useState({});
  const [isCommenting, setIsCommenting] = useState(false);
  const [isReplySubmittingByComment, setIsReplySubmittingByComment] = useState(
    {},
  );
  const [isTogglingCommentLike, setIsTogglingCommentLike] = useState({});
  const [activeCommentLikesDrawerId, setActiveCommentLikesDrawerId] =
    useState(null);
  const currentUserId = currentUser?.id ?? currentUser?.userId ?? null;
  const hiddenCommentSubmitRef = useRef(null);
  const hiddenReplySubmitRefs = useRef({});
  const likes = useMemo(() => post.PostLikes ?? [], [post.PostLikes]);
  const comments = useMemo(() => post.Comments ?? [], [post.Comments]);
  const likeCount = likes.length;
  const commentCount = comments.length;

  const handleOpenLikesDrawer = () => setShowLikesDrawer(true);
  const handleCloseLikesDrawer = () => setShowLikesDrawer(false);

  const likedByNames = useMemo(() => {
    return likes
      .map((like) => {
        if (!like.User) return null;
        return `${like.User.firstName || ''} ${like.User.lastName || ''}`.trim();
      })
      .filter(Boolean);
  }, [likes]);

  const isLikedByMe = useMemo(() => {
    if (!currentUserId) return false;
    return likes.some(
      (like) =>
        like.UserId === currentUserId || like.User?.id === currentUserId,
    );
  }, [likes, currentUserId]);

  const activeCommentLikes = useMemo(() => {
    if (!activeCommentLikesDrawerId) return [];
    const activeComment = comments.find((comment) => {
      if (comment.id === activeCommentLikesDrawerId) return true;
      return (comment.replies || []).some(
        (reply) => reply.id === activeCommentLikesDrawerId,
      );
    });

    if (!activeComment) return [];

    if (activeComment.id === activeCommentLikesDrawerId) {
      return activeComment.CommentLikes || [];
    }

    const activeReply = (activeComment.replies || []).find(
      (reply) => reply.id === activeCommentLikesDrawerId,
    );

    if (!activeReply) return [];
    return activeReply.CommentLikes || [];
  }, [activeCommentLikesDrawerId, comments]);

  const activeCommentLikedByNames = useMemo(() => {
    return activeCommentLikes
      .map((like) => {
        if (!like.User) return null;
        return `${like.User.firstName || ''} ${like.User.lastName || ''}`.trim();
      })
      .filter(Boolean);
  }, [activeCommentLikes]);

  const handleToggleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await dispatch(togglePostLike(post.id)).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleCreateComment = async (event) => {
    event.preventDefault();
    if (isCommenting) return;

    const content = commentText.trim();
    if (!content) return;

    setIsCommenting(true);
    try {
      await dispatch(createComment({ content, postId: post.id })).unwrap();

      setCommentText('');
    } catch (error) {
      console.error(error);
    } finally {
      setIsCommenting(false);
    }
  };

  const handleCommentKeyDown = (event) => {
    if (event.key !== 'Enter' || event.shiftKey) return;

    const content = commentText.trim();
    if (!content || isCommenting) return;

    event.preventDefault();
    hiddenCommentSubmitRef.current?.click();
  };

  const handleOpenCommentLikesDrawer = (commentId) => {
    setActiveCommentLikesDrawerId(commentId);
  };

  const handleCloseCommentLikesDrawer = () => {
    setActiveCommentLikesDrawerId(null);
  };

  const handleToggleCommentLike = async (commentId) => {
    if (isTogglingCommentLike[commentId]) return;
    setIsTogglingCommentLike((prev) => ({ ...prev, [commentId]: true }));
    try {
      await dispatch(toggleCommentLike(commentId)).unwrap();
    } catch (err) {
      console.error(err);
    } finally {
      setIsTogglingCommentLike((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  const handleReplyInputToggle = (commentId) => {
    setShowReplyInputByComment((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
  };

  const handleReplyTextChange = (commentId, value) => {
    setReplyTexts((prev) => ({
      ...prev,
      [commentId]: value,
    }));
  };

  const handleCreateReply = async (event, parentId, postId) => {
    event.preventDefault();
    if (isReplySubmittingByComment[parentId]) return;

    const content = (replyTexts[parentId] || '').trim();
    if (!content) return;

    setIsReplySubmittingByComment((prev) => ({ ...prev, [parentId]: true }));

    try {
      await dispatch(
        createComment({
          content,
          postId,
          parentId,
        }),
      ).unwrap();

      setReplyTexts((prev) => ({ ...prev, [parentId]: '' }));
      setShowReplyInputByComment((prev) => ({ ...prev, [parentId]: false }));
    } catch (error) {
      console.error(error);
    } finally {
      setIsReplySubmittingByComment((prev) => ({ ...prev, [parentId]: false }));
    }
  };

  const handleReplyKeyDown = (event, parentId) => {
    if (event.key !== 'Enter' || event.shiftKey) return;

    const content = (replyTexts[parentId] || '').trim();
    if (!content || isReplySubmittingByComment[parentId]) return;

    event.preventDefault();
    hiddenReplySubmitRefs.current[parentId]?.click();
  };

  return (
    <div className='_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16'>
      <div className='_feed_inner_timeline_content _padd_r24 _padd_l24'>
        <div className='_feed_inner_timeline_post_top'>
          <div className='_feed_inner_timeline_post_box'>
            <div className='_feed_inner_timeline_post_box_image'>
              <UserAvatar
                profileImage={post.User?.profileImage}
                firstName={post.User?.firstName}
                lastName={post.User?.lastName}
                className='_post_img'
                initialsPadding='6px'
                initialsFontSize='0.95em'
                style={{ width: '35px', height: '35px' }}
              />
            </div>
            <div className='_feed_inner_timeline_post_box_txt'>
              <h4 className='_feed_inner_timeline_post_box_title'>
                {authorName}
              </h4>
              <p className='_feed_inner_timeline_post_box_para'>
                {createdAt}
                {post.privacy && (
                  <>
                    {' '}
                    . <a href='#0'>{post.privacy}</a>
                  </>
                )}
              </p>
            </div>
          </div>
          <div className='_feed_inner_timeline_post_box_dropdown'>
            <div className='_feed_timeline_post_dropdown'>
              <button href='#0' className='_feed_timeline_post_dropdown_link'>
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='4'
                  height='17'
                  fill='none'
                  viewBox='0 0 4 17'
                >
                  <circle cx='2' cy='2' r='2' fill='#C4C4C4' />
                  <circle cx='2' cy='8' r='2' fill='#C4C4C4' />
                  <circle cx='2' cy='15' r='2' fill='#C4C4C4' />
                </svg>
              </button>
            </div>
            {/*Dropdown*/}
            <div className='_feed_timeline_dropdown'>
              <ul className='_feed_timeline_dropdown_list'>
                <li className='_feed_timeline_dropdown_item'>
                  <a href='#0' className='_feed_timeline_dropdown_link'>
                    <span>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='18'
                        height='18'
                        fill='none'
                        viewBox='0 0 18 18'
                      >
                        <path
                          stroke='#1890FF'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='1.2'
                          d='M14.25 15.75L9 12l-5.25 3.75v-12a1.5 1.5 0 011.5-1.5h7.5a1.5 1.5 0 011.5 1.5v12z'
                        />
                      </svg>
                    </span>
                    Save Post
                  </a>
                </li>
                <li className='_feed_timeline_dropdown_item'>
                  <a href='#0' className='_feed_timeline_dropdown_link'>
                    <span>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='20'
                        height='22'
                        fill='none'
                        viewBox='0 0 20 22'
                      >
                        <path
                          fill='#377DFF'
                          fillRule='evenodd'
                          d='M7.547 19.55c.533.59 1.218.915 1.93.915.714 0 1.403-.324 1.938-.916a.777.777 0 011.09-.056c.318.284.344.77.058 1.084-.832.917-1.927 1.423-3.086 1.423h-.002c-1.155-.001-2.248-.506-3.077-1.424a.762.762 0 01.057-1.083.774.774 0 011.092.057zM9.527 0c4.58 0 7.657 3.543 7.657 6.85 0 1.702.436 2.424.899 3.19.457.754.976 1.612.976 3.233-.36 4.14-4.713 4.478-9.531 4.478-4.818 0-9.172-.337-9.528-4.413-.003-1.686.515-2.544.973-3.299l.161-.27c.398-.679.737-1.417.737-2.918C1.871 3.543 4.948 0 9.528 0zm0 1.535c-3.6 0-6.11 2.802-6.11 5.316 0 2.127-.595 3.11-1.12 3.978-.422.697-.755 1.247-.755 2.444.173 1.93 1.455 2.944 7.986 2.944 6.494 0 7.817-1.06 7.988-3.01-.003-1.13-.336-1.681-.757-2.378-.526-.868-1.12-1.851-1.12-3.978 0-2.514-2.51-5.316-6.111-5.316z'
                          clipRule='evenodd'
                        />
                      </svg>
                    </span>
                    Turn On Notification
                  </a>
                </li>
                <li className='_feed_timeline_dropdown_item'>
                  <a href='#0' className='_feed_timeline_dropdown_link'>
                    <span>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='18'
                        height='18'
                        fill='none'
                        viewBox='0 0 18 18'
                      >
                        <path
                          stroke='#1890FF'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='1.2'
                          d='M14.25 2.25H3.75a1.5 1.5 0 00-1.5 1.5V15A1.5 1.5 0 003 16.5h10.5A1.5 1.5 0 0015 15V9.75'
                        />
                        <path
                          stroke='#1890FF'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='1.2'
                          d='M13.875 1.875a1.591 1.591 0 112.25 2.25L9 11.25 6 12l.75-3 7.125-7.125z'
                        />
                      </svg>
                    </span>
                    Hide
                  </a>
                </li>
                <li className='_feed_timeline_dropdown_item'>
                  <a href='#0' className='_feed_timeline_dropdown_link'>
                    <span>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='18'
                        height='18'
                        fill='none'
                        viewBox='0 0 18 18'
                      >
                        <path
                          stroke='#1890FF'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='1.2'
                          d='M8.25 3H3a1.5 1.5 0 00-1.5 1.5V15A1.5 1.5 0 003 16.5h10.5A1.5 1.5 0 0015 15V9.75'
                        />
                        <path
                          stroke='#1890FF'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='1.2'
                          d='M13.875 1.875a1.591 1.591 0 112.25 2.25L9 11.25 6 12l.75-3 7.125-7.125z'
                        />
                      </svg>
                    </span>
                    Edit Post
                  </a>
                </li>
                <li className='_feed_timeline_dropdown_item'>
                  <a href='#0' className='_feed_timeline_dropdown_link'>
                    <span>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='18'
                        height='18'
                        fill='none'
                        viewBox='0 0 18 18'
                      >
                        <path
                          stroke='#1890FF'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth='1.2'
                          d='M2.25 4.5h13.5M6 4.5V3a1.5 1.5 0 011.5-1.5h3A1.5 1.5 0 0112 3v1.5m2.25 0V15a1.5 1.5 0 01-1.5 1.5h-7.5a1.5 1.5 0 01-1.5-1.5V4.5h10.5zM7.5 8.25v4.5M10.5 8.25v4.5'
                        />
                      </svg>
                    </span>
                    Delete Post
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <h4 className='_feed_inner_timeline_post_title'>{post.content}</h4>
        {post.imageUrl && (
          <div className='_feed_inner_timeline_image'>
            <img src={post.imageUrl} alt='Post content' className='_time_img' />
          </div>
        )}
      </div>
      {/* Post Reactions */}
      <div className='_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26'>
        <div
          className='_feed_inner_timeline_total_reacts_image'
          onClick={handleOpenLikesDrawer}
          role='button'
          tabIndex={0}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              handleOpenLikesDrawer();
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          <img
            src='/assets/images/react_img1.png'
            alt='Image'
            className='_react_img1'
          />
          <img
            src='/assets/images/react_img2.png'
            alt='Image'
            className='_react_img'
          />
          <img
            src='/assets/images/react_img3.png'
            alt='Image'
            className='_react_img _rect_img_mbl_none'
          />
          <img
            src='/assets/images/react_img4.png'
            alt='Image'
            className='_react_img _rect_img_mbl_none'
          />
          <img
            src='/assets/images/react_img5.png'
            alt='Image'
            className='_react_img _rect_img_mbl_none'
          />
          <p className='_feed_inner_timeline_total_reacts_para'>9+</p>
        </div>
        <div className='_feed_inner_timeline_total_reacts_txt'>
          <p
            className='_feed_inner_timeline_total_reacts_para1'
            onClick={handleOpenLikesDrawer}
            role='button'
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleOpenLikesDrawer();
              }
            }}
            style={{ cursor: 'pointer' }}
          >
            <span>{likeCount}</span> Like{likeCount !== 1 ? 's' : ''}
          </p>
          <p className='_feed_inner_timeline_total_reacts_para1'>
            <span>{commentCount}</span> Comment{commentCount !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <div
        className='_feed_inner_timeline_reaction'
        style={{
          display: 'flex',
          height: '48px',
          padding: '0',
        }}
      >
        <button
          className={`_feed_inner_timeline_reaction_emoji _feed_reaction ${
            isLikedByMe ? '_feed_reaction_active' : ''
          }`}
          onClick={handleToggleLike}
          disabled={isLiking}
          type='button'
          style={{
            flex: 1,
            borderRight: '1px solid rgba(0, 0, 0, 0.15)',
            height: '100%',
          }}
        >
          <span className='_feed_inner_timeline_reaction_link'>
            <svg
              className='_reaction_svg'
              xmlns='http://www.w3.org/2000/svg'
              width='21'
              height='21'
              fill='none'
              viewBox='0 0 24 24'
              style={{ marginRight: '8px' }}
            >
              <path
                stroke='#000'
                strokeWidth='2'
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3'
              />
            </svg>
            <span>{isLikedByMe ? 'Unlike' : 'Like'}</span>
          </span>
        </button>
        <button
          className='_feed_inner_timeline_reaction_comment _feed_reaction'
          style={{
            flex: 1,
            borderRight: '1px solid rgba(0, 0, 0, 0.15)',
            height: '100%',
          }}
        >
          <span className='_feed_inner_timeline_reaction_link'>
            <svg
              className='_reaction_svg'
              xmlns='http://www.w3.org/2000/svg'
              width='21'
              height='21'
              fill='none'
              viewBox='0 0 21 21'
              style={{ marginRight: '8px' }}
            >
              <path
                stroke='#000'
                d='M1 10.5c0-.464 0-.696.009-.893A9 9 0 019.607 1.01C9.804 1 10.036 1 10.5 1v0c.464 0 .696 0 .893.009a9 9 0 018.598 8.598c.009.197.009.429.009.893v6.046c0 1.36 0 2.041-.317 2.535a2 2 0 01-.602.602c-.494.317-1.174.317-2.535.317H10.5c-.464 0-.696 0-.893-.009a9 9 0 01-8.598-8.598C1 11.196 1 10.964 1 10.5v0z'
              ></path>
              <path
                stroke='#000'
                strokeLinecap='round'
                strokeLinejoin='round'
                d='M6.938 9.313h7.125M10.5 14.063h3.563'
              ></path>
            </svg>
            <span>Comment</span>
          </span>
        </button>
        <button
          className='_feed_inner_timeline_reaction_share _feed_reaction'
          style={{
            flex: 1,
            height: '100%',
          }}
        >
          <span className='_feed_inner_timeline_reaction_link'>
            <svg
              className='_reaction_svg'
              xmlns='http://www.w3.org/2000/svg'
              width='24'
              height='21'
              fill='none'
              viewBox='0 0 24 21'
              style={{ marginRight: '8px' }}
            >
              <path
                stroke='#000'
                strokeLinejoin='round'
                d='M23 10.5L12.917 1v5.429C3.267 6.429 1 13.258 1 20c2.785-3.52 5.248-5.429 11.917-5.429V20L23 10.5z'
              ></path>
            </svg>
            <span>Share</span>
          </span>
        </button>
      </div>
      {/* Likes Drawer */}
      {showLikesDrawer && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            padding: '16px',
          }}
        >
          <div
            onClick={handleCloseLikesDrawer}
            style={{ position: 'absolute', inset: 0 }}
          />
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '70%',
              background: '#fff',
              borderRadius: '18px',
              boxShadow: '0 18px 36px rgba(0,0,0,0.18)',
              overflowY: 'auto',
              padding: '20px',
              zIndex: 1001,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1rem' }}>
                {likeCount} Like{likeCount !== 1 ? 's' : ''}
              </h3>
              <button
                type='button'
                onClick={handleCloseLikesDrawer}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1.4rem',
                  lineHeight: 1,
                  cursor: 'pointer',
                }}
                aria-label='Close likes drawer'
              >
                ×
              </button>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {likedByNames.length ? (
                likedByNames.map((name, index) => (
                  <li
                    key={`${name}-${index}`}
                    style={{
                      padding: '12px 0',
                      borderBottom:
                        index !== likedByNames.length - 1
                          ? '1px solid rgba(0,0,0,0.08)'
                          : 'none',
                    }}
                  >
                    {name}
                  </li>
                ))
              ) : (
                <li style={{ padding: '12px 0', color: '#666' }}>
                  No likes yet.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
      {/* Comment Likes Drawer */}
      {activeCommentLikesDrawerId && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
            padding: '16px',
          }}
        >
          <div
            onClick={handleCloseCommentLikesDrawer}
            style={{ position: 'absolute', inset: 0 }}
          />
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '520px',
              maxHeight: '70%',
              background: '#fff',
              borderRadius: '18px',
              boxShadow: '0 18px 36px rgba(0,0,0,0.18)',
              overflowY: 'auto',
              padding: '20px',
              zIndex: 1001,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1rem' }}>
                {activeCommentLikes.length} Like
                {activeCommentLikes.length !== 1 ? 's' : ''}
              </h3>
              <button
                type='button'
                onClick={handleCloseCommentLikesDrawer}
                style={{
                  border: 'none',
                  background: 'transparent',
                  fontSize: '1.4rem',
                  lineHeight: 1,
                  cursor: 'pointer',
                }}
                aria-label='Close comment likes drawer'
              >
                ×
              </button>
            </div>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
              {activeCommentLikedByNames.length ? (
                activeCommentLikedByNames.map((name, index) => (
                  <li
                    key={`${name}-${index}`}
                    style={{
                      padding: '12px 0',
                      borderBottom:
                        index !== activeCommentLikedByNames.length - 1
                          ? '1px solid rgba(0,0,0,0.08)'
                          : 'none',
                    }}
                  >
                    {name}
                  </li>
                ))
              ) : (
                <li style={{ padding: '12px 0', color: '#666' }}>
                  No likes yet.
                </li>
              )}
            </ul>
          </div>
        </div>
      )}
      {/* Comment Section */}
      <div
        className='_feed_inner_timeline_cooment_area'
        style={{ marginLeft: '-8px' }}
      >
        <div className='_feed_inner_comment_box'>
          <form
            className='_feed_inner_comment_box_form'
            onSubmit={handleCreateComment}
          >
            <div className='_feed_inner_comment_box_content'>
              {/* Comment User Avatar */}
              <div className='_feed_inner_comment_box_content_image'>
                <UserAvatar
                  profileImage={currentUser?.profileImage}
                  firstName={currentUser?.firstName}
                  lastName={currentUser?.lastName}
                  className='_comment_img'
                  initialsPadding='6px'
                  style={{ width: '38px', height: '38px' }}
                />
              </div>
              {/* Comment Textarea */}
              <div className='_feed_inner_comment_box_content_txt'>
                <textarea
                  className='form-control _comment_textarea'
                  placeholder='Write a comment'
                  id='floatingTextarea1'
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  onKeyDown={handleCommentKeyDown}
                ></textarea>
              </div>
            </div>
            <div className='_feed_inner_comment_box_icon'>
              {/* Comment Mic Button */}
              <button
                className='_feed_inner_comment_box_icon_btn'
                type='button'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  fill='none'
                  viewBox='0 0 16 16'
                >
                  <path
                    fill='#000'
                    fillOpacity='.46'
                    fillRule='evenodd'
                    d='M13.167 6.534a.5.5 0 01.5.5c0 3.061-2.35 5.582-5.333 5.837V14.5a.5.5 0 01-1 0v-1.629C4.35 12.616 2 10.096 2 7.034a.5.5 0 011 0c0 2.679 2.168 4.859 4.833 4.859 2.666 0 4.834-2.18 4.834-4.86a.5.5 0 01.5-.5zM7.833.667a3.218 3.218 0 013.208 3.22v3.126c0 1.775-1.439 3.22-3.208 3.22a3.218 3.218 0 01-3.208-3.22V3.887c0-1.776 1.44-3.22 3.208-3.22zm0 1a2.217 2.217 0 00-2.208 2.22v3.126c0 1.223.991 2.22 2.208 2.22a2.217 2.217 0 002.208-2.22V3.887c0-1.224-.99-2.22-2.208-2.22z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
              {/* Comment Image Upload Button */}
              <button
                className='_feed_inner_comment_box_icon_btn'
                type='button'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  width='16'
                  height='16'
                  fill='none'
                  viewBox='0 0 16 16'
                >
                  <path
                    fill='#000'
                    fillOpacity='.46'
                    fillRule='evenodd'
                    d='M10.867 1.333c2.257 0 3.774 1.581 3.774 3.933v5.435c0 2.352-1.517 3.932-3.774 3.932H5.101c-2.254 0-3.767-1.58-3.767-3.932V5.266c0-2.352 1.513-3.933 3.767-3.933h5.766zm0 1H5.101c-1.681 0-2.767 1.152-2.767 2.933v5.435c0 1.782 1.086 2.932 2.767 2.932h5.766c1.685 0 2.774-1.15 2.774-2.932V5.266c0-1.781-1.089-2.933-2.774-2.933zm.426 5.733l.017.015.013.013.009.008.037.037c.12.12.453.46 1.443 1.477a.5.5 0 11-.716.697S10.73 8.91 10.633 8.816a.614.614 0 00-.433-.118.622.622 0 00-.421.225c-1.55 1.88-1.568 1.897-1.594 1.922a1.456 1.456 0 01-2.057-.021s-.62-.63-.63-.642c-.155-.143-.43-.134-.594.04l-1.02 1.076a.498.498 0 01-.707.018.499.499 0 01-.018-.706l1.018-1.075c.54-.573 1.45-.6 2.025-.06l.639.647c.178.18.467.184.646.008l1.519-1.843a1.618 1.618 0 011.098-.584c.433-.038.854.088 1.19.363zM5.706 4.42c.921 0 1.67.75 1.67 1.67 0 .92-.75 1.67-1.67 1.67-.92 0-1.67-.75-1.67-1.67 0-.921.75-1.67 1.67-1.67zm0 1a.67.67 0 10.001 1.34.67.67 0 00-.002-1.34z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
              {/* Comment Post Button */}
              <button
                ref={hiddenCommentSubmitRef}
                type='submit'
                disabled={isCommenting}
                style={{ display: 'none' }}
                aria-hidden='true'
                tabIndex={-1}
              />
            </div>
          </form>
        </div>
      </div>
      <div className='_timline_comment_main'>
        {/* <div className='_previous_comment'>
          <button type='button' className='_previous_comment_txt'>
            View 4 previous comments
          </button>
        </div> */}
        {comments.map((comment, index) => {
          const commentAuthor =
            `${comment.User?.firstName || ''} ${comment.User?.lastName || ''}`.trim() ||
            'User';
          const localLikes = comment.CommentLikes || [];
          const commentReplies = comment.replies || [];
          const commentLikeCount = localLikes.length;
          const isCommentLikedByMe = localLikes.some(
            (like) =>
              like.UserId === currentUserId || like.User?.id === currentUserId,
          );
          const commentTime = comment.createdAt
            ? new Date(comment.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
            : 'Just now';

          return (
            <div
              className='_comment_main'
              key={comment.id || `${commentAuthor}-${index}`}
            >
              <div className='_comment_image'>
                <a href='#0' className='_comment_image_link'>
                  <UserAvatar
                    profileImage={comment.User?.profileImage}
                    firstName={comment.User?.firstName}
                    lastName={comment.User?.lastName}
                    className='_comment_img1'
                    style={{ width: '40px', height: '40px', flexShrink: 0 }}
                  />
                </a>
              </div>
              <div className='_comment_area'>
                <div className='_comment_details'>
                  <div className='_comment_details_top'>
                    <div className='_comment_name'>
                      <a href='#0'>
                        <h4 className='_comment_name_title'>{commentAuthor}</h4>
                      </a>
                    </div>
                  </div>
                  <div className='_comment_status'>
                    <p className='_comment_status_text'>
                      <span>{comment.content}</span>
                    </p>
                  </div>
                  <div
                    className='_total_reactions'
                    style={{ right: '-20px', cursor: 'pointer' }}
                    onClick={() => handleOpenCommentLikesDrawer(comment.id)}
                    role='button'
                    tabIndex={0}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleOpenCommentLikesDrawer(comment.id);
                      }
                    }}
                  >
                    <div className='_total_react'>
                      <span className='_reaction_like'>
                        <svg
                          xmlns='http://www.w3.org/2000/svg'
                          width='16'
                          height='16'
                          viewBox='0 0 24 24'
                          fill='none'
                          stroke='currentColor'
                          strokeWidth='2'
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          className='feather feather-thumbs-up'
                        >
                          <path d='M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3'></path>
                        </svg>
                      </span>
                    </div>
                    <span className='_total'>{commentLikeCount}</span>
                  </div>
                  <div className='_comment_reply'>
                    <div className='_comment_reply_num'>
                      <ul
                        className='_comment_reply_list'
                        style={{ flexWrap: 'nowrap' }}
                      >
                        <li>
                          <span
                            onClick={() => handleToggleCommentLike(comment.id)}
                            style={{
                              cursor: 'pointer',
                              color: isCommentLikedByMe ? '#1890FF' : 'inherit',
                            }}
                            role='button'
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleToggleCommentLike(comment.id);
                              }
                            }}
                          >
                            {isCommentLikedByMe ? 'Unlike' : 'Like'}.
                          </span>
                        </li>
                        <li>
                          <span
                            onClick={() => handleReplyInputToggle(comment.id)}
                            role='button'
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleReplyInputToggle(comment.id);
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                          >
                            Reply.
                          </span>
                        </li>
                        <li>
                          <span>Share</span>
                        </li>
                        <li style={{ whiteSpace: 'nowrap', marginLeft: '6px' }}>
                          <span
                            className='_time_link'
                            style={{ fontSize: '14px', color: '#9CA3AF' }}
                          >
                            .{commentTime}
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                {showReplyInputByComment[comment.id] && (
                  <div
                    className='_feed_inner_timeline_cooment_area'
                    style={{ marginLeft: '56px', marginTop: '12px' }}
                  >
                    <div className='_feed_inner_comment_box'>
                      <form
                        className='_feed_inner_comment_box_form'
                        onSubmit={(event) =>
                          handleCreateReply(event, comment.id, post.id)
                        }
                      >
                        <div className='_feed_inner_comment_box_content'>
                          <div className='_feed_inner_comment_box_content_image'>
                            <UserAvatar
                              profileImage={currentUser?.profileImage}
                              firstName={currentUser?.firstName}
                              lastName={currentUser?.lastName}
                              className='_comment_img'
                              initialsPadding='6px'
                              style={{
                                width: '34px',
                                height: '34px',
                                minWidth: '34px',
                                minHeight: '34px',
                              }}
                            />
                          </div>
                          <div className='_feed_inner_comment_box_content_txt'>
                            <textarea
                              className='form-control _comment_textarea'
                              placeholder='Write a reply'
                              value={replyTexts[comment.id] || ''}
                              onChange={(event) =>
                                handleReplyTextChange(
                                  comment.id,
                                  event.target.value,
                                )
                              }
                              onKeyDown={(event) =>
                                handleReplyKeyDown(event, comment.id)
                              }
                            ></textarea>
                          </div>
                        </div>
                        <button
                          ref={(node) => {
                            if (!node) return;
                            hiddenReplySubmitRefs.current[comment.id] = node;
                          }}
                          type='submit'
                          disabled={isReplySubmittingByComment[comment.id]}
                          style={{ display: 'none' }}
                          aria-hidden='true'
                          tabIndex={-1}
                        />
                      </form>
                    </div>
                  </div>
                )}

                {commentReplies.map((reply, replyIndex) => {
                  const replyAuthor =
                    `${reply.User?.firstName || ''} ${reply.User?.lastName || ''}`.trim() ||
                    'User';
                  const replyLikes = reply.CommentLikes || [];
                  const replyLikeCount = replyLikes.length;
                  const isReplyLikedByMe = replyLikes.some(
                    (like) =>
                      like.UserId === currentUserId ||
                      like.User?.id === currentUserId,
                  );
                  const replyTime = reply.createdAt
                    ? new Date(reply.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'Just now';

                  return (
                    <div
                      className='_comment_main'
                      key={reply.id || `${replyAuthor}-${replyIndex}`}
                      style={{ marginLeft: '56px', marginTop: '10px' }}
                    >
                      <div className='_comment_image'>
                        <a href='#0' className='_comment_image_link'>
                          <UserAvatar
                            profileImage={reply.User?.profileImage}
                            firstName={reply.User?.firstName}
                            lastName={reply.User?.lastName}
                            className='_comment_img1'
                            initialsPadding='6px'
                            initialsFontSize='0.78em'
                            style={{
                              width: '34px',
                              height: '34px',
                              minWidth: '34px',
                              minHeight: '34px',
                            }}
                          />
                        </a>
                      </div>
                      <div
                        className='_comment_area'
                        style={{ marginLeft: '8px' }}
                      >
                        <div className='_comment_details'>
                          <div className='_comment_details_top'>
                            <div className='_comment_name'>
                              <a href='#0'>
                                <h4 className='_comment_name_title'>
                                  {replyAuthor}
                                </h4>
                              </a>
                            </div>
                          </div>
                          <div className='_comment_status'>
                            <p className='_comment_status_text'>
                              <span>{reply.content}</span>
                            </p>
                          </div>
                          <div
                            className='_total_reactions'
                            style={{ right: '-20px', cursor: 'pointer' }}
                            onClick={() =>
                              handleOpenCommentLikesDrawer(reply.id)
                            }
                            role='button'
                            tabIndex={0}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                handleOpenCommentLikesDrawer(reply.id);
                              }
                            }}
                          >
                            <div className='_total_react'>
                              <span className='_reaction_like'>
                                <svg
                                  xmlns='http://www.w3.org/2000/svg'
                                  width='16'
                                  height='16'
                                  viewBox='0 0 24 24'
                                  fill='none'
                                  stroke='currentColor'
                                  strokeWidth='2'
                                  strokeLinecap='round'
                                  strokeLinejoin='round'
                                  className='feather feather-thumbs-up'
                                >
                                  <path d='M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3'></path>
                                </svg>
                              </span>
                            </div>
                            <span className='_total'>{replyLikeCount}</span>
                          </div>
                          <div className='_comment_reply'>
                            <div className='_comment_reply_num'>
                              <ul
                                className='_comment_reply_list'
                                style={{ flexWrap: 'nowrap' }}
                              >
                                <li>
                                  <span
                                    onClick={() =>
                                      handleToggleCommentLike(reply.id)
                                    }
                                    style={{
                                      cursor: 'pointer',
                                      color: isReplyLikedByMe
                                        ? '#1890FF'
                                        : 'inherit',
                                    }}
                                    role='button'
                                    tabIndex={0}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleToggleCommentLike(reply.id);
                                      }
                                    }}
                                  >
                                    {isReplyLikedByMe ? 'Unlike' : 'Like'}.
                                  </span>
                                </li>
                                <li>
                                  <span>Share</span>
                                </li>
                                <li
                                  style={{
                                    whiteSpace: 'nowrap',
                                    marginLeft: '6px',
                                  }}
                                >
                                  <span
                                    className='_time_link'
                                    style={{
                                      fontSize: '14px',
                                      color: '#9CA3AF',
                                    }}
                                  >
                                    .{replyTime}
                                  </span>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
