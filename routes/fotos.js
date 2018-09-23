const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const router = express.Router();
const models = require('../models');
var FS = require('fs');

app.use(bodyParser.urlencoded({ extended: false }));

router.post('/insertfoto',(req,res,next)=>{

    var imagen = FS.readFileSync(req.body['imagen']);

    //console.log(imagen);

    if(imagen){
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
            console.log(error);
            res.json({
                status: 0
            });
        });
    } else {
        res.json({
            status: 0,
            description: 'Imagen is null!!! :('
        });
    }
});

router.get('/:id', (req, res) => {
    models.fotos.findOne({
        where: {
          id: req.params.id
        }
    })
    .then(foto =>{
        if (foto){
            
            /* var blobURL = blobUtil.createObjectURL(foto.imagen);
            var newImg = document.createElement('img');
            
            newImg.src = blobURL; */
            
            res.json({
                status: 1,
                data: foto.imagen
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