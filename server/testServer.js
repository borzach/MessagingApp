var axios = require('axios');
var data = JSON.stringify({
    "collection": "users",
    "database": "messagingApp",
    "dataSource": "ClusterMessagingApp",
    "projection": {
        "_id": 1
    }
});
            
var config = {
    method: 'post',
    url: 'https://eu-west-2.aws.data.mongodb-api.com/app/data-ikxmv/endpoint/data/v1/action/findOne',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': 'J3f5UJCDAjgcAW1idR4mi4vsb8vFy2DYpAWi1rqGXdQ2iFRdgdu5JlQywffRWQpW',
    },
    data: data
};
            
axios(config)
    .then(function (response) {
        console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
        console.log(error);
    });
