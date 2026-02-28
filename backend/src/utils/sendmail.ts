import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const sendVerificationEmail = async function (
  code: string,
  email: string,
  name: string
): Promise<boolean> {
  const token = jwt.sign(email, String(process.env.SECRET));
  const verifyUrl = `${process.env.SERVER_URL}/verify/${code}/${token}`;

  try {
    const { error } = await resend.emails.send({
      from: 'Alexandria <noreply@tryalexandria.com>',
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
