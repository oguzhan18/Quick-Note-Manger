import { Injectable } from '@angular/core';
import {SocketService} from '../../../core/services/socket.service';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class NotesService {

  notesListed$: Observable<any>;
  noteAdded$: Observable<any>;
  noteUpdated$: Observable<any>;
  noteDeleted$: Observable<any>;

  constructor(private socket: SocketService) {

    this.socket.join('notes');
    this.notesListed$ = this.socket.listen('[Notes] Listed');
    this.noteAdded$ = this.socket.listen('[Notes] Added');
    this.noteUpdated$ = this.socket.listen('[Notes] Updated');
    this.noteDeleted$ = this.socket.listen('[Notes] Deleted');

  }
  listNotes() {
    this.socket.emit('[Notes] List');
  }

  addNote(note) {
    this.socket.emit('[Notes] Add', note);
  }

  updateNote(note) {
    this.socket.emit('[Notes] Update', note);
  }

  deleteNote(note) {
    this.socket.emit('[Notes] Delete', note);
  }

}
