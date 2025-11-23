import { Controller, All, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { serverClient } from "./integrate";

@Controller("api/integrate")
export class OAuthController {
    @All("*")
    async handleOAuth(@Req() req: Request, @Res() res: Response) {
        await serverClient.handler(req, res);
    }
}