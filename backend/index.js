const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')
dotenv.config()

const logger = require('./logger')
const authRoutes = require('./routes/auth')
const uploadRoutes = require('./routes/uploads')   

const swaggerUi = require('swagger-ui-express')
const swaggerSpec = require('./swagger')

const logsDir = path.join(__dirname, 'logs')
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true })

const app = express()


app.use(cors())
app.use(express.json())


app.use('/api/auth', authRoutes)
app.use('/api/uploads', uploadRoutes)   

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.get('/api/docs.json', (req, res) => res.json(swaggerSpec))


app.get('/api/ping', (req, res) => res.json({ pong: true }))

app.use((err, req, res, next) => {
  logger.error('Unhandled error: %o', err)
  res.status(500).json({ error: 'Internal server error' })
})


const PORT = process.env.PORT || 4000
app.listen(PORT, () => {
  logger.info(`Backend listening on ${PORT}`)
  console.log(`Backend listening on ${PORT}`)
})
