const express = require("express");
const swStats = require("swagger-stats");
const app = express();

app.use(swStats.getMiddleware());

app.get("/", (req, res) => {
    res.send("Hello World!")
})

app.get("/comments", (req, res) => {
    res.send("Comments")
})


const port = 3000

app.listen(port, () => {
    console.log(`App listening on port ${port}`)
})