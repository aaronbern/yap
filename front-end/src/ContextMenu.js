// Context menu to support right click options
import React, { useEffect } from 'react';
import './ContextMenu.css';

const ContextMenu = ({ options, xPos, yPos, show, onClose }) => {
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (show) {
                onClose();
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [show, onClose]);

    return (
        <div
            className="context-menu"
            style={{ top: yPos, left: xPos, display: show ? 'block' : 'none' }}
        >
            {options.map((option, index) => (
                <div key={index} className="context-menu-item" onClick={option.onClick}>
                    {option.label}
                </div>
            ))}
        </div>
    );
};

export default ContextMenu;
