import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
import listEndpoints from 'express-list-endpoints'
import req from 'express/lib/request'
import res from 'express/lib/response'

const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost/happyThoughts'
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise
// mongoose.set('useFindAndModify', false)

const port = process.env.PORT || 8080
const app = express()

const ThoughtSchema = new mongoose.Schema({
  message: {
    type: String,
    minlength: 5,
    maxlength: 140,
    required: true,
  },
  hearts: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
})

const Thought = mongoose.model('Thought', ThoughtSchema)

// Add middlewares to enable cors and json body parsing
app.use(cors())
app.use(express.json())

// Start defining your routes here
app.get('/', (req, res) => {
  res.send(listEndpoints(app))
  // res.send('Hello peeps here are some happy thoughts')
})

app.get('/thoughts', async (req, res) => {
  const thoughts = await Thought.find()
    .sort({ createdAt: 'desc' })
    .limit(20)
    .exec()
  res.json(thoughts)
})

app.post('/thoughts', async (req, res) => {
  const { message } = req.body
  try {
    const newThought = await new Thought({ message }).save()
    res.status(200).json({ response: newThought, success: true })
  } catch (error) {
    res.status(400).json({ response: error, success: false })
  }
})

app.post('/thoughts/:thoughtId/like', async (req, res) => {
  const { thoughtId } = req.params
  try {
    const updatedThought = await Thought.findByIdAndUpdate(
      thoughtId,
      {
        $inc: { hearts: 1 },
      },
      { new: true }
    )

    res.status(200).json({ response: updatedThought, success: true })
  } catch (error) {
    res.status(400).json({ response: error, success: false })
  }
})

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server running on http://localhost:${port}`)
})
