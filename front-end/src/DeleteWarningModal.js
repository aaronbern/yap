import React from 'react';
import Modal from 'react-modal';
import styled from 'styled-components';

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

const Button = styled.button`
    background-color: ${props => props.cancel ? '#ccc' : '#f44336'};
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

const DeleteWarningModal = ({ isOpen, onRequestClose, onDelete }) => {
    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={customStyles}
            contentLabel="Delete Chat Room"
            ariaHideApp={false}
        >
            <h2>Delete Chat Room</h2>
            <p>Are you sure you want to delete this chat room? This action cannot be undone.</p>
            <div>
                <Button cancel onClick={onRequestClose}>Cancel</Button>
                <Button onClick={onDelete}>Delete</Button>
            </div>
        </Modal>
    );
};

export default DeleteWarningModal;
