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

app.get('/todos', auth, (req, res) => {
    const username = req.username;

    const currentUser = users.find(user => user.username === username);

    if (!currentUser || !currentUser.todos) {
        return res.status(404).json({ message: "User or todos not found" });
    }

    res.send({
        todos: currentUser.todos
    });
});


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

app.delete('/delete-todo/:id', auth, (req,res)=>{
    const username = req.username
    const todoId = parseInt(req.params.id);
    if(!todoId){
        return res.status(400).json({ message: "To delete todo, please write todo id in url!" });
    }

    const currentUser = users.find(user => user.username === username);

    if (!currentUser || !currentUser.todos) {
        return res.status(404).json({ message: "User or todos not found" });
    }

    const initialLength = currentUser.todos.length;

    currentUser.todos = currentUser.todos.filter(todo => todo.id !== todoId);

    if (currentUser.todos.length === initialLength) {
        return res.status(404).json({ message: "Todo not found" });
    }

    res.send({
        message: "Todo deleted successfully",
        currentUser: currentUser
    });
})

app.put('/update-todo/:id', auth, (req, res) => {
    const username = req.username;
    const todoId = parseInt(req.params.id);
    const newTodoText = req.body.todoText;

    if (!todoId || !newTodoText) {
        return res.status(400).json({ message: "Please provide todo ID and new todo text!" });
    }

    const currentUser = users.find(user => user.username === username);

    if (!currentUser || !currentUser.todos) {
        return res.status(404).json({ message: "User or todos not found" });
    }

    const todoToUpdate = currentUser.todos.find(todo => todo.id === todoId);

    if (!todoToUpdate) {
        return res.status(404).json({ message: "Todo not found" });
    }

    todoToUpdate.todo = newTodoText;

    res.send({
        message: "Todo updated successfully",
        currentUser: currentUser
    });
});


app.listen(3000, ()=>{
    console.log("Server started listing!");
})