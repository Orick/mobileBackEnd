const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const models = require('../models');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

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

    module.exports = router;