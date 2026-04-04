export default function PostCard({ post }) {
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

  const likeCount = post.PostLikes?.length || 0;
  const commentCount = post.Comments?.length || 0;

  return (
    <div className='_feed_inner_timeline_post_area _b_radious6 _padd_b24 _padd_t24 _mar_b16'>
      <div className='_feed_inner_timeline_content _padd_r24 _padd_l24'>
        <div className='_feed_inner_timeline_post_top'>
          <div className='_feed_inner_timeline_post_box'>
            <div className='_feed_inner_timeline_post_box_image'>
              <img
                src='/assets/images/post_img.png'
                alt='User avatar'
                className='_post_img'
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
        </div>
        <h4 className='_feed_inner_timeline_post_title'>{post.content}</h4>
        {post.imageUrl && (
          <div className='_feed_inner_timeline_image'>
            <img src={post.imageUrl} alt='Post content' className='_time_img' />
          </div>
        )}
      </div>
      <div className='_feed_inner_timeline_total_reacts _padd_r24 _padd_l24 _mar_b26'>
        <div className='_feed_inner_timeline_total_reacts_txt'>
          <p className='_feed_inner_timeline_total_reacts_para1'>
            <a href='#0'>
              {likeCount} Like{likeCount !== 1 ? 's' : ''}
            </a>
            <span> · </span>
            <a href='#0'>
              {commentCount} Comment{commentCount !== 1 ? 's' : ''}
            </a>
          </p>
        </div>
      </div>
      <div className='_feed_inner_timeline_footer_counter _padd_r24 _padd_l24 _padd_b24 _padd_t24'>
        <div className='_feed_inner_timeline_footer_counter_item'>
          <button className='_feed_inner_timeline_footer_counter_link'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='20'
              height='20'
              fill='none'
              viewBox='0 0 20 20'
            >
              <path
                fill='#666'
                d='M2.5 10.625c0 .412.16.808.444 1.1l5.31 5.474a1.562 1.562 0 002.246-2.18L6.188 10l3.723-3.837c.665-.68.631-1.78-.08-2.418a1.562 1.562 0 00-2.245 2.177l-5.31 5.475a1.544 1.544 0 00-.444 1.1l.378.128z'
              />
            </svg>
            <span>Like</span>
          </button>
        </div>
        <div className='_feed_inner_timeline_footer_counter_item'>
          <button className='_feed_inner_timeline_footer_counter_link'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='20'
              height='20'
              fill='none'
              viewBox='0 0 20 20'
            >
              <path
                fill='#666'
                d='M18.333 9.375H10.42V1.458a1.563 1.563 0 00-3.125 0v7.917H1.667a1.562 1.562 0 100 3.125h5.628v5.625a1.563 1.563 0 003.125 0v-5.625h7.913a1.563 1.563 0 100-3.125z'
              />
            </svg>
            <span>Comment</span>
          </button>
        </div>
        <div className='_feed_inner_timeline_footer_counter_item'>
          <button className='_feed_inner_timeline_footer_counter_link'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='20'
              height='20'
              fill='none'
              viewBox='0 0 20 20'
            >
              <path
                fill='#666'
                d='M10.822 17.333H5.833c-2.204 0-3.708-1.508-3.708-3.708V8.333c0-2.2 1.504-3.708 3.708-3.708h8.334c2.204 0 3.708 1.508 3.708 3.708v5.292c0 2.2-1.504 3.708-3.708 3.708h-1.629c-.154 0-.304.054-.429.154l-1.633 1.371c-.521.42-1.333.171-1.454-.54z'
              />
            </svg>
            <span>Comment</span>
          </button>
        </div>
        <div className='_feed_inner_timeline_footer_counter_item'>
          <button className='_feed_inner_timeline_footer_counter_link'>
            <svg
              xmlns='http://www.w3.org/2000/svg'
              width='20'
              height='20'
              fill='none'
              viewBox='0 0 20 20'
            >
              <path
                fill='#666'
                d='M10.417 18.333a8.333 8.333 0 110-16.666 8.333 8.333 0 010 16.666zM10 13.542l3.208-3.208m0 0L10 7.125M13.208 10.334h-6.25'
              />
            </svg>
            <span>Share</span>
          </button>
        </div>
      </div>
    </div>
  );
}
