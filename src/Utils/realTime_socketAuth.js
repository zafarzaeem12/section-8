import {joseJwtDecrypt} from './AccessTokenManagement/Tokens.js';


export const realTime_socketAuth = (io) => {
    
     io.use((socket, next) => {
        // Access the token from the query parameters
        const token = socket.handshake.query.token;

        // Validate the token using joseJwtDecrypt
        joseJwtDecrypt(token)
            .then((user) => {
                // If the token is valid, attach the user to the socket for use in event handlers
                socket.user = user;
                next();
            })
            .catch((error) => {
                console.log("ooooo",error)
                console.error('JWT token validation error:', error);
                next(new Error('Authentication error: Invalid token.'));
            });
    });
}