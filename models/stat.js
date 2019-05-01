const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const statSchema = new Schema({
  vodID: { type: Number, require: true },
  textLog: { type: Array },
  vodTitle: { type: String },
  vodURL: { type: String },
  previewURL: { type: String },
  broadcasterName: { type: String },
  broadcasterChannel: { type: String },
  obj: { type: Object },
});

const Stats = mongoose.model("Stat", statSchema);

module.exports = mongoose.models.Stats || Stats;
