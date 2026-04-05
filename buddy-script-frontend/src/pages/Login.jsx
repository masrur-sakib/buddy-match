import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DecorShapes from '../components/auth/DecorShapes';
import { API_URL } from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const { email, password } = formData;
    if (!email || !password) {
      return setError('Email and password are required.');
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data.error || 'Login failed. Please check your credentials.',
        );
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      navigate('/feed');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className='_social_login_wrapper _layout_main_wrapper'>
      <DecorShapes />
      <div className='_social_login_wrap'>
        <div className='container'>
          <div className='row align-items-center'>
            <div className='col-xl-8 col-lg-8 col-md-12 col-sm-12'>
              <div className='_social_login_left'>
                <div className='_social_login_left_image'>
                  <img
                    src='/assets/images/login.png'
                    alt='Image'
                    className='_left_img'
                  />
                </div>
              </div>
            </div>
            <div className='col-xl-4 col-lg-4 col-md-12 col-sm-12'>
              <div className='_social_login_content'>
                <div className='_social_login_left_logo _mar_b28'>
                  <img
                    src='/assets/images/logo.svg'
                    alt='Image'
                    className='_left_logo'
                  />
                </div>
                <p className='_social_login_content_para _mar_b8'>
                  Welcome back
                </p>
                <h4 className='_social_login_content_title _titl4 _mar_b50'>
                  Login to your account
                </h4>
                <button
                  type='button'
                  className='_social_login_content_btn _mar_b40'
                >
                  <img
                    src='/assets/images/google.svg'
                    alt='Image'
                    className='_google_img'
                  />{' '}
                  <span>Or sign-in with google</span>
                </button>
                <div className='_social_login_content_bottom_txt _mar_b40'>
                  <span>Or</span>
                </div>
                <form className='_social_login_form' onSubmit={handleSubmit}>
                  <div className='row'>
                    <div className='col-xl-12 col-lg-12 col-md-12 col-sm-12'>
                      <div className='_social_login_form_input _mar_b14'>
                        <label className='_social_login_label _mar_b8'>
                          Email
                        </label>
                        <input
                          name='email'
                          value={formData.email}
                          onChange={handleChange}
                          type='email'
                          className='form-control _social_login_input'
                          placeholder='Email address'
                        />
                      </div>
                    </div>
                    <div className='col-xl-12 col-lg-12 col-md-12 col-sm-12'>
                      <div className='_social_login_form_input _mar_b14'>
                        <label className='_social_login_label _mar_b8'>
                          Password
                        </label>
                        <input
                          name='password'
                          value={formData.password}
                          onChange={handleChange}
                          type='password'
                          className='form-control _social_login_input'
                          placeholder='Password'
                        />
                      </div>
                    </div>
                  </div>
                  {error && (
                    <div className='row'>
                      <div className='col-12'>
                        <p className='text-danger'>{error}</p>
                      </div>
                    </div>
                  )}
                  <div className='row'>
                    <div className='col-lg-6 col-xl-6 col-md-6 col-sm-12'>
                      <div className='form-check _social_login_form_check'>
                        <input
                          className='form-check-input _social_login_form_check_input'
                          type='radio'
                          name='flexRadioDefault'
                          id='flexRadioDefault2'
                          defaultChecked
                        />
                        <label
                          className='form-check-label _social_login_form_check_label'
                          htmlFor='flexRadioDefault2'
                        >
                          Remember me
                        </label>
                      </div>
                    </div>
                    <div className='col-lg-6 col-xl-6 col-md-6 col-sm-12'>
                      <div className='_social_login_form_left'>
                        <p className='_social_login_form_left_para'>
                          Forgot password?
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='row'>
                    <div className='col-lg-12 col-md-12 col-xl-12 col-sm-12'>
                      <div className='_login_registration_btn_section _social_login_form_btn _mar_t40 _mar_b60'>
                        <button
                          type='submit'
                          className='_social_login_form_btn_link _btn1'
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Signing in...' : 'Sign in'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                <div className='row'>
                  <div className='col-xl-12 col-lg-12 col-md-12 col-sm-12'>
                    <div className='_social_login_bottom_txt'>
                      <p className='_social_login_bottom_txt_para'>
                        Dont have an account?{' '}
                        <Link to='/register'>Create New Account</Link>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
