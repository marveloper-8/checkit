import { Body, Controller, Post, Request, UseGuards } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { AuthGuard } from "@nestjs/passport";
import { LoginDto } from "./dto/login.dto";

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @UseGuards(AuthGuard('local'))
    @Post('login')
    @ApiOperation({summary: 'User login'})
    @ApiResponse({status: 200, description: 'Login successful'})
    @ApiResponse({status: 401, description: 'Unauthorized'})
    async login(@Request() req, @Body() loginDto: LoginDto) {
        return this.authService.login(req.user)
    }
}