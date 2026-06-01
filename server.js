const app = require('./src/app');
const connectDB = require('./src/config/db');
const seedDB = require('./src/config/seeder');
require('dotenv').config();

const PORT = process.env.PORT || 4000;

connectDB()
  .then(async () => {
    await seedDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });
