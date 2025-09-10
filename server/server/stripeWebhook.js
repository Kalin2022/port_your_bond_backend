"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeWebhook = void 0;
const stripeWebhook = async (req, res) => {
    try {
        // Handle Stripe webhook events
        console.log('Stripe webhook received:', req.body);
        res.json({ received: true });
    }
    catch (error) {
        console.error('Stripe webhook error:', error);
        res.status(400).json({ error: 'Webhook error' });
    }
};
exports.stripeWebhook = stripeWebhook;
