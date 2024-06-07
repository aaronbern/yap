import React, { useState } from 'react';
import { FaTimes } from 'react-icons/fa';
import './PollModal.css';

const PollModal = ({ isOpen, onClose, onCreate }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['']);

    const handleAddOption = () => {
        setOptions([...options, '']);
    };

    const handleOptionChange = (index, value) => {
        const newOptions = options.slice();
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleRemoveOption = (index) => {
        const newOptions = options.slice();
        newOptions.splice(index, 1);
        setOptions(newOptions);
    };

    const handleCreatePoll = () => {
        if (question && options.every(option => option)) {
            onCreate({ question, options });
            setQuestion('');
            setOptions(['']);
        }
    };

    return isOpen ? (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={e => e.stopPropagation()}>
                <h2>Create a Poll</h2>
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Poll question"
                />
                <div className="options-container">
                    {options.map((option, index) => (
                        <div key={index} className="option-container">
                            <input
                                type="text"
                                value={option}
                                onChange={(e) => handleOptionChange(index, e.target.value)}
                                placeholder={`Option ${index + 1}`}
                            />
                            {options.length > 1 && (
                                <button className="remove-option-button" onClick={() => handleRemoveOption(index)}>
                                    <FaTimes />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button onClick={handleAddOption}>Add Option</button>
                <button onClick={handleCreatePoll}>Create Poll</button>
                <button onClick={onClose} className="close-button">Close</button>
            </div>
        </div>
    ) : null;
};

export default PollModal;
