const express = require('express');
const router = express.Router();
const models = require('../models');

router.post('/insertfoto',(req,res,next)=>{
    imagen = req.body['imagen'];
    models.fotos.create({
        imagen: imagen
    })
    .then(imagen => {
        if (imagen) {
            res.json({
                status: 1,
                description: "La foto se ingreso correctamente."
            });
        } else {
            res.json({
                status: 0,
                description: "No se puedo ingresar la foto"
            });
        }
    })
    .catch(error => {
        res.json({
            status: 0,
            data: error
        });
    });
});

router.get('/:id', (req, res) => {
    models.fotos.findAll({
        where: {
          id: req.params.id
        }
    })
    .then(fotos =>{
        if (fotos){
            res.json({
                status: 1,
                data: fotos
            });
        } else {
            res.status(400).json({
                status:0
            });
        }
    })
    .catch(error => {
        res.status(400).json({
            status:0,
            data: error
        })
    });
});

module.exports = router;