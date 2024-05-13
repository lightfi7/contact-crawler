module.exports = {
  place_id: {
    type: String,
    unique: true,
    required: true,
    dropDups: true,
    index: true,
  },
  result: {},
};
