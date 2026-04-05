import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getStoredUser, isAuthenticated } from '../utils/auth';
import DarkModeToggle from '../components/feed/DarkModeToggle';
import FeedNavbar from '../components/feed/FeedNavbar';
import FeedMobileHeader from '../components/feed/FeedMobileHeader';
import FeedMobileBottomNav from '../components/feed/FeedMobileBottomNav';
import FeedLeftSidebar from '../components/feed/FeedLeftSidebar';
import FeedMiddle from '../components/feed/FeedMiddle';
import FeedRightSidebar from '../components/feed/FeedRightSidebar';
import {
  fetchFeed,
  selectFeedError,
  selectFeedLoading,
  selectFeedPosts,
} from '../store/feedSlice';

export default function Feed() {
  const dispatch = useDispatch();
  const [darkMode, setDarkMode] = useState(false);
  const loading = useSelector(selectFeedLoading);
  const error = useSelector(selectFeedError);
  const posts = useSelector(selectFeedPosts);
  const [user] = useState(() => (isAuthenticated() ? getStoredUser() : null));

  useEffect(() => {
    dispatch(fetchFeed());
  }, [dispatch]);

  if (!isAuthenticated()) {
    return <Navigate to='/login' replace />;
  }

  return (
    <div
      className={`_layout _layout_main_wrapper${darkMode ? ' _dark_wrapper' : ''}`}
    >
      <DarkModeToggle onToggle={() => setDarkMode((d) => !d)} />
      <div className='_main_layout'>
        <FeedNavbar />
        <FeedMobileHeader />
        <FeedMobileBottomNav />
        <div className='container _custom_container'>
          <div className='mb-3'>
            {loading && <div className='alert alert-info'>Loading feed...</div>}
            {!loading && error && (
              <div className='alert alert-danger'>{error}</div>
            )}
            {!loading && !error && (
              <div className='alert alert-success mb-0'>
                {`Welcome back${user?.firstName ? `, ${user.firstName}` : ''}! Loaded ${posts.length} posts.`}
              </div>
            )}
          </div>
          <div className='_layout_inner_wrap'>
            <div className='row'>
              <FeedLeftSidebar />
              <FeedMiddle posts={posts} />
              <FeedRightSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
