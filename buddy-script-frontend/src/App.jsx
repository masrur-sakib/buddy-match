import { Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated } from './utils/auth';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Feed from './pages/Feed';
import Profile from './pages/Profile';

function PrivateRoute({ children }) {
  return isAuthenticated() ? children : <Navigate to='/login' replace />;
}

function PublicRoute({ children }) {
  return !isAuthenticated() ? children : <Navigate to='/feed' replace />;
}

export default function App() {
  return (
    <Routes>
      <Route
        path='/'
        element={
          isAuthenticated() ? (
            <Navigate to='/feed' replace />
          ) : (
            <Navigate to='/login' replace />
          )
        }
      />
      <Route
        path='/login'
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path='/register'
        element={
          <PublicRoute>
            <Registration />
          </PublicRoute>
        }
      />
      <Route
        path='/feed'
        element={
          <PrivateRoute>
            <Feed />
          </PrivateRoute>
        }
      />
      <Route
        path='/profile'
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}
