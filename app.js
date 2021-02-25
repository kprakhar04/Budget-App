var express=require("express"),
    mongoose=require("mongoose"),
    bodyParser=require("body-parser"),
    passport=require("passport"),
    User=require("./models/user"),
    LocalStrategy=require("passport-local"),
    passportLocalMongoose=require("passport-local-mongoose"),
    methodOverride=require("method-override"),
    flash=require('connect-flash'),
    dt = require('./module'),
    window=require('window');
var app=express();
mongoose.connect("mongodb://localhost/budget_app",{useUnifiedTopology:true,useNewUrlParser:true});
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine","ejs");
app.use(require("express-session")({
    secret:"Love hates fear",
    resave: false,
    saveUninitialized: false
}))



app.use(flash());
app.use(express.static("public"));
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


var budgetSchema=new mongoose.Schema([{
    item:String,
    cost:Number,
    type:String,
    month:Number,
    year:Number,
    author:{
        id:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        }
    }
}])
var Budget=mongoose.model("Budget",budgetSchema);

//routes



app.get("/",isLoggedIn,function(req,res){
    Budget.find({},function(err,budget){
        if(err){
            console.log(err);
        } else{
            res.render("bud",{budget:budget,currentUser:req.user});
        }
    })
})

app.post("/bud",function(req,res){

    var d1=new Date();

    var item1=new Budget({
        item:req.body.bud.item,
        cost:req.body.bud.cost,
        type:req.body.bud.type,
        month:d1.getMonth(),
        year:d1.getFullYear(),
        author:{
            id:req.user.id
        }
    });
    item1.save();
    res.redirect("/");

})

app.get("/bud/:id/edit",function(req,res){
    Budget.find({},function(err,budget){
        if(err){
            console.log(err);
        } else{
            res.render("bud",{budget:budget,currentUser:req.user});
        }
    })
})
app.put("/bud/:id",function(req,res){
    Budget.findByIdAndUpdate(req.params.id,req.body.bud,function(err,updatedBudget){
        if(err){
            console.log("editing error");
            res.redirect("/");
        } else{
            res.redirect("/");
        }
    })
})

app.delete("/bud/:id",function(req,res){
      Budget.findByIdAndRemove(req.params.id,function(err){
          if(err){
              res.redirect("/");
          } else{
              res.redirect("/");
          }
      })
})

app.get("/summary",function(req,res){
    res.render("summary_form",{mes:req.flash('alert')});
})
app.post("/findsummary",function(req,res){

    if(req.body.month=="select_month"){

        req.flash('alert','Enter a value for month');
        res.redirect("/summary");
    } else if(req.body.year=="select_year"){
        req.flash('alert','Enter a value for year');
        res.redirect("/summary");
    }
    
    var query={month:req.body.month,year:req.body.year};
    var mon=dt.getMonth(req.body.month);
    Budget.find(query,function(err,budget){
        if(err){
            console.log(err);
        } else{
            res.render("budget_summary",{currentUser:req.user,budget:budget,mon:mon,yr:req.body.year});
        }
    })

})

//AUTH routes

app.get("/register",function(req,res){
    res.render("register",{err:req.flash('message1')});
})


app.post("/register",function(req,res){
    User.register(new User({username:req.body.username}),req.body.password,function(err,user){
        if(err){
            req.flash('message1','oops! '+err.message);
            res.redirect("/register");
        } else{
            req.flash('message','Successfully signed up. login and use the app');
            res.redirect("/login");
        }
    })
})

app.get("/login",function(req,res){
   
    res.render("login",{success:req.flash('message')});
})

app.post("/login",
passport.authenticate("local",{
    successRedirect:"/",
    failureRedirect:"/login"
})
,function(req,res){

});




app.get("/logout",function(req,res){
    req.logOut();
    req.flash('message','Successfully Logged you out!');
    res.redirect("/login");
})

function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    } 
        req.flash('message','Login first to use the app');
        res.redirect("/login");
}
var port=process.env.PORT || 3000;
app.listen(port);