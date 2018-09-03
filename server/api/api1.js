// routes/api1.js
// caller: server.js
// All the routes for version 1 of our api

import express from 'express';
import arrayWrap from 'arraywrap';
import fs from 'fs';
import chalk from 'chalk';
import validator from 'validator';
import path from 'path';
import User from '../models/User';
import Project from '../models/Project';
import Post from '../models/Post';
import urlSlug from '../modules/urlSlug';
import dataPreloading from '../../client/iso-middleware/dataPreloading';

const cuid = require('cuid');

const api = express.Router();

// Posts ======================================================================
const getPosts = ({ findCriteria, limit, cbSuccess }) => {
  return Post.find(findCriteria).sort({ createdAt: -1 }).limit(limit).exec(
    (err, posts) => {
      cbSuccess(posts);
    }
  );
};
api.delete('/post', (req, res) => {
  console.log(chalk.red(req.query._id))
  Post.findByIdAndRemove(req.query._id, (err, post) => {
    // As always, handle any potential errors:
    if (err) return res.status(500).send(err);
    const response = {
      message: "Post successfully deleted",
      id: post._id
    };
    return res.status(200).send(response);
  });
});

api.post('/post', (req, res, next) => {
  const { content, userId, context } = req.body;
  const newPost = new Post();
  newPost.content = content;
  newPost.postedBy = userId;
  newPost.context = context;
  newPost.save(next);
  return res.send({ status: 'success', msg: 'post success!' });
});

api.get('/post', (req, res) => {
  // Queries
  const limit = parseInt(req.query.limit, 10);
  const cbSuccess = result => res.send(result);
  const findCriteria = req.query;
  getPosts({ findCriteria, limit, cbSuccess });
});
api.get('/post/community/:slug', (req, res) => {
  // Queries
  const limit = parseInt(req.query.limit, 10);
  const cbSuccess = result => res.send(result);
  const findCriteria = { 'context.community': req.params.slug };
  getPosts({ findCriteria, limit, cbSuccess });
});
api.get('/post/project/:slug', (req, res) => {
  // Queries
  const limit = parseInt(req.query.limit, 10);
  const cbSuccess = result => res.send(result);
  const findCriteria = { 'context.project': req.params.slug };
  getPosts({ findCriteria, limit, cbSuccess });
});

// Projects ======================================================================
api.post('/project', (req, res, next) => {
  const formFields = req.body.formFields;

  // Do some error checking
  if (validator.isEmpty(formFields.title)) {
    res.statusMessage = 'error';
    return res.send('Project must have a title!');
  }

  // Add new project to database
  const newProject = new Project();
  const slug = urlSlug(formFields.title, cuid.slug());
  newProject.postedBy = req.body.userId;
  newProject.creator = {
    about: validator.escape(formFields.aboutMe),
    mission: validator.escape(formFields.mission)
  };

  newProject.title = validator.escape(formFields.title);
  newProject.slug = slug;
  newProject.desc = validator.escape(formFields.desc);
  newProject.projectType = formFields.projectType;
  newProject.tags = formFields.selectedTags;
  newProject.contributors = formFields.contributors;
  newProject.submission = {
    platform: formFields.selectedPlatform,
    instruction: validator.escape(formFields.submissionInst)
  };
  newProject.dueDate = formFields.dueDate;
  newProject.save(next);
  return res.send(slug);
});

// NOTE: No limit for how many can be displayed...but obviously we
// want to put a limit if the number gets really big.
// TODO: Get project based on descending order ("trendiest" project at the top)
api.get('/project', (req, res) => {
  // Queries
  const limit = parseInt(req.query.limit, 10);
  Project.find(req.query).sort({ createdAt: -1 }).limit(limit).exec(
    (err, projects) => {
      res.send(projects);
    }
  );
});

// TODO: The following is probably not needed
api.get('/project/:slug', (req, res) => {
  Project.find({ slug: req.params.slug }, (err, project) => {
    if (err) {
      req.flash('error', 'No project found');
      res.statusMessage = 'error';
      return res.send('No project found');
    }
    // If there's no error, send project if project exists
    // NOTE project is an Array containing one element.
    if (project) {
      return res.send(project);
    }
  });
});

// Users ======================================================================
const getUsers = ({ findCriteria, cbSuccess }) => {
  return User.find(findCriteria).sort({ lastLoggedIn: -1 }).exec(
    (err, users) => {
      const usersOut = [];

      users.forEach((user) => {
        const userInfo = {
          _id: user._id,
          createdAt: user.createdAt,
          lastLoggedIn: user.lastLoggedIn,
          username: user.username,
          displayName: user.displayName,
          email: user.email,
          picture: user.picture,
          bio: user.bio,
          website: user.website,
          interests: user.interests,
          communities: user.communities
        };
        usersOut.push(userInfo);
      });
      cbSuccess(usersOut);
    }
  );
};
// Get all users
// TODO: List in descending order (most recently signed up user at the top).
// Also, return the users JSON with date of creation.
// NOTE: this handles finding using these queries:
// http://localhost:3001/api/user?_id=5b25d5d8bbb7ca0765de2127
// http://localhost:3001/api/username?username=xyang
// http://localhost:3001/api/user?communities=video-producers
// http://localhost:3001/api/user?communities=misc
api.get('/user', (req, res) => {
  const cbSuccess = result => res.send(result);
  const findCriteria = req.query;
  getUsers({ findCriteria, cbSuccess });
});

