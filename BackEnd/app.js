
const express = require('express');
const socketio = require('socket.io');
const _ = require('lodash');
const uuid = require('uuid');
const actions = require('./actions');


const port = process.env.PORT || 3003;
const env = process.env.NODE_ENV || "development";

const app = express();

app.set('port', port);
app.set('env', env);

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

const router = express.Router();


router.get('/', (req, res) => {
    res.json({ health: 'OK', ...db });
});


app.use('/', router);

const server = app.listen(app.get('port'), () => {
    console.log('SocketIO server listening on port ' + app.get('port'));
});

const io = socketio(server, {'origins': '*:*'} );

const db = {
    posts: {},
    notes: {}
};

const createNote = (newNote) => {
  newNote.id = uuid.v4();
  if(!newNote.body) newNote.body = '';
  db.notes[newNote.id] = newNote;
  return db.notes[newNote.id];
};


const updateNote = (noteData) => {
  const note = db.notes[noteData.id];
  if(note) {
    db.notes[noteData.id] = _.merge(note, noteData);
    return db.notes[noteData.id];
  } else return undefined;
};

const deleteNote = (id) => {
  if(db.notes[id]){
    delete db.notes[id];
  }
  return id;
};

io.on('connection', (client) => {

    console.log("client connected...");

    client.on("join", (data) => {
        console.log(data);
        console.log(`user ${data.username} tries to join ${data.room}`);
        if(Object.keys(db).includes(data.room)){
            console.log(`client joined ${data.room}`);
            client.join(data.room);
        }else{
            console.warn('unknown channel')
        }
    });

    client.on(actions.ADD_NOTE, (note) => {
        const newNote = createNote(note);
        console.log('add note', newNote);
        io.in('notes').emit(actions.NOTE_ADDED, newNote);
    });

    client.on(actions.LIST_NOTES, () => {
      client.emit(actions.NOTES_LISTED, db.notes);
    });

    client.on(actions.UPDATE_NOTE, (note) => {
      const updatedNote = updateNote(note);
      console.log('update note', updatedNote);
      io.in('notes').emit(actions.NOTE_UPDATED, updatedNote);

    });

    client.on(actions.DELETE_NOTE, (note) => {
      console.log("ID", note.id);
      deleteNote(note.id);
      io.in('notes').emit(actions.NOTE_DELETED, note);
      console.log(db.notes)
    });


    client.on('disconnect', () => {
      console.log('client disconnected')
    });

});

