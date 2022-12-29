const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middle wares
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f7wnwq6.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri)
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run() {
    const userCollection = client.db('taskApp').collection('users')
    const taskCollection = client.db('taskApp').collection('tasks')
    // const commentCollection = client.db('netBooks').collection('comment')

    // add user data
    app.post('/users', async (req, res) => {
        const newUser = req.body;
        const query = { email: newUser.email }
        const user = await userCollection.findOne(query);
        if (!user) {
            const result = await userCollection.insertOne(newUser)
            return res.send(result)
        }
        res.send({ message: 'already store data' })
    })

    // add tasks
    app.post('/tasks', async (req, res) => {
        const task = req.body;
        const result = await taskCollection.insertOne(task);
        res.send(result)
    })

    // send notes client
    app.get('/tasks/:email', async (req, res) => {
        const email = req.params.email
        const query = { email }
        const allTask = await taskCollection.find(query, { sort: { _id: -1 } }).toArray()
        const tasks = allTask.filter(t => !t.completed)
        res.send(tasks);
    })
    //send note client
    app.get('/note/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: ObjectId(id) }
        const note = await noteCollection.findOne(query)
        res.send(note);
    })


}


run().catch(e => console.error(e))

app.get('/', (req, res) => {
    res.send('Task app server is running')
})

app.listen(port, () => {
    console.log(`Task app server running ${port}`)
})