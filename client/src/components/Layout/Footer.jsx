import React from 'react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="app-footer">

            {/* Footer Top */}
            <div className="footer-top">

                {/* Company */}
                <div className="footer-company">
                    EGOTECHWORLD (PVT) LTD
                </div>

                {/* Contact Information */}
                <div className="footer-links">
                    <span>
                        egotechworld.com
                    </span>

                    <span>|</span>

                    <span>
                        +94 74 312 6123
                    </span>
                </div>

            </div>

            {/* Copyright */}
            <div className="footer-copyright">
                © {currentYear} EgotechWorld (Pvt) Ltd.
                All rights reserved.
            </div>

        </footer>
    );
}