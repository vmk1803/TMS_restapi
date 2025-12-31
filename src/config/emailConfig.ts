const dotenv = require('dotenv');
dotenv.config();

export const emailConfig = {

  service_key: process.env.KAKA_EMAIL_SERVICE_KEY!,
  email_base_url: process.env.KAKA_EMAIL_SERVICE_API_URL!,
  labsquire_from_mail: process.env.LABSQUIRE_FROM_EMAIL!
};


