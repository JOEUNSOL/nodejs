const express = require('express')

const socket = require('socket.io')

const http = require('http')

const fs = require('fs')

const app = express()

const session = require('express-session');

const server = http.createServer(app)

const io = socket(server)

const mariadb = require('mariadb/callback');
// DB 접속정보
const conn = mariadb.createConnection({

  host: 'database-1.c61pugwopkxu.ap-northeast-2.rds.amazonaws.com',
  port: 3306,
  user: 'admin',
  password: 'q10q10q10q10!',
  connectionLimit: 5,
  database: 'test01'

});

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

let DB_user_info


conn.query('SELECT * FROM user', (err, rows) => {
  DB_user_info = rows
  // console.log(DB_user_info)
})




app.use('/css', express.static(__dirname + '/static/css'))
app.use('/js', express.static(__dirname + '/static/js'))
// 파싱 작업 나중에 알아보자 parsing 안해주면 post method 전달한 parameter 안보이거나 전달이 안댐
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}))


server.listen(80, function() {
  console.log('run...')
})
//  root 접속
app.get('/', function(req, res) {
  fs.readFile(__dirname + '/static/index.html', function(err, data) {
    if (err) {
      res.send('error')
    } else {

      // res.send(email);
      res.writeHead(200)
      res.write(data)
      res.end();
    }
  })
})
// 회원가입 Form 에서 전달된 정보를 DB user table 에 저장
app.post('/', function(req, res, next) {
  let sign_info = {
    id: req.body.id,
    pwd: req.body.pwd
  }
  console.log(`INSERT INTO user (id,pwd) VALUES ('${req.body.id}','${req.body.pwd}');`)
  conn.query(`INSERT INTO user (id,pwd) VALUES ('${req.body.id}','${req.body.pwd}');`, (err, rows) => {
    if (err) {
      console.log(err)
    } else {
      console.log(rows)
    }

  })
  fs.readFile(__dirname + '/static/index.html', function(err, data) {

    if (err) {
      res.send('error')
    } else {

      console.log(sign_info + "가입정보")
      res.writeHead(200)
      res.write(data)
      res.end();
    }
  })
})

// 로그인시 form input 에 있는 data 를 DB에있는 정보와 비교한후 맞으면 개인페이지로 redirect 시켜줌
app.post('/private/login', function(req, res, next) {

  for (i = 0; i < DB_user_info.length; i++) {

    if (req.body.id === DB_user_info[i].id && req.body.password === DB_user_info[i].pwd && DB_user_info[i].pwd) {
      let session_id =  req.session.user_id = req.body.id
      console.log(session_id + '   session_id')
      res.redirect('/private/login_page.html')
    } else {
      console.log('Not Found')
    }
  }

})

app.get('/private/login_denied'),
  function(req, res, next) {
    res.send("Long Password")
  }


app.get('/private/login_page.html', (req, res, next) => {

  fs.readFile('/test01/static/private/login_page.html', function(err, data) {
    if (err) {
      throw err;
      res.send('error')
      console.log(err)
    } else {
      res.writeHead(200)
      res.write(data)
      res.end();
    }
  })
})


app.get('/signup.html', (req, res, next) => {

  fs.readFile('/test01/static/signup.html', function(err, data) {
    if (err) {
      res.send('error')
      console.log(err)
    } else {
      res.writeHead(200)
      res.write(data)
      res.end();
    }
  })
})


io.sockets.on('connection', function(socket) {
  console.log('유저접속' )

  socket.on('send', function(data) {
    console.log('전달된 메세지:  \n', data.msg)
  })
  socket.on('disconnect', function() {
    console.log('접속끝')
  })
})
