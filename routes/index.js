const express = require('express');
const router = express.Router();
const models = require('../models');
/* GET home page. */
router.get('/', (req, res) => {
    res.json({
        title: 'Nothing?'
    })
});

router.get('/testSelect', (req, res) => {
    console.log(">>>>BBB<<<<<");
    models.user.findAll({
        where:{
            token:"A"
        },
        include: {
            model: models.macetero,
            as: 'userMacetero',
            where : {
                idMacetero: "a"
            }
        }
    }).then( relacionX => {
            res.json({
                relacionX
            });
    }).catch(error => {
        res.json({
            error
        });
    });

});


module.exports = router;


