const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const url = `mongodb+srv://phonebook:${password}@phonebook.vtxvki5.mongodb.net/?retryWrites=true&w=majority`;

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema);

const person = new Person({
  name,
  number,
})

if (process.argv.length === 3) {
  console.log('phonebook:')
  Person.find({}).then((result) => {
    result.forEach((person) => {
      console.log(person.name, person.number)
    })
    mongoose.connection.close()
  })
} else if (process.argv.length > 3) {
  person.save(name, number).then((result) => {
    console.log(`added ${name} number ${number} to phonebook`)

    mongoose.connection.close()
  })
}
