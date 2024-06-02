const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const passport = require('passport');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const cors = require('cors');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('./config/passport');

const Message = require('./models/message');

const app = express();
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type'],
        credentials: true
    }
});

// Middleware
app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Express session
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI }),
    cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 day session expiration
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log(err));

// Attach io to request
app.use((req, res, next) => {
    req.io = io;
    next();
});

// Routes
app.use('/auth', require('./routes/auth'));
app.use('/users', require('./routes/user_routes'));
app.use('/chat', require('./routes/chat_routes'));

// Dashboard route
app.get('/dashboard', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('http://localhost:3000');
    } else {
        res.redirect('/');
    }
});

// Home route
app.get('/', (req, res) => {
    res.send('Yap Chat Application');
});

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static('yap-chat-frontend/build'));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'yap-chat-frontend', 'build', 'index.html'));
    });
}

// Socket.IO event handling
io.on('connection', (socket) => {
    console.log('New user connected');

    socket.on('joinRoom', ({ chatRoomId }) => {
        socket.join(chatRoomId);
        console.log(`User joined room: ${chatRoomId}`);
    });
    
    socket.on('leaveRoom', ({ chatRoomId }) => {
        socket.leave(chatRoomId);
        console.log(`User left room: ${chatRoomId}`);
    });
    
    socket.on('chatMessage', async ({ chatRoomId, text, senderId }) => {
        try {
            console.log('Message received on server:', { chatRoomId, text, senderId });
            
            if (!chatRoomId || !senderId) {
                console.error('chatRoomId or senderId is undefined');
                return;
            }

            // Prevent double entry by checking message uniqueness
            const existingMessage = await Message.findOne({
                chatRoom: chatRoomId,
                sender: senderId,
                text
            });

            if (existingMessage) {
                return;
            }

            const message = new Message({
                chatRoom: new mongoose.Types.ObjectId(chatRoomId),
                sender: new mongoose.Types.ObjectId(senderId),
                text
            });

            console.log('message data before save:', message);

            await message.save();

            const populatedMessage = await Message.findById(message._id).populate('sender', 'displayName').exec();
            console.log('Emitting message to room:', chatRoomId, populatedMessage);

            io.to(chatRoomId).emit('message', populatedMessage); // Emit to all clients in the room
        } catch (err) {
            console.error('Error sending message:', err);
        }
    });

    socket.on('typing', (data) => {
        socket.to(data.chatRoomId).emit('typing', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected');
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
