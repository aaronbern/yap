import request from 'supertest';
import { expect } from 'chai';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import app from '../server.js'; // Adjust the path if your server.js is in a different directory

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

