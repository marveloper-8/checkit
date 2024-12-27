import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { WsException } from "@nestjs/websockets";
import { Socket } from "socket.io";

@Injectable()
export class WsJwtGuard implements CanActivate {
    constructor(private jwtService: JwtService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            const client: Socket = context.switchToWs().getClient()
            const token = this.extractTokenFromHeader(client)

            if (!token) {
                throw new WsException('Unauthorized')
            }

            const payload = this.jwtService.verify(token);
            (client as any).user = payload;

            return true
        } catch {
            throw new WsException('Unauthorized')
        }
    }

    private extractTokenFromHeader(client: Socket): string | undefined {
        const [type, token] = client.handshake.headers.authorization?.split(' ') ?? [];
        return type === "Bearer" ? token : undefined;
    }
}