import { useEffect, useState } from 'react'
import DarkModeToggle from '../components/feed/DarkModeToggle'
import FeedNavbar from '../components/feed/FeedNavbar'
import FeedMobileHeader from '../components/feed/FeedMobileHeader'
import FeedMobileBottomNav from '../components/feed/FeedMobileBottomNav'
import FeedLeftSidebar from '../components/feed/FeedLeftSidebar'
import FeedMiddle from '../components/feed/FeedMiddle'
import FeedRightSidebar from '../components/feed/FeedRightSidebar'

export default function Feed() {
  const [darkMode, setDarkMode] = useState(false)

  useEffect(() => {
    const onToggleTimeline = (e) => {
      const btn = e.target.closest('._feed_timeline_post_dropdown_link')
      if (!btn) return
      e.preventDefault()
      const wrap = btn.closest('._feed_inner_timeline_post_box_dropdown')
      const drop = wrap?.querySelector('._feed_timeline_dropdown')
      if (drop) {
        drop.classList.toggle('show')
      }
    }
    document.addEventListener('click', onToggleTimeline)
    return () => document.removeEventListener('click', onToggleTimeline)
  }, [])

  return (
    <div className={`_layout _layout_main_wrapper${darkMode ? ' _dark_wrapper' : ''}`}>
      <DarkModeToggle onToggle={() => setDarkMode((d) => !d)} />
      <div className="_main_layout">
        <FeedNavbar />
        <FeedMobileHeader />
        <FeedMobileBottomNav />
        <div className="container _custom_container">
          <div className="_layout_inner_wrap">
            <div className="row">
              <FeedLeftSidebar />
              <FeedMiddle />
              <FeedRightSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
