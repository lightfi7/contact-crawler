module.exports = {
  url: { type: String, required: true, unique: true, index: true },
  level: { type: Number, default: 0 },
};
