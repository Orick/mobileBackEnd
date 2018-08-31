const express = require('express');
const router = express.Router();
const models = require('../models');
const firebaseAdmin = require('../config/firebaseConfig');


router.post('/create',(req,res,next)=>{
    firebaseAdmin.auth().getUserByEmail(req.body.email)
    .then(function(userRecord) {
        res.json({
            status: 1,
            statusCode: 'assocciatedAccounts/create/error',
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

            models.userSummoner.create({
                token:userRecord.uid
            }).then(userCreated =>{
                res.json({
                    status: 1,
                    statusCode: 'assocciatedAccounts/create/ok',
                    description: 'Usuario creado'
                })
            }).catch(error => {
                res.json({
                    status: 0,
                    statusCode: 'assocciatedAccounts/create/error',
                    description: 'Error base de datos'
                });
            });
        })
        .catch(function(error) {
            res.json({
                status: 1,
                statusCode: 'assocciatedAccounts/create/error',
                description:'Firebase error, creando usuario',
                error: error
            });
        });
    });
});

router.post('/updateUserPassword', (req, res, next) => {
    firebaseAdmin.auth().verifyIdToken(req.body.token)
    .then(decodedToken => {

        firebaseAdmin.auth().updateUser(decodedToken.uid, {
            password:req.body.password
        }).then( userRecord => {
            res.json({
                status: 1,
                statusCode: 'assocciatedAccounts/updateUserPassword',
                description: 'update de password correcto'
            });
        }).catch( error => {
            console.log("error wtd");
            res.json({
                status: 1,
                statusCode: 'assocciatedAccounts/updateUserPassword/error',
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

router.post('/get', (req, res, next) => {
    firebaseAdmin.auth().verifyIdToken(req.body.token)
    .then(decodedToken => {
        models.userSummoner
        .findAll({
            where:{
                token:decodedToken.uid
            },
            include:{
                model:models.summoner,
                through :'associateUserSum',
                as: 'userSummonerX',
                include:{
                    model:models.league,
                    as : 'summonerLeague'
                }

            }
        }).then(users => {
            if (users) {
                dataSummoners = users[0].userSummonerX.map(d => {
                    delete d.dataValues.associateUserSum;
                    return d;
                });
                res.json({
                    status: 1,
                    statusCode: 'userSummoner/get/listing',
                    data: dataSummoners
                });
            } else {
                res.status(400).json({
                    status: 0,
                    statusCode: 'userSummoner/not-found',
                    description: 'There\'s no user information!'
                });
            }
        }).catch(error => {
            res.status(400).json({
                status: 0,
                statusCode: 'database/error',
                description: error.toString()
            });
        });
    }).catch(error =>{
        res.json({
            code:'0',
            description:'error al verificar token de usuario',
        });
    });
});



// router.get('/all', (req, res, next) => {
//     models.userSummoner
//     .findAll(
//         {
//             include:{
//                 model:models.summoner,
//                 through :'associateUserSum',
//                 as: 'userSummonerX'
//             }
//         }
//     )
//     .then(users => {
//         if (users) {
//             res.json({
//                 status: 1,
//                 statusCode: 'userSummoner/listing',
//                 data: users
//             });
//         } else {
//             res.status(400).json({
//                 status: 0,
//                 statusCode: 'userSummoner/not-found',
//                 description: 'There\'s no user information!'
//             });
//         }
//     }).catch(error => {
//         res.status(400).json({
//             status: 0,
//             statusCode: 'database/error',
//             description: error.toString()
//         });
//     });
// });




module.exports = router;
