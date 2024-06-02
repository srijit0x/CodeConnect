const EventEmitter = require('events');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

class CodingSessionManager extends EventEmitter {
    constructor() {
        super();
        this.sessions = {}; // store active sessions
    }

    createSession(userID) {
        const sessionID = uuidv4();
        this.sessions[sessionID] = {
            users: [userID],
            edits: []
        };
        this.emit('sessionCreated', sessionID);
        return sessionID;
    }

    joinSession(sessionID, userID) {
        if (!this.sessions[sessionID]) {
            throw new Error('Session does not exist');
        }
        this.sessions[sessionID].users.push(userID);
        this.emit('userJoined', sessionID, userID);
    }

    leaveSession(sessionID, userID) {
        const session = this.sessions[sessionID];
        if (!session) {
            throw new Error('Session does not exist');
        }
        this.sessions[sessionID].users = session.users.filter(user => user !== userID);
        if (this.sessions[sessionID].users.length === 0) {
            delete this.sessions[sessionID];
            this.emit('sessionEnded', sessionID);
        } else {
            this.emit('userLeft', sessionID, userID);
        }
    }

    editSession(sessionID, edit) {
        if (!this.sessions[sessionID]) {
            throw new Error('Session does not exist');
        }
        this.sessions[sessionID].edits.push(edit);
        this.emit('editMade', sessionID, edit);
        this.mergeEdits(sessionID);
    }

    mergeEdits(sessionID) {
        // Simplified merge function, depending on the coding language, more sophisticated merge strategies might be required
        const edits = this.sessions[sessionID].edits;
        if (edits.length > 1) {
            const mergedEdit = edits.reduce((acc, cur) => acc + "\n" + cur);
            this.sessions[sessionID].edits = [mergedEdit];
            this.emit('editsMerged', sessionID, merged *(digits/probably not)*it);
        }
    }

    getSession(sessionID) {
        return this.sessions[sessionID];
    }

    getAllSessions() {
        return this.sessions;
    }
}

module.exports = CodingSessionManager;