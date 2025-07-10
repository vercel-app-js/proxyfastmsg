const express = require('express');
const axios = require('axios');
const qs = require('qs'); // Импортируем библиотеку qs для сериализации

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.all('*', async (req, res) => {
    const url = `https://api.dkon.app${req.originalUrl}`;

    try {
        const response = await axios({
            method: req.method, // Используем метод запроса клиента
            url: url,
            headers: {
                ...req.headers,
                host: 'api.dkon.app',
                'Content-Type': 'application/x-www-form-urlencoded' // Устанавливаем заголовок Content-Type
            },
            data: req.method === 'POST' ? qs.stringify(req.body) : undefined, // Сериализуем тело для POST-запросов
            responseType: 'arraybuffer' 
        });

        // Устанавливаем заголовки ответа
        Object.entries(response.headers).forEach(([key, value]) => {
            res.setHeader(key, value);
        });

        // Отправляем ответ клиенту
        res.status(response.status).send(response.data);
    } catch (error) {
        console.error('Error occurred:', error.response ? error.response.data : error.message);
        res.status(error.response ? error.response.status : 500).send({
            message: error.message,
            details: error.response ? error.response.data : 'No additional details'
        });
    }
});

module.exports = app;
