import { Navigate } from 'react-router-dom'

// Placeholder profile route. The original HTML navigates to `profile.html`,
// which isn't included in this React conversion.
export default function Profile() {
  return <Navigate to="/feed" replace />
}

