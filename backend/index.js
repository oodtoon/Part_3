const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
require('dotenv').config()

const Person = require('./models/person')

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(cors())
app.use(express.json())
app.use(morgan('tiny'))
app.use(express.static('build'))

morgan.token('object', (request, response) => {
  return `${JSON.stringify(request.body)}`
})

app.use(morgan(':object'))

let persons = []

let totalPeople = persons.length
let today = new Date()

app.get('/info', (request, response) => {
  Person.find({}).then((persons) => {
    response.send(`
    <div>Phonebook has info for ${persons.length} people</div>
    <br />
    <div>${today}</>`)
  })
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then((persons) => {
    response.json(persons)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then((person) => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })
    .catch((error) => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then((result) => {
      response.status(204).end()
    })
    .catch((error) => next(error))
})

const generateId = () => {
  const randomId = Math.floor(Math.random() * 1000000)
  let currentIds = persons.map((person) => person.id)
  if (currentIds.includes(randomId)) {
    return generateId()
  } else {
    return randomId
  }
}

app.post('/api/persons', (request, response, next) => {
  const body = request.body
  let currentNames = persons.map((person) => person.name)

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: 'missing name or number',
    })
  } else if (currentNames.includes(body.name)) {
    return response.status(400).json({
      error: 'name must be unique',
    })
  } else {
    const person = new Person({
      name: body.name,
      number: body.number,
    })

    person
      .save()
      .then((savedPerson) => {
        response.json(savedPerson);
      })
      .catch((error) => next(error));
  }
})

app.put('/api/persons/:id', (request, response, next) => {
  const { name, number } = request.body

  Person.findByIdAndUpdate(
    request.params.id,
    { name, number },
    { new: true, runValidators: true, context: 'query' }
  )
    .then((updatedPerson) => {
      response.json(updatedPerson)
    })
    .catch((error) => console.log('error', error.message))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
