import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { FaPlus, FaPaperclip, FaTimes } from 'react-icons/fa';
import './App.css';
import ContextMenu from './ContextMenu';
import DeleteWarningModal from './DeleteWarningModal';
import CreateChatRoomModal from './CreateChatRoomModal';
import typingIndicatorGif from './typing-indicator.gif'; // Adjust the path as needed

const socket = io('http://localhost:5000');

function App() {
    const [user, setUser] = useState(null);
    const [chatRooms, setChatRooms] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedChatRoom, setSelectedChatRoom] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [participants, setParticipants] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contextMenu, setContextMenu] = useState({ show: false, xPos: 0, yPos: 0, roomId: null });
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [roomIdToDelete, setRoomIdToDelete] = useState(null);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [typingMessage, setTypingMessage] = useState('');
    const [typingUser, setTypingUser] = useState('');
    const [attachment, setAttachment] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isImageModalOpen, setIsImageModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const typingTimeoutRef = useRef(null);

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
        const handleNewMessage = (message) => {
            console.log('New message received:', message); // Debug log
            if (message.chatRoom.toString() === selectedChatRoom) {
                setMessages(prevMessages => [...prevMessages, message]);
                scrollToBottom();
            }
        };

        const handleTyping = (data) => {
            console.log('Typing event received:', data);
            if (data.chatRoomId === selectedChatRoom && data.user !== user.displayName) {
                setTypingUser(data.user);
                setTypingMessage('is yapping...');
                clearTimeout(typingTimeoutRef.current);
                typingTimeoutRef.current = setTimeout(() => {
                    setTypingMessage('');
                    setTypingUser('');
                }, 1000);
            }
        };

        socket.on('message', handleNewMessage);
        socket.on('typing', handleTyping);

        return () => {
            socket.off('message', handleNewMessage);
            socket.off('typing', handleTyping);
        };
    }, [selectedChatRoom, user]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    };

    const fetchChatRooms = () => {
        axios.get('/chat/rooms')
            .then(response => setChatRooms(response.data))
            .catch(error => console.error('Error fetching chat rooms:', error));
    };

    const fetchMessages = (chatRoomId) => {
        if (selectedChatRoom) {
            socket.emit('leaveRoom', { chatRoomId: selectedChatRoom });
        }
        setSelectedChatRoom(chatRoomId);
        socket.emit('joinRoom', { chatRoomId });
        axios.get(`/chat/rooms/${chatRoomId}/messages`)
            .then(response => {
                const orderedMessages = response.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                setMessages(orderedMessages);
                fetchParticipants(chatRoomId);
                scrollToBottom();
            })
            .catch(error => console.error('Error fetching messages:', error));
    };

    const fetchParticipants = (chatRoomId) => {
        axios.get(`/chat/rooms/${chatRoomId}/participants`)
            .then(response => setParticipants(response.data))
            .catch(error => console.error('Error fetching participants:', error));
    };

    const handleSendMessage = () => {
        if (!selectedChatRoom || !user) {
            console.error('No chat room selected or user not defined');
            return;
        }

        if (!newMessage && !attachment) {
            console.error('Either text or attachment is required');
            return;
        }

        const message = {
            chatRoomId: selectedChatRoom,
            text: newMessage,
            senderId: user._id,
            attachments: attachment ? [attachment] : []
        };

        console.log('Sending message:', message); // Debug log

        axios.post('/chat/messages', message)
            .then(response => {
                setNewMessage('');
                setAttachment(null); // Reset attachment after sending
                socket.emit('chatMessage', response.data); // Emit the message through Socket.IO
            })
            .catch(error => console.error('Error sending message:', error));
    };

    const handleTyping = () => {
        if (!selectedChatRoom) return;
        socket.emit('typing', { chatRoomId: selectedChatRoom, user: user.displayName });
    };

    const handleCreateChatRoom = (name, participants) => {
        axios.post('/chat/rooms', { name, participants })
            .then(response => {
                setChatRooms([...chatRooms, response.data]);
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
        if (!participants.some(participant => participant._id === userId)) {
            axios.post(`/chat/rooms/${selectedChatRoom}/add`, { userId })
                .then(response => {
                    setParticipants(response.data.participants);
                })
                .catch(error => console.error('Error adding participant:', error));
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleContextMenu = (event, roomId) => {
        event.preventDefault();
        setContextMenu({
            show: true,
            xPos: event.pageX,
            yPos: event.pageY,
            roomId
        });
    };

    const handleRenameChatRoom = (roomId, newName) => {
        axios.put(`/chat/rooms/${roomId}/rename`, { name: newName })
            .then(response => {
                setChatRooms(chatRooms.map(room => room._id === roomId ? response.data : room));
            })
            .catch(error => console.error('Error renaming chat room:', error));
    };

    const handleDeleteChatRoom = (roomId) => {
        axios.delete(`/chat/rooms/${roomId}`)
            .then(() => {
                setChatRooms(chatRooms.filter(room => room._id !== roomId));
                if (selectedChatRoom === roomId) {
                    setSelectedChatRoom(null);
                    setMessages([]);
                }
            })
            .catch(error => console.error('Error deleting chat room:', error));
    };

    const openDeleteModal = (roomId) => {
        setRoomIdToDelete(roomId);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setRoomIdToDelete(null);
    };

    const confirmDeleteChatRoom = () => {
        handleDeleteChatRoom(roomIdToDelete);
        closeDeleteModal();
    };

    const openAddUserModal = () => {
        setIsAddUserModalOpen(true);
    };

    const closeAddUserModal = () => {
        setIsAddUserModalOpen(false);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleKeyDown = (event, action) => {
        if (event.key === 'Enter') {
            action();
        }
    };

    const handleAttachmentClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('file', file);

            setIsUploading(true);
            setUploadProgress(0);

            axios.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            })
                .then(response => {
                    setAttachment(response.data.filePath);
                    console.log('File uploaded successfully:', response.data.filePath);
                    setIsUploading(false);
                })
                .catch(error => {
                    console.error('Error uploading file:', error);
                    setIsUploading(false);
                });
        }
    };

    const removeAttachment = () => {
        setAttachment(null);
    };

    const contextMenuOptions = [
        {
            label: 'Add User',
            onClick: () => {
                if (contextMenu.roomId) {
                    setSelectedChatRoom(contextMenu.roomId);
                    openAddUserModal();
                }
            }
        },
        {
            label: 'Rename',
            onClick: () => {
                const newName = prompt('Enter new chat room name:');
                if (newName && contextMenu.roomId) {
                    handleRenameChatRoom(contextMenu.roomId, newName);
                }
            }
        },
        {
            label: 'Delete',
            onClick: () => {
                if (contextMenu.roomId) {
                    openDeleteModal(contextMenu.roomId);
                }
            }
        }
    ];

    // Context menu for attachment options
    const handleAttachmentContextMenu = (event, attachment) => {
        event.preventDefault();
        setContextMenu({
            show: true,
            xPos: event.pageX,
            yPos: event.pageY,
            options: [
                {
                    label: 'Download',
                    onClick: () => {
                        const link = document.createElement('a');
                        link.href = `http://localhost:5000${attachment}`;
                        link.download = attachment.split('/').pop();
                        link.click();
                    }
                },
                {
                    label: 'Cancel',
                    onClick: () => setContextMenu({ ...contextMenu, show: false })
                }
            ]
        });
    };

    const handleImageClick = (attachment) => {
        setSelectedImage(`http://localhost:5000${attachment}`);
        setIsImageModalOpen(true);
    };

    const closeImageModal = () => {
        setIsImageModalOpen(false);
        setSelectedImage(null);
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
                                <li key={room._id} onContextMenu={(e) => handleContextMenu(e, room._id)} onClick={() => fetchMessages(room._id)} className={selectedChatRoom === room._id ? 'active' : ''}>{room.name}</li>
                            ))}
                            <li>
                                <button onClick={openModal} className="plus-icon">
                                    <FaPlus />
                                </button>
                            </li>
                        </ul>

                        <div className="participants">
                            <h3>Participants</h3>
                            <ul>
                                {participants.map(participant => (
                                    <li key={participant._id}>{participant.displayName}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="chat-window">
                        <h2>Messages</h2>
                        <ul className="messages-list">
                            {messages.map((msg, index) => {
                                const showSender = index === 0 || (messages[index - 1] && messages[index - 1].sender._id !== msg.sender._id);
                                const isUserMessage = msg.sender._id === user._id;
                                const messageClass = isUserMessage ? 'message-item user-message' : 'message-item participant-message';
                                return (
                                    <li key={msg._id} className={messageClass}>
                                        {showSender && <div className="message-sender">{msg.sender.displayName}</div>}
                                        <div className="message-text">{msg.text}</div>
                                        {msg.attachments && msg.attachments.map((attachment, index) => (
                                            <div
                                                key={index}
                                                className="message-attachment"
                                                onClick={() => handleImageClick(attachment)}
                                                onContextMenu={(e) => handleAttachmentContextMenu(e, attachment)}
                                            >
                                                <img src={`http://localhost:5000${attachment}`} alt="Attachment" className="attachment-preview" />
                                            </div>
                                        ))}
                                    </li>
                                );
                            })}
                            <div ref={messagesEndRef} /> {/* Ref to handle scrolling */}
                        </ul>
                        <div className="typing-indicator">
                            {typingMessage && (
                                <>
                                    <img src={typingIndicatorGif} alt="Typing indicator" />
                                    <span>{typingUser} {typingMessage}</span>
                                </>
                            )}
                        </div>
                        <div className="message-input">
                            <button className="attachment-button" onClick={handleAttachmentClick}>
                                <FaPaperclip />
                            </button>
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    handleTyping();
                                }}
                                placeholder="Type a message"
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <button onClick={handleSendMessage}>Send</button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                style={{ display: 'none' }}
                                onChange={handleFileChange}
                            />
                            {isUploading && <div className="upload-progress">Uploading... {uploadProgress}%</div>}
                            {attachment && (
                                <div className="file-preview">
                                    <img src={`http://localhost:5000${attachment}`} alt="Attachment Preview" className="attachment-thumbnail" />
                                    <button className="remove-attachment-button" onClick={removeAttachment}><FaTimes /></button>
                                </div>
                            )}
                        </div>
                    </div>

                    <CreateChatRoomModal
                        isOpen={isModalOpen}
                        onRequestClose={closeModal}
                        onCreate={handleCreateChatRoom}
                    />

                    {isAddUserModalOpen && (
                        <div className="modal-overlay">
                            <div className="modal">
                                <h2>Add User to Chat Room</h2>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search users"
                                    onKeyDown={(e) => handleKeyDown(e, handleSearchUsers)}
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
                                <button onClick={closeAddUserModal} className="close-button">Close</button>
                            </div>
                        </div>
                    )}

                    <ContextMenu
                        options={contextMenu.options || contextMenuOptions}
                        xPos={contextMenu.xPos}
                        yPos={contextMenu.yPos}
                        show={contextMenu.show}
                        onClose={() => setContextMenu({ ...contextMenu, show: false })}
                    />

                    <DeleteWarningModal
                        isOpen={isDeleteModalOpen}
                        onRequestClose={closeDeleteModal}
                        onDelete={confirmDeleteChatRoom}
                    />

                    {isImageModalOpen && (
                        <div className="modal-overlay" onClick={closeImageModal}>
                            <div className="modal">
                                <img src={selectedImage} alt="Full Size Attachment" className="full-size-image" />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default App;
