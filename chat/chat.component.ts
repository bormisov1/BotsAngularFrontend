import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { Bot } from '../shared/bot';
import { Message } from '../shared/message';
import {
	InSocket
	, BotInfoSocket
	, MessageInSocket
	, MessageOutSocket
	, DenySocket
	, ConfirmSocket
	, AuthSocket
	, CaptchaSocket
} from '../shared/sockets';

import { BotsService } from '../services/bots.service';
import { ChatService } from '../services/chat.service';
import { AuthenticationService } from '../services/authentication.service';

import { ChatButton, ChatSelect, ChatCheckbox } from '../shared/chat';

@Component({
	selector: 'app-chat',
	templateUrl: './chat.component.html',
	styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

	botId: number = 1;
	bot: Bot = new Bot({});
	msgs: Message[] = [];
	unconfirmedMsgs: MessageOutSocket[] = [];
	currentMessageText: string = "";
	currentButtons: ChatButton[];
	currentSelects: ChatSelect[];
	currentCheckboxes: ChatCheckbox[];
	userInputMode: number = 1; // 1 for text+button, 2 for buttons, 3 for selects, 4 for checkboxes.
	justAfterFirstAuthentication: boolean = false;
	justAuthenticated: boolean = false;
	//preStartState: number = 1;
	//isAuthenticated: boolean = false;

	handlers: { [id: string]: (socket: InSocket) => void; } = {
		'bot_info': (botInfoSocket: BotInfoSocket) => {
			this.bot = new Bot({
				id: 1
				, name: botInfoSocket.name
				, description: botInfoSocket.description
				, firstMessage: botInfoSocket.message
			});
			if (botInfoSocket.messages !== undefined) {
				this.msgs.sort((msg1, msg2) => (msg1.serialNum - msg2.serialNum));
				botInfoSocket.messages.sort((msg1, msg2) => (msg1.serialNum - msg2.serialNum));
				this.msgs = this.uniteSortedMsgs(this.msgs, botInfoSocket.messages);
				this.chatService.reSetMessages(this.msgs);
			}
			if (this.justAuthenticated && this.chatService.messagesCounter < 6 && this.msgs.length < 19) {
				this.userInputMode = 10;
				this.chatService.sendMessage(this.bot, 'Далее', [], '');
			} else {
				this.userInputMode = 1;	
			}/*
			this.userInputMode = (this.justAfterFirstAuthentication)?10:1;
			this.justAfterFirstAuthentication = false;*/
		}
		, 'deny': (denySocket: DenySocket) => {
			console.log('access denied');
			//this.router.navigate(['/login']);
		}
		, 'confirm': (confirmSocket: ConfirmSocket) => {
			let confirmedMsgIndex: number = -1;
			for (let i = 0; i != this.unconfirmedMsgs.length; i++) {
				if (this.unconfirmedMsgs[i].temporarySerialNum === confirmSocket.temporarySerialNum) {
					confirmedMsgIndex = i;
					break;
				}
			}
			if (confirmedMsgIndex >= 0) {
				let confirmedMessage = new Message(this.unconfirmedMsgs[confirmedMsgIndex], confirmSocket.serialNum);
				this.unconfirmedMsgs.splice(confirmedMsgIndex, 1);
				this.msgs.push(confirmedMessage);
				this.chatService.recordMessage(confirmedMessage);
			} else {
				console.log('no message to apply confirmation to! serialNum =', confirmSocket.serialNum);
			}
		}
		, 'auth': (authSocket: AuthSocket) => {
			this.authenticationService.login(authSocket.username, authSocket.password)
				.subscribe(result => {
	                if (result === true) {
	                	this.msgs = [];
	                	this.chatService.reSetMessages([]);
						this.msgs = this.getMessages();
						this.justAuthenticated = true;
/*						if (this.chatService.messagesCounter < 6) {
							console.log("Далее", this.chatService.messagesCounter);
							this.justAfterFirstAuthentication = true;
							this.chatService.sendMessage(this.bot, 'Далее', [], '');
						}*/
	                } else {
	                    console.log('shit happens');
	                }
	            });
		}
		, 'message': (msgSocket: MessageInSocket) => {
			let receivedMessage = new Message(msgSocket);
			this.chatService.recordMessage(receivedMessage);
			this.msgs.push(receivedMessage);
			if (msgSocket.isQuestion) {
				if (msgSocket.buttons && msgSocket.buttons.length > 0) {
					this.userInputMode = 2;
					this.currentButtons = msgSocket.buttons;
				} else if (msgSocket.selects && msgSocket.selects.length > 0) {
					this.userInputMode = 3;
					this.currentSelects = msgSocket.selects;
				} else if (msgSocket.checkboxes && msgSocket.checkboxes.length > 0) {
					this.userInputMode = 4;
					this.currentCheckboxes = msgSocket.checkboxes;
				} else {
					this.userInputMode = 1;
				}
			} else {
				this.userInputMode = 10;
			}
			if (!this.chatService.getUsername() && msgSocket.username) {
				this.chatService.setUsername(msgSocket.username);
			}
		}
	};

	constructor(
        private botService: BotsService
        , private chatService: ChatService
        , private authenticationService: AuthenticationService
        , private router: Router
	) {
	}

	ngOnInit() {
/*		this.chatService.isAuthenticated((is: boolean) => {
			this.isAuthenticated = is;
		});*/
		this.setHandlers();
		this.msgs = this.getMessages();
	}

	getMessages(): Message[] {
		return this.chatService.getMessages(this.botId);
	}

	setHandlers(): void {
		this.chatService.sockets.subscribe(socket => {
			let inSocket = socket as InSocket;
			console.log('received', inSocket);
			if (this.handlers[inSocket.action])
				this.handlers[inSocket.action](inSocket);
			else
				console.log('NO HANDLER FOR action ', inSocket.action);
		})
	}

	sendMessage(text?: string): void {
		this.currentMessageText = text || this.currentMessageText;
		if (this.currentMessageText.toLowerCase() != 'забыть диалог') {
			let label;
			if (this.userInputMode == 3) {
				this.currentSelects.forEach(select => {
					if (select.answer == this.currentMessageText)
						label = select.label;
				})
			}
			this.unconfirmedMsgs.push(this.chatService.sendMessage(this.bot, this.currentMessageText, this.currentCheckboxes, label));
			this.userInputMode = 10;
		} else {
			this.msgs = [];
			this.unconfirmedMsgs = [];
			this.userInputMode = 1;
			this.chatService.reSetMessages([]);
			this.chatService.reSetUnconfirmedMessages([]);
			this.chatService.removeCurrentUser();
			this.chatService.messagesCounter = 0;
		}
		this.currentMessageText = '';
		this.currentButtons = [];
		this.currentSelects = [];
		this.currentCheckboxes = [];
	}

	private uniteSortedMsgs(arr1: Message[], arr2: Message[]): Message[] {
		let i: number = 0, j: number = 0;
		let united: Message[] = [];
		while(i < arr1.length && j < arr2.length) {
			if (arr1[i].serialNum < arr2[j].serialNum) {
				united.push(arr1[i++]);
			} else if (arr1[i].serialNum === arr2[j].serialNum) {
				i++;
			} else {
				united.push(arr2[j++]);
			}
		}
		while(i < arr1.length) {
			united.push(arr1[i++]);
		}
		while(j < arr2.length) {
			united.push(arr2[j++]);
		}
		return united;
	}
}
