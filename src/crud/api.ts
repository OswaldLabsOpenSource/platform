import { Translate } from "@google-cloud/translate";
import { GOOGLE_PROJECT_ID, GOOGLE_TRANSLATE_KEY } from "../config";

const translate = new Translate({
  projectId: GOOGLE_PROJECT_ID,
  key: GOOGLE_TRANSLATE_KEY
});

export const translateText = (
  text: string,
  language: string
): Promise<string> =>
  new Promise((resolve, reject) => {
    translate
      .translate(text, language)
      .then(data => {
        if (data.length) {
          try {
            return resolve(data[0]);
          } catch (error) {}
        }
        reject();
      })
      .catch(error => {
        reject(error);
      });
  });
