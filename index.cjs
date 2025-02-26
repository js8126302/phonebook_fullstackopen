const express = require('express')
const morgan = require('morgan')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')

app.use(morgan('tiny'))
app.use(express.json())
dotenv.config()
app.use(cors())
app.use(express.static('public'));

morgan.token('body', (request, response) => JSON.stringify(request.body))

const logFormat = ':method :url :status :res[content-length] - :response-time :body'
const postRouteLogger = morgan(logFormat)

const getRouteLogger = (request, response, next) => {
 console.log(`
 \n ------\n
  Method: ${request.method}
  Route: ${request.url}
  Time: ${new Date().toDateString()}
  \n ------ \n
  `)
  
  next()
}

let persons = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    },
    { 
      "id": "5",
      "name": "Magaret Mitchell", 
      "number": "213-458-12-12"
    }
]

app.route('/')
   .get((request, response) => {
  response.send('<h1>Hello Word</h1>')
})

//get json response of the list of all persons
app.route('/api/persons')
   .get(getRouteLogger, (request, response) => {
  response.json(persons)
})

//request to info to respond with time stamp and length of the persons array
app.route('/api/info')
   .get((request, response) => {
    response.send(
        `<p>Phonebook has info for ${persons.length} people</p>
        <p> ${new Date()}</p>
        `)
   })

//access individual resource
app.route('/api/persons/:id')
   .get((request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if (!person) {
     return response.send(`Contact with id ${id} is not found`)
    }
    return response.json(person)
   })

// delete resource 
app.route('/api/persons/:id')
   .delete((request, response) => {
  const id = request.params.id
  const person = persons.find(person => person.id === id)
  if (!person) {
    return response.status(404).json({ message: `Person with ID ${id} not found` });
  }

  persons = persons.filter(person => person.id !== id); // Remove person
  response.status(200).json({ message: `${person.name} was removed from phonebook` });

})

// add a new contact to phonebook

app.route('/api/persons')
   
   .post(postRouteLogger, (request, response) => {
    // check if input fields are empty
    const {name, number} = request.body
    if (!name || !number) {
        return response.status(400).json({message: "Name and number are required"})
    }
    //check if entry already exists
    const existingPerson = persons.find(persons => persons.name === name)
    if(existingPerson) {
        return response.status(409).json({message: `Contact ${name} is already exists`})
    }

    const newId = Math.floor(Math.random() * 1001)
    const newPerson = {
        id: newId,
        name,
        number
    }
    
    persons.push(newPerson)
    response.status(201).json(newPerson)
   })
   








const PORT = process.env.PORT || 3001;
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
