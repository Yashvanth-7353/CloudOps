const crypto = require('crypto');

const verifyGitHubWebhook = (req, res, next) => {
    const signature = req.headers['x-hub-signature-256'];
    const payload = JSON.stringify(req.body);
    const secret = process.env.WEBHOOK_SECRET;

    if (!signature) {
        return res.status(401).send('No signature found');
    }

    const hmac = crypto.createHmac('sha256', secret);
    const digest = Buffer.from('sha256=' + hmac.update(payload).digest('hex'), 'utf8');
    const checksum = Buffer.from(signature, 'utf8');

    if (checksum.length !== digest.length || !crypto.timingSafeEqual(digest, checksum)) {
        return res.status(401).send('Request signature mismatch');
    }

    next();
};

module.exports = verifyGitHubWebhook;