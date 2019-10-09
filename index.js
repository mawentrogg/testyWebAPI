// Authors:
// Shane Oatman https://github.com/shoatman
// Sunil Bandla https://github.com/sunilbandla
// Daniel Dobalian https://github.com/danieldobalian

var express = require("express");
var morgan = require("morgan");
var passport = require("passport");
var BearerStrategy = require('passport-azure-ad').BearerStrategy;

// TODO: Update the first 3 variables
var clientID = "0988718b-26a6-4ad3-874c-f0f3bdc23d5a";
var b2cDomainHost = "hpaccess.b2clogin.com";
var tenantIdGuid = "a51c92dd-146c-44ba-99da-6596487433cd";
var policyName = "B2C_1_SignIn";
var options = {
    identityMetadata: "https://" + b2cDomainHost + "/" + tenantIdGuid + "/" + policyName + "/v2.0/.well-known/openid-configuration/",

    clientID: clientID,
    policyName: policyName,
    isB2C: true,
    validateIssuer: false,
    loggingLevel: 'info',
    loggingNoPII: false,
    passReqToCallback: false
};

var bearerStrategy = new BearerStrategy(options,
    function (token, done) {
        // Send user info using the second argument
        done(null, {}, token);
    }
);

var app = express();
app.use(morgan('dev'));

app.use(passport.initialize());
passport.use(bearerStrategy);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/hello",
    passport.authenticate('oauth-bearer', {session: false}),
    function (req, res) {
        var claims = req.authInfo;
        var groups = req.user;
        var req1 = req;
        
        console.log('User info: ', req.user);
        console.log('Validated claims: ', claims);
        
        if (claims['scp'].split(" ").indexOf("demo.read") >= 0) {
            // Service relies on the name claim.
            if(claims['extension_Org'] === "Heimdall Power squared"){
                res.status(200).json({
                    "membership": "HEIMDALL YO, ALL ADMIN ACCESS GRANTED",
                    " claims": claims.valueOf(),
                    " user" : groups.valueOf()
                    //" req": req1.valueOf()
                })
            }else {

                res.status(200).json({
                    'name': claims['name'],
                    "testytest": "testymestTestNOOOOOOOO",
                    "claims" : claims.valueOf()

                });
            }
        } else {
            console.log("Invalid Scope, 403");
            res.status(403).json({'error': 'insufficient_scope'}); 
        }
    }
);

var port = process.env.PORT || 5000;
app.listen(port, function () {
    console.log("Listening on port " + port);
});