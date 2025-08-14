import dotenv from 'dotenv';
import sequelize  from './config/database.js';
import app from './app.js';
import db from './models/index.js';
dotenv.config();


dotenv.config();

const PORT = process.env.PORT ||4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos exitosa.');

    await db.sequelize.sync({ force: false });
    console.log('✅ modelos sincronizados.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Error al conectar con la base de datos:', error);
  }
})();
