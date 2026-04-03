const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;

const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  const projectName = 'fcc-test-project';
  let testId1;
  let testId2;

  test('Create an issue with every field: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post('/api/issues/' + projectName)
      .send({
        issue_title: 'Test issue full',
        issue_text: 'Full field issue text',
        created_by: 'Tester One',
        assigned_to: 'Dev A',
        status_text: 'In QA'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Test issue full');
        assert.equal(res.body.issue_text, 'Full field issue text');
        assert.equal(res.body.created_by, 'Tester One');
        assert.equal(res.body.assigned_to, 'Dev A');
        assert.equal(res.body.status_text, 'In QA');
        assert.isTrue(res.body.open);
        assert.exists(res.body._id);
        assert.exists(res.body.created_on);
        assert.exists(res.body.updated_on);

        testId1 = res.body._id;
        done();
      });
  });

  test('Create an issue with only required fields: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post('/api/issues/' + projectName)
      .send({
        issue_title: 'Test issue required',
        issue_text: 'Required only issue text',
        created_by: 'Tester Two'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Test issue required');
        assert.equal(res.body.issue_text, 'Required only issue text');
        assert.equal(res.body.created_by, 'Tester Two');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status_text, '');
        assert.isTrue(res.body.open);
        assert.exists(res.body._id);
        assert.exists(res.body.created_on);
        assert.exists(res.body.updated_on);

        testId2 = res.body._id;
        done();
      });
  });

  test('Create an issue with missing required fields: POST request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .post('/api/issues/' + projectName)
      .send({
        issue_title: '',
        issue_text: 'Missing title',
        created_by: 'Tester'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'required field(s) missing' });
        done();
      });
  });

  test('View issues on a project: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/' + projectName)
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);

        const issue = res.body[0];
        assert.property(issue, '_id');
        assert.property(issue, 'issue_title');
        assert.property(issue, 'issue_text');
        assert.property(issue, 'created_by');
        assert.property(issue, 'assigned_to');
        assert.property(issue, 'status_text');
        assert.property(issue, 'created_on');
        assert.property(issue, 'updated_on');
        assert.property(issue, 'open');
        done();
      });
  });

  test('View issues on a project with one filter: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/' + projectName)
      .query({ created_by: 'Tester Two' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);
        res.body.forEach((issue) => {
          assert.equal(issue.created_by, 'Tester Two');
        });
        done();
      });
  });

  test('View issues on a project with multiple filters: GET request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .get('/api/issues/' + projectName)
      .query({ created_by: 'Tester One', assigned_to: 'Dev A' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.isAtLeast(res.body.length, 1);
        res.body.forEach((issue) => {
          assert.equal(issue.created_by, 'Tester One');
          assert.equal(issue.assigned_to, 'Dev A');
        });
        done();
      });
  });

  test('Update one field on an issue: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/' + projectName)
      .send({
        _id: testId1,
        issue_text: 'Updated one field text'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          result: 'successfully updated',
          _id: testId1
        });
        done();
      });
  });

  test('Update multiple fields on an issue: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/' + projectName)
      .send({
        _id: testId1,
        issue_title: 'Updated title',
        assigned_to: 'Dev B',
        status_text: 'Done'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          result: 'successfully updated',
          _id: testId1
        });
        done();
      });
  });

  test('Update an issue with missing _id: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/' + projectName)
      .send({
        issue_title: 'No id update'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });

  test('Update an issue with no fields to update: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/' + projectName)
      .send({
        _id: testId1
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          error: 'no update field(s) sent',
          _id: testId1
        });
        done();
      });
  });

  test('Update an issue with an invalid _id: PUT request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .put('/api/issues/' + projectName)
      .send({
        _id: 'invalidid123',
        issue_title: 'Should fail'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          error: 'could not update',
          _id: 'invalidid123'
        });
        done();
      });
  });

  test('Delete an issue: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete('/api/issues/' + projectName)
      .send({
        _id: testId2
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          result: 'successfully deleted',
          _id: testId2
        });
        done();
      });
  });

  test('Delete an issue with an invalid _id: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete('/api/issues/' + projectName)
      .send({
        _id: 'invalidid123'
      })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, {
          error: 'could not delete',
          _id: 'invalidid123'
        });
        done();
      });
  });

  test('Delete an issue with missing _id: DELETE request to /api/issues/{project}', function (done) {
    chai
      .request(server)
      .delete('/api/issues/' + projectName)
      .send({})
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.deepEqual(res.body, { error: 'missing _id' });
        done();
      });
  });
});