const express = require('express');
const app = express();
const path = require('path');
const nodemailer = require('nodemailer');
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
    cors: {
        origin: "http://127.0.0.1:4000",
        methods: ["GET", "POST"]
    }
});

const cors = require('cors');
app.use(cors());

app.use(express.json());

app.get('/', (req, resp) => {
    resp.sendFile(path.join(__dirname, 'static', 'index.html'));
});

// Socket.IO connection handling
io.on('connection', (socket) => {
    console.log('Client connected');
    socket.emit('countupdated', { count: 0 });
});

app.post('/submit1', (req, resp) => {
    const senderemail = req.body.senderemail;
    const receipentemail = req.body.receipentemail;
    const number = req.body.numberedemails;
    const pass = req.body.password;
    const subject = req.body.subject;
    const emailcontent = req.body.emailtext;

    resp.sendFile(path.join(__dirname, 'static', 'result.html'));

    let count = 1;

    // Use setInterval to schedule the mailkaro function with a delay of 10 seconds
    const intervalId = setInterval(() => {
        mailkaro(count);

        // Stop the interval after sending 1000 emails
        io.emit('countupdated',  {count} );
        if (count >= number) {
            clearInterval(intervalId);
        } else {
            count += 1;
        }
    }, 3000);

    function mailkaro(count) {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `${senderemail}`,
                pass: `${pass}`,
            },
        });

        // Email content
        const mailOptions = {
            from: `${senderemail}`,
            to: `${receipentemail}`, // Replace with the recipient's email address
            subject: `${subject} - ${count}th email`,
            text: `${emailcontent}`,
        };

        // Send the email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error:', error);
            } else {
                console.log('Email sent:', info.response)
            }
        });
    }
});

http.listen(4000, () => {
    console.log('server is active on port 4000');
});
