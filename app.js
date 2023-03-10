//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect('mongodb+srv://Ammanbutt:Amman.butt15@cluster0.tycifer.mongodb.net/todolistDB',{useNewUrlParser:true});
const itemSchema =new mongoose.Schema({
  name:String
});
const Item = mongoose.model("Item",itemSchema);// use capital starting letter
const item1=new Item({
  name:"buy food"
});

const item2=new Item({
  name:"cook food"
});

const item3=new Item({
  name:"eat food"
});

const defaultItems=[item1,item2,item3];

const listSchema={
name: String,
items:[itemSchema]
};
const List=mongoose.model("List",listSchema);


app.get("/", function(req, res) {
Item.find({},function(err,retrievedItems)
{
  if(retrievedItems.length==0)
  {
      Item.insertMany(defaultItems,function(err){
      if (err)
      {
        console.log(err);
      }
      else 
      {
        console.log("Items inserted successfully");
      }
    });
    res.redirect("/")//done to redirect to home route to repeat the process
  }
  else 
  {
    res.render("list", {listTitle: "Today", newListItems: retrievedItems});
  }
})
});

app.get("/:customListName", function(req,res){
  const customListName=_.capitalize(req.params.customListName);
List.findOne({name:customListName},function(err,foundList)
{
  if(!err)
  {
    if(!foundList)
    {
      const list= new List({
      name:customListName,
      items:defaultItems
  });
    list.save();
    res.redirect("/"+ customListName);
    }

    else
    {
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }
})
  

  
});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item4=new Item(
    {
      name: itemName
    }
  );
  if (listName==="Today")
  {
    item4.save();
  res.redirect("/");
  }
  else 
  {
    List.findOne({name: listName},function(err,foundList)
    {
      foundList.items.push(item4);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
  
});

app.post("/delete",function(req,res)
{
  const checkedItemId = req.body.checkbox;
  const listName= req.body.listName;
  
  if (listName === "Today")
  {
      Item.findByIdAndRemove(checkedItemId,function(err)
    {
      if(err)
      {
        console.log(err);
      }
      else{
        console.log("removed successfully");
        res.redirect("/");
      }
  });
  }
  else 
  {
    List.findOneAndUpdate({name:listName},{$pull:{items :{_id: checkedItemId}}},function(err,foundList)
      {
        if(!err)
        {
          res.redirect("/"+ listName);
        }
      })
  }

  
});

app.get("/about", function(req, res){
  res.render("about");
});
const port =process.env.port || 3000;
app.listen(port, function() {
  console.log("Server started on port 3000");
});
