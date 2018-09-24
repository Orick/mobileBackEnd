const express = require('express');
const router = express.Router();
const models = require('../models');
const firebaseAdmin = require('../config/firebaseConfig');


router.post('/create',(req,res,next)=>{
    firebaseAdmin.auth().getUserByEmail(req.body.email)
    .then(function(userRecord) {
        res.json({
            status: 1,
            statusCode: 'user/create/error',
            description:'email ya existente'
        });
    }).catch(function(error) {
        firebaseAdmin.auth().createUser({
            email: req.body.email,
            emailVerified: false,
            password: req.body.password,
        })
        .then(function(userRecord) {
            console.log("Usuario", userRecord.uid);

            models.user.create({
                token:userRecord.uid
            }).then(userCreated =>{
                res.json({
                    status: 1,
                    statusCode: 'user/create/ok',
                    description: 'Usuario creado'
                })
            }).catch(error => {
                res.json({
                    status: 0,
                    statusCode: 'user/create/error',
                    description: 'Error base de datos'
                });
            });
        })
        .catch(function(error) {
            res.json({
                status: 1,
                statusCode: 'user/create/error',
                description:'Firebase error, creando usuario',
                error: error
            });
        });
    });
});

router.post('/updatePassword', (req, res, next) => {
    firebaseAdmin.auth().verifyIdToken(req.body.token)
    .then(decodedToken => {

        firebaseAdmin.auth().updateUser(decodedToken.uid, {
            password:req.body.password
        }).then( userRecord => {
            res.json({
                status: 1,
                statusCode: 'user/updatePassword',
                description: 'update de password correcto'
            });
        }).catch( error => {
            console.log("error wtd");
            res.json({
                status: 1,
                statusCode: 'user/updatePassword/error',
                description:'Firebase error, update password',
                error: error
            });
        });

    }).catch(error =>{
        res.json({
            code:'0',
            description:'error al verificar token de usuario',
        });
    });
});


//Crear macetero
//editar contraña/nombre red
//asignar planta
//sensor obtener ultimo datos sensores
//sensor obtener ultimo forzado





module.exports = router;
