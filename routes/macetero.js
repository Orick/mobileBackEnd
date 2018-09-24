const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const models = require('../models');
const router = express.Router();
const Sequelize = require('sequelize');
const firebaseAdmin = require('../config/firebaseConfig');
const Op = Sequelize.Op;

app.use(bodyParser.urlencoded({ extended: false }));

router.post('/insert',(req,res,next)=>{
    firebaseAdmin.auth().verifyIdToken(req.body.token)
        .then(decodedToken => {
            models.user.findOne({
                where:  {token: decodedToken.uid
                }
            }).then(usuario =>{
                if (usuario){
                    models.macetero.create({
                    idMacetero: req.body.idMacetero,
                    nombreRed: req.body.nombreRed,
                    passRed: req.body.passRed
                    }).then(maceteroCreated =>{
                        usuario.addUserMacetero(maceteroCreated)
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
            } else {
                res.json({
                    status: 0,
                    statusCode: 'macetero/insert/error',
                    description: 'No se encontró el usuario'
                });
            }
        }).catch(error =>{
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

router.post('/asignarplanta',(req,res,next)=>{
    var idMacetero = req.body['idMacetero'];
    var fechaFin = new Date();
    var estado = (req.body['estado'] == "1");
    var nombrePlanta = req.body['nombrePlanta'];
    var tipoCuidado = (req.body['tipoCuidado'] == "1");

    models.macetero.findOne({
        where:{
            idMacetero: idMacetero
        }
    })
    .then(macetero => {
        models.plantaAsignada.create({
            fechaFin: fechaFin,
            estado: estado,
            nombrePlanta: nombrePlanta,
            tipoCuidado: tipoCuidado
        })
        .then(associatedPlant =>{
            res.json({
                status: 1,
                statusCode: 'macetero/asignarplanta/ok',
                description: 'Planta asociada',
            }); 

            macetero.addMaceteroPlanta(associatedPlant)
        })
        .catch(error => {
            res.json({
                status: 0,
                statusCode: 'Ocurrio un error'
            });
        });
    })
    .catch(error => {
        res.json({
            status: 0,
            statusCode: 'No se encontro macetero'
        });
    });
});

router.get('/:id', (req, res) => {
    models.macetero.findOne({
        where: {
          idMacetero: req.params.id
        },
        include: {
            model: models.plantaAsignada,
            as: 'maceteroPlanta'
        }
    })
    .then(macetero =>{
        res.json({
            status: 1,
            data: macetero
        });
    })
    .catch(error => {
        console.log('Ocurrio un error')
        res.status(400).json({
            status:0,
            data: error
        })
    });
});


    module.exports = router;