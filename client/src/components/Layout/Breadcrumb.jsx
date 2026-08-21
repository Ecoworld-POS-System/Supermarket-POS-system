import React from 'react';

export default function Breadcrumb({
    items = ['EGOTECH WORLD', 'Bill History'],
}) {
    return (
        <nav
            className="breadcrumb"
            aria-label="Breadcrumb"
        >
            {items.map((item, index) => (
                <React.Fragment
                    key={`${item}-${index}`}
                >

                    {/* Breadcrumb Item */}
                    <span
                        className={
                            index === items.length - 1
                                ? 'active-crumb'
                                : 'breadcrumb-crumb'
                        }
                    >
                        {item}
                    </span>

                    {/* Separator */}
                    {index < items.length - 1 && (
                        <span className="breadcrumb-separator">
                            /
                        </span>
                    )}

                </React.Fragment>
            ))}
        </nav>
    );
}