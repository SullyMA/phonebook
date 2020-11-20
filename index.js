require('dotenv').config()
const express = require('express')
const app = express()

const morgan = require('morgan')

const Person = require('./models/person')

const cors = require('cors')

app.use(express.static('build'))
app.use(cors())
app.use(express.json())



const morganLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(morganLogger)

app.use(morgan('tiny'))


let today = new Date()
let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate()


// let persons = [
//     {
//       id: 1,
//       name: "Arto Hellas",
//       number: "040-123456"
//     },
//     {
//       id: 2,
//       name: "Ada Loveplace",
//       number: "39-44-5323523"
//     },
//     {
//       id: 3,
//       name: "Dan Abramov",
//       number: "12-43-234345"
//     },
//     {
//       id: 4,
//       name: "Mary Poppendick",
//       number: "12-43-234345"
//     }
//   ]

// const names = persons.map(person => person.name)
// const numbers = persons.map(num => num.number)

// app.get('/api/persons', (request, response) => {
//     response.json(persons)
//   })


 
app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })
})

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    response.send(`Phonebook has ${persons.length} people ${date}`)
  })
})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(persons => {
    if (persons) {
      response.json(persons.toJSON())
    } else {
      response.status(404).end()
    }
  })
    .catch(error => next(error))
})

// app.get('/api/persons/:id', (request, response) => {
//   const id = Number(request.params.id);
//   const personEntry = persons.find(persons => persons.id === id)
//   if (personEntry) {
//       response.json(personEntry)
//     } else {
//       response.status(404).send()
//     }
// })

// > var ObjectId = require('mongodb').ObjectId; 
// > var id = req.params.gonderi_id;       
// > var o_id = new ObjectId(id);
// > db.test.find({_id:o_id})



 



/**
  * test this function again
  */
// const generateId = () => {
//   const maxId = persons.length > 0
//   ?  Math.floor(Math.random() * (10000 - 4 + 1)) + 4
//   : 0
//   return maxId + 1
// }
  
// app.post('/api/persons', (request, response) => {
//   const body = request.body
    
//   if(names.includes(body.name) || numbers.includes(body.number)){
//       response.status(400)
//       throw new Error("this person already exist");
//       return response.json('this person exist already')
//   }
  
//   if (!body.name || !body.number) {
//       response.status(400)
//       throw new Error("Missing name and/or number fields");
//       return response.json('Missing name and number')
//   }
  
//   const person = {
//   id: generateId(),
//   name: body.name,
//    number: body.number || 0,
//   }
  
//   persons = persons.concat(person)
//   response.json(person)
// })
  
app.post('/api/persons', (request, response, next) => {
  const body = request.body
  
  if (body.name === undefined || body.number === undefined) {
    return response.status(400).json({ error: 'content missing' })
  }
  
  //
  const person = new Person({
    // id: generateId(),
    name: body.name,
    number: body.number || 0,
  })

  if(isNaN(parseInt(body.number))){
    throw new Error (`${body.number} is not a number`)
  } else {
    person.save().then(savedPerson => {
      response.json(savedPerson)
      console.log(savedPerson)
      // mongoose.connection.close()
    }).catch(error => next(error))
  }
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    // .then(request => {
    //   response.status(204).end()
    // })
    .catch(error => next(error))
})


app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true })
    .then(updatedPerson => {
      response.json(updatedPerson.toJSON())
    })
    .catch(error => next(error))
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}
  
app.use(unknownEndpoint)
  
const errorHandler = (error, request, response, next) => {
  console.error(error.message)
  
  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    return response.status(400).send({ error: 'malformatted id' })
  }else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  } 
  
  next(error)
}
  
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
