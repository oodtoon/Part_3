import { useState, useEffect } from 'react'
import personService from './services/persons'


const Notification = ({ message }) => {
  if (message === null) {
    return null
  }
  return (
    <div className='success'>{message}</div>
  )
}

const ErrorNotification = ({ message }) => {
  if (message === null) {
    return null
  }
  return (
    <div className='error'>{message}</div>
  )
}

const Person = ({ person, handleDelete }) => {
  return (
    <li>
      {person.name} {person.number} <button onClick={handleDelete}>Delete</button>
    </li>
  )
}

const Filter = (props) => {
  return (
    <div>
      <form>
        filter shown with
        <input value={props.filterdPerson}
          onChange={props.handleChange}
          onKeyDown={props.setFilter} />
      </form>
    </div>
  )
}

const Form = (props) => {
  return (
    <form onSubmit={props.addName}>
      <div>
        <Field label="Name" value={props.newName} handleChange={props.nameChange} />
      </div>
      <div>
        <Field label="Number" value={props.newNumber} handleChange={props.numberChange} />
      </div>
      <div>
        <button type="submit">add</button>
      </div>
    </form>
  )

}

const Field = ({ label, value, handleChange }) => {
  return (
    <label>
      {label}:
      <input value={value}
        onChange={handleChange}
      />
    </label>

  )

}


const App = () => {
  const [persons, setPersons] = useState([
    { name: 'Arto Hellas', number: '040-123456', id: 1 },
  ])

  const [newName, setNewName] = useState('a new name...')
  const [newNumber, setNewNumber] = useState('a new number...')
  const [filterdPerson, setFilteredPerson] = useState('')
  const [successMessage, setSuccessMessage] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)


  useEffect(() => {
    console.log('effect')
    personService
      .getAll()
      .then(response => {
        setPersons(response.data)
      })

  }, [])

  const addName = (event) => {
    event.preventDefault()
    const nameObject = {
      name: newName,
      number: newNumber,
      id: persons.length + 1,
    }


    const existingNames = persons.map(person => person.name)
    const existingNumbers = persons.map(person => person.number)

    const newPerson = { name: newName, number: newNumber }
    const foundPerson = persons.find(person => person.name === newName)


    if (existingNames.includes(newName) && existingNumbers.includes(newNumber)) {
      alert(`${newName} is already added to the phonebook`)
    }
    else if (existingNames.includes(newName) && !existingNumbers.includes(newNumber)) {
      if (window.confirm(`${newName} already exists in this phonebook. Do you want to replace their number?`)) {
        personService
          .update(foundPerson.id, newPerson)
          .then(returnedPerson => {
            setPersons(persons.map(person => person.id === returnedPerson.id ? returnedPerson : person
            )
            )


            setSuccessMessage(`Added ${newNumber} for ${newName}`)
            setTimeout(() => {
              setSuccessMessage(null)
            }, 5000)

          })
          .catch(error => setErrorMessage(`Information of ${newName} was already removed from the server`))
        setTimeout(() => { setErrorMessage(null) }, 5000)
      }

    }
    else {
      personService
        .create(nameObject)
        .then(response => {
          setPersons(persons.concat(response.data))

          setSuccessMessage(`Added ${newName}`)
          setTimeout(() => {
            setSuccessMessage(null)
          }, 5000)

        })

    }
  }



  const handleNameChange = (event) => {
    setNewName(event.target.value)
  }

  const handleNumberChange = (event) => {
    setNewNumber(event.target.value)
  }

  const handleFilterChange = (event) => {
    setFilteredPerson(event.target.value)
  }

  const handleDelete = (name, id) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      personService
        .remove(id)
        .then(() => {
          setPersons(persons.filter(person => person.id !== id))
        })

    }
  }


  const matchingPersons = persons.filter(person => person.name.toLowerCase().includes(filterdPerson.toLowerCase()))



  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={successMessage} />
      <ErrorNotification message={errorMessage} />
      <Filter filterdPerson={filterdPerson} handleChange={handleFilterChange}
      />
      <h2>add a new</h2>
      <Form addName={addName} nameChange={handleNameChange} numberChange={handleNumberChange} />
      <h2>Numbers</h2>

      <ul id="persons-list">
        {matchingPersons.map(person =>
          <Person key={person.id}
            person={person}
            handleDelete={() => handleDelete(person.name, person.id)} />
        )}
      </ul>


    </div>
  )
}

export default App;
