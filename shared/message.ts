import { MessageOutSocket, MessageInSocket } from './sockets';
import { ChatCheckbox } from './chat';

export class Message {
	serialNum: number;
	botId: number;
	isOutgoing: boolean;
	text?: string;
	checkboxes?: ChatCheckbox[];
	label?: string;

	constructor (messageInSocket: MessageInSocket);
	constructor (messageOutSocket: MessageOutSocket, serialNum: number);
	constructor (messageSocket: MessageOutSocket | MessageInSocket, serialNum?: number) {
		let isOutgoingMsg: boolean = messageSocket instanceof MessageOutSocket;
		this.serialNum = isOutgoingMsg?serialNum:(<MessageInSocket>messageSocket).serialNum;
		this.text = messageSocket.text;
		this.botId = messageSocket.botId;
		this.checkboxes = messageSocket.checkboxes;
		this.isOutgoing = isOutgoingMsg;
		this.label = isOutgoingMsg?(<MessageOutSocket>messageSocket).label:'';
	}
};