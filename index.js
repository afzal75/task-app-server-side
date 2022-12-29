const express = require('express');
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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

    // send tasks client
    app.get('/tasks/:email', async (req, res) => {
        const email = req.params.email
        const query = { email }
        const allTask = await taskCollection.find(query, { sort: { _id: -1 } }).toArray()
        const tasks = allTask.filter(t => !t.completed)
        res.send(tasks);
    })

    //send task client
    app.get('/task/:id', async (req, res) => {
        const id = req.params.id
        const query = { _id: ObjectId(id) }
        const task = await taskCollection.findOne(query)
        res.send(task);
    })

    //update task
    app.put('/task/:id', async (req, res) => {
        const id = req.params.id
        const task = req.body;
        const filter = { _id: ObjectId(id) };
        const updatedDoc = {
            $set: task
        }
        const result = await taskCollection.updateOne(filter, updatedDoc);
        res.send(result);
    })

    //send completed notes client
    app.get('/completed-notes/:email', async (req, res) => {
        const email = req.params.email
        const query = { email }
        const allTask = await taskCollection.find(query, { sort: { _id: -1 } }).toArray()
        const notes = allTask.filter(n => n.completed)
        res.send(notes);
    });


    // update completed situation
    app.put('/tasks/:id', async (req, res) => {
        const id = req.params.id;
        const complete = req.body;
        const filter = { _id: ObjectId(id) };
        const options = { upsert: true };
        const updatedDoc = {
            $set: complete
        }
        const result = await taskCollection.updateOne(filter, updatedDoc, options);
        res.send(result);
    });

    // delete task
    app.delete('/tasks/:id', async (req, res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id) }
        const result = await taskCollection.deleteOne(query);
        res.send(result);
    })

}


run().catch(e => console.error(e))

app.get('/', (req, res) => {
    res.send('Task app server is running')
})

app.listen(port, () => {
    console.log(`Task app server running ${port}`)
})