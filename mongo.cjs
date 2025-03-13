const dotenv = require('dotenv')
dotenv.config()
const mongoose = require('mongoose')
mongoose.set('strictQuery', false)
const uri = process.env.MONGO_URL

const databaseConnection = () => {
    console.log('Connecting to database...')
    return mongoose.connect(uri)
            .then(() => console.log('Connection succesfull'))
            .catch(error => console.error('Error connecting to database', error.message))
}

const personSchema = new mongoose.Schema({
    name: {
      type: String,
      minLength: 3,
      required: true
    },
    number: {
      type: String,
      required: true,
      validate: {
        validator: function (value) {
          return /^\d{3}-\d{3}-\d{4}$/.test(value)
        },
        message: props => `${props.value} is not a valid phone number. Format should be XXX-XXX-XX-XX`
      }
    },
  })

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString()
      delete returnedObject._id
      delete returnedObject.__v
    }
  })

const Person = mongoose.model('Person', personSchema)

module.exports = { databaseConnection, Person}







