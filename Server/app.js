var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');
var app = express();
var AWS = require('aws-sdk');

AWS.config.update({region: 'us-east-2'});

ddb = new AWS.DynamoDB();

app.use(cors());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const processItems = function(items) {
  const people = {};
  items.forEach(function(item) {
    people[item.name.S] = parseInt(item.score.N)
  });
  return people;
}

const processToArray = function(items) {
  return items.map(function(item) {
    return {name: item.name.S, score: parseInt(item.score.N)}
  })
};

app.get('/', function(req, res) {
  ddb.scan({TableName: 'scores'}, function(err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(processToArray(data.Items).sort(function (a, b) {
        return a.score - b.score
      }));
    }
  });
});

app.post('/update', function(req, res) {
  // Clone so we can access innocents later
  const participants = req.body.innocent.slice(0);
  participants.push(req.body.caller);
  if (participants.indexOf(req.body.getCalled) === -1) {
    participants.push(req.body.getCalled);
  }

  const keysQuery = participants.map(function(individual) {
    return {"name": {S: individual}}
  });

  const params = {
    RequestItems: {
      "scores":  {
        Keys: keysQuery
      }
    }
  }

  ddb.batchGetItem(params, function(err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      const scoresToUpdate = processItems(data.Responses.scores);
      participants.forEach(function(individual) {
        console.log('individual name', individual);
        if (typeof scoresToUpdate[individual] === 'undefined') {
          scoresToUpdate[individual] = 0;
        }
      });
      const innocentScoreChange = req.body.callerWins ? -1 : 1;
      const guiltyScoreChange = req.body.callerWins ? 1 : -1;
      if (req.body.caller === req.body.getCalled) {
        scoresToUpdate[req.body.caller] += 4*guiltyScoreChange;
      } else {
        scoresToUpdate[req.body.caller] += 2*guiltyScoreChange;
        scoresToUpdate[req.body.getCalled] += 1*guiltyScoreChange;
      }

      req.body.innocent.forEach(function(individual) {
        scoresToUpdate[individual] += 1*innocentScoreChange;
      })

      console.log(scoresToUpdate);

      const requests = [];

      Object.keys(scoresToUpdate).forEach(function(individual) {
        const score = scoresToUpdate[individual];

        requests.push({
          PutRequest: {
            Item: {
              "name": {
                S: individual
              },
              "score": {
                N: score.toString()
              }
            }
          }
        });
      })


      const writeParams = {
        RequestItems: {
          "scores": requests
        }
      }

      ddb.batchWriteItem(writeParams, function(err, data) {
        if (err) {
          res.status(500).send(err);
        } else {
          if (Object.keys(data.UnprocessedItems).length === 0) {
            const finalResponse = Object.keys(scoresToUpdate).map(function(name) {
              return {name: name, score: scoresToUpdate[name]}
            });
            res.status(200).send(finalResponse);
          } else {
            res.status(500).send(data.UnprocessedItems);
          }
        }
      })
    }
  });
});

app.get('/users/:userName', function(req, res) {
  ddb.getItem({
    TableName: 'scores',
    "Key": {
      "name": {
        S: req.params.userName
      }
    }
  }, function(err, data) {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send(processItems([data.Item]));
    }
  })
});

app.get('/highest', function(req, res) {
  ddb.scan({TableName: 'scores'}, function(err, data) {
    const sortedArray = processToArray(data.Items).sort(function(a, b) {
      return b.score - a.score;
    });
    const filteredArray = sortedArray.filter(function(item) {
      return item.score === sortedArray[0].score
    })
    res.status(200).send(filteredArray);
  });
});

app.get('/lowest', function(req, res) {
  ddb.scan({TableName: 'scores'}, function(err, data) {
    const sortedArray = processToArray(data.Items).sort(function(a, b) {
      return a.score - b.score;
    });
    const filteredArray = sortedArray.filter(function(item) {
      return item.score === sortedArray[0].score
    })
    res.status(200).send(filteredArray);
  });
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
});

module.exports = app;
