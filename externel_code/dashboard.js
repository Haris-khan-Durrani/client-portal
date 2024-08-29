const express = require('express');
const router = express.Router();

// The shared data object to hold data across routes
const sharedData = require('../sharedData');

// The function to generate HTML content
function generateHtmlContent(contacts) {
    let htmlContent = '<div>';
    contacts.forEach(contact => {
        htmlContent += `<div><h2>${contact.contactName}</h2></div>`;
    });
    htmlContent += '</div>';
    return htmlContent;
}

// The /dashboard route
router.get('/dashboard', (req, res) => {
    if (!sharedData['latest']) {
        const socket = require('../socket'); // Import socket from a common module
        socket.emit('contact', {
            query1: req.session.user,
            query2: process.env.LOCATION_ID,
            query3: 10,
        });

        socket.once('searchResult', (data) => {
            if (data.error) {
                console.error('Socket.IO Error:', data.error);
                res.status(500).send('An error occurred.');
            } else {
                sharedData['latest'] = data.contacts;
                const htmlContent = generateHtmlContent(sharedData['latest']);
                res.render('dashboard', {
                    title: 'Dashboard',
                    user: req.session.user,
                    logo: process.env.LOGO_URL,
                    lid: process.env.LOCATION_ID,
                    theme: req.client.theme,
                    contacts: htmlContent,
                });
            }
        });
    } else {
        const htmlContent = generateHtmlContent(sharedData['latest']);
        res.render('dashboard', {
            title: 'Dashboard',
                    user: req.session.user,
                    logo: process.env.LOGO_URL,
                    lid: process.env.LOCATION_ID,
                    theme: req.client.theme,
                    contacts: htmlContent,
        });
    }
});

module.exports = router; // Export the router
