const express = require('express');
const router = express.Router();
const models = require('../models');
const firebaseAdmin = require('../config/firebaseConfig');

//para prueba
router.post('/insertMacetero',(req,res,next)=>{

    models.macetero.create({
        idMacetero:req.body.idMacetero,
        nombreRed: req.body.nombreRed,
        passRed: req.body.passRed
    }).then(maceteroCreated =>{

        models.plantaAsignada.create({
            fechaFin: new Date(),
            estado: 'ok',
            nombrePlanta: 'test1',
            tipoCuidado: 1
        }).then(plantaAsignadaCreated =>{
            maceteroCreated.addMaceteroPlanta(plantaAsignadaCreated);

            models.planta.create({
                tipoPlanta: 'tulipan',
                humedadOptima: 0.2,
                humedadMinima: 0.02,
                luzOptima: 12,
                luzMinima: 10
            }).then(plantaCreated =>{
                console.log("Planta creada");
                plantaAsignadaCreated.addPlanta(plantaCreated);
                console.log('Planta asignada');
                res.json({
                    status: 1,
                    statusCode: 'sensores/insertmacetero/ok',
                    description: 'ok',
                });
            }).catch(error => {
                console.log(error);
                res.json({
                    status: 0,
                    statusCode: 'sensores/insert/error',
                    description: 'Error base de datos'
                });
            });
        }).catch(error => {
            console.log(error);
            res.json({
                status: 0,
                statusCode: 'sensores/insert/error',
                description: 'Error base de datos'
            });
        });
    }).catch(error => {
        res.json({
            status: 0,
            statusCode: 'sensores/insert/error',
            description: 'Error base de datos'
        });
    });


});



// router.post('/insertMacetero2',(req,res,next)=>{
//
//     models.macetero.findOne({
//         where:{
//             idMacetero:req.body.idMacetero
//         }
//     }).then(maceteroCreated =>{
//
//         models.plantaAsignada.create({
//             fechaFin: new Date(),
//             estado: 'ok',
//             nombrePlanta: 'test2',
//             tipoCuidado: 0
//         }).then(plantaAsignadaCreated =>{
//             maceteroCreated.addMaceteroPlanta(plantaAsignadaCreated);
//
//             models.planta.findOne({
//                 where:{
//                     tipoPlanta: 'tulipan'
//                 }
//             }).then(plantaCreated =>{
//                 console.log("tulipan entontrado");
//                 plantaAsignadaCreated.addPlanta(plantaCreated);
//                 console.log('tulipan asignada');
//                 res.json({
//                     status: 1,
//                     statusCode: 'sensores/insertmacetero2/ok',
//                     description: 'ok',
//                 });
//             }).catch(error => {
//                 console.log(error);
//                 res.json({
//                     status: 0,
//                     statusCode: 'sensores/insert2/error',
//                     description: 'Error base de datos'
//                 });
//             });
//         }).catch(error => {
//             console.log(error);
//             res.json({
//                 status: 0,
//                 statusCode: 'sensores/insert/error',
//                 description: 'Error base de datos'
//             });
//         });
//     }).catch(error => {
//         res.json({
//             status: 0,
//             statusCode: 'sensores/insert/error',
//             description: 'Error base de datos'
//         });
//     });
//
//
// });


