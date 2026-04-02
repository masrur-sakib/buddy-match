function SteveRow() {
  return (
    <div className="_notification_box">
      <div className="_notification_image">
        <img src="/assets/images/friend-req.png" alt="Image" className="_notify_img" />
      </div>
      <div className="_notification_txt">
        <p className="_notification_para">
          <span className="_notify_txt_link">Steve Jobs</span>
          posted a link in your timeline.
        </p>
        <div className="_nitification_time">
          <span>42 miniutes ago</span>
        </div>
      </div>
    </div>
  )
}

function AdminRow() {
  return (
    <div className="_notification_box">
      <div className="_notification_image">
        <img src="/assets/images/profile-1.png" alt="Image" className="_notify_img" />
      </div>
      <div className="_notification_txt">
        <p className="_notification_para">
          An admin changed the name of the group{' '}
          <span className="_notify_txt_link">Freelacer usa</span>
          to
          <span className="_notify_txt_link">Freelacer usa </span>
        </p>
        <div className="_nitification_time">
          <span>42 miniutes ago</span>
        </div>
      </div>
    </div>
  )
}

export default function FeedNotificationPanel() {
  const rows = Array.from({ length: 20 }, (_, i) => (i % 2 === 0 ? 'steve' : 'admin'))
  return (
    <>
      <div className="_notifications_content">
        <h4 className="_notifications_content_title">Notifications</h4>
        <div className="_notification_box_right">
          <button type="button" className="_notification_box_right_link">
            <svg xmlns="http://www.w3.org/2000/svg" width="4" height="17" fill="none" viewBox="0 0 4 17">
              <circle cx="2" cy="2" r="2" fill="#C4C4C4" />
              <circle cx="2" cy="8" r="2" fill="#C4C4C4" />
              <circle cx="2" cy="15" r="2" fill="#C4C4C4" />
            </svg>
          </button>
          <div className="_notifications_drop_right">
            <ul className="_notification_list">
              <li className="_notification_item">
                <span className="_notification_link">Mark as all read</span>
              </li>
              <li className="_notification_item">
                <span className="_notification_link">Notifivations seetings</span>
              </li>
              <li className="_notification_item">
                <span className="_notification_link">Open Notifications</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="_notifications_drop_box">
        <div className="_notifications_drop_btn_grp">
          <button type="button" className="_notifications_btn_link">
            All
          </button>
          <button type="button" className="_notifications_btn_link1">
            Unread
          </button>
        </div>
        <div className="_notifications_all">
          {rows.map((kind, idx) =>
            kind === 'steve' ? <SteveRow key={idx} /> : <AdminRow key={idx} />,
          )}
        </div>
      </div>
    </>
  )
}
