const mongoose = require('mongoose')

mongoose.set('strictQuery', false)

const uri = process.env.MONGODB_URI

console.log('conntecting to:', uri)

mongoose
  .connect(uri)
  .then((result) => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message)
  })

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: [3, 'Must be at least 3 characters long'],
    required: true
  },
  number: {
    type: String,
    minLength: 10,
    required: true,
    validate: {
      validator: function(n) {
        return /\d{3}-\d{3}-\d{4}/.test(n)
      },
      message: props => 'Not a valid phone number!'
    }
  }
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  },
})

module.exports = mongoose.model('Person', personSchema)
