import jwt from 'jsonwebtoken';

import sgMail from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY)
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendVerificationEmail = async function (
  code: string,
  email: string,
  name: string
) {
  const token = jwt.sign(email, String(process.env.SECRET));

  const mail = {
    to: email,
    from: 'noreply@tryalexandria.com',
    subject: 'Verify your email address for Alexandria',
    text: `Text version of the link: ${process.env.SERVER_URL}/verify/${code}/${token}`,
    html: `
    <h3>Hello, ${name}!</h3>
    <p>Please follow this link to verify the email address you used to sign up for Alexandria:</p>
    <p><a href="${process.env.SERVER_URL}/verify/${code}/${token}">Verify ${email}</a></p>
    <p>You can then start to add your own texts.</p>
    <p>Greetings from team Alexandria</p>`,
  };

  const response = await sgMail.send(mail);
  console.log(response[0].statusCode);
  console.log(response[0].headers);
};

export default {
  sendVerificationEmail,
};
