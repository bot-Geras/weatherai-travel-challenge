import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import  'dotenv/config' 

const app = express()
// Middleware
app.use(cors())
app.use(helmet())
app.use(express.json())



app.get('/', (req, res) => {
  res.send('Hello World')
})

app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000')
})