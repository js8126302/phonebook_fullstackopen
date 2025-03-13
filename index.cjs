const express = require('express')
const morgan = require('morgan')
const app = express()
const dotenv = require('dotenv')
const cors = require('cors')
const {databaseConnection, Person} = require('./mongo.cjs')

app.use(morgan('tiny'))
app.use(express.json())
dotenv.config()
app.use(cors())
app.use(express.static('dist'));



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



//database connection
databaseConnection()

//api routes

app.route('/')
   .get((request, response) => {
  response.send('<h1>Hello Word</h1>')
})


//get json response of the list of all persons
app.route('/api/persons')
  .get(getRouteLogger, (request, response) => {
    Person.find({})
      .then(persons => {
        if (persons.length > 0) { // Check if there are persons
          persons.map(person => {
            console.log(`id: ${person.id} name: ${person.name} number: ${person.number}`);
          });
          return response.json(persons); // Send the persons data as a JSON response
        }
        return response.status(404).json({ message: 'Phonebook is not found' }); // Handle case when no persons are found
      })
      .catch(error => response.status(500).json({ message: 'Error finding note', error })); // Catch any error during the database query
  });

//request to info to respond with time stamp and length of the persons array
app.route('/api/info')
   .get((request, response) => {
    Person.countDocuments({})
          .then(result => {
      return response.send(
         `<p>Phonebook has info for ${result} people</p>
        <p> ${new Date()}</p>`)
    })    .catch(error => {
      console.error(`Error counting documents`, error)
      return response.status(500).send(`Error counting contacts`)
   })
    
   })

//access individual resource
const mongoose = require('mongoose');

app.route('/api/persons/:id')
  .get((request, response) => {
    const id = request.params.id;

    // Ensure the id is in a valid ObjectId format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return response.status(400).json({ message: 'Invalid ID format' });
    }

    // Use findById, which automatically handles ObjectId conversion
    Person.findById(id)
      .then(person => {
        if (!person) {
          return response.status(404).json({ message: `Contact with id ${id} is not found` });
        }
        return response.json(person);
      })
      .catch(error => {
        console.error(error);
        return response.status(500).json({ message: 'Error retrieving contact' });
      });
  });

// delete resource 
app.route('/api/persons/:id')
   .delete((request, response) => {
  const id = request.params.id
  Person.findByIdAndDelete(id)
        .then(deletedPerson => {
          if (!deletedPerson) {
            return response.status(404).json({message: `Person with id: ${id} is not found`})
          }
          console.log(`Person ${deletedPerson.name} has been removed from contact`)
          return response.status(204).end()
          
        })
        .catch(error => console.log(`Error deleting person with ${id}`))
 


})

// add a new contact to phonebook

app.route('/api/persons')
   .post(postRouteLogger, (request, response, next) => {
    // check if input fields are empty
    const { name, number } = request.body
    if (!name || !number) {
        return response.status(400).json({message: "Name and number are required"})
    }
    const person = new Person({
      name: name,
      number: number
    })
    person.save().then((savedPerson) => {
      console.log(savedPerson)
      return response.send(savedPerson)

    }).catch(error => next(error))
  })


  //updating contact phone number
  app.route('/api/persons/:id')
  .put((request, response, next) => {
    const { name, number } = request.body;
    const id = request.params.id;

    // Updated person object
    const updatedPerson = { name, number };

    Person.findByIdAndUpdate(id, updatedPerson, { new: true, runValidators: true })
      .then(person => {
        if (!person) {
          return response.status(404).json({ message: `Person with ID ${id} not found` });
        }
        response.json(person);
      })
      .catch(error => next(error)); // Pass errors to Express error handler
  });
 

  const unknownEndpoint = (request, response) => {
    response.status(404).send({ error: 'unknown endpoint' })
  }
  app.use(unknownEndpoint)

  const handleErrors = (error, request, response, next) => {
    console.log(error.message)
    if (error.name === 'CastError'){
      return response.status(400).send({})
    } else if (error.name === 'ValidationError'){
      return response.status(400).json({ error: error.message })
    }
    next()
  }

  app.use(handleErrors)






const PORT = process.env.PORT || 3001;
app.listen(PORT)
console.log(`Server running on port ${PORT}`)
