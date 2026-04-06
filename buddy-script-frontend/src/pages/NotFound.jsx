import { Link } from 'react-router-dom';
import { isAuthenticated } from '../utils/auth';

export default function NotFound() {
  const destination = isAuthenticated() ? '/feed' : '/login';
  const label = isAuthenticated() ? 'Go to Feed' : 'Go to Login';

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.code}>404</div>
        <h1 style={styles.title}>Page Not Found</h1>
        <p style={styles.subtitle}>
          Oops! The page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
        <Link to={destination} style={styles.button}>
          {label}
        </Link>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    padding: '60px 48px',
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    maxWidth: '440px',
    width: '100%',
  },
  code: {
    fontSize: '96px',
    fontWeight: '800',
    lineHeight: 1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
    marginBottom: '8px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: '12px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#6b7280',
    marginBottom: '32px',
    lineHeight: '1.6',
  },
  button: {
    display: 'inline-block',
    padding: '12px 32px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '15px',
    textDecoration: 'none',
    transition: 'opacity 0.2s',
  },
};
