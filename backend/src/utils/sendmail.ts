import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import env from '../lib/env';

let resend: Resend;
function getResendClient() {
  if (!resend) resend = new Resend(env.RESEND_API_KEY);
  return resend;
}

const sendVerificationEmail = async function (
  code: string,
  email: string,
  name: string
): Promise<boolean> {
  if (env.NODE_ENV === 'test') return false;

  const token = jwt.sign(email, env.SECRET);
  const verifyUrl = `${env.SERVER_URL}/verify/${code}/${token}`;

  try {
    const { error } = await getResendClient().emails.send({
      from: 'Alexandria <noreply@signup.tryalexandria.com>',
      to: email,
      subject: 'Verify your email address for Alexandria',
      text: `Text version of the link: ${verifyUrl}`,
      html: `
    <h3>Hello, ${name}!</h3>
    <p>Please follow this link to verify the email address you used to sign up for Alexandria:</p>
    <p><a href="${verifyUrl}">Verify ${email}</a></p>
    <p>You can then start to add your own texts.</p>
    <p>Greetings from team Alexandria</p>`,
    });

    if (error) {
      console.error(`Failed to send verification email to ${email}:`, error);
      return false;
    }

    console.log(`Verification email sent to ${email}`);
    return true;
  } catch (error) {
    console.error(`Failed to send verification email to ${email}:`, error);
    return false;
  }
};

export default {
  sendVerificationEmail,
};
