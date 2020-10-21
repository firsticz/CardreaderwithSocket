import { createServer } from 'http'
import fs from 'fs'
import path from 'path'
import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import Socket from 'socket.io'
 
const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors())

const port = process.env.PORT || 3000
const server = createServer(app)
server.listen(port)

const io = Socket(server)
//const documentPath = path.basename('C:\\Users\\PC\\Documents\\SIAM-ID\\Data.txt')
const documentPath = 'C:\\Users\\PC\\Documents\\SIAM-ID\\Data.txt'
io.on('connection', (socket) => {
  console.log('client connect')
  fs.watchFile(documentPath, (curr, prev) => {
    console.log('card read')
    fs.readFile(documentPath, 'utf-8', (err, data) => {
      if(err) throw err

      const lines = data.trim().split('\n')
      const lastline = lines.slice(-1)[0]

      const field = lastline.split(',')
      const filterdata = {
        nationalId : field[2].replace(/[" "]+/g, ''),
        // idCardPhoto
        gender: field[10] === 'ชาย' ? 'male' : 'female',
        age: field[13],
        birthdate: field[9]
      }

      io.emit('readIdCard', filterdata)
    })
    console.log('current:' +curr.mtime)
    console.log('prev:' +prev.mtime)
  })
 

})

const onError = (error) => {
  if (error.syscall !== 'listen') {
    throw error
  }
  const bind = typeof port === 'string'
    ? `Pipe ${port}`
    : `Port ${port}`
  switch (error.code) {
    case 'EACCES':
      console.error(`${bind} requires elevated privileges`)
      process.exit(1)
      break
    case 'EADDRINUSE':
      console.error(`${bind} is already in use`)
      process.exit(1)
      break
    default:
      throw error
  }
}
const onListening = () => {
  const addr = server.address()
  const bind = typeof addr === 'string'
    ? `pipe ${addr}`
    : `port ${addr.port}`
  console.info(`Listening on ${bind}`)
}
server.on('error', onError)
server.on('listening', onListening)
