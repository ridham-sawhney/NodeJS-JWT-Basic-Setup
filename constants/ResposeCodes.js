const ResponseCodes = {
    SUCCESS: {
        message: 'Success',
        code:200
    },
    BAD_REQUEST: {
        message: 'Bad Request',
        code:400
    },
    UNAUTHORIZED: {
        message: 'Unauthorized',
        code:401
    },
    FORBIDDEN: {
        message: 'Forbidden',
        code:403
    },
    NOT_FOUND: {
        message: 'Not Found',
        code:404
    },
    CONFLICT: {
        message: 'Conflict',
        code:409
    },
    SERVER_ERROR: {
        message: 'Internal Server Error',
        code:500
    }
}



module.exports = {ResponseCodes};