import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authFetch, getStoredUser, isAuthenticated } from '../utils/auth';
import DarkModeToggle from '../components/feed/DarkModeToggle';
import FeedNavbar from '../components/feed/FeedNavbar';
import FeedMobileHeader from '../components/feed/FeedMobileHeader';
import FeedMobileBottomNav from '../components/feed/FeedMobileBottomNav';
import FeedLeftSidebar from '../components/feed/FeedLeftSidebar';
import FeedMiddle from '../components/feed/FeedMiddle';
import FeedRightSidebar from '../components/feed/FeedRightSidebar';

export default function Feed() {
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posts, setPosts] = useState([]);
  const [user] = useState(() => (isAuthenticated() ? getStoredUser() : null));

  useEffect(() => {
    authFetch('/api/posts')
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Unable to load feed');
        }
        return res.json();
      })
      .then((data) => setPosts(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

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