router.post('/insert',(req,res,next)=>{
    // req.body.idMacetero
    // req.body.humedad
    // req.body.temperatura
    // req.body.agua

    models.macetero.findOne({
        where:{
            idMacetero: req.body.idMacetero
        },
        include: {
            model: models.plantaAsignada,
            as: 'maceteroPlanta',
            order: 'createdAt DESC',
            include: {
                model: models.planta,
                order: 'createdAt DESC'
            }
        }
    }).then( macetero => {
        if ( macetero ){
            let listInserts = [
                                insertHumedad(macetero, req.body.humedad),
                                insertLuz(macetero, req.body.luz),
                                insertAgua(macetero, req.body.agua)
                            ];
            Promise.all(listInserts)
            .then( inserts => {
                res.json({
                    status: 1,
                    statusCode: 'sensores/insert/ok',
                    description: 'insert ok',
                    inserts
                });
            })
            .catch( error => {
                res.json({
                    status: 0,
                    statusCode: 'matchlist/find/error',
                    description: 'Error base de datos',
                    error: error.toString()
                });
            });

        }else{
            res.json({
                status: 0,
                statusCode: 'sensores/insert/error44',
                description: 'Macetero no encontrado'
            });
        }
    }).catch(error => {
        res.json({
            status: 0,
            statusCode: 'sensores/insert/error55',
            description: 'database error'
        });
    });
});



const insertHumedad = async (macetero, valor) =>{
    return new Promise((resolve,reject)=> {
        models.humedad.create({
            valor
        }).then(humedadCreated => {
            console.log('humedad creado');
            macetero.addMaceteroHumedad(humedadCreated);
            console.log('humedad asignado');

            let datosCuidado = macetero.dataValues.maceteroPlanta[0];
            let datosPlanta = macetero.dataValues.maceteroPlanta[0].dataValues.planta[0];
            let plantaAsignada = macetero.dataValues.maceteroPlanta[0];
            if( datosPlanta && datosCuidado ){
                console.log('Datos ok');
                // tipoCuidato 1 = Optimo
                // tipoCuidato 0 = Minimo
                if(datosCuidado.tipoCuidado){
                    if(valor <= datosPlanta.humedadOptima ){
                        models.notificaciones.create({
                            tipo: 'Humedad',
                            descripcion: 'Humedad registrada menor a la humedad óptima'
                        }).then(notificacion => {
                            if(notificacion){
                                console.log('NOTIFICACION CREADA HUMEDAD');
                                plantaAsignada.addAsignadaNotificaciones(notificacion);
                                console.log('NOTIFICACION RELACIONADA HUMEDAD');
                                resolve({ok:'ok'});
                            }else{
                                reject({
                                    description:'Error creando notificacion'
                                });
                            }
                        }).catch(error => {
                            reject({
                                error,
                                description:'Error'
                            });
                        })
                    }else{
                        resolve({ok:'ok'});
                    }
                }else{
                    if(valor <= datosPlanta.humedadMinima){
                        models.notificaciones.create({
                            tipo: 'Humedad',
                            descripcion: 'Humedad registrada menor a la humedad mínima'
                        }).then(notificacion => {
                            if(notificacion){
                                console.log('NOTIFICACION CREADA HUMEDAD');
                                plantaAsignada.addAsignadaNotificaciones(notificacion);
                                console.log('NOTIFICACION RELACIONADA HUMEDAD');
                                resolve({ok:'ok'});
                            }else{
                                reject({
                                    description:'Error creando notificacion'
                                });
                            }
                        }).catch(error => {
                            reject({
                                error,
                                description:'Error'
                            });
                        })
                    }else{
                        resolve({ok:'ok'});
                    }
                }
                // console.log(datosCuidado);
                // console.log(datosPlanta);
                // resolve({ok:planta.dataValues.maceteroPlanta[0].dataValues.planta[0]});
            }else{
                reject({
                    error,
                    description:'Error'
                });
            }
        }).catch(error => {
            console.log('error');
            reject({
                error,
                description:'Error Db'
            });
        });
    });
};

