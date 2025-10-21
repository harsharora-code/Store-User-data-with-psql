import dotenv from "dotenv";
dotenv.config();
import { Client, Query } from "pg"
import express from 'express'
const app = express();
app.use(express.json());

const pgClient = new Client(process.env.POSTGRES_URL);

pgClient.connect();

app.post("/signup", async function(req, res) {
    const username = req.body.username;
    const passsword = req.body.passsword;
    const email = req.body.email;
    
    const city = req.body.city;
    const country = req.body.country;
    const street = req.body.street;
    const pincode = req.body.pincode;

    try {
    const insertQuery = `INSERT INTO users (username, email, passsword) VALUES ($1, $2, $3) RETURNING id;`
    const response = await pgClient.query(insertQuery, [username, email, passsword]);
    const userId = response.rows[0].id;
    const addressInsertQuery = `INSERT INTO address (city, country, street, pincode, user_id) VALUES ($1, $2, $3, $4, $5);`
    const addressInsertResponse = await pgClient.query(addressInsertQuery, [city, country, street, pincode, userId]);

    res.json({
        msg: "you have signed up"
    })
    console.log(response);
} catch(e) {
    console.log(e);
    res.status(400).json({
        msg: "error while signed up"
    })
}
})
app.get("/metadata", async function(req, res) {
    const id = req.query.id;
    const query1 = `SELECT username, email, id FROM users WHERE id=$1`;
    const response1 = await pgClient.query(query1, [id]);
    const query2 =  `SELECT * FROM address WHERE user_id=$1`;
    const response2 = await pgClient.query(query2, [id]);
    
    res.json({
        user : response1.rows[0],
        address: response2.rows
    })
})
        

app.listen(3000)