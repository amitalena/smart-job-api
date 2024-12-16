const Razorpay = require('razorpay');

// Create instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY, // Key ID from environment
    key_secret: process.env.RAZORPAY_SECRET, // Secret Key from environment
});

// Create Order
const createOrder = async (req, res) => {
    const options = {
        amount: 50000, // amount in the smallest currency unit (e.g., paise)
        currency: 'INR',
        receipt: 'order_rcptid_11',
    };

    try {
        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).send(error);
    }
};
