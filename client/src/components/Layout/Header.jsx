import React, { useEffect, useState } from 'react';
import Breadcrumb from './Breadcrumb';

export default function Header({
    breadcrumb = ['EGOTECH WORLD', 'Bill History'],
}) {
    const [currentDateTime, setCurrentDateTime] = useState('');

    useEffect(() => {
        const updateDateTime = () => {
            const now = new Date();

            const formattedDate =
                now.toLocaleDateString('en-US', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                });

            const formattedTime =
                now.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                    hour12: true,
                });

            setCurrentDateTime(
                `${formattedDate} • ${formattedTime}`
            );
        };

        // Initial update
        updateDateTime();

        // Update every second
        const timer = setInterval(
            updateDateTime,
            1000
        );

        // Cleanup
        return () => clearInterval(timer);
    }, []);

    return (
        <header className="top-header">

            {/* Breadcrumb */}
            <Breadcrumb items={breadcrumb} />

            {/* Current Date & Time */}
            <div className="header-date">
                {currentDateTime}
            </div>

        </header>
    );
}