const express = require('express');
const path = require('path');
const app = express();
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const session=require('express-session');
const socketIO = require('socket.io');
const http = require('http').createServer(app);
app.use(express.json());
path.join(__dirname);


// разрешение политики редиректа cors

app.use(cors());


//подключение ejs
app.set('views', path.join(__dirname, '/'));
app.set('view engine', 'ejs');
app.use(bodyParser.json());

// подключение сессии

app.use(session({
    secret: 'n~cX#7R9oP!2bT$zY@5sL8v^aQ1gH*3',
    resave: false,
    saveUninitialized: true
}));

// переменные для сессии (глобальные переменные):
var username_i = null;
var isPro_insession = null;nsession


            // обслуживание кнопок на общедоступных страницах входа и регистрации

// Указываем Express на то, что статические файлы находятся в текущей директории
app.use(express.static(__dirname));

app.get('/', (req, res) => {
    // Отправнляем файл index.ejs как ответ а GET-запрос к корневому URL
    res.sendFile(path.join(__dirname, 'index.ejs'));
});

const server = http.listen(process.env.PORT || 5000, () => {
    console.log(`Сервер запущен на порту ${server.address().port}`);
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'страничка входа/index.html'));

});

app.get('/register', (req,res)=>{
    res.sendFile(path.join(__dirname,'register_form/register.html'))
})
app.get('/pro_reg_form', (req,res)=>{
    res.sendFile(path.join(__dirname,'register_pro_form/register_pro.html'))
})





// подключение к бд
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0887',
    database: 'pcionic',
    port: 3306
});

db.connect((err) => {
    if (err) {
        throw err;
        console.log("ошибка подключения к бд");
    }
    console.log('Подключено к базе данных');
});







            // обслуживание страницы register (user)


// запрос для регистрации как юзер
app.post('/register-user', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Проверяем, существует ли пользователь с таким логином
    const checkExistingUserQuery = 'SELECT * FROM clients WHERE login = ?';

    db.query(checkExistingUserQuery, [username], (error, results, fields) => {
        if (error) {
            console.error('Ошибка выполнения запроса:', error);
            res.status(500).send('Ошибка сервера');
            return;
        }

        // Если запись существует, выводим сообщение в консоль и отправляем ответ клиенту
        if (results.length > 0) {
            console.log(`Пользователь с логином ${username} уже существует`);
            res.status(409).send('Пользователь с таким логином уже существует');
        } else {
            // Если запись не существует, добавляем нового пользователя
            const insertNewUserQuery = 'INSERT INTO clients (login, password) VALUES (?, ?)';

            db.query(insertNewUserQuery, [username, password], (err, result) => {
                if (err) {
                    console.error('Ошибка выполнения запроса:', err);
                    res.status(500).send('Ошибка сервера');
                    return;
                }

                console.log('Запись добавлена в таблицу clients');
                res.status(201).send('Пользователь успешно зарегистрирован');
            });
        }
    });
});






            //обслуживание страницы register(pro)


// запрос для регистрации как про
app.post('/pro_reg_form', (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Проверяем, существует ли профессионал с таким логином
    const checkExistingProQuery = 'SELECT * FROM professionals WHERE login = ?';

    db.query(checkExistingProQuery, [username], (error, results, fields) => {
        if (error) {
            console.error('Ошибка выполнения запроса:', error);
            res.status(500).send('Ошибка сервера');
            return;
        }

        // Если запись существует, выводим сообщение в консоль и отправляем ответ клиенту
        if (results.length > 0) {
            console.log(`Профессионал с логином ${username} уже существует`);
            res.status(409).send('Профессионал с таким логином уже существует');
        } else {
            // Если запись не существует, добавляем нового профессионала
            const insertNewProQuery = 'INSERT INTO professionals (login, password) VALUES (?, ?)';

            db.query(insertNewProQuery, [username, password], (err, result) => {
                if (err) {
                    console.error('Ошибка выполнения запроса:', err);
                    res.status(500).send('Ошибка сервера');
                    return;
                }

                console.log('Запись добавлена в таблицу professionals');
                res.status(201).send('Профессионал успешно зарегистрирован');
            });
        }
    });
});






  //логинизация
