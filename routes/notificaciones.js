const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const models = require('../models');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const firebaseAdmin = require('../config/firebaseConfig');

app.use(bodyParser.urlencoded({ extended: false }));


router.get('/all', (req, res, next)=>{
    models.notificaciones
    .findAll()
    .then(notificaciones => {
        if (notificaciones){
            res.json({
                status: 1,
                data: notificaciones
            });
        } else {
            res.status(400).json({
                status:0
            });
        }
    }).catch(error => {
        res.status(400).json({
            status:0
        });
    });
});

router.post('/search', (req, res, next)=>{
    var idMacetero = req.body['idMacetero'];
    /* firebaseAdmin.auth().verifyIdToken(req.body.token)
        .then(decodedToken => {
                var iduser = decodedToken.uid; */
    models.plantaAsignada
    .findOne({
        where:  {maceteroIdMacetero: idMacetero,
                estado: true
                }
    })
    .then(response=>{
        if (response){
            models.notificaciones
            .findAll({
                where: {plantaAsignadaId: response.id}
            })
            .then(notificaciones=>{
                if (notificaciones){
                    res.json({
                        status: 1,
                        data: notificaciones
                    });
                }else {
                    res.status(400).json({
                        status:0
                    });
                }
                    
            }).catch(error => {
                res.status(400).json({
                    status:0,
                    error
                });
            });
            /* res.json({
                status: 1,
            data: response
            }); */
        } else {
            res.status(400).json({
                status:0
            });
        }
    }).catch(error => {
        res.status(400).json({
            status:0,
            error
        });
    });
/* }).catch(error =>{
        res.json({
            code:'0',
            error,
            description:'error al verificar token de usuario',
        });
    }); */
});

    module.exports = router;