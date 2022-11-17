const express = require('express');
const StudentVue = require('studentvue.js');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);


app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
   // res.sendStatus(200)
});

app.get('/health', (req,res) => {
    res.sendStatus(200)
})


server.listen(3001, () => {
    console.log(__dirname)
    console.log('listening on *:3001');
});

io.on('connection', (socket) => {
    socket.on('getGrades', (username, password) => {
        console.log('a user connected')
        putObject(username, password)
    });
  


let mpObject = [];
let allGrades = [];
let className = '';


async function putObject(username, password) {
    console.log('Request recieved')
    mpObject = [];
    for (let i = 1; i <= 5; i += 2) {
        let testthing = await (getGrades('https://va-arl-psv.edupoint.com/', username, password, i))
        mpObject.push(testthing)
        testthing = ''
        //console.log(i)
        console.log(mpObject)
        if (i === 5) {
        try{
            callGrades();
            socket.emit("sucess")
        } catch(err){
            console.log('invalid user/pass' + err.stack)
            socket.emit("error", 'Invalid Username or Password')
            }
        } 
    }
}

function getGrades(url, username, password, reportingPeriod)  {
    return StudentVue.login(url, username, password, reportingPeriod)
        .then(client => client.getGradebook(reportingPeriod))
        .then(JSON.parse)
    
}


function callGrades() { 
    number_courses = mpObject[0]['Gradebook']['Courses']['Course'].length
    for (let i = 0; i < number_courses; i++) {
        for (let j = 0; j <= 2; j++) {
            
            try {
                
                if (j === 1) {
                    allGrades.push(mpObject[j]['Gradebook']['Courses']['Course'][i]['Marks']['Mark']['0']['CalculatedScoreRaw'])
                    console.log(mpObject[j]['Gradebook']['Courses']['Course'][i]['Marks']['Mark']['0']['CalculatedScoreRaw'])
                }
                else {
                    allGrades.push(mpObject[j]['Gradebook']['Courses']['Course'][i]['Marks']['Mark']['CalculatedScoreRaw'])
                    console.log(mpObject[j]['Gradebook']['Courses']['Course'][i]['Marks']['Mark']['CalculatedScoreRaw'])
                
                }
                className = mpObject[j]['Gradebook']['Courses']['Course'][i];    
            }
            catch(err) {
                break
            }
    }
    let classNamed = className['Title']
    socket.emit('sendClient', allGrades, classNamed)
    allGrades = [];
    className = '';
    classNamed = '';
} 
}


});




