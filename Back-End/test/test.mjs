import request from 'supertest';
import { expect } from 'chai';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import app from '../server.js';

describe('GET /', () => {
  it('should return status 200 and a welcome message', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.text).to.equal('Yap Chat Application');
        done();
      });
  });
});

describe('POST /polls', () => {
  it('should create a new poll', (done) => {
    const pollData = {
      question: 'What is your favorite color?',
      options: [{ text: 'Red' }, { text: 'Blue' }],
      chatRoom: '60d21b4667d0d8992e610c85' // replace with an actual chatRoom ID
    };

    request(app)
      .post('/polls')
      .send(pollData)
      .expect(201)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body).to.have.property('_id');
        expect(res.body.question).to.equal(pollData.question);
        expect(res.body.options.length).to.equal(2);
        done();
      });
  });
});

describe('POST /polls/vote/:pollId', () => {
  it('should vote on a poll option', (done) => {
    const pollId = '60d21b4667d0d8992e610c85'; // replace with an actual poll ID
    const voteData = {
      optionIndex: 0
    };

    request(app)
      .post(`/polls/vote/${pollId}`)
      .send(voteData)
      .expect(200)
      .end((err, res) => {
        if (err) return done(err);
        expect(res.body.options[0].votes).to.equal(1);
        done();
      });
  });
});

describe('Authentication Service', () => {
  describe('POST /auth/register', () => {
    it('should register a new user', (done) => {
      const userData = {
        username: 'testuser',
        email: 'testuser@example.com',
        password: 'password123'
      };

      request(app)
        .post('/auth/register')
        .send(userData)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('username', userData.username);
          expect(res.body).to.have.property('email', userData.email);
          done();
        });
    });
  });

  describe('POST /auth/login', () => {
    it('should log in a user', (done) => {
      const loginData = {
        email: 'testuser@example.com',
        password: 'password123'
      };

      request(app)
        .post('/auth/login')
        .send(loginData)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('token');
          done();
        });
    });
  });

  describe('POST /auth/logout', () => {
    it('should log out a user', (done) => {
      request(app)
        .post('/auth/logout')
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('message', 'Logged out successfully');
          done();
        });
    });
  });
});

describe('Messaging Service', () => {
  describe('POST /chat/messages', () => {
    it('should send a message', (done) => {
      const messageData = {
        chatRoomId: '60d21b4667d0d8992e610c85', // replace with an actual chatRoom ID
        text: 'Hello, this is a test message',
        senderId: '60d21b4667d0d8992e610c86' // replace with an actual user ID
      };

      request(app)
        .post('/chat/messages')
        .send(messageData)
        .expect(201)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.have.property('text', messageData.text);
          expect(res.body).to.have.property('sender');
          done();
        });
    });
  });

  describe('GET /chat/rooms/:chatRoomId/messages', () => {
    it('should fetch messages for a chat room', (done) => {
      const chatRoomId = '60d21b4667d0d8992e610c85'; // replace with an actual chatRoom ID

      request(app)
        .get(`/chat/rooms/${chatRoomId}/messages`)
        .expect(200)
        .end((err, res) => {
          if (err) return done(err);
          expect(res.body).to.be.an('array');
          done();
        });
    });
  });
});
