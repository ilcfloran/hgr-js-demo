import express from 'express';
import path from 'path';
import open from 'open';
import webpack from 'webpack';
import config from '../webpack.config.dev';
var db = require("./db");


//const db = require('node-localdb');
//const user = db('C:/TagDB/tag.json')
const port = 3000;
const app = express();
const compiler = webpack(config);
//var cache = require('./cache');
const NodeCache = require("node-cache");
const tagCache = new NodeCache();

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

app.get('/', function(req, res) {
    //res.sendFile(path.join(__dirname, '../src/views/index.html'));
    res.render("index", {title: "Tags Home Page"});
});

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
  console.log(`server got: ${pkt} from ${rinfo.address}:${rinfo.port}`);
  var items = JSON.parse(pkt);
  
  //console.log(items);
  var zones = ["zone1", "zone2"];
  //const tags = {};
  
  if(items !== null && items !== '') {
    
    //console.log("All tags in memory is => "+ cache.getAll().length);    
    var tagInMemory = tagCache.get(items['tag-id']);
    //console.log("tag in memory is => "+ tagInMemory);
   
    var tst = (tagInMemory === undefined) ? "undefined" : tagInMemory.zone;
    console.log(tst);
    console.log(items.zone);

    if( tagInMemory === undefined){
        //console.log(tags);
        var tagKey = items['tag-id'];
        //console.log(tagKey);
        tagCache.set(tagKey, items);
        console.log("ALLLLLLLLLLLLLLLLLLLLLLL");
        console.log(tagCache.get(''));

    }else if(tagInMemory.zone != items.zone)
    {
        //console.log("*************Entered Else block*************");
        switch(tagInMemory.zone){
            case 'zone1':
                console.log("Worker entered the area");
                //Update database to change tags zone to zone2
                var tmpTag = tagCache.get(items['tag-id']);
                tmpTag.zone = 'zone2';
                tagCache.set(items['tag-id'], tmpTag);
                break;
            case 'zone2':
                console.log("Worker exited the area");
                //Update database to change tags zone to zone1
                //console.log(cache.get)
                //tags[items['tag-id']]
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

server.on('listening', () => {
  const address = server.address();
  console.log(`server listening ${address.address}:${address.port}`);
});

server.bind(3001);