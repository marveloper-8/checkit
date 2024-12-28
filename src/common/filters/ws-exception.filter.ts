import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseWsExceptionFilter, WsException } from "@nestjs/websockets";

@Catch()
export class WsExceptionFilter extends BaseWsExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const client = host.switchToWs().getClient()

        if (exception instanceof WsException) {
            client.emit('error', {
                status: 'error',
                message: exception.message
            })
        } else {
            client.emit('error', {
                status: 'error',
                message: 'Internal server error'
            })
        }
    }
}