const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const models = require('../models');
const router = express.Router();
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

app.use(bodyParser.urlencoded({ extended: false }));

router.post('/insert',(req,res,next)=>{
	models.planta.create({
	    tipoPlanta: req.body.tipoPlanta,
	    humedadOptima: req.body.humedadOptima,
	    humedadMinima: req.body.humedadMinima,
	    luzOptima: req.body.luzOptima,
	    luzMinima: req.body.luzMinima
	}).then(plantaCreated =>{
	    res.json({
	        status: 1,
	        statusCode: 'plantas/insert/ok',
	        description: 'ok',
	    });
	}).catch(error => {
	    res.json({
	        status: 0,
	        statusCode: 'planta/insert/error',
	        description: 'Error base de datos'
	    });
	});
});

router.get('/all', (req, res, next)=>{
    models.planta
    .findAll()
    .then(champions=>{
        if (champions){
            res.json({
                status: 1,
            data: champions
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