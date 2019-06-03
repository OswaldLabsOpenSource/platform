import { Request, Response } from "express";
import { Get, Controller, ClassWrapper } from "@overnightjs/core";
import asyncHandler from "express-async-handler";
import Joi from "@hapi/joi";
import { joiValidate, detectTextLanguage } from "../helpers/utils";

@Controller("api")
@ClassWrapper(asyncHandler)
export class ApiController {
  @Get("language-detect")
  async get(req: Request, res: Response) {
    const text = req.query.q;
    joiValidate({ text: Joi.string().required() }, { text });
    res.json({ language: detectTextLanguage(text) });
  }
}
