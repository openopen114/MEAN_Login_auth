const User = require('../models/user');
const jwt = require('jsonwebtoken'); // Compact, URL-safe means of representing claims to be transferred between two parties.
const config = require('../config/databse'); // Import database configuration


module.exports = (router) => {

	router.post('/register', (req, res) => {
		console.log("=== POST ===");
		console.log(req.body.email);
		  // Check if email was provided
	    if (!req.body.email) {
	      res.json({ success: false, message: 'You must provide an e-mail' }); // Return error
	    } else {
	      // Check if username was provided
	      if (!req.body.username) {
	        res.json({ success: false, message: 'You must provide a username' }); // Return error
	      } else {
	        // Check if password was provided
	        if (!req.body.password) {
	          res.json({ success: false, message: 'You must provide a password' }); // Return error
	        } else {
	          // Create new user object and apply user input
	          let user = new User({
	            email: req.body.email.toLowerCase(),
	            username: req.body.username.toLowerCase(),
	            password: req.body.password
	          });
	          // Save user to database
	          user.save((err) => {
	            // Check if error occured
	            if (err) {
	              // Check if error is an error indicating duplicate account
	              if (err.code === 11000) {
	                res.json({ success: false, message: 'Username or e-mail already exists' }); // Return error
	              } else {
	                // Check if error is a validation rror
	                if (err.errors) {
	                  // Check if validation error is in the email field
	                  if (err.errors.email) {
	                    res.json({ success: false, message: err.errors.email.message }); // Return error
	                  } else {
	                    // Check if validation error is in the username field
	                    if (err.errors.username) {
	                      res.json({ success: false, message: err.errors.username.message }); // Return error
	                    } else {
	                      // Check if validation error is in the password field
	                      if (err.errors.password) {
	                        res.json({ success: false, message: err.errors.password.message }); // Return error
	                      } else {
	                        res.json({ success: false, message: err }); // Return any other error not already covered
	                      }
	                    }
	                  }
	                } else {
	                  res.json({ success: false, message: 'Could not save user. Error: ', err }); // Return error if not related to validation
	                }
	              }
	            } else { 
	              res.json({ success: true, message: 'Acount registered!', username: req.body.username.toLowerCase(),
	            password: req.body.password}); // Return success
	            }
	          });
	        }
	      }
	    } 
	});

 

	/* ========
  LOGIN ROUTE
  ======== */
  router.post('/login', (req, res) => {
  	console.log("=== login ===");
    // Check if username was provided
    if (!req.body.username) {
      res.json({ success: false, message: 'No username was provided' }); // Return error
    } else {
      // Check if password was provided
      if (!req.body.password) {
        res.json({ success: false, message: 'No password was provided.' }); // Return error
      } else {
        // Check if username exists in database
        User.findOne({ username: req.body.username.toLowerCase() }, (err, user) => {

        	console.log(user);
         
         
         // Check if error was found
          if (err) {
            res.json({ success: false, message: err }); // Return error
          } else {
            // Check if username was found
            if (!user) {
              res.json({ success: false, message: 'Username not found.' }); // Return error
            } else {
            		console.log("=== user ===");
            		console.log(user);
            	
              const validPassword = user.comparePassword(req.body.password); // Compare password provided to password in database
              // Check if password is a match
              if (!validPassword) {
                res.json({ success: false, message: 'Password invalid' }); // Return error
              } else {
              	 const token = jwt.sign({ userId: user._id }, config.secret, { expiresIn: '24h' }); // Create a token for client
                res.json({ success: true, message: 'Success!', token: token, user: { username: user.username } }); // Return success and token to frontend
                //res.json({ success: true, message: 'Success!'}); // Return success and token to frontend
              }

				

            }
          }
        });
      }
    }
  });

 // eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1OWY5MTVlMDhiM2U2OTA3NjU5ZmRhZTYiLCJpYXQiOjE1MDk1MDQwNzksImV4cCI6MTUwOTU5MDQ3OX0.3_lwwAkRmK5MtCuTE7EVrB7m_QQLUi4dERTuuwhsEZo
  /* ================================================
  MIDDLEWARE - Used to grab user's token from headers
  ================================================ */
 
  router.use((req, res, next) => {
    const token = req.headers['authorization']; // Create token found in headers
    // Check if token was found in headers
    if (!token) {
      res.json({ success: false, message: 'No token provided' }); // Return error
    } else {
      // Verify the token is valid
      console.log(token);
      jwt.verify(token, config.secret, (err, decoded) => {
        // Check if error is expired or invalid
        if (err) {
          res.json({ success: false, message: 'Token invalid: ' + err }); // Return error for token validation
        } else {
          req.decoded = decoded; // Create global variable to use in any request beyond
          next(); // Exit middleware
        }
      });
    }
  });
 

  /* ===============================================================
     Route to get user's profile data
  =============================================================== */
  router.get('/profile', (req, res) => {

   
  	 
    // Search for user in database
    User.findOne({ _id: req.decoded.userId }).select('username email').exec((err, user) => {
      // Check if error connecting
      if (err) {
        res.json({ success: false, message: err }); // Return error
      } else {
        // Check if user was found in database
        if (!user) {
          res.json({ success: false, message: 'User not found' }); // Return error, user was not found in db
        } else {
          res.json({ success: true, user: user }); // Return success, send user object to frontend for profile
        }
      }
    });
    
  });

	return router;
}