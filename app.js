import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());


app.get('/', (req, res) => {
  res.sendFile('home.html', { root: '.' });
});

app.get('/login', (req, res) => {
    res.send('Login Page - To be implemented');
});

app.post('/api/register', async (req, res) => {
    try{
        console.log(req.body);
        res.status(201).send({ message: 'User registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 