api.post('/user/community', (req, res, next) => {
  User.findById(req.query._id, (err, user) => {
    if (err) return res.send('Error');
    const formFields = req.body.formFields;
    const communities = formFields;
    user.set({
      communities
    });
    user.save(); // NOTE: changing from user.save(next) to user.save()
    // removes the cannot set header error
    return res.send({ status: 'success', msg: 'change success!' });
  });
});
// Update user based on id
// TODO: This is dangerous. This API lets anyone update user information
// based on user id. How do we make sure the request is coming from the
// actual user?
// TODO: Make the id come from req.query._id, as consistent from the previous api.post request handler
// for user community
api.post('/user', (req, res) => {
  User.findById(req.query._id, (err, user) => {
    if (err) return res.send('Error');

    const formFields = req.body.formFields;
    if (formFields.username === '') {
      res.statusText = 'error';
      // TODO: Below is the way we should be sending error messages. Make the same change
      // to POST /project and POST /auth/login
      return res.send({ status: 'error', msg: 'username cannot be empty!' });
    }


    if (formFields.email === '') {
      res.statusText = 'error';
      // TODO: Below is the way we should be sending error messages. Make the same change
      // to POST /project and POST /auth/login
      return res.send({ status: 'error', msg: 'email cannot be empty!' });
    }
    const username = formFields.username || user.username;
    const displayName = formFields.displayName || user.displayName;
    const email = formFields.email || user.email;
    const location = formFields.location || user.location;
    const interests = formFields.interests || user.interests;
    const bio = formFields.bio || user.bio;
    const website = formFields.website || user.website;

    // TODO: If user is making a request to change the username,
    // (1) Make sure username cannot contain any spaces or special characters.
    // (2) Make sure the desired username is not already taken
    // (3) If username change is successful, make sure to have the server
    // redirect to the settings page with username changed?

    user.set({
      username,
      displayName,
      email,
      location,
      interests,
      bio,
      website
    });
    user.save();

    return res.send({ status: 'success', msg: 'change success!' });
  });
});

// Misc Code =======================================================
// TODO: Dead code below for testing only. Delete.
api.get('/hello', (req, res) => {
  res.send({ express: 'If you are seeing this, your frontend react app is hooked up to your backend Express app. CONGRATULATIONS!' });
});

api.get('/hello/@:who', (req, res) => {
  res.send(`Hello, ${req.params.who}.`);
  // Fun fact: this has some security issues, which we’ll get to!
});
// http://localhost:3001/api/search?q=hello+world
// http://localhost:3001/api/search?q=abc+123&q=hello+world&q=xyz
// if someone gives you more queries than you expect,
// you just take the first one and ignore the rest.
api.get('/search', (req, res) => {
  const search = arrayWrap(req.query.q || '');
  const terms = search[0].split(' ');
  res.send(terms);
});

api.get('/goodbye', (req, res) => {
  res.send({ express: 'Goodbye!' });
});
api.get('/random/:min/:max', (req, res) => {
  const min = parseInt(req.params.min, 10);
  const max = parseInt(req.params.max, 10);
  if (Number.isNaN(min) || Number.isNaN(max)) {
    res.status(400);
    res.json({ error: 'Bad request.' });
    return;
  }
  const result = Math.round((Math.random() * (max - min)) + min);
  res.json({ result });
});

api.get('/hello-recipe', dataPreloading);

api.get('/recipes', (req, res) => {
  // Read and open the recipes json file
  const filePath = path.join(__dirname, '../data/recipes.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    // Error handling - return an error
    if (err) {
      res.status(500).end();
      return console.error(err);
    }
    const recipes = JSON.parse(data);
    res.status(200).send({ recipes });
  });
});
api.get('/featured', (req, res) => {
  // Read and open the featured recipe json file
  const filePath = path.join(__dirname, '../data/featured.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    // Error handling - return an error
    if (err) {
      res.status(500).end();
      console.error(err);
    }
    const recipe = JSON.parse(data);
    res.status(200).send({ recipe });
  });
});

api.get('/projects/todos', (req, res) => {
  // Read and open the recipes json file
  const filePath = path.join(__dirname, '../data/recipes.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    // Error handling - return an error
    if (err) {
      res.status(500).end();
      return console.error(err);
    }
    const newProjects = JSON.parse(data);
    res.status(200).send({ newProjects });
  });
});
api.get('/projects/completed', (req, res) => {
  // Read and open the featured recipe json file
  const filePath = path.join(__dirname, '../data/featured.json');
  fs.readFile(filePath, 'utf8', (err, data) => {
    // Error handling - return an error
    if (err) {
      res.status(500).end();
      console.error(err);
    }
    const completedProjects = JSON.parse(data);
    res.status(200).send({ completedProjects });
  });
});

/*
TODO: code below is for development only. Remove for production
 */

api.get('/test', (req, res) => {
  const slug = cuid.slug();

  const title = "<>/I'm a little Tea---Pot Short & Stout";
  const sanitizedTitle = validator.escape(title);
  const output = urlSlug(title, slug);
  res.send(`url: ${output} \n santizedTitle: ${sanitizedTitle}`);
});

// TODO: Don't know if following code is dead code or not...need to delete?
api.use('/assets', (req, res, next) => {
  const filePath = path.join(__dirname, '../assets', req.url);
  res.sendFile(filePath, (err) => {
    if (err) {
      next(new Error('Error sending file!'));
    }
  });
});

module.exports = api;
