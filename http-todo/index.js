const express = require("express")
const jwt = require("jsonwebtoken")



const app = express()
app.use(express.json())
const JWT_SECRET = "science"
const users = []

app.get('/', (req, res)=>{
    res.sendFile(__dirname+"/public/index.html")
})

app.post('/signup', (req, res)=>{
    const username = req.body.username;
    const password = req.body.password;

    if(!username || !password){
        return res.status(400).json({ message: "Username and password are required!" });
    }

    const userExists = users.find(users => users.username === username)

    if(userExists){
        return res.status(409).json({ message: "User already exists!" });
    }

    users.push({ 
        username: username,
        password: password
     });
    console.log(users)
    return res.status(201).json({ message: "Signup successful!" });


})

app.post('/signin', (req, res)=>{
    const username = req.body.username;
    const password = req.body.password;

    if(!username || !password){
        return res.status(400).json({ message: "Username and password are required!" });
    }

    const userExists = users.find(users => users.username === username && users.password === password)

    if(userExists){
        const token = jwt.sign({username: username}, JWT_SECRET)
        return res.status(201).json({ message: "Signin successful!", token: token });
    } else {
        return res.status(409).json({ message: "Invalid username or password!" });
    }
})

function auth (req,res,next){
    const token = req.headers.token
    if(!token){
        return res.status(400).json({ message: "Token is missing!" });
    }
    jwt.verify(token, JWT_SECRET, (err, userInfo)=>{
        if(err){
            return res.status(401).json({ message: "Unauthorized. Invalid token." });
        }
        const isUserNameLegit = users.find(user=> user.username === userInfo.username)
        if (!isUserNameLegit) {
            return res.status(401).json({ message: "User not found. Invalid token." });
        }
        req.username = userInfo.username
        next()
    })
}

app.post('/create-todo', auth, (req,res)=>{
    const username = req.username
    const todo = req.body.todo
    if(!todo){
        return res.status(400).json({ message: "To add todo, please write todo in body json!" });
    }
    const currentUser = users.find(user=> user.username === username)

    if (!currentUser.todos) {
        currentUser.todos = [];
      }
      currentUser.todos.push({
        id: currentUser.todos.length + 1,
        todo: todo
      });      

res.send({
    currentUser: currentUser
})
})

app.listen(3000, ()=>{
    console.log("Server started listing!");
})