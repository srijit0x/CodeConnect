const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

class CodingSessionManager extends EventEmitter {
    constructor() {
        super();
        this.sessions = {}; // store active sessions
    }

    createSession(userID) {
        // Simple validation for userID, more complex validation logic might be necessary depending on requirements
        if (!userID) throw new Error('Invalid userID');

        const sessionID = uuidv4();
        this.sessions[sessionID] = {
            users: [userID],
            edits: []
        };
        this.emit('sessionCreated', sessionID);
        return sessionID;
    }

    joinSession(sessionID, userID) {
        if (!sessionID || !userID) throw new Error('Invalid sessionID or userID');

        const session = this.sessions[sessionID];
        if (!session) {
            throw new Error('Session does not exist');
        }
        // Preventing the same user from joining the session multiple times.
        if (session.users.includes(userID)) {
            throw new Error('User already in session');
        }
        session.users.push(userID);
        this.emit('userJoined', sessionID, userID);
    }

    leaveSession(sessionID, userID) {
        if (!sessionID || !userID) throw new Error('Invalid sessionID or userID');

        const session = this.sessions[sessionID];
        if (!session) {
            throw new Error('Session does not exist');
        }
        const initialLength = session.users.length;
        session.users = session.users.filter(user => user !== userID);

        // If the filtered length is the same, the user was not in the session
        if (initialLength === session.users.length) {
            throw new Error('User not found in session');
        }

        if (session.users.length === 0) {
            delete this.sessions[sessionID];
            this.emit('sessionEnded', sessionID);
        } else {
            this.emit('userLeft', sessionID, userID);
        }
    }

    editSession(sessionID, edit) {
        if (!sessionID || !edit) throw new Error('Invalid sessionID or edit');

        const session = this.sessions[sessionID];
        if (!session) {
            throw new Error('Session does not exist');
        }
        session.edits.push(edit);
        this.emit('editMade', sessionID, edit);