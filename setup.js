const app = require('./app');
// Setup Route to render setup page
app.get('/setup', (req, res) => {
    const domain = req.query.domain || '';
    res.render('setup', { domain });
});
// app.get('/404', (req, res) => {
//     //const domain = req.query.domain || '';
//     res.render('404');
// });

app.get('/404', (req, res) => {
    // Render the 404.ejs view
    res.status(404).render('404');
});
// Setup POST Route to handle form submission
app.post('/setup', async (req, res) => {
    const {
        domain, location_id, v_location_id, logo_url, background, dark_back, side_dark_back, side_back,
        grid_back, dark_grid_back, text_light, text_dark, icon_button_back, button_bottom_border,
        company_name, company_address, heading_color
    } = req.body;

    try {
        const insertQuery = `
            INSERT INTO domain_config (
                domain, location_id, v_location_id, logo_url, background, dark_back, side_dark_back, side_back,
                grid_back, dark_grid_back, text_light, text_dark, icon_button_back, button_bottom_border,
                company_name, company_address, heading_color
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await pool.query(insertQuery, [
            domain, location_id, v_location_id, logo_url, background, dark_back, side_dark_back, side_back,
            grid_back, dark_grid_back, text_light, text_dark, icon_button_back, button_bottom_border,
            company_name, company_address, heading_color
        ]);

        res.redirect('/'); // Redirect to home or another appropriate page
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).send('Failed to save domain configuration.');
    }
});