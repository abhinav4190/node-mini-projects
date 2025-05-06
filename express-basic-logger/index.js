const express = require("express");
const app = express();

let totalRequests = 0;

function logIncomingRequest(req, res, next) {
    const method = req.method;
    const url = req.url;
    const time = new Date().toLocaleString();

    totalRequests += 1;

    req.totalRequests = totalRequests;

    console.log({
        "Request Method": method,
        "Request URL": url,
        "Request Time": time,
    });

    next();
}

app.use(logIncomingRequest);

app.get('/', (req, res) => {
    res.send("Check the console for logs, or visit the '/totalReq' route to see the total number of requests.");

});

app.get('/totalReq', (req, res) => {
    res.json({ totalRequests: req.totalRequests });
});

app.listen(3001, () => {
    console.log('Server is running on port 3001');
});
