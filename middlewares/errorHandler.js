const {logEvents} = require('./logEvents');

const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    logEvents(`${err.name}: ${err.message}`, 'errLog.txt');
    res.status(500).json({ responseCode: "SERVER_ERROR", message: 'Internal Server Error' });
}
module.exports = errorHandler;