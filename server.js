const express = require("express")
require("dotenv").config();
const { Paystack } = require("@paystack/paystack-sdk") 

//middleware
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3500;

//Initialise the payment SDK with  your secret key from the .env file
const paystack = new Paystack(process.env.PAYSTACK_SECRET_KEY);
//POST route for initialising the payment
app.post("/pay", async(req, res) => {
    try{

        const { email, amount } = req.body;

        if(!email || !amount) {
            return res.status(400).json({
                success: false, error: "Email and amount are required"
            })
        }

        //for calling paystack to initialise the transaction (amount is multiplied by 100 to convert to kobo)
        const response = await paystack.transaction.initialize({
            email: email,
            amount: amount * 100
        });

        if(!response.status) {
            return res.status(404).json({
                success: false, error: response.message
            });
        }

        //Return the secure checkoutlink and reference to the client
        res.status(200).json({
            success: true,
            authorization_url: response.data.authorization_url,
            reference: response.data.reference
        });
    } catch(error){
        console.console.error("Paystack SDK error:", error);
        
        res.status(500).json({
            success: false, error: error.message
        })
    }
});

app.listen(PORT, () => {
    console.log(`Paystack backend server running on port ${PORT} `)
})