app.post('/button-click', (req, res) => {
    console.log('Редирект выполнен');
    console.log('Нажатие кнопки!');
    console.log('Переменная username:', req.body.username);
    console.log('Переменная password:', req.body.password);
    console.log('Переменная isPro:', req.body.isPro);
    if (req.body.isPro === 'off')
    {
        console.log('Это клиент');
        let username = req.body.username;
        let password = req.body.password;

        let login_check = `SELECT * FROM clients WHERE login = '${username}'`;

        db.query(login_check, (err, results, fields) =>
        {
            if (err) {
                console.error('Ошибка выполнения запроса:', err);
                res.status(500).send('Ошибка сервера');
                return;
            }

            if (results.length > 0) {
                // Если пользователь найден, проверяем совпадение паролей
                if (results[0].password === password) {
                    // Успешный вход
                    req.session.username = username;
                    req.session.isPro = false; // для клиента
                    username_insession  = req.session.username;
                    isPro_insession = req.session.isPro;
                    console.log('Успешный вход');
                    res.redirect('/client_page'); // Переносим редирект сюда

                } else {
                    console.log('Неверный пароль');
                    res.status(401).send('Неверный пароль');
                }
            } else {
                console.log('Пользователя не существует');
                res.status(404).send('Пользователя не существует');
            }
        });
    } else {
        console.log('Это про');
        let username = req.body.username;
        let password = req.body.password;
        let login_check = `SELECT * FROM professionals WHERE login = '${username}'`;
        db.query(login_check,(err,results,fields) => {
            if (err) {
                console.error('Ошибка выполнения запроса:', err);
                res.status(500).send('Ошибка сервера');
                return;
            }
            console.log('запрос сделан');
            if(results.length > 0){
                console.log('пользователь найден в базе ');
                if(results[0].password === password){
                    console.log('правильный пароль');
                    req.session.username = username;
                    req.session.isPro = true;
                    username_insession  = req.session.username;
                    isPro_insession = req.session.isPro;
                    console.log('Успешный вход');
                    res.redirect('/pro_page');
                }else{
                    console.log('неправильный пароль');
                }
            } else{
               console.log('пользователя не существует')
            }
        })

    }

});










            //личный кабинет pro

app.get('/pro_page', (req, res) => {
    if (req.session.username != null && req.session.isPro === true) {
        let login = req.session.username;
        res.render('profile_pro/index',{login});
    } else {
        res.send(`
            <script>
                alert('вы не авторизированы');
            </script>
        `);
    }
});


        //личный кабинет клиента
app.get('/client_page', (req, res) => {
    if (req.session.username != null && req.session.isPro === false) {
        let login = req.session.username;
        res.render('profile_client/index',{login});
    } else {
        res.send(`
            <script>
                alert('вы не авторизированы');
            </script>
        `);
    }
});


/// эксперимент с видеочатом

const io = socketIO(http);


const users = {};

app.get('/chatroom', (req, res) => {
    const userLogin = req.session.username;
    res.render('test-chatroom/chatroom', { login: userLogin });
});

io.on('connection', (socket) => {
    // При подключении нового пользователя
    socket.on('join', (login) => {
        users[login] = socket.id;
        socket.login = login;
        io.emit('updateUserList', Object.keys(users));
    });

    // Проверка наличия пользователя в сети и отправка запроса на соединение
    socket.on('requestConnection', (targetLogin) => {
        if (users[targetLogin]) {
            io.to(users[targetLogin]).emit('connectionRequested', socket.login);
        }
    });

    // Обработка ответа на запрос соединения
    socket.on('respondToConnection', (requesterLogin, accept) => {
        if (accept) {
            io.to(users[requesterLogin]).emit('connectionAccepted', socket.login);
        } else {
            io.to(users[requesterLogin]).emit('connectionDeclined', socket.login);
        }
    });

    // Обработка ICE-кандидатов
    socket.on('iceCandidate', (targetLogin, candidate) => {
        io.to(users[targetLogin]).emit('iceCandidate', socket.login, candidate);
    });

    // Отключение пользователя
    socket.on('disconnect', () => {
        delete users[socket.login];
        io.emit('updateUserList', Object.keys(users));
    });
});
