const express = require('express');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());



app.get('/', (req, res) => {
    res.send('plese use these URL to get all data & filtered data : <br> server name /data  <br>  Server name /data?filters=[{"id":"bE2Bo4cGUv49cjnqZ4UnkW","condition":"equals","value":"Johnny"}]');
});
app.get('/data', async (req, res) => {
    try {
        // const { formId } = req.params;
        const { filters } = req.query;
        const apiKey = 'sk_prod_TfMbARhdgues5AuIosvvdAC9WsA5kXiZlW8HZPaRDlIbCpSpLsXBeZO7dCVZQwHAY3P4VSBPiiC33poZ1tdUj2ljOzdTCCOSpUZ_3912';
        const apiUrl = `https://api.fillout.com/v1/api/forms/cLZojxk94ous/submissions`;

        const response = await axios.get(apiUrl, {
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        if (!filters) {
            //return res.status(400).json({ error: 'filters are required.' });
            // Fetch responses from Fillout.com API if no filters applied
                res.json({
                    responses: response.data.responses,
                    totalResponses: response.data.totalResponses,
                    pageCount: response.data.pageCount
                });
        }else{

        // Parse the filters JSON string
        const parsedFilters = JSON.parse(filters);
        // Filter responses based on filter clauses
        const filteredResponses = response.data.responses.filter(response => {
            return parsedFilters.every(filter => {
                const question = response.questions.find(question => question.id === filter.id);
                if (!question) return false; // question not found

                // Apply filter condition
                switch (filter.condition) {
                    case 'equals':
                        return question.value === filter.value;
                    case 'does_not_equal':
                        return question.value !== filter.value;
                    case 'greater_than':
                        return question.value > filter.value;
                    case 'less_than':
                        return question.value < filter.value;
                    default:
                        return false;
                }
            });
        });

        res.json({
            responses: filteredResponses,
            totalResponses: response.data.totalResponses,
            pageCount: response.data.pageCount
        });

      }
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});