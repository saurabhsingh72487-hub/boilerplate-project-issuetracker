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
            issue_title: 'TitleReq',
            issue_text: 'TextReq',
            created_by: 'CreatorReq'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'TitleReq');
            assert.equal(res.body.issue_text, 'TextReq');
            assert.equal(res.body.created_by, 'CreatorReq');
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
    
    suite('GET /api/issues/{project} with multiple filters', function() {
      test('GET with multiple filters', function(done) {
        chai.request(server)
          .get(`/api/issues/${testProject}`)
          .query({ created_by: 'CreatorReq', open: true })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
          });
      });
    });
    
    suite('PUT /api/issues/{project} one field', function() {
      test('update one field', function(done) {
        let issueId;
        chai.request(server)
          .post(`/api/issues/${testProject}`)
          .send({
            issue_title: 'Title1',
            issue_text: 'Text1',
            created_by: 'Creator1'
          })
          .end(function(err, res) {
            issueId = res.body._id;
            chai.request(server)
              .put(`/api/issues/${testProject}`)
              .send({ _id: issueId, issue_title: 'Updated' })
              .end(function(err2, res2) {
                assert.equal(res2.status, 200);
                assert.equal(res2.body.result, 'successfully updated');
                assert.equal(res2.body['_id'], issueId);
                done();
              });
          });
      });
    });
    
    suite('PUT /api/issues/{project} multiple fields', function() {
      test('update multiple fields', function(done) {
        let issueId;
        chai.request(server)
          .post(`/api/issues/${testProject}`)
          .send({
            issue_title: 'Title2',
            issue_text: 'Text2',
            created_by: 'Creator2'
          })
          .end(function(err, res) {
            issueId = res.body._id;
            chai.request(server)
              .put(`/api/issues/${testProject}`)
              .send({ _id: issueId, issue_title: 'Updated2', assigned_to: 'New' })
              .end(function(err2, res2) {
                assert.equal(res2.status, 200);
                assert.equal(res2.body.result, 'successfully updated');
                assert.equal(res2.body['_id'], issueId);
                done();
              });
          });
      });
    });
    
    suite('PUT /api/issues/{project} missing _id', function() {
      test('missing _id', function(done) {
        chai.request(server)
          .put(`/api/issues/${testProject}`)
          .send({ issue_title: 'NoID' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'missing _id');
            done();
          });
      });
    });
    
    suite('PUT /api/issues/{project} no fields to update', function() {
      test('no fields to update', function(done) {
        let issueId;
        chai.request(server)
          .post(`/api/issues/${testProject}`)
          .send({
            issue_title: 'NoUpdate',
            issue_text: 'NoUpdate',
            created_by: 'NoUpdate'
          })
          .end(function(err, res) {
            issueId = res.body._id;
            chai.request(server)
              .put(`/api/issues/${testProject}`)
              .send({ _id: issueId })
              .end(function(err2, res2) {
                assert.equal(res2.status, 200);
                assert.equal(res2.body.error, 'no update field(s) sent');
                assert.equal(res2.body['_id'], issueId);
                done();
              });
          });
      });
    });
    
    suite('PUT /api/issues/{project} invalid _id', function() {
      test('invalid _id', function(done) {
        chai.request(server)
          .put(`/api/issues/${testProject}`)
          .send({ _id: '507f1f77bcf86cd799439011', issue_title: 'Invalid' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'could not update');
            assert.equal(res.body['_id'], '507f1f77bcf86cd799439011');
            done();
          });
      });
    });
    
    suite('DELETE /api/issues/{project} with valid _id', function() {
      test('delete issue', function(done) {
        let issueId;
        chai.request(server)
          .post(`/api/issues/${testProject}`)
          .send({
            issue_title: 'DeleteMe',
            issue_text: 'DeleteMe',
            created_by: 'DeleteMe'
          })
          .end(function(err, res) {
            issueId = res.body._id;
            chai.request(server)
              .delete(`/api/issues/${testProject}`)
              .send({ _id: issueId })
              .end(function(err2, res2) {
                assert.equal(res2.status, 200);
                assert.equal(res2.body.result, 'successfully deleted');
                assert.equal(res2.body['_id'], issueId);
                done();
              });
          });
      });
    });
    
    suite('DELETE /api/issues/{project} with invalid _id', function() {
      test('delete with invalid _id', function(done) {
        chai.request(server)
          .delete(`/api/issues/${testProject}`)
          .send({ _id: '507f1f77bcf86cd799439011' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'could not delete');
            assert.equal(res.body['_id'], '507f1f77bcf86cd799439011');
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