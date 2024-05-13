const mongoose = require("mongoose");
mongoose.Promise = global.Promise;

module.exports = {
  makeDBConnection: async (url, options) => {
    mongoose
      .connect(url, options)
      .then(() => {
        Promise.resolve();
      })
      .catch((err) => {
        Promise.reject(err);
      });
  },

  makeSchema: (schema) => {
    return mongoose.Schema(schema);
  },

  makeCollection: (name, schema) => {
    return mongoose.model(name, schema);
  },
};
