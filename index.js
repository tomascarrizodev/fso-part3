require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))

morgan.token('person', (req, res) => JSON.stringify(req.body))
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :person'))

// let persons = [
//   {
//     "id": 1,
//     "name": "Arto Hellas",
//     "number": "040-123456"
//   },
//   {
//     "id": 2,
//     "name": "Ada Lovelace",
//     "number": "39-44-5323523"
//   },
//   {
//     "id": 3,
//     "name": "Dan Abramov",
//     "number": "12-43-234345"
//   },
//   {
//     "id": 4,
//     "name": "Mary Poppendieck",
//     "number": "39-23-6423122"
//   }
// ]

app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>')
})

app.get('/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons)
  })
})

app.get('/persons/:id', (req, res) => {
  Person.findById(req.params.id).then(person => {
    res.json(person)
  })
})

app.get('/info', (req, res) => {
  res.send(`<p>Phonebook has info for ${persons.length} person<p><p>${Date()}</p>`)
})

// app.delete('/persons/:id', (req, res) => {
//   const id = Number(req.params.id)
//   persons = persons.filter(person => person.id !== id)
//   res.status(204).end()
// })

app.post('/persons', (req, res) => {
  const body = req.body

  if (body.name == false) {
    return res.status(400).json({ error: 'content missing' })
  }

  const person = new Person({
    id: body.id,
    name: body.name,
    number: body.number,
  })

  person.save().then(savedPerson => {
    res.json(savedPerson)
    mongoose.connection.close()
  })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log('Server running on port', PORT)
})