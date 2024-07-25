const mongoose = require('mongoose')

const DatabaseConnection = () =>{
    mongoose.connect(process.env.MONGO_DB).then((conn) => {
        console.log(`Database Connected: ${conn.connection.host}`);
      })
      .catch((err) => {
        console.error(`Database Error: ${err}`);
        process.exit(1);
      });
}

module.exports = DatabaseConnection