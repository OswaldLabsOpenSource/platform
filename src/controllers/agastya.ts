import { Request, Response } from "express";
import { Get, Controller, ClassWrapper } from "@overnightjs/core";
import asyncHandler from "express-async-handler";
import Joi from "@hapi/joi";
import { joiValidate } from "../helpers/utils";
import { collect } from "../rest/agastya";

@Controller("agastya")
@ClassWrapper(asyncHandler)
export class AgastyaController {
  @Get("secure-collect/:apiKey")
  async get(req: Request, res: Response) {
    const apiKey = req.params.apiKey;
    joiValidate({ apiKey: Joi.string().required() }, { apiKey });
    res.json(await collect(apiKey, req.body, res.locals));
  }
}
