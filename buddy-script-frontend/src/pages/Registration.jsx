import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DecorShapes from '../components/auth/DecorShapes';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function Registration() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { firstName, lastName, email, password, confirmPassword } = formData;
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return setError('Please fill in all fields.');
    }
    if (password !== confirmPassword) {
      return setError('Passwords do not match.');
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed. Please try again.');
      }

      setSuccess(data.message || 'Registration successful!');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className='_social_registration_wrapper _layout_main_wrapper'>
      <DecorShapes />
      <div className='_social_registration_wrap'>
        <div className='container'>
          <div className='row align-items-center'>
            <div className='col-xl-8 col-lg-8 col-md-12 col-sm-12'>
              <div className='_social_registration_right'>
                <div className='_social_registration_right_image'>
                  <img src='/assets/images/registration.png' alt='Image' />
                </div>
                <div className='_social_registration_right_image_dark'>
                  <img src='/assets/images/registration1.png' alt='Image' />
                </div>
              </div>
            </div>
            <div className='col-xl-4 col-lg-4 col-md-12 col-sm-12'>
              <div className='_social_registration_content'>
                <div className='_social_registration_right_logo _mar_b28'>
                  <img
                    src='/assets/images/logo.svg'
                    alt='Image'
                    className='_right_logo'
                  />
                </div>
                <p className='_social_registration_content_para _mar_b8'>
                  Get Started Now
                </p>
                <h4 className='_social_registration_content_title _titl4 _mar_b50'>
                  Registration
                </h4>
                <button
                  type='button'
                  className='_social_registration_content_btn _mar_b40'
                >
                  <img
                    src='/assets/images/google.svg'
                    alt='Image'
                    className='_google_img'
                  />{' '}
                  <span>Register with google</span>
                </button>
                <div className='_social_registration_content_bottom_txt _mar_b40'>
                  <span>Or</span>
                </div>
                <form
                  className='_social_registration_form'
                  onSubmit={handleSubmit}
                >
                  <div className='row'>
                    <div className='col-xl-6 col-lg-6 col-md-12 col-sm-12'>
                      <div className='_social_registration_form_input _mar_b14'>
                        <label className='_social_registration_label _mar_b8'>
                          First Name
                        </label>
                        <input
                          name='firstName'
                          value={formData.firstName}
                          onChange={handleChange}
                          type='text'
                          className='form-control _social_registration_input'
                          placeholder='First name'
                        />
                      </div>
                    </div>
                    <div className='col-xl-6 col-lg-6 col-md-12 col-sm-12'>
                      <div className='_social_registration_form_input _mar_b14'>
                        <label className='_social_registration_label _mar_b8'>
                          Last Name
                        </label>
                        <input
                          name='lastName'
                          value={formData.lastName}
                          onChange={handleChange}
                          type='text'
                          className='form-control _social_registration_input'
                          placeholder='Last name'
                        />
                      </div>
                    </div>
                    <div className='col-xl-12 col-lg-12 col-md-12 col-sm-12'>
                      <div className='_social_registration_form_input _mar_b14'>
                        <label className='_social_registration_label _mar_b8'>
                          Email
                        </label>
                        <input
                          name='email'
                          value={formData.email}
                          onChange={handleChange}
                          type='email'
                          className='form-control _social_registration_input'
                          placeholder='Email address'
                        />
                      </div>
                    </div>
                    <div className='col-xl-12 col-lg-12 col-md-12 col-sm-12'>
                      <div className='_social_registration_form_input _mar_b14'>
                        <label className='_social_registration_label _mar_b8'>
                          Password
                        </label>
                        <input
                          name='password'
                          value={formData.password}
                          onChange={handleChange}
                          type='password'
                          className='form-control _social_registration_input'
                          placeholder='Password'
                        />
                      </div>
                    </div>
                    <div className='col-xl-12 col-lg-12 col-md-12 col-sm-12'>
                      <div className='_social_registration_form_input _mar_b14'>
                        <label className='_social_registration_label _mar_b8'>
                          Repeat Password
                        </label>
                        <input
                          name='confirmPassword'
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          type='password'
                          className='form-control _social_registration_input'
                          placeholder='Repeat password'
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
                  {success && (
                    <div className='row'>
                      <div className='col-12'>
                        <p className='text-success'>{success}</p>
                      </div>
                    </div>
                  )}
                  <div className='row'>
                    <div className='col-lg-12 col-xl-12 col-md-12 col-sm-12'>
                      <div className='form-check _social_registration_form_check'>
                        <input
                          className='form-check-input _social_registration_form_check_input'
                          type='radio'
                          name='flexRadioDefaultReg'
                          id='flexRadioDefaultReg2'
                          defaultChecked
                        />
                        <label
                          className='form-check-label _social_registration_form_check_label'
                          htmlFor='flexRadioDefaultReg2'
                        >
                          I agree to terms & conditions
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className='row'>
                    <div className='col-lg-12 col-md-12 col-xl-12 col-sm-12'>
                      <div className='_login_registration_btn_section _social_registration_form_btn _mar_t40 _mar_b60'>
                        <button
                          type='submit'
                          className='_social_registration_form_btn_link _btn1'
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? 'Registering...' : 'Register'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
                <div className='row'>
                  <div className='col-xl-12 col-lg-12 col-md-12 col-sm-12'>
                    <div className='_social_registration_bottom_txt'>
                      <p className='_social_registration_bottom_txt_para'>
                        Already have an account?{' '}
                        <Link to='/login'>Login here</Link>
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
