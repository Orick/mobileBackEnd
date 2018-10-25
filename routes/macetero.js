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
                            description: 'Error base de datos user'
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
                        description: 'Error base de datos macetero'
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
    var idPlanta = req.body['idPlanta'];

    models.macetero.findOne({
        where:{
            idMacetero: idMacetero
        }
    })
    .then(macetero => {
        models.plantaAsignada.findOne({
            where:{
                maceteroIdMacetero: idMacetero,
                estado: true
            }
        })
        .then(associatedPlantTrue =>{
            if (associatedPlantTrue == null) {
                models.plantaAsignada.create({
                    fechaFin: fechaFin,
                    estado: estado,
                    nombrePlanta: nombrePlanta,
                    tipoCuidado: tipoCuidado
                })
                .then(associatedPlant =>{
                    macetero.addMaceteroPlanta(associatedPlant);
                    models.planta.findOne({
                        where:{
                            id: idPlanta
                        }
                    })
                    .then(findPlanta =>{
                        associatedPlant.addPlanta(findPlanta);
                        res.json({
                            status: 1,
                            statusCode: 'macetero/asignarplanta/ok null',
                            description: 'ok',
                        });
                    })
                    .catch(error => {
                        res.json({
                            status: 0,
                            statusCode: 'No se encontró la planta y no habia asignaciones'
                        });
                    });
                   
                })
                .catch(error => {
                    res.json({
                        status: 0,
                        statusCode: 'Ocurrio un error y no habia asignaciones'
                    });
                });
            } else {
                associatedPlantTrue.updateAttributes({
                    estado: false
                })
                .then(associatedPlantFalse =>{
                    models.plantaAsignada.create({
                        fechaFin: fechaFin,
                        estado: estado,
                        nombrePlanta: nombrePlanta,
                        tipoCuidado: tipoCuidado
                    })
                    .then(associatedPlant =>{
                        macetero.addMaceteroPlanta(associatedPlant);
                        models.planta.findOne({
                            where:{
                                id: idPlanta
                            }
                        })
                        .then(findPlanta =>{
                            associatedPlant.addPlanta(findPlanta);
                            res.json({
                                status: 1,
                                statusCode: 'macetero/asignarplanta/ok nonull',
                                description: 'ok',
                            });
                        })
                        .catch(error => {
                            res.json({
                                status: 0,
                                statusCode: 'No se encontró la planta y habia asignaciones'
                            });
                        });
                       
                    })
                    .catch(error => {
                        res.json({
                            status: 0,
                            statusCode: 'Ocurrio un error y habia asignaciones'
                        });
                    });
                })
                .catch(error => {
                    res.json({
                        status: 0,
                        statusCode: 'No se pudieron modificar los datos'
                    });
                });
            }
        })
        .catch(error => {
            res.json({
                status: 0,
                statusCode: 'Ocurrio un error al buscar la asignacion'
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

router.post('/update',(req,res,next)=>{
    let idMacetero = req.body['idMacetero'];
    models.macetero.findOne({
        where:{
            idMacetero: idMacetero
        }
    })
    .then(macetero => {
        macetero.updateAttributes({
            nombreRed: req.body['nombreRed'],
            passRed: req.body['passRed']
          })
        res.json({
            status: 1,
            statusCode: 'macetero/update/ok',
            description: 'ok',
        });
    })
    .catch(error=> {
        res.json({
            status: 1,
            statusCode: 'macetero/update/error',
            description: 'error',
        });
    })
});

router.post('/delete', (req, res) => {
    let idMacetero = req.body['idMacetero'];
    models.macetero.findOne({
        where: {
          idMacetero: idMacetero
        }
    })
    .then(macetero =>{
        
        models.plantaAsignada.findOne({
            where: {
                maceteroIdMacetero: idMacetero
            }
        })
        .then(plantaasig =>{
            plantaasig.destroy()
            .then(destroyObject => {
                console.log("plantaAsignada eliminada")
            })
            .catch(error => {
                console.log('Ocurrio un error en eliminacion macetero')
                res.status(400).json({
                    status:0,
                    data: error
                })
            });
        })
        .catch(error => {
            console.log('Planta asignada no encontrada')
            res.status(400).json({
                status:0,
                data: error
            })
        });
        
        macetero.destroy()
        .then(
            res.json({
                status: 1,
                data: "macetero eliminado"
            })
        )
        .catch(error => {
            console.log('Ocurrio un error en eliminacion macetero')
            res.status(400).json({
                status:0,
                data: error
            })
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

router.get('/maceterosUser/:token', (req, res) => {
    models.user.findOne({
        where: {
          token: req.params.token
        },
        include: {
            model: models.macetero,
            as: 'userMacetero'
        }
    })
    .then(user =>{
        res.json({
            status: 1,
            data: user.userMacetero
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

router.get('/todo', (req, res) => {
    models.plantaAsignada.findAll({
        include: {
            model: models.planta
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