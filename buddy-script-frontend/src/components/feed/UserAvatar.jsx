import { useState } from 'react';

/**
 * Renders a profile image when available, otherwise a circle with the
 * user's initials (first letter of firstName + first letter of lastName).
 *
 * Props:
 *   profileImage  – signed URL string (optional)
 *   firstName     – string (optional)
 *   lastName      – string (optional)
 *   className     – extra CSS class applied to both the <img> and the initials div
 *   style         – extra inline styles
 */
export default function UserAvatar({
  profileImage,
  firstName,
  lastName,
  className = '',
  style = {},
  initialsPadding = '0px',
  initialsFontSize = '0.85em',
}) {
  const [imgError, setImgError] = useState(false);

  const initials = [firstName, lastName]
    .map((n) => (n ? n.charAt(0).toUpperCase() : ''))
    .join('');

  if (profileImage && !imgError) {
    return (
      <img
        src={profileImage}
        alt={initials || 'User'}
        className={className}
        style={{
          borderRadius: '50%',
          objectFit: 'cover',
          ...style,
        }}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box',
        background: 'linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)',
        color: '#fff',
        fontWeight: 600,
        fontSize: initialsFontSize,
        letterSpacing: '0.03em',
        borderRadius: '50%',
        padding: initialsPadding,
        userSelect: 'none',
        ...style,
      }}
      aria-label={initials || 'User'}
    >
      {initials || '?'}
    </div>
  );
}
