const express = require('express');
const router = express.Router();
const models = require('../models');
const firebaseAdmin = require('../config/firebaseConfig');

router.post('/insertMacetero',(req,res,next)=>{

    models.macetero.create({
        idMacetero:req.body.idMacetero,
        nombreRed: req.body.nombreRed,
        passRed: req.body.passRed
    }).then(maceteroCreated =>{

        models.plantaAsignada.create({
            fechaFin: new Date(),
            estado: 'ok',
            nombrePlanta: 'test1'
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



router.post('/insertMacetero2',(req,res,next)=>{

    models.macetero.findOne({
        where:{
            idMacetero:req.body.idMacetero
        }
    }).then(maceteroCreated =>{

        models.plantaAsignada.create({
            fechaFin: new Date(),
            estado: 'ok',
            nombrePlanta: 'test2'
        }).then(plantaAsignadaCreated =>{
            maceteroCreated.addMaceteroPlanta(plantaAsignadaCreated);

            models.planta.findOne({
                where:{
                    tipoPlanta: 'tulipan'
                }
            }).then(plantaCreated =>{
                console.log("tulipan entontrado");
                plantaAsignadaCreated.addPlanta(plantaCreated);
                console.log('tulipan asignada');
                res.json({
                    status: 1,
                    statusCode: 'sensores/insertmacetero2/ok',
                    description: 'ok',
                });
            }).catch(error => {
                console.log(error);
                res.json({
                    status: 0,
                    statusCode: 'sensores/insert2/error',
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


router.post('/insert',(req,res,next)=>{
    // req.body.idMacetero
    // req.body.humedad
    // req.body.temperatura
    // req.body.agua


    models.macetero.findOne({
        where:{
            idMacetero: req.body.idMacetero
        }
    }).then( macetero => {
        if ( macetero ){
            console.log(1);
            let listInserts = [insertHumedad(macetero, req.body.humedad)];
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
            // models.humedad.create({
            //     valor:req.body.humedad
            // }).then(humedadCreated =>{
            //     console.log(2);
            //     macetero.addMaceteroHumedad(humedadCreated);
            //     console.log(3);
            //     models.luz.create({
            //         valor:req.body.luz
            //     }).then(luzCreated =>{
            //         console.log(5);
            //         macetero.addMaceteroLuz(luzCreated);
            //
            //         models.agua.create({
            //             valor:req.body.agua
            //         }).then(aguaCreated =>{
            //             macetero.addMaceteroAgua(aguaCreated);
            //
            //             res.json({
            //                 status: 1,
            //                 statusCode: 'sensores/insert/ok',
            //                 description: 'ok',
            //             });
            //
            //         }).catch(error => {
            //             res.json({
            //                 status: 0,
            //                 statusCode: 'sensores/insert/error11',
            //                 description: 'Error base de datos'
            //             });
            //         });
            //     }).catch(error => {
            //         console.log(4);
            //         res.json({
            //             status: 0,
            //             statusCode: 'sensores/insert/error22',
            //             description: 'Error base de datos'
            //         });
            //     });
            //
            //
            // }).catch(error => {
            //     res.json({
            //         status: 0,
            //         statusCode: 'sensores/insert/error33',
            //         description: 'Error base de datos'
            //     });
            // });
            //userX.addUserSummonerX(summonerX);
            // res.json({
            //     status: 0,
            //     statusCode: 'sensores/insert/ok',
            //     description: 'ssss',
            // });
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
            console.log('creado');
            macetero.addMaceteroHumedad(humedadCreated);
            console.log('asignado');

            models.macetero.findOne({
                where:{
                    idMacetero: macetero.dataValues.idMacetero
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
            }).then(planta => {
                let datosPlanta = planta.dataValues.maceteroPlanta[0].dataValues.planta[0];
                if( datosPlanta ){

                    console.log(planta);


                }else{
                    reject({
                        error,
                        description:'Error'
                    });
                }
                //console.log(planta.dataValues.maceteroPlanta[0].dataValues.planta[0]);
                //resolve({ok:planta.dataValues.maceteroPlanta[0].dataValues.planta[0]});

            }).catch( error => {
                console.log('error buscando planta');
                reject({
                    error,
                    description:'Error Db'
                });
            });






        }).catch(error => {
            console.log('error');
            reject({
                error,
                description:'Error Db'
            });
        });




    });
};
// resolve({match:match});
// reject({error:error});





router.post('/testPlanta',(req,res,next)=>{

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
