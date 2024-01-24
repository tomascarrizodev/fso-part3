require('dotenv').config()
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const morgan = require('morgan')
const Person = require('./models/person')

const app = express()

app.use(express.static('dist'))
app.use(express.json())
app.use(cors())

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

let personsQuantity

app.get('/', (req, res) => {
  res.send('<h1>Hello World</h1>')
})

app.get('/persons', (req, res) => {
  Person.find({}).then(persons => {
    res.json(persons) 
  })
})

app.get('/persons/:id', (req, res, next) => {
  Person.findById(req.params.id)
    .then(person => {
      if (person) {
        res.json(person)
      } else {
        res.status(404).end()
      }
    })
    .catch(err => next(err))
})

app.get('/info', async (req, res) => {
  try {
    personsQuantity = await Person.countDocuments()
    res.send(`<p>Phonebook has info for ${personsQuantity} persons<p><p>${Date()}</p>`)
  } catch (err) {
    console.log(err)
    res.status(500).send('Internal error')
  }
})

app.delete('/persons/:id', (req, res) => {
  Person.findByIdAndDelete(req.params.id)
    .then(result => {
      personsQuantity = personsQuantity - 1
      res.status(204).end()
    })
    .catch(err => next(err))
})

app.post('/persons', (req, res, next) => {
  const body = req.body

  if (body.name == false) {
    return res.status(400).json({ error: 'content missing' })
  }

  const person = new Person({
    id: body.id,
    name: body.name,
    number: body.number,
  })

  person.save()
    .then(savedPerson => {
      personsQuantity++
      res.json(savedPerson)
      mongoose.connection.close()
    })
    .catch(err => next(err))
})

app.put('/persons/:id', (req, res) => {
  const { name, number } = req.body

  Person.findByIdAndUpdate(req.params.id, { name, number }, { new: true, runValidators: true, context: 'query' })
    .then(updatedPerson => {
      res.json(updatedPerson)
    })
    .catch(err => next(err))
})

const unknownEndpoint = (req, res) => {
  res.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (err, req, res, next) => {
  console.error(err.message)

  if (err.name === 'CastError') {
    return res.status(400).send({ error: 'malformatted id' })
  } else if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message })
  }

  next(err)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log('Server running on port', PORT)
})