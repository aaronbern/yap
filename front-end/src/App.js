import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaPlus } from 'react-icons/fa';
import './App.css'; // Ensure this import is present to apply CSS

function App({ socket }) {
    const [user, setUser] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedChatRoom, setSelectedChatRoom] = useState(null);
    const [newChatRoomName, setNewChatRoomName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        axios.get('/auth/user')
            .then(response => {
                setUser(response.data);
                if (response.data) {
                    fetchChatRooms();
                }
            })
            .catch(error => console.error('Error fetching user:', error));
    }, []);

    useEffect(() => {
        socket.on('message', (message) => {
            if (message.chatRoom === selectedChatRoom) {
                setMessages((prevMessages) => [...prevMessages, message]);
            }
        });

        return () => {
            socket.off('message');
        };
    }, [selectedChatRoom, socket]);

    const fetchChatRooms = () => {
        axios.get('/chat/rooms')
            .then(response => setChatRooms(response.data))
            .catch(error => console.error('Error fetching chat rooms:', error));
    };

    const fetchMessages = (chatRoomId) => {
        setSelectedChatRoom(chatRoomId);
        socket.emit('joinRoom', { chatRoomId });

        axios.get(`/chat/rooms/${chatRoomId}/messages`)
            .then(response => {
                const orderedMessages = response.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                setMessages(orderedMessages);
            })
            .catch(error => console.error('Error fetching messages:', error));
    };

    const handleSendMessage = () => {
        if (!selectedChatRoom) {
            console.error('No chat room selected');
            return;
        }

        const message = { chatRoomId: selectedChatRoom, text: newMessage, senderId: user._id };

        socket.emit('chatMessage', message);

        setNewMessage('');
    };

    const handleCreateChatRoom = () => {
        axios.post('/chat/rooms', { name: newChatRoomName, participants })
            .then(response => {
                setChatRooms([...chatRooms, response.data]);
                setNewChatRoomName('');
                setParticipants([]);
                setIsModalOpen(false);
            })
            .catch(error => console.error('Error creating chat room:', error));
    };

    const handleSearchUsers = () => {
        axios.get(`/users/search?query=${searchQuery}`)
            .then(response => setSearchResults(response.data))
            .catch(error => console.error('Error searching users:', error));
    };

    const handleAddParticipant = (userId) => {
        if (!participants.includes(userId)) {
            setParticipants([...participants, userId]);
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setNewChatRoomName('');
        setParticipants([]);
    };

    return (
        <div className="App">
            {!user ? (
                <div className="login-container">
                    <h1>Welcome to Yap Chat</h1>
                    <a href="http://localhost:5000/auth/google" className="login-button">Login with Google</a>
                </div>
            ) : (
                <div className="chat-container">
                    <div className="sidebar">
                        <h2>Hello, {user.displayName}</h2>
                        <button className="logout-button" onClick={() => axios.get('/auth/logout').then(() => setUser(null))}>Logout</button>

                        <h3>Chat Rooms</h3>
                        <ul className="chat-room-list">
                            {chatRooms.map(room => (
                                <li key={room._id} onClick={() => fetchMessages(room._id)} className={selectedChatRoom === room._id ? 'active' : ''}>{room.name}</li>
                            ))}
                            <li>
                                <button onClick={openModal} className="plus-icon">
                                    <FaPlus />
                                </button>
                            </li>
                        </ul>

                        <div className="search-users">
                            <h3>Search Users to Add</h3>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search users"
                            />
                            <button onClick={handleSearchUsers}>Search</button>
                            <ul className="search-results">
                                {searchResults.map(user => (
                                    <li key={user._id}>
                                        {user.displayName}
                                        <button onClick={() => handleAddParticipant(user._id)}>Add</button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="chat-window">
                        <h2>Messages</h2>
                        <ul className="messages-list">
                            {messages.map((msg, index) => {
                                const showSender = index === 0 || (messages[index - 1] && messages[index - 1].sender._id !== msg.sender._id);
                                return (
                                    <li key={msg._id} className={`message-item ${showSender ? 'new-sender' : ''}`}>
                                        {showSender && <div className="message-sender">{msg.sender.displayName}</div>}
                                        <div className="message-text">{msg.text}</div>
                                    </li>
                                );
                            })}
                        </ul>
                        <div className="message-input">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message"
                            />
                            <button onClick={handleSendMessage}>Send</button>
                        </div>
                    </div>

                    {isModalOpen && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h2>Create New Chat Room</h2>
                                <input
                                    type="text"
                                    value={newChatRoomName}
                                    onChange={(e) => setNewChatRoomName(e.target.value)}
                                    placeholder="Chat room name"
                                />
                                <div className="search-users-modal">
                                    <h3>Search Users to Add</h3>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search users"
                                    />
                                    <button onClick={handleSearchUsers}>Search</button>
                                    <ul className="search-results">
                                        {searchResults.map(user => (
                                            <li key={user._id}>
                                                {user.displayName}
                                                <button onClick={() => handleAddParticipant(user._id)}>Add</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <button onClick={handleCreateChatRoom} className="create-button">Create</button>
                                <button onClick={closeModal} className="close-button">Close</button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;
