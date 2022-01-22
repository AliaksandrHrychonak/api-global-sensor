const {
  Schema,
  model,
} = require('mongoose');

const ImageSchema = new Schema({
  name: String,
  desc: String,
  img:
    {
      data: Buffer,
      contentType: String,
    },
});

module.exports = model('Image', ImageSchema);
