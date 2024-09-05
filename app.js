require('dotenv').config();

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const bodyParser = require('body-parser');
const { sequelize } = require('./models');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(cors());

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));


io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('joinRoom', (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});


app.use('/api/users', require('./routes/authRoutes'));
app.use('/api/messages', require('./routes/messageRoutes')(io));

app.use('/api/groups', require('./routes/groupRoutes'));


const port = 9000;
const localIpAddress = getLocalIpAddress();

if (process.env.NODE_ENV !== 'test') {
  sequelize
    .sync()
    .then(() => {
      app.listen(port, localIpAddress, () => {
        console.log(`Server running at http://${localIpAddress}:${port}`);
      });
    })
    .catch((err) => {
      console.error('Unable to connect to the database:', err);
    });
}

function getLocalIpAddress() {
  const interfaces = require('os').networkInterfaces();
  for (const interfaceName in interfaces) {
    const networkInterface = interfaces[interfaceName];
    for (const address of networkInterface) {
      if (address.family === 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }
  return 'localhost';
}

module.exports = app; 