const express = require("express");
const app = express();
const morgan = require('morgan')

app.use(express.json());
app.use(morgan('tiny'))

morgan.token('object', (request, response) => {
    return `${JSON.stringify(request.body)}`
})

app.use(morgan(':object'))

let persons = [
  {
    id: 1,
    name: "Arto Hellas",
    number: "040-123456",
  },
  {
    id: 2,
    name: "Ada Lovelace",
    number: "39-44-5323523",
  },
  {
    id: 3,
    name: "Dan Abramov",
    number: "12-43-234345",
  },
  {
    id: 4,
    name: "Mary Poppendieck",
    number: "39-23-6423122",
  },
];

let totalPeople = persons.length;
let today = new Date();

app.get("/", (request, response) => {
  response.send("<h1>phonebook</h1>");
});

app.get("/info", (request, response) => {
  response.send(`
    <div>Phonebook has info for ${totalPeople} people</div>
    <br />
    <div>${today}</>`);
});

app.get("/api/persons/", (request, response) => {
  response.json(persons);
});

app.get("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  const person = persons.find((person) => person.id === id);

  if (person) {
    response.json(person);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/persons/:id", (request, response) => {
  const id = Number(request.params.id);
  persons = persons.filter((person) => person.id !== id);

  response.status(204).end();
});

const generateId = () => {
  const randomId = Math.floor(Math.random() * 1000000);
  let currentIds = persons.map((person) => person.id);
  if (randomId === currentIds) {
    generateId();
  } else {
    return randomId;
  }
};

app.post("/api/persons", (request, response) => {
  const body = request.body;
  let currentNames = persons.map((person) => person.name);

  if (!body.name || !body.number) {
    return response.status(400).json({
      error: "missing name or number",
    });
  } else if (currentNames.includes(body.name)) {
    return response.status(400).json({
      error: "name must be unique",
    });
  } else {
    const person = {
      name: body.name,
      number: body.number,
      id: generateId(),
    };
    persons = persons.concat(person);

    response.json(person);
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
