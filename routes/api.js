'use strict';

const { v4: uuidv4 } = require('uuid');

let projects = {}; // In-memory storage

module.exports = function (app) {
  
  app.route('/api/issues/:project')
    
    .post(function (req, res) {
      const project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text } = req.body;
      
      // Validate required fields
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }
      
      // Initialize project array if it doesn't exist
      if (!projects[project]) {
        projects[project] = [];
      }
      
      const issue = {
        _id: uuidv4(),
        issue_title,
        issue_text,
        created_by,
        assigned_to: assigned_to || '',
        status_text: status_text || '',
        created_on: new Date(),
        updated_on: new Date(),
        open: true
      };
      
      projects[project].push(issue);
      res.json(issue);
    })
    
    .get(function (req, res) {
      const project = req.params.project;
      
      if (!projects[project]) {
        return res.json([]);
      }
      
      // Filter issues based on query parameters
      let filteredIssues = projects[project].filter(issue => {
        return Object.keys(req.query).every(key => {
          if (key === 'open') {
            return String(issue[key]) === req.query[key];
          }
          if (issue[key] === undefined || issue[key] === null || issue[key] === '') {
            return false;
          }
          return issue[key].toString().toLowerCase().includes(req.query[key].toLowerCase());
        });
      });
      
      res.json(filteredIssues);
    })
    
    .put(function (req, res) {
      const project = req.params.project;
      const _id = req.body._id;
      
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      
      const updateFields = Object.keys(req.body).filter(key => key !== '_id');
      if (updateFields.length === 0) {
        return res.json({ error: 'no update field(s) sent', _id });
      }
      
      if (!projects[project]) {
        return res.json({ error: 'could not update', _id });
      }
      
      const issueIndex = projects[project].findIndex(issue => issue._id === _id);
      if (issueIndex === -1) {
        return res.json({ error: 'could not update', _id });
      }
      
      updateFields.forEach(field => {
        projects[project][issueIndex][field] = req.body[field];
      });
      projects[project][issueIndex].updated_on = new Date();
      
      res.json({ result: 'successfully updated', _id });
    })
    
    .delete(function (req, res) {
      const project = req.params.project;
      const _id = req.body._id;
      
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      
      if (!projects[project]) {
        return res.json({ error: 'could not delete', _id });
      }
      
      const issueIndex = projects[project].findIndex(issue => issue._id === _id);
      if (issueIndex === -1) {
        return res.json({ error: 'could not delete', _id });
      }
      
      projects[project].splice(issueIndex, 1);
      res.json({ result: 'successfully deleted', _id });
    });
};