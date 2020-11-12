const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');
const Food = require('../models/Food');
const { forwardAuthenticated , ensureAuthenticated} = require('../config/auth');

// Login Page
router.get('/login', forwardAuthenticated, (req, res) => res.render('login'));

// Register Page
router.get('/register', forwardAuthenticated, (req, res) => res.render('register'));

// Register
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body;
  let errors = [];

  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please enter all fields' });
  }

  if (password != password2) {
    errors.push({ msg: 'Passwords do not match' });
  }

  if (password.length < 6) {
    errors.push({ msg: 'Password must be at least 6 characters' });
  }

  if (errors.length > 0) {
    res.render('register', {
      errors,
      name,
      email,
      password,
      password2
    });
  } else {
    User.findOne({ email: email }).then(user => {
      if (user) {
        errors.push({ msg: 'Email already exists' });
        res.render('register', {
          errors,
          name,
          email,
          password,
          password2
        });
      } else {
        const newUser = new User({
          name,
          email,
          password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => {
                req.flash(
                  'success_msg',
                  'You are now registered and can log in'
                );
                res.redirect('/users/login');
              })
              .catch(err => console.log(err));
          });
        });
      }
    });
  }
});

// Dashboard
router.get('/dashboard',ensureAuthenticated ,async (req, res) => {
  var data = [];
  await Food.find({}).then(async ele => {
    for (var i = 0; i < ele.length; i++) {
      var id = ele[i]._id;
      var name = ele[i].name;
      var category = ele[i].category;
      var price = ele[i].price;
      data.push({ id, name, category, price });
    }
  })
  return res.render('dashboard', { data: data })
})

// Login
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/users/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next);
});

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/users/login');
});

// Reservation Page 

router.get('/enter_new_food', (req, res) => {
  res.render('reservation', { id: "", name: "", category: "", price: "" });
})
router.post('/add_food', async(req, res) => {
  console.log(req.body);
  if (req.body.id == '') {
    var { name, category, price } = req.body;
    const new_food = new Food({
      name, category, price
    })
    new_food.save();
    res.redirect('/users/dashboard');
  }
  else {
    await Food.findOneAndUpdate({_id : req.body.id} , req.body);
    res.redirect('/users/dashboard');
  }
})

router.get('/delete_food/:id', async (req, res) => {
  var food_id = req.params.id;
  await Food.remove({ _id: food_id });
  res.redirect('/users/dashboard');
})

router.get('/edit_food/:id', async (req, res) => {
  var food_id = req.params.id;
  var name, category, price;
  await Food.findOne({ _id: food_id }).then(element => {
    name = element.name;
    category = element.category;
    price = element.price;
  })
  res.render('reservation', { id: food_id, name: name, category: category, price: price });
})



module.exports = router;