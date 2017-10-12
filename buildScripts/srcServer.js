import express from 'express';
import path from 'path';
import open from 'open';
import webpack from 'webpack';
import config from '../webpack.config.dev';
var db = require("../db");
var tagRepo = require("../tag-repo");
var dateFormat = require('dateformat');

//const db = require('node-localdb');
//const user = db('C:/TagDB/tag.json')
const port = 3000;
const app = express();
const compiler = webpack(config);
//var cache = require('./cache');
app.use(express.static('public'));
const controllers = require("../controllers");
const NodeCache = require("node-cache");
const tagCache = new NodeCache();

controllers.init(app, tagRepo);

app.set("view engine", "vash");
//var knex = require("knex")(cfg);

// knex.select().from('Tags_tbl').asCallback(function(err, rows)
// {
//     if(err) { console.log(err); }
//     else
//         {
//             console.log(rows);
//         }
//     knex.destroy();
//     console.log("Done.....");
// });


app.use(require('webpack-dev-middleware')(compiler, {
    noInfo: true,
    publicPath: config.output.publicPath
}));

app.use(express.static('src/views'));



app.get('/workers', function(req, res) {

    //return json object of workers in the site
    res.sendFile(path.join(__dirname, '../src/views/index.html'));
});


app.listen(port, function(err) {
    if (err) {
        console.log(err);
    } else {
        open('http://localhost:' + port);
    }
});

const dgram = require('dgram');
const server = dgram.createSocket('udp4');

server.on('error', (err) => {
  console.log(`server error:\n${err.stack}`);
  server.close();
});

function isEmptyObject(obj) {
  return !Object.keys(obj).length;
}

server.on('message', (pkt, rinfo) => {
  //console.log(`server got: ${pkt} from ${rinfo.address}:${rinfo.port}`);
  var items = JSON.parse(pkt);
  
  //console.log(items);
  var zones = ["Zone001", "Zone002"];
  const tags = {};
  
  if(items !== null && items !== '' && items.zones.length > 0) {
    
    var tagKey = items.id;
    //console.log("All tags in memory is => "+ cache.getAll().length);    
    var tagInMemory = tagCache.get(tagKey);
    //console.log(tagCache.get(tagKey));
    //console.log("tag in memory is => "+ JSON.stringify(tagInMemory));
   
    //var tst = (tagInMemory === undefined) ? "undefined" : tagInMemory.zones[0].name;
    console.log("Tag zone is: ...........");
    
    //check if zone is undefined
    //console.log(items.zones[0].name);

    console.log("Tag key is: " + tagKey);

    // if(items.zones.length > 0)
    // {
        
    // }

    if( tagInMemory === undefined){
        tagCache.set(tagKey, items);
    }else if(tagInMemory.zones[0].name != items.zones[0].name)
    {
        console.log("Tag in memory zone is: ...........");
        console.log(tagInMemory.zones[0].name);
        //console.log("*************Entered Else block*************");
        switch(tagInMemory.zones[0].name){
            case 'Zone001':
                console.log("Worker entered the area");
                //Update database to change tags zone to zone2
                var tmpTag = tagCache.get(tagKey);
                tmpTag.zones[0].name = 'Zone002';
                tagCache.set(tagKey, tmpTag);

                //add object mapper later
                var now = new Date();
                var dbTag = 
                {
                    'tag-id': tmpTag.id,
                    'zone': tmpTag.zones[0].name,
                    'prev-zone': 'Zone001',
                    'time': dateFormat(now, "yyyy-mm-dd'T'HH:MM:ss")
                };

                tagRepo.saveTag(dbTag).then(function(result){
                    console.log(result);
                }).catch(function(err){
                    console.log(err);
                });
                
                // .finally(function(){
                //     db.destroy();
                // });
                break;
            case 'Zone002':
                console.log("Worker exited the area");
                //Update database to change tags zone to zone1
                //console.log(cache.get)
                //tags[items['tag-id']]
                
                var tmpTag = tagCache.get(tagKey);
                tagCache.del(tagKey);

                //Persistence operation
                var now = new Date();
                var dbTag = {};
                tagRepo.getTag(tagKey).then(function(result){
                    dbTag = result;
                }).catch(function(err){
                    console.log(err);
                });

                dbTag['zone'] = 'Zone001';
                dbTag['time'] = dateFormat(now, "yyyy-mm-dd'T'HH:MM:ss");
                dbTag['prev-zone'] = tmpTag.zones[0].name;
                
                tagRepo.updateTag(tagKey, dbTag).then(function(result){
                    console.log(result);
                }).catch(function(err){
                    console.log(err);
                });
                
                // .finally(function(){
                //     db.destroy();
                // });
                
                break;
        }
    }



    //console.log("Packet received #####################");
    //console.log(tags[items["tag-id"]]);
    //console.log("###########################");

    // console.log("going to insert into the database ......");
    // knex.insert(items).returning('id').into("Tags_tbl").then(function(id)
    // {
    //     console.log(id);
    // });
    // console.log("End of Query .... !!");


    //knex.destroy();
    
    
    // knex.raw(
    //     'INSERET INTO Tags_tbl (tag-id, zone, type) VALUES (?, ?, ?)',
    //     [items['tag-id'], items.zone, items.tp]
    // ).then(function(id){
    //     console.log(id);
    //     console.log("here in then block");
    // })
    // .finally(function()
    // {
    //     knex.destroy();
    //     console.log("Insert Done ...");
    // });

    // knex('Tags_tbl').insert({'tag-id': tmpvar.id, 'zone': tmpvar.zn, 'type': tmpvar.kind}).then(function(id){
    //     console.log(id);
    // })
    // .finally(function()
    // {
    //     knex.destroy();
    // });

    // knex('Tags_tbl').insert({'tag-id': 800, 'zone': 'zone0'}).then(function(id){
    //     console.log(id);
    // })
    // .finally(function()
    // {
    //     knex.destroy();
    // });

  }
  

//  if (isEmptyObject(items.zones))
//   user.insert({name: items.id, zone: 'no-zone'});
//  else
//   user.insert({name: items.id, zone: items.zones[0].name}); 
});

// Uncomment for server to listen for HTTP requests

// server.on('listening', () => {
//   const address = server.address();
//   console.log(`server listening ${address.address}:${address.port}`);
// });

// server.bind(3001);