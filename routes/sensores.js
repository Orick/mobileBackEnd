const express = require('express');
const router = express.Router();
const models = require('../models');
const firebaseAdmin = require('../config/firebaseConfig');

//para pruebas
router.post('/insertMacetero',(req,res,next)=>{

    models.macetero.create({
        idMacetero:req.body.idMacetero,
        nombreRed: req.body.nombreRed,
        passRed: req.body.passRed
    }).then(maceteroCreated =>{

        models.plantaAsignada.create({
            fechaFin: new Date(),
            estado: true,
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
    // req.body.luz
    // req.body.agua

    models.macetero.findOne({
        where:{
            idMacetero: req.body.idMacetero
        },
        include: {
            model: models.plantaAsignada,
            as: 'maceteroPlanta',
            where: {
                estado : true
            },
            include: {
                model: models.planta
            }
        }
    }).then( macetero => {
        if ( macetero ){


            let datosCuidado = macetero.dataValues.maceteroPlanta[0];
            let datosPlanta = macetero.dataValues.maceteroPlanta[0].dataValues.planta[0];
            let plantaAsignada = macetero.dataValues.maceteroPlanta[0];

            if( datosPlanta && datosCuidado && plantaAsignada){
                console.log('Datos ok');
                let estadoHumedad, estadoLuz, estadoAgua;
                console.log("Datos por cuidado");
                if(datosCuidado.tipoCuidado){
                    // humedad: this.body.humedad,
                    // luz: this.body.luz,
                    // agua: this.body.agua,
                    estadoHumedad = req.body.humedad <= datosPlanta.humedadOptima? false : true;
                    estadoLuz = req.body.luz <= datosPlanta.luzOptima? false : true;
                    estadoAgua = req.body.agua <= 0.2 ? false : true;
                }else{
                    estadoHumedad = req.body.humedad <= datosPlanta.humedadMinima? false : true;
                    estadoLuz = req.body.luz <= datosPlanta.luzMinima? false : true;
                    estadoAgua = req.body.agua <= 0.2 ? false : true;
                }
                // tipoCuidato 1 = Optimo
                // tipoCuidato 0 = Minimo
                //  insertHumedad(macetero, req.body.humedad),
                //  insertLuz(macetero, req.body.luz),
                //  insertAgua(macetero, req.body.agua)
                models.sensores.create({
                    humedad: req.body.humedad,
                    luz: req.body.luz,
                    agua: req.body.agua,
                    estadoHumedad,
                    estadoLuz,
                    estadoAgua
                }).then(sensadoCreated => {
                    console.log('sensado creado');
                    macetero.addMaceteroSensores(sensadoCreated);
                    console.log('sensado asignado');
                    //Notificaciones
                    //modificar solo que notificaciones
                    let listInsertsNotificaciones = [
                                        insertHumedad(macetero, req.body.humedad),
                                        insertLuz(macetero, req.body.luz),
                                        insertAgua(macetero, req.body.agua)
                                    ];
                    Promise.all(listInsertsNotificaciones)
                    .then( notificaciones => {
                        res.json({
                            status: 1,
                            statusCode: 'sensores/insert/ok',
                            description: 'insert ok',
                            notificaciones
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


                    //Notificaciones
                }).catch(error => {
                    console.log('error');
                    res.json({
                        status: 0,
                        error,
                        description:'Error Db'
                    });
                });

                

            }else{
                res.json({
                    status: 0,
                    statusCode: 'sensores/insert/error',
                    description: 'database error, error buscando datos'
                });
            }
        }else{
            res.json({
                status: 0,
                statusCode: 'sensores/insert/error44',
                description: 'Macetero no encontrado'
            });
        }
    }).catch(error => {
        console.log(error);
        res.json({
            status: 0,
            statusCode: 'sensores/insert/error55',
            description: 'database error'
        });
    });
});

// router.post('/insert',(req,res,next)=>{
//     // req.body.idMacetero
//     // req.body.humedad
//     // req.body.luz
//     // req.body.agua

//     models.macetero.findOne({
//         where:{
//             idMacetero: req.body.idMacetero
//         },
//         include: {
//             model: models.plantaAsignada,
//             as: 'maceteroPlanta',
//             where: {
//                 estado : true
//             },
//             include: {
//                 model: models.planta
//             }
//         }
//     }).then( macetero => {
//         if ( macetero ){
//             let listInserts = [
//                                 insertHumedad(macetero, req.body.humedad),
//                                 insertLuz(macetero, req.body.luz),
//                                 insertAgua(macetero, req.body.agua)
//                             ];
//             Promise.all(listInserts)
//             .then( inserts => {
//                 res.json({
//                     status: 1,
//                     statusCode: 'sensores/insert/ok',
//                     description: 'insert ok',
//                     inserts
//                 });
//             })
//             .catch( error => {
//                 res.json({
//                     status: 0,
//                     statusCode: 'matchlist/find/error',
//                     description: 'Error base de datos',
//                     error: error.toString()
//                 });
//             });

//         }else{
//             res.json({
//                 status: 0,
//                 statusCode: 'sensores/insert/error44',
//                 description: 'Macetero no encontrado'
//             });
//         }
//     }).catch(error => {
//         console.log(error);
//         res.json({
//             status: 0,
//             statusCode: 'sensores/insert/error55',
//             description: 'database error'
//         });
//     });
// });



const insertHumedad = async (macetero, valor) =>{
    return new Promise((resolve,reject)=> {
        let datosCuidado = macetero.dataValues.maceteroPlanta[0];
        let datosPlanta = macetero.dataValues.maceteroPlanta[0].dataValues.planta[0];
        let plantaAsignada = macetero.dataValues.maceteroPlanta[0];

        
            // tipoCuidato 1 = Optimo
            // tipoCuidato 0 = Minimo
        if(datosCuidado.tipoCuidado){
            if(valor <= datosPlanta.humedadOptima ){
                models.notificaciones.create({
                    tipo: 'Humedad',
                    descripcion: 'Humedad de '+valor+', menor a la condición óptima'
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
                    descripcion: 'Humedad de '+valor+',menor a la condición mínima'
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







        // models.humedad.create({
        //     valor
        // }).then(humedadCreated => {
        //     console.log('humedad creado');
        //     macetero.addMaceteroHumedad(humedadCreated);
        //     console.log('humedad asignado');

        //     let datosCuidado = macetero.dataValues.maceteroPlanta[0];
        //     let datosPlanta = macetero.dataValues.maceteroPlanta[0].dataValues.planta[0];
        //     let plantaAsignada = macetero.dataValues.maceteroPlanta[0];
        //     if( datosPlanta && datosCuidado ){
        //         console.log('Datos ok');
        //         // tipoCuidato 1 = Optimo
        //         // tipoCuidato 0 = Minimo
        //         if(datosCuidado.tipoCuidado){
        //             if(valor <= datosPlanta.humedadOptima ){
        //                 models.notificaciones.create({
        //                     tipo: 'Humedad',
        //                     descripcion: 'Humedad registrada menor a la humedad óptima'
        //                 }).then(notificacion => {
        //                     if(notificacion){
        //                         console.log('NOTIFICACION CREADA HUMEDAD');
        //                         plantaAsignada.addAsignadaNotificaciones(notificacion);
        //                         console.log('NOTIFICACION RELACIONADA HUMEDAD');
        //                         resolve({ok:'ok'});
        //                     }else{
        //                         reject({
        //                             description:'Error creando notificacion'
        //                         });
        //                     }
        //                 }).catch(error => {
        //                     reject({
        //                         error,
        //                         description:'Error'
        //                     });
        //                 })
        //             }else{
        //                 resolve({ok:'ok'});
        //             }
        //         }else{
        //             if(valor <= datosPlanta.humedadMinima){
        //                 models.notificaciones.create({
        //                     tipo: 'Humedad',
        //                     descripcion: 'Humedad registrada menor a la humedad mínima'
        //                 }).then(notificacion => {
        //                     if(notificacion){
        //                         console.log('NOTIFICACION CREADA HUMEDAD');
        //                         plantaAsignada.addAsignadaNotificaciones(notificacion);
        //                         console.log('NOTIFICACION RELACIONADA HUMEDAD');
        //                         resolve({ok:'ok'});
        //                     }else{
        //                         reject({
        //                             description:'Error creando notificacion'
        //                         });
        //                     }
        //                 }).catch(error => {
        //                     reject({
        //                         error,
        //                         description:'Error'
        //                     });
        //                 })
        //             }else{
        //                 resolve({ok:'ok'});
        //             }
        //         }
        //         // console.log(datosCuidado);
        //         // console.log(datosPlanta);
        //         // resolve({ok:planta.dataValues.maceteroPlanta[0].dataValues.planta[0]});
        //     }else{
        //         console.log(datosPlanta, datosCuidado );
        //         reject({
        //             description:'Error'
        //         });
        //     }
        // }).catch(error => {
        //     console.log('error');
        //     reject({
        //         error,
        //         description:'Error Db'
        //     });
        // });
    });
};

const insertLuz = async (macetero, valor) =>{
    return new Promise((resolve,reject)=> {


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
                        descripcion: 'Luz de '+valor+', menor a la condición óptima'
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
                        descripcion: 'Luz de '+valor+', menor a la condición mínima'
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
                description:'Error'
            });
        }
    
        // models.luz.create({
        //     valor
        // }).then(luzCreated => {
        //     console.log('luz creado');
        //     macetero.addMaceteroLuz(luzCreated);
        //     console.log('luz asignado');

        //     let datosCuidado = macetero.dataValues.maceteroPlanta[0];
        //     let datosPlanta = macetero.dataValues.maceteroPlanta[0].dataValues.planta[0];
        //     let plantaAsignada = macetero.dataValues.maceteroPlanta[0];
        //     if( datosPlanta && datosCuidado ){
        //         console.log('Datos ok');
        //         // tipoCuidato 1 = Optimo
        //         // tipoCuidato 0 = Minimo
        //         if(datosCuidado.tipoCuidado){
        //             if(valor <= datosPlanta.luzOptima){
        //                 models.notificaciones.create({
        //                     tipo: 'Luz',
        //                     descripcion: 'Luz registrada menor a la luz óptima'
        //                 }).then(notificacion => {
        //                     if(notificacion){
        //                         console.log('NOTIFICACION CREADA LUZ');
        //                         plantaAsignada.addAsignadaNotificaciones(notificacion);
        //                         console.log('NOTIFICACION RELACIONADA LUZ');
        //                         resolve({ok:'ok'});
        //                     }else{
        //                         reject({
        //                             description:'Error creando notificacion'
        //                         });
        //                     }
        //                 }).catch(error => {
        //                     reject({
        //                         error,
        //                         description:'Error'
        //                     });
        //                 })
        //             }else{
        //                 resolve({ok:'ok'});
        //             }
        //         }else{
        //             if(valor <= datosPlanta.luzMinima){
        //                 models.notificaciones.create({
        //                     tipo: 'Luz',
        //                     descripcion: 'Luz registrada menor a la luz mínima'
        //                 }).then(notificacion => {
        //                     if(notificacion){
        //                         console.log('NOTIFICACION CREADA LUZ');
        //                         plantaAsignada.addAsignadaNotificaciones(notificacion);
        //                         console.log('NOTIFICACION RELACIONADA LUZ');
        //                         resolve({ok:'ok'});
        //                     }else{
        //                         reject({
        //                             description:'Error creando notificacion'
        //                         });
        //                     }
        //                 }).catch(error => {
        //                     reject({
        //                         error,
        //                         description:'Error'
        //                     });
        //                 })
        //             }else{
        //                 resolve({ok:'ok'});
        //             }
        //         }
        //     }else{
        //         reject({
        //             description:'Error'
        //         });
        //     }
        // }).catch(error => {
        //     console.log('error');
        //     reject({
        //         error,
        //         description:'Error Db'
        //     });
        // });
    });
};


const insertAgua = async (macetero, valor) =>{
    return new Promise((resolve,reject)=> {
        
        let plantaAsignada = macetero.dataValues.maceteroPlanta[0];

        if(valor <= 0.2){
            models.notificaciones.create({
                tipo: 'Agua',
                descripcion: 'Porcentaje de agua restante '+valor+'%'
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



        // models.agua.create({
        //     valor
        // }).then(aguaCreated => {
        //     console.log('agua creado');
        //     macetero.addMaceteroAgua(aguaCreated);
        //     console.log('agua asignado');

        //     let plantaAsignada = macetero.dataValues.maceteroPlanta[0];

        //     if(valor <= 0.2){
        //         models.notificaciones.create({
        //             tipo: 'Agua',
        //             descripcion: 'Porcentaje menor al 20%'
        //         }).then(notificacion => {
        //             if(notificacion){
        //                 console.log('NOTIFICACION CREADA AGUA');
        //                 plantaAsignada.addAsignadaNotificaciones(notificacion);
        //                 console.log('NOTIFICACION RELACIONADA AGUA');
        //                 resolve({ok:'ok'});
        //             }else{
        //                 reject({
        //                     description:'Error creando notificacion'
        //                 });
        //             }
        //         }).catch(error => {
        //             reject({
        //                 error,
        //                 description:'Error'
        //             });
        //         })
        //     }else{
        //         resolve({ok:'ok'});
        //     }

        // }).catch(error => {
        //     console.log('error');
        //     reject({
        //         error,
        //         description:'Error Db'
        //     });
        // });
    });
};


router.post('/getLast',(req,res,next)=>{
    // req.body.token
    // req.body.idMacetero
    // include: {
    //     model: models.plantaAsignada,
    //         as: 'maceteroPlanta',
    //         order: 'createdAt DESC',
    //         include: {
    //         model: models.planta,
    //             order: 'createdAt DESC'
    //     }
    // }

    // firebaseAdmin.auth().verifyIdToken(req.body.token)
    // .then(decodedToken => {
    //     models.user.findOne({
    //         where:{
    //             token: decodedToken.uid
    //         },
    //         include: {
    //             model: models.macetero,
    //             as: 'userMacetero',
    //             where: {
    //                 idMacetero: req.body.idMacetero
    //             },
    //             include:{
    //                 model: models.humedad,
    //                 as: 'maceteroHumedad',
    //                 order: 'createdAt DESC'
    //             }
    //         }
    //     })
    //     .then(Humedad =>{
    //         models.user.findOne({
    //             where:{
    //                 token: decodedToken.uid
    //             },
    //             include: {
    //                 model: models.macetero,
    //                 as: 'userMacetero',
    //                 where: {
    //                     idMacetero: req.body.idMacetero
    //                 },
    //                 include:{
    //                     model: models.luz,
    //                     as: 'maceteroLuz',
    //                     order: 'createdAt DESC'
    //                 }
    //             }
    //         })
    //         .then(Luz =>{
    //             models.user.findOne({
    //                 where:{
    //                     token: decodedToken.uid
    //                 },
    //                 include: {
    //                     model: models.macetero,
    //                     as: 'userMacetero',
    //                     where: {
    //                         idMacetero: req.body.idMacetero
    //                     },
    //                     include:{
    //                         model: models.agua,
    //                         as: 'maceteroAgua',
    //                         order: 'createdAt DESC'
    //                     }
    //                 }
    //             })
    //             .then(Agua =>{
    //                 let l1 = Humedad.dataValues.userMacetero[0].dataValues.maceteroHumedad.length;
    //                 let l2 = Agua.dataValues.userMacetero[0].dataValues.maceteroAgua.length;
    //                 let l3 = Luz.dataValues.userMacetero[0].dataValues.maceteroLuz.length;
    //                 console.log('HUMEDAD ULTIMO',Humedad.dataValues.userMacetero[0].dataValues.maceteroHumedad[l1-1].valor);
    //                 console.log('AGUA ULTIMO',Agua.dataValues.userMacetero[0].dataValues.maceteroAgua[l2-1].valor);
    //                 console.log('LUZ ULTIMO',Luz.dataValues.userMacetero[0].dataValues.maceteroLuz[l3-1].valor);
    //                 res.json({
    //                     status:1,
    //                     Humedad:Humedad.dataValues.userMacetero[0].dataValues.maceteroHumedad[l1-1].valor,
    //                     Luz:Luz.dataValues.userMacetero[0].dataValues.maceteroLuz[l3-1].valor,
    //                     Agua:Agua.dataValues.userMacetero[0].dataValues.maceteroAgua[l2-1].valor
    //                 });
    //             })
    //             .catch(error => {
    //                 console.log('ERROR: ', error);
    //                 res.json({
    //                     error
    //                 });
    //             });
    //         })
    //         .catch(error => {
    //             console.log('ERROR: ', error);
    //             res.json({
    //                 error
    //             });
    //         });
    //     })
    //     .catch(error => {
    //         console.log('ERROR: ', error);
    //         res.json({
    //             error
    //         });
    //     })
    // }).catch(error =>{
    //     res.json({
    //         code:'0',
    //         description:'error al verificar token de usuario',
    //     });
    // });


    firebaseAdmin.auth().verifyIdToken(req.body.token)
    .then(decodedToken => {
        models.user.findOne({
            where:{
                token: decodedToken.uid
            },
            include: {
                model: models.macetero,
                as: 'userMacetero',
                where: {
                    idMacetero: req.body.idMacetero
                },
                include:{
                    model: models.sensores,
                    as: 'maceteroSensores',
                    order: 'createdAt DESC'
                }
            }
        })
        .then(sensores =>{
                    let l1 = sensores.dataValues.userMacetero[0].dataValues.maceteroSensores.length;
        
                    // console.log('HUMEDAD ULTIMO',Humedad.dataValues.userMacetero[0].dataValues.maceteroHumedad[l1-1].valor);
                    // console.log('AGUA ULTIMO',Agua.dataValues.userMacetero[0].dataValues.maceteroAgua[l2-1].valor);
                    // console.log('LUZ ULTIMO',Luz.dataValues.userMacetero[0].dataValues.maceteroLuz[l3-1].valor);
                    res.json({
                        status:1,
                        Humedad: sensores.dataValues.userMacetero[0].dataValues.maceteroSensores[l1-1].humedad,
                        Luz:     sensores.dataValues.userMacetero[0].dataValues.maceteroSensores[l1-1].luz,
                        Agua:    sensores.dataValues.userMacetero[0].dataValues.maceteroSensores[l1-1].agua,
                        estadoHumedad: sensores.dataValues.userMacetero[0].dataValues.maceteroSensores[l1-1].estadoHumedad,
                        estadoLuz: sensores.dataValues.userMacetero[0].dataValues.maceteroSensores[l1-1].estadoLuz,
                        estadoAgua: sensores.dataValues.userMacetero[0].dataValues.maceteroSensores[l1-1].estadoAgua
                    });
        })
        .catch(error => {
            console.log('ERROR: ', error);
            res.json({
                status: 0,
                error
            });
        })
    }).catch(error =>{
        res.json({
            status:0,
            description:'error al verificar token de usuario',
        });
    });


});


router.post('/getLastForce',(req,res,next)=>{


    res.json({
        ok:'ok'
    });


});

















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
