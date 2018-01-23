import { Injectable } from '@angular/core';
import * as Rx from 'rxjs/Rx';

@Injectable()
export class WebsocketService {
  private subject: Rx.Subject<MessageEvent>;
  private queue: string[] = [];
  private readonly initialPause: number = 100;
  private pauseFactor: number = 1;
  
  constructor() {  }

  public connect(url): Rx.Subject<MessageEvent> {
    if (!this.subject) {
      this.subject = this.create(url);
      console.log("Successfully connected: " + url);
    } 
    return this.subject;
  }

  private recurrentSending(ws, nextFunc): void {
  	if (this.queue && this.queue.length > 0) {
	  	if (ws.readyState === WebSocket.OPEN) {
	  		ws.send(this.queue.shift());
	  		this.pauseFactor = 1;
	  		setTimeout(() => {this.recurrentSending(ws, this.recurrentSending)}, this.initialPause * this.pauseFactor);
	  	} else {
	  		this.pauseFactor *= 2;
	  	}
  	} else {
  		setTimeout(() => {this.recurrentSending(ws, this.recurrentSending)}, this.initialPause * this.pauseFactor);
  	}
  }
  
  private create(url): Rx.Subject<MessageEvent> {
    let ws = new WebSocket(url);

    let observable = Rx.Observable.create((obs: Rx.Observer<MessageEvent>) => {
		ws.onmessage = obs.next.bind(obs);
		ws.onerror = obs.error.bind(obs);
		ws.onclose = obs.complete.bind(obs);
		return ws.close.bind(ws);
	})
	
	let observer = {
		next: (data: Object) => {
			this.queue.push(JSON.stringify(data));
		}
	}

	setTimeout(() => {this.recurrentSending(ws, this.recurrentSending)}, this.initialPause * this.pauseFactor);
	
	return Rx.Subject.create(observer, observable);
  }

}