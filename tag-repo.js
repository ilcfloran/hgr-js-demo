"use restrict";

var promise = require("bluebird");
var db      = require("./db");

module.exports =
{
    listTags: function()
    {
        return db.select("id", "type").from("tags").where('zone', 'Zone002').then();
    },

    saveTag: function(tag)
    {
        return db("tags").insert(tag).then();
    },

    getTag: function(key)
    {
        return db("tags").where('tag-id', key).then();
    },

    updateTag: function(key, tag)
    {
        return db("tags").where('tag-id', key).update(tag).then();
    }
};