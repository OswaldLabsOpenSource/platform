import { Translate } from "@google-cloud/translate";
import { GOOGLE_PROJECT_ID, GOOGLE_TRANSLATE_KEY } from "../config";
import { getItemFromCache, storeItemInCache } from "../helpers/cache";
import { CacheCategories } from "../interfaces/enum";

const translate = new Translate({
  projectId: GOOGLE_PROJECT_ID,
  key: GOOGLE_TRANSLATE_KEY
});

export const translateText = (
  text: string,
  language: string
): Promise<string> =>
  new Promise((resolve, reject) => {
    const cached = getItemFromCache(CacheCategories.TRANSLATION, text);
    if (cached) return resolve(cached);
    translate
      .translate(text, language)
      .then(data => {
        if (data.length) {
          try {
            storeItemInCache(CacheCategories.TRANSLATION, text, data[0]);
            return resolve(data[0]);
          } catch (error) {}
        }
        reject();
      })
      .catch(error => {
        reject(error);
      });
  });
