  import '@babel/polyfill';
  import { login } from './login';
  import { logout } from './login';
  import { updateSettings } from './updateSettings';
  import { bookTour } from './stripe';

  try {
    console.log('index.js loaded successfully!'); // ✅ moved here

    const loginForm = document.querySelector('.form--login');
    const logOutBtn = document.querySelector('.nav__el--logout');
    const userDataForm = document.querySelector('.form-user-data');
    const passwordDataForm = document.querySelector('.form-user-settings');
    const bookBtn = document.getElementById('book-tour');

    if (loginForm)
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        console.log('is it working');
        login(email, password);
      });

    if (logOutBtn) logOutBtn.addEventListener('click', logout);

    if (userDataForm)
      userDataForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const form = new FormData();
        form.append('name', document.getElementById('name').value);
        form.append('email', document.getElementById('email').value);
        form.append('photo', document.getElementById('photo').files[0]);
        updateSettings(form, 'data');
      });

    if (passwordDataForm)
      passwordDataForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const passwordCurrent = document.getElementById('password-current').value;
        const password = document.getElementById('password').value;
        const passwordConfirm = document.getElementById('password-confirm').value;
        updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');
      });

    if (bookBtn) {
      bookBtn.addEventListener('click', (e) => {
        e.target.textContent = 'Processing...';
        const { tourId } = e.target.dataset;
        bookTour(tourId);
      });
    }
  } catch (err) {
    console.error('BUNDLE ERROR:', err); // ✅ will now show exactly what is crashing
  }