const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const models = require('../models');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

app.use(bodyParser.urlencoded({ extended: false }));

router.post('/insert',(req,res,next)=>{
    firebaseAdmin.auth().verifyIdToken(req.body.token)
        .then(decodedToken => {
            models.macetero.create({
                userToken: decodedToken.uid,
                idMacetero:req.body.idMacetero,
                nombreRed: req.body.nombreRed,
                passRed: req.body.passRed
            }).then(maceteroCreated =>{
                res.json({
                    status: 1,
	                statusCode: 'macetero/insert/ok',
	                description: 'ok',
                });    
            }).catch(error => {
                res.json({
                    status: 0,
                    statusCode: 'macetero/insert/error',
                    description: 'Error base de datos'
                });
            });

        }).catch(error =>{
            res.json({
                code:'0',
                error,
                description:'error al verificar token de usuario',
            });
        });
});


    module.exports = router;