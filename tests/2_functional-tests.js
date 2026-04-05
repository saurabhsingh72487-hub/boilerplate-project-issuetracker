const chaiHttp = require('chai-http');
const chai = require('chai');
const server = require('../server');

chai.use(chaiHttp);
const assert = chai.assert;

suite('Functional Tests', function() {
  this.timeout(15000);
  
  let testProject = 'test';

  suite('Routing tests', function() {
    suite('POST /api/issues/{project} with every field', function() {
      test('complete POST', function(done) {
        chai.request(server)
          .post(`/api/issues/${testProject}`)
          .send({
            issue_title: 'Title',
            issue_text: 'Text',
            created_by: 'Creator',
            assigned_to: 'Assignee',
            status_text: 'Status'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Title');
            assert.equal(res.body.issue_text, 'Text');
            assert.equal(res.body.created_by, 'Creator');
            assert.equal(res.body.assigned_to, 'Assignee');
            assert.equal(res.body.status_text, 'Status');
            assert.isTrue(res.body.open);
            assert.property(res.body, '_id');
            done();
          });
      });
    });
    
    suite('POST /api/issues/{project} with only required fields', function() {
      test('POST with only required fields', function(done) {
        chai.request(server)
          .post(`/api/issues/${testProject}`)
          .send({
            issue_title: 'Title',
            issue_text: 'Text',
            created_by: 'Creator'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Title');
            assert.equal(res.body.issue_text, 'Text');
            assert.equal(res.body.created_by, 'Creator');
            assert.equal(res.body.assigned_to, '');
            assert.equal(res.body.status_text, '');
            assert.isTrue(res.body.open);
            done();
          });
      });
    });
    
    suite('POST /api/issues/{project} with missing fields', function() {
      test('missing required fields', function(done) {
        chai.request(server)
          .post(`/api/issues/${testProject}`)
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'required field(s) missing');
            done();
          });
      });
    });
    
    suite('GET /api/issues/{project} returns all issues', function() {
      test('GET all issues', function(done) {
        chai.request(server)
          .get(`/api/issues/${testProject}`)
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
          });
      });
    });
    
    suite('GET /api/issues/{project} with one filter', function() {
      test('GET with one filter', function(done) {
        chai.request(server)
          .get(`/api/issues/${testProject}`)
          .query({ open: true })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
          });
      });
    });
    
    suite('PUT /api/issues/{project} one field', function() {
      test('update one field', function(done) {
        chai.request(server)
          .post(`/api/issues/${testProject}`)
          .send({
            issue_title: 'Title1',
            issue_text: 'Text1',
            created_by: 'Creator1'
          })
          .end(function(err, res) {
            const issueId = res.body._id;
            chai.request(server)
              .put(`/api/issues/${testProject}`)
              .send({ _id: issueId, issue_title: 'Updated Title' })
              .end(function(err2, res2) {
                assert.equal(res2.status, 200);
                assert.equal(res2.body.result, 'successfully updated');
                done();
              });
          });
      });
    });
    
    suite('PUT /api/issues/{project} multiple fields', function() {
      test('update multiple fields', function(done) {
        chai.request(server)
          .post(`/api/issues/${testProject}`)
          .send({
            issue_title: 'Title2',
            issue_text: 'Text2',
            created_by: 'Creator2'
          })
          .end(function(err, res) {
            const issueId = res.body._id;
            chai.request(server)
              .put(`/api/issues/${testProject}`)
              .send({ 
                _id: issueId, 
                issue_title: 'Updated Title2',
                issue_text: 'Updated Text2'
              })
              .end(function(err2, res2) {
                assert.equal(res2.status, 200);
                assert.equal(res2.body.result, 'successfully updated');
                done();
              });
          });
      });
    });
    
    suite('PUT /api/issues/{project} missing _id', function() {
      test('missing _id', function(done) {
        chai.request(server)
          .put(`/api/issues/${testProject}`)
          .send({ issue_title: 'Title' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'missing _id');
            done();
          });
      });
    });
    
    suite('PUT /api/issues/{project} no fields to update', function() {
      test('no fields to update', function(done) {
        chai.request(server)
          .post(`/api/issues/${testProject}`)
          .send({
            issue_title: 'Title3',
            issue_text: 'Text3',
            created_by: 'Creator3'
          })
          .end(function(err, res) {
            const issueId = res.body._id;
            chai.request(server)
              .put(`/api/issues/${testProject}`)
              .send({ _id: issueId })
              .end(function(err2, res2) {
                assert.equal(res2.status, 200);
                assert.equal(res2.body.error, 'no update field(s) sent');
                done();
              });
          });
      });
    });
    
    suite('PUT /api/issues/{project} invalid _id', function() {
      test('invalid _id', function(done) {
        chai.request(server)
          .put(`/api/issues/${testProject}`)
          .send({ _id: 'invalid_id', issue_title: 'Title' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'could not update');
            done();
          });
      });
    });
    
    suite('DELETE /api/issues/{project} with valid _id', function() {
      test('delete issue', function(done) {
        chai.request(server)
          .post(`/api/issues/${testProject}`)
          .send({
            issue_title: 'Title4',
            issue_text: 'Text4',
            created_by: 'Creator4'
          })
          .end(function(err, res) {
            const issueId = res.body._id;
            chai.request(server)
              .delete(`/api/issues/${testProject}`)
              .send({ _id: issueId })
              .end(function(err2, res2) {
                assert.equal(res2.status, 200);
                assert.equal(res2.body.result, 'successfully deleted');
                done();
              });
          });
      });
    });
    
    suite('DELETE /api/issues/{project} with invalid _id', function() {
      test('delete with invalid _id', function(done) {
        chai.request(server)
          .delete(`/api/issues/${testProject}`)
          .send({ _id: 'invalid_id' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'could not delete');
            done();
          });
      });
    });
    
    suite('DELETE /api/issues/{project} missing _id', function() {
      test('delete missing _id', function(done) {
        chai.request(server)
          .delete(`/api/issues/${testProject}`)
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'missing _id');
            done();
          });
      });
    });
  });
});