import React, { useState } from 'react';
import './Polls.css';

const Polls = ({ isOpen, onRequestClose, onCreate }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState([{ text: '' }]);

    const handleAddOption = () => {
        setOptions([...options, { text: '' }]);
    };

    const handleOptionChange = (index, value) => {
        const newOptions = [...options];
        newOptions[index].text = value;
        setOptions(newOptions);
    };

    const handleSubmit = () => {
        onCreate({ question, options });
        setQuestion('');
        setOptions([{ text: '' }]);
    };

    return isOpen ? (
        <div className="polls-overlay" onClick={onRequestClose}>
            <div className="polls-modal" onClick={(e) => e.stopPropagation()}>
                <h2>Create Poll</h2>
                <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Enter poll question"
                />
                {options.map((option, index) => (
                    <input
                        key={index}
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                    />
                ))}
                <button onClick={handleAddOption}>Add Option</button>
                <button onClick={handleSubmit}>Create Poll</button>
                <button onClick={onRequestClose}>Cancel</button>
            </div>
        </div>
    ) : null;
};

export default Polls;
