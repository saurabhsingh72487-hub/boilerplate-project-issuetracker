'use strict';

const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    project: { type: String, required: true },
    issue_title: { type: String, required: true },
    issue_text: { type: String, required: true },
    created_by: { type: String, required: true },
    assigned_to: { type: String, default: '' },
    status_text: { type: String, default: '' },
    created_on: { type: Date, default: Date.now },
    updated_on: { type: Date, default: Date.now },
    open: { type: Boolean, default: true }
  },
  { versionKey: false }
);

const Issue = mongoose.models.Issue || mongoose.model('Issue', issueSchema);

module.exports = function (app) {
  app
    .route('/api/issues/:project')

    .get(async function (req, res) {
      try {
        const project = req.params.project;
        const queryObj = { project };

        for (const key in req.query) {
          let value = req.query[key];

          if (key === 'open') {
            value = value === 'true';
          }

          queryObj[key] = value;
        }

        const issues = await Issue.find(queryObj).lean();
        res.json(issues);
      } catch (err) {
        res.json([]);
      }
    })

    .post(async function (req, res) {
      try {
        const project = req.params.project;
        const {
          issue_title,
          issue_text,
          created_by,
          assigned_to = '',
          status_text = ''
        } = req.body;

        if (!issue_title || !issue_text || !created_by) {
          return res.json({ error: 'required field(s) missing' });
        }

        const now = new Date();

        const issue = new Issue({
          project,
          issue_title,
          issue_text,
          created_by,
          assigned_to,
          status_text,
          created_on: now,
          updated_on: now,
          open: true
        });

        const savedIssue = await issue.save();
        res.json(savedIssue);
      } catch (err) {
        res.json({ error: 'required field(s) missing' });
      }
    })

    .put(async function (req, res) {
      try {
        const { _id, ...fields } = req.body;

        if (!_id) {
          return res.json({ error: 'missing _id' });
        }

        const updateFields = {};

        for (const key in fields) {
          if (fields[key] !== '') {
            if (key === 'open') {
              updateFields[key] =
                fields[key] === true || fields[key] === 'true';
            } else {
              updateFields[key] = fields[key];
            }
          }
        }

        if (Object.keys(updateFields).length === 0) {
          return res.json({ error: 'no update field(s) sent', _id });
        }

        updateFields.updated_on = new Date();

        const updated = await Issue.findByIdAndUpdate(_id, updateFields, {
          new: true
        });

        if (!updated) {
          return res.json({ error: 'could not update', _id });
        }

        res.json({ result: 'successfully updated', _id });
      } catch (err) {
        res.json({ error: 'could not update', _id: req.body._id });
      }
    })

    .delete(async function (req, res) {
      try {
        const { _id } = req.body;

        if (!_id) {
          return res.json({ error: 'missing _id' });
        }

        const deleted = await Issue.findByIdAndDelete(_id);

        if (!deleted) {
          return res.json({ error: 'could not delete', _id });
        }

        res.json({ result: 'successfully deleted', _id });
      } catch (err) {
        res.json({ error: 'could not delete', _id: req.body._id });
      }
    });
};