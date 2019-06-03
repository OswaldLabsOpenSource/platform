import { Request, Response } from "express";
import { Get, Controller, ClassWrapper } from "@overnightjs/core";
import asyncHandler from "express-async-handler";
import Joi from "@hapi/joi";
import { joiValidate, detectTextLanguage } from "../helpers/utils";
import { translateText } from "../crud/api";

@Controller("api")
@ClassWrapper(asyncHandler)
export class ApiController {
  @Get("language-detect")
  async detectLanguage(req: Request, res: Response) {
    const text = req.query.q;
    joiValidate({ text: Joi.string().required() }, { text });
    res.json({ language: detectTextLanguage(text) });
  }

  @Get("translate")
  async translateText(req: Request, res: Response) {
    const text = req.query.q;
    const lang = req.query.lang;
    joiValidate(
      {
        text: Joi.string().required(),
        lang: Joi.string().required()
      },
      { text, lang }
    );
    res.json({ language: await translateText(text, lang) });
  }
}
