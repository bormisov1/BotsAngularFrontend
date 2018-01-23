import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';

import { HttpService } from './http.service';
import { baseURL, wsBaseURL } from '../shared/baseurl'

import { Message } from '../shared/message';
import { Bot } from '../shared/bot';
import { CurrentUser } from '../shared/current-user';
import { MessageOutSocket } from '../shared/sockets';

import { LocalStorageService } from './local-storage.service';
import { WebsocketService } from './websocket.service';

import { ChatCheckbox } from '../shared/chat';

@Injectable()
export class ChatService {
	public sockets: Subject<{}>;
	public messagesCounter: number;

	constructor(
		private localStorageService: LocalStorageService
		, private httpService: HttpService
		, private wsService: WebsocketService
	) {
		this.messagesCounter = 0;
		this.sockets = <Subject<Message>>wsService
			.connect(wsBaseURL + '/bots')
			.map((response: MessageEvent): Message => {
				return JSON.parse(response.data);
			});
	}

	getMsgsAndMaxSerialNum(botId: number): [Message[], number] {
		let msgs = this.localStorageService.get<Message[]>('messages') || [];
		let maxMsgSerialNum = msgs.reduce((prevVal, curVal) => {
			return (curVal.serialNum > prevVal.serialNum)?curVal:prevVal;
		}, { serialNum: 0 }).serialNum;
		return [msgs, maxMsgSerialNum];
	}

	getMessages(botId: number): Message[] {
		let [msgs, maxMsgSerialNum] = this.getMsgsAndMaxSerialNum(botId);
		let currentUser = this.localStorageService.get<CurrentUser>('currentUser');
		let socket = {
			action: 'get'
			, botId: botId
			, maxSerialNumKnown: maxMsgSerialNum
			, token: ''
			, username: ''
		};
		if (currentUser && currentUser.token && currentUser.username) {
			socket.token = currentUser.token;
			socket.username = currentUser.username;
		}
		this.sockets.next(socket);
		return msgs;
	}

	sendMessage(bot: Bot, messageText?: string, checkboxes?: ChatCheckbox[], label?: string): MessageOutSocket {
		this.messagesCounter++;
		let currentUser = this.localStorageService.get<CurrentUser>('currentUser');
		let [msgs, maxMsgSerialNum] = this.getMsgsAndMaxSerialNum(bot.id);
		messageText = messageText || checkboxes.map(checkbox => (checkbox.checked?'1':'0')).join('');
		let message: MessageOutSocket = new MessageOutSocket(Object.assign({
			action: 'chat'
			, botId: bot.id
			, text: messageText
			, temporarySerialNum: maxMsgSerialNum + 1
			, messagesCounter: this.messagesCounter
			, checkboxes: checkboxes
			, label: label
		}, currentUser));
		console.log('sent:', message);
		this.sockets.next(message);
		this.localStorageService.pushElToArrayField<MessageOutSocket>('unconfirmed-messages', message);
		return message;
	}

	recordMessage(msg: Message): void {
		this.localStorageService.pushElToArrayField('messages', msg);
	}

	reSetMessages(msgs: Message[]): void {
		this.localStorageService.set('messages', msgs);
	}

	reSetUnconfirmedMessages(msgs: MessageOutSocket[]): void {
		this.localStorageService.set('unconfirmed-messages', msgs);
	}

	getUsername(): string {
		return (this.localStorageService.get<CurrentUser>('currentUser') || { username: '' }).username;
	}

	setUsername(username: string): void {
		let currentUser = this.localStorageService.get<CurrentUser>('currentUser');
		currentUser = currentUser || { username: '', token: '' };
		currentUser.username = username;
		this.localStorageService.set('currentUser', currentUser);
	}

	removeCurrentUser(): void {
		this.localStorageService.set('currentUser', {});
	}
}