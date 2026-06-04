import rateLimit from 'express-rate-limit';
import 'dotenv/config';

const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX) || 30, // limit each IP to 30 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, 
    legacyHeaders: false, 
});

const aiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 60000, // 1 minute
    max: parseInt(process.env.RATE_LIMIT_MAX) || 5, // limit each IP to 5 requests per windowMs
    message: 'Too many AI advice requests from this IP, please try again later.',

});


export{
    limiter as apiLimiter,
    aiLimiter
}