import { Message } from './message';

export class Bot {
	id: number;
	name: string;
	description: string;
	firstMessage: Message;

	constructor (botInfo) {
		this.id = botInfo.id;
		this.name = botInfo.name;
		this.description = botInfo.description;
		this.firstMessage = botInfo.firstMessage;
	}
};