const dotenv = require("dotenv");

dotenv.config({ path: ".env" });

var coinbase = require('coinbase-commerce-node');
var Client = coinbase.Client;
var resources = coinbase.resources;
var webhook = coinbase.Webhook
 
var clientObj = Client.init(process.env.COINBASE_API);
clientObj.setRequestTimeout(3000);




    module.exports.verify = async  (req, res, buf) => {
        const url = req.originalUrl;
        if(url.startWith("/api/webhook")){
            req.rawBody = buf.toString();
        }
    }


module.exports.deposit = async (req, res) => {

    const {amount, currency } = req.body;
    
    let charge;

    try {
        const charge = await resources.Charge.create({
            name : "Complex Trading",
            description: "Make a Deposit",
            local_price: {
                amount: amount,
                currency: currency,
            },
            pricing_type: "fixed_price",
            metadata: {
                userId: "345"
            },
        })

        res.status(200).json({
            charge: charge
        })
        
    } catch (error) {
        
        res.status(500).json({
            error: error
        })
    }

}


module.exports.webhook = async (req, res) => {
    try {
        
        const event = webhook.verifyEventBody(
            req.rawBody,
            req.headers["x-cc-webhook-signature"],
            process.env.COINBASE_WEBHOOK_SECRET
            );
    
            if(event.type === "charge:confirmed") {
                let amount = event.data.pricing.local.amount;
                let currency = event.data.pricing.local.currency;
                let user_id = event.data.userId;
    
                console.log(amount, currency, user_id)
            }
            res.status(200).json({message: "Sucesssful"})
    } catch (error) {
        res.status(500).json({
            error: error
        })
    }


}