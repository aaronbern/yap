import request from 'supertest';
import { expect } from 'chai';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { default: mongoose } = require('mongoose');
const { default: app } = require('../server.js'); 

let server;

before((done) => {
    const PORT = process.env.TEST_PORT || 5001;
    server = app.listen(PORT, () => {
        console.log(`Test server running on port ${PORT}`);
        done();
    });
});

after((done) => {
    server.close(() => {
        console.log('Test server closed');
        mongoose.connection.close(done);
    });
});

describe('GET /', () => {
  it('should return status 200 and a welcome message', (done) => {
    request(server)
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
      chatRoom: '665bd9663e417cb0c9a0b613' // replace with an actual chatRoom ID
    };

    request(server)
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
    const pollId = '665bd9663e417cb0c9a0b615'; // replace with an actual poll ID
    const voteData = {
      optionIndex: 0
    };

    request(server)
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

      request(server)
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

      request(server)
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
      request(server)
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
        chatRoomId: '665bd9663e417cb0c9a0b613', // replace with an actual chatRoom ID
        text: 'Hello, this is a test message',
        senderId: '665bd9663e417cb0c9a0b614' // replace with an actual user ID
      };

      request(server)
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
      const chatRoomId = '665bd9663e417cb0c9a0b613'; // replace with an actual chatRoom ID

      request(server)
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
