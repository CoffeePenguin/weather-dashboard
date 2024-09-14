import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json());

const WEATHER_API_URL = 'https://weather.tsukumijima.net/api/forecast/city/130010'; // 東京のデータ

let lastMotionDetected: Date | null = null;

app.post('/motion-detected', (req, res) => {
    lastMotionDetected = new Date();
    res.sendStatus(200);
});

app.get('/weather', async (req, res) => {
    try {
        const response = await axios.get(WEATHER_API_URL);
        const weatherData = response.data;
        const todayForecast = weatherData.forecasts[0]; // 今日の予報
        const tomorrowForecast = weatherData.forecasts[1]; // 明日の予報

        res.json({
            weather: {
                date: todayForecast.date,
                dateLabel: todayForecast.dateLabel,
                telop: todayForecast.telop,
                description: weatherData.description.text,
                temperature: {
                    max: tomorrowForecast.temperature.max?.celsius || "N/A",
                    min: tomorrowForecast.temperature.min?.celsius || "N/A"
                },
                chanceOfRain: todayForecast.chanceOfRain,
                image: todayForecast.image
            },
            tomorrow: {
                date: tomorrowForecast.date,
                dateLabel: tomorrowForecast.dateLabel,
                telop: tomorrowForecast.telop,
                temperature: {
                    max: tomorrowForecast.temperature.max?.celsius || "N/A",
                    min: tomorrowForecast.temperature.min?.celsius || "N/A"
                },
                chanceOfRain: tomorrowForecast.chanceOfRain
            },
            lastMotionDetected
        });
    } catch (error) {
        console.error('Error fetching weather data:', error);
        res.status(500).json({ error: '気象データの取得に失敗しました' });
    }
});

const PORT = 3001;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`サーバーがポート${PORT}で起動しました`);
});
