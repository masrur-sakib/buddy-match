import { Navigate } from 'react-router-dom';
import { getAuthToken, getStoredUser } from '../utils/auth';

export default function Profile() {
  const token = getAuthToken();
  const user = getStoredUser();

  if (!token) {
    return <Navigate to='/login' replace />;
  }

  return (
    <div className='_layout _layout_main_wrapper'>
      <div className='container py-5'>
        <div className='row justify-content-center'>
          <div className='col-xl-6 col-lg-8 col-md-10 col-sm-12'>
            <div className='card p-4'>
              <h2 className='mb-4'>Profile</h2>
              {user ? (
                <div>
                  <p>
                    <strong>Name:</strong> {user.firstName} {user.lastName}
                  </p>
                  <p>
                    <strong>User ID:</strong> {user.id}
                  </p>
                  <p>
                    <strong>Email:</strong> {user.email || 'Not available'}
                  </p>
                  <p>
                    <strong>Token:</strong> <code>{token.slice(0, 20)}...</code>
                  </p>
                </div>
              ) : (
                <p>No user information available. Please log in again.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
