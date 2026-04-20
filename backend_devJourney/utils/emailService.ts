import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  service: 'gmail', // ou un autre service d'envoi
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendOTP = async (to: string, otp: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'Code de vérification - DevJourney',
    text: `Votre code de vérification est: ${otp}. Ce code expire dans 10 minutes.`,
    html: `<p>Votre code de vérification est: <strong style="font-size: 24px;">${otp}</strong>.</p><p>Ce code expire dans 10 minutes.</p>`,
  };

  console.log(`\n==============================================`);
  console.log(`📩  E-MAIL DE VÉRIFICATION PRÊT`);
  console.log(`📧  DESTINATAIRE: ${to}`);
  console.log(`🔑  CODE OTP: ${otp}`);
  console.log(`==============================================\n`);

  try {
    if (process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('votre_email')) {
      const info = await transporter.sendMail(mailOptions);
      console.log('✅ Email OTP envoyé avec succès :', info.response);
    } else {
      console.log('⚠️  EMAIL NON ENVOYÉ: Vos identifiants SMTP ne sont pas configurés dans .env');
      console.log('💡  Pour tester, utilisez le code OTP affiché ci-dessus dans la console.');
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'envois de l\'email OTP:', error);
    // On ne bloque l'inscription que si on est sûr de vouloir envoyer un mail réel
    if (process.env.EMAIL_USER && !process.env.EMAIL_USER.includes('votre_email')) {
       throw new Error('Erreur lors de l\'envoi de l\'email OTP');
    }
  }
};
