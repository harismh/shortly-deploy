var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');
var Users = require('../app/collections/users');
var Links = require('../app/collections/links');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function() {
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  Link.find({}, function(err, links) {
    if (err) {
      console.log(err);
      throw err;
    } else if (links.length === 0) {
      console.log('no links found');
    } else {
      res.status(200).send(links);
    }
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.sendStatus(404);
  }

  Link.find({url: uri}, function(err, link) {
    if (err) {
      console.log(err);
      res.send(404);
    } else if (link.length === 0) {
      console.log('link not found...');
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.sendStatus(404);
        } else {          
          var newLink = Link({
            url: uri,
            title: title,
            baseUrl: req.headers.origin
          });

          newLink.save(function(err) {
            if (err) {
              console.log('Error saving link.');
              throw err;
            } else {
              console.log('Saved new link.');
              res.status(200).send(newLink);
            }
          });
        }
      });
    } else {
      res.status(200).send(link[0]);
    }
  });

};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({username: username}, function(err, user) {
    if (err) {
      console.log('error finding user in login');
    } else if (user === null) {
      console.log('username not found');
      res.redirect('/login');
    } else {

      User.comparePassword(password, user.password, function(match) {
        if (match) {
          console.log('password matched.');
          util.createSession(req, res, user.username);
        } else {
          console.log('incorrect password');
          res.send(404);
        }
      });
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.find({username: username}, function(err, user) {
    if (user.length !== 0) {
      res.redirect('/login');
    } else {
      var newUser = User({
        username: username,
        password: util.hashPassword(password)
      });
      newUser.save(function(err) {
        if (err) {
          console.log('Error saving user.');
          throw err;
          res.redirect('/login');
        } else {
          console.log('Saved new user.');
          res.redirect('/');
        }
      });
    }
  });

};

exports.navToLink = function(req, res) {
  Link.findOne({code: req.params[0]}, function(err, link) {
    if (err) {
      res.redirect('/');
    } else if (link) {
      link.visits++;
      res.redirect(link.url);
    }
  });
};