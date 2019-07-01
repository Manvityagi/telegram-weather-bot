const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");

require("dotenv").config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

const telegramUrl = "https://api.telegram.org/bot" + process.env.TELEGRAM_API_TOKEN + "/sendMessage";
const openWeatherUrl = process.env.OPENWEATHER_API_URL;


app.post("/start_bot", (req, res) => {
    console.log(">>> req body is ");
    console.log(req.body);

    const { message } = req.body;
    let reply;

    if (message.text.toLowerCase().indexOf("hi") !== -1) {

        reply = "Welcome to telegram weather bot";
        sendMessage(telegramUrl, message, reply, res);
        // response ended
        // return res.send(reply);
    } else if ((message.text.toLowerCase().indexOf("check") !== -1) &&
        (message.text.toLowerCase().indexOf("/") !== -1)) {

        let city = message.text.split("/")[1];
        getForecast(city)
            .then(response => {
                reply = response;
                sendMessage(telegramUrl, message, reply, res);
                // reponse ended
                // return res.send(reply);
            });
    } else {

        reply = "request not understood, please review and try again.";
        sendMessage(telegramUrl, message, reply, res);
        // response ended
        // return res.send(reply);
    }
});


function sendMessage(url, message, reply, res) {
    axios.post(url, {
        chat_id: message.chat.id,
        text: reply
    }).then(response => {
        console.log("Reply successfully sent to Telegram");
        res.end("ok");
    }).catch(error => {
        console.log(error);
    })
}

async function getForecast(city) {
    const newUrl = openWeatherUrl + city + "&appid=" + process.env.OPENWEATHER_API_KEY;
    return await axios.get(newUrl)
        .then(response => {
            let tempInK = response.data.main.temp;
            let tempInC = Math.round(tempInK - 273.15);
            let cityName = response.data.name;
            return "It's " + tempInC + " degrees in " + cityName;
        })
        .catch(error => {
            console.log(error);
        })
}


const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log("Server listening on port " + port);
})

app.listen()