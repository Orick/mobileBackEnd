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
    models.summoner
        .findAll()
        .then(users => {
            if (users) {
                res.json({
                    status: 1,
                    statusCode: 'summoner/listing',
                    data: users
                });
            } else {
                res.status(400).json({
                    status: 0,
                    statusCode: 'summoner/all/not-found',
                    description: 'There\'s no user information!'
                });
            }
        }).catch(error => {
        res.status(400).json({
            status: 0,
            statusCode: 'database/error',
            description: error.toString()
        });
    });
});


module.exports = router;


