interface IBot {
    name: string;

    sendAll(message: string): void;
    sendAll(message: string, channel: number): void;

    sendMessage(target: number, message: string): void;
    sendMessage(target: number, message: string, channel: number): void;
}