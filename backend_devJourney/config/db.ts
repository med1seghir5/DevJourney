import mongoose from 'mongoose';

/**
 * Connexion à MongoDB avec gestion des erreurs de certificat
 */
const connectDB = async (): Promise<void> => {
  try {
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error('DATABASE_URL is not defined in .env');
    }

    // Options pour stabiliser la connexion, notamment sur Windows/Render
    const options = {
      // Si vous avez toujours l'erreur "certificate validation failed" sur votre machine locale
      // ces options permettent de passer outre les problèmes de certificats système
      tls: true,
      // tlsAllowInvalidCertificates: true, // Décommentez cette ligne si la connexion échoue encore
    };

    const conn = await mongoose.connect(dbUrl, options);
    console.log(`✅ MongoDB Connecté : ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`❌ Erreur de connexion MongoDB : ${error.message}`);

    // Tentative de reconnexion automatique ou sortie propre
    console.log('Tentative de reconnexion dans 5 secondes...');
    setTimeout(connectDB, 5000);
  }
};

export default connectDB;
