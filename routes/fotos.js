const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const router = express.Router();
const models = require('../models');
//var FS = require('fs');

app.use(bodyParser.urlencoded({ extended: false }));

router.post('/insertfoto',(req,res,next)=>{

    //var imagen = FS.readFileSync(req.body['imagen']);
    var imagen = req.body['base64code'];
    var idMacetero = req.body['idMacetero'];

    //console.log(imagen);

    if(idMacetero){
        models.macetero.findOne({
            where:{
                idMacetero: idMacetero
            }
        })
        .then(macetero => {
            if (macetero) {
                models.fotos.create({
                    imagen: imagen
                })
                .then(fotoIng => {
                    macetero.addMaceteroFotos(fotoIng);
                })
                .catch(error => {
                    console.log(error);
                    res.json({
                        status: 0,
                        description: 'Problemas al ingresar la imagen'
                    });
                });
            } else {
                res.json({
                    status: 0,
                    description: 'Macetero nulo'
                });
            }
        })
        .catch(error => {
            console.log(error);
            res.json({
                status: 0,
                description: 'Problema al buscar el macetero'
            });
        });
    } else {
        res.json({
            status: 0,
            description: 'Ocurrio un problema con el macetero'
        });
    }
});

router.get('/:idMacetero', (req, res) => {
    models.fotos.findOne({
        where: {
          idMacetero: req.params.idMacetero
        },
        include: {
            model: models.fotos,
            as: 'maceteroFotos'
        }
    })
    .then(macetero =>{
        if (macetero){
            
            /* var blobURL = blobUtil.createObjectURL(foto.imagen);
            var newImg = document.createElement('img');
            
            newImg.src = blobURL; */
            
            res.json({
                status: 1,
                data: macetero
            });
        } else {
            console.log('No se pudo cargar la imagen')
            res.status(400).json({
                status:0
            });
        }
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