import axios from 'axios';
import { showAlert } from './alert';

export const bookTour = async (tourId) => {
  try {
    const stripe = Stripe(
      'pk_test_51TCqykBxLeA7jEBOVESfhuMKHQBjMVPWs9LxTmjBZo7WkiDQ5izsUOYWrzVhzIie8N7AGFWRHJYkf5qO7Rz1kxBC00xqkdlbHw',
    );
    //1. Get  checkout session from API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    console.log(session);

    //2. Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (e) {
    console.log('Error 💥💥⛔ ', e);
    showAlert('error', e.message);
  }
};