const insertLuz = async (macetero, valor) =>{
    return new Promise((resolve,reject)=> {
        models.luz.create({
            valor
        }).then(luzCreated => {
            console.log('luz creado');
            macetero.addMaceteroLuz(luzCreated);
            console.log('luz asignado');

            let datosCuidado = macetero.dataValues.maceteroPlanta[0];
            let datosPlanta = macetero.dataValues.maceteroPlanta[0].dataValues.planta[0];
            let plantaAsignada = macetero.dataValues.maceteroPlanta[0];
            if( datosPlanta && datosCuidado ){
                console.log('Datos ok');
                // tipoCuidato 1 = Optimo
                // tipoCuidato 0 = Minimo
                if(datosCuidado.tipoCuidado){
                    if(valor <= datosPlanta.luzOptima){
                        models.notificaciones.create({
                            tipo: 'Luz',
                            descripcion: 'Luz registrada menor a la luz óptima'
                        }).then(notificacion => {
                            if(notificacion){
                                console.log('NOTIFICACION CREADA LUZ');
                                plantaAsignada.addAsignadaNotificaciones(notificacion);
                                console.log('NOTIFICACION RELACIONADA LUZ');
                                resolve({ok:'ok'});
                            }else{
                                reject({
                                    description:'Error creando notificacion'
                                });
                            }
                        }).catch(error => {
                            reject({
                                error,
                                description:'Error'
                            });
                        })
                    }else{
                        resolve({ok:'ok'});
                    }
                }else{
                    if(valor <= datosPlanta.luzMinima){
                        models.notificaciones.create({
                            tipo: 'Luz',
                            descripcion: 'Luz registrada menor a la luz mínima'
                        }).then(notificacion => {
                            if(notificacion){
                                console.log('NOTIFICACION CREADA LUZ');
                                plantaAsignada.addAsignadaNotificaciones(notificacion);
                                console.log('NOTIFICACION RELACIONADA LUZ');
                                resolve({ok:'ok'});
                            }else{
                                reject({
                                    description:'Error creando notificacion'
                                });
                            }
                        }).catch(error => {
                            reject({
                                error,
                                description:'Error'
                            });
                        })
                    }else{
                        resolve({ok:'ok'});
                    }
                }
            }else{
                reject({
                    error,
                    description:'Error'
                });
            }
        }).catch(error => {
            console.log('error');
            reject({
                error,
                description:'Error Db'
            });
        });
    });
};


const insertAgua = async (macetero, valor) =>{
    return new Promise((resolve,reject)=> {
        models.agua.create({
            valor
        }).then(aguaCreated => {
            console.log('agua creado');
            macetero.addMaceteroAgua(aguaCreated);
            console.log('agua asignado');

            let plantaAsignada = macetero.dataValues.maceteroPlanta[0];

            if(valor <= 0.2){
                models.notificaciones.create({
                    tipo: 'Agua',
                    descripcion: 'Porcensaje menor al 20%'
                }).then(notificacion => {
                    if(notificacion){
                        console.log('NOTIFICACION CREADA AGUA');
                        plantaAsignada.addAsignadaNotificaciones(notificacion);
                        console.log('NOTIFICACION RELACIONADA AGUA');
                        resolve({ok:'ok'});
                    }else{
                        reject({
                            description:'Error creando notificacion'
                        });
                    }
                }).catch(error => {
                    reject({
                        error,
                        description:'Error'
                    });
                })
            }else{
                resolve({ok:'ok'});
            }

        }).catch(error => {
            console.log('error');
            reject({
                error,
                description:'Error Db'
            });
        });
    });
};






router.post('/testPlanta',(req,res,next)=>{

    models.plantaAsignada.findAll({
        include: {
            model: models.notificaciones,
            as: 'asignadaNotificaciones'
        }
    })
    .then(findall =>{
        res.json({
            findall
        });
    })
    .catch(error => {
        console.log('ERROR: ', error);
        res.json({
            error
        });
    })
});

router.post('/testPlanta2',(req,res,next)=>{

    models.plantaAsignada.findAll({
        include: {
            model: models.planta
        }
    })
    .then(findall =>{
        res.json({
            findall
        });
    })
    .catch(error => {
        console.log('ERROR: ', error);
        res.json({
            error
        });
    })
});








module.exports = router;
