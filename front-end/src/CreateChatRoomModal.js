import React, { useState } from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';
import axios from 'axios';

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
        padding: '20px',
        borderRadius: '10px',
        textAlign: 'center',
    },
};

const Input = styled.input`
    padding: 10px;
    margin: 10px 0;
    width: 100%;
    box-sizing: border-box;
`;

const Button = styled.button`
    background-color: ${props => props.primary ? '#4CAF50' : '#f44336'};
    color: white;
    border: none;
    padding: 10px 20px;
    margin: 10px;
    cursor: pointer;
    border-radius: 5px;
    &:hover {
        opacity: 0.8;
    }
`;

const CreateChatRoomModal = ({ isOpen, onRequestClose, onCreate }) => {
    const [newChatRoomName, setNewChatRoomName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);

    const handleSearchUsers = () => {
        // Implement user search logic here
        axios.get(`/users/search?query=${searchQuery}`)
            .then(response => setSearchResults(response.data))
            .catch(error => console.error('Error searching users:', error));
    };

    const handleAddUser = (user) => {
        if (!selectedUsers.some(selectedUser => selectedUser._id === user._id)) {
            setSelectedUsers([...selectedUsers, user]);
        }
    };

    const handleCreateChatRoom = () => {
        onCreate(newChatRoomName, selectedUsers.map(user => user._id));
        setNewChatRoomName('');
        setSearchQuery('');
        setSearchResults([]);
        setSelectedUsers([]);
    };

    const handleKeyDown = (event, action) => {
        if (event.key === 'Enter') {
            action();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={customStyles}
            contentLabel="Create New Chat Room"
            ariaHideApp={false}
        >
            <h2>Create New Chat Room</h2>
            <Input
                type="text"
                value={newChatRoomName}
                onChange={(e) => setNewChatRoomName(e.target.value)}
                placeholder="Chat room name"
            />
            <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users"
                onKeyDown={(e) => handleKeyDown(e, handleSearchUsers)}
            />
            <Button onClick={handleSearchUsers}>Search</Button>
            <ul className="search-results">
                {searchResults.map(user => (
                    <li key={user._id}>
                        {user.displayName}
                        <Button onClick={() => handleAddUser(user)}>Add</Button>
                    </li>
                ))}
            </ul>
            <h3>Selected Users</h3>
            <ul>
                {selectedUsers.map(user => (
                    <li key={user._id}>{user.displayName}</li>
                ))}
            </ul>
            <div>
                <Button primary onClick={handleCreateChatRoom}>Create</Button>
                <Button onClick={onRequestClose}>Close</Button>
            </div>
        </Modal>
    );
};

export default CreateChatRoomModal;
