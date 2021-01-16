/**
 *  Messenger Translator for Telegram
 *  Copyright (C) 2021, Adriane Justine Tan
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

const FuzzySet = require('fuzzyset.js')

const localeStrings = require('./locale/')
const replacer = require('./utils/replacer.js')

const users = require('./users.js')
const languages = require('./languages.js')

const DEBUG = process.env.DEBUG

/**
 *  Changes the user's language
 *
 *  @param {string} user      User's object from the database
 *  @param {string} lang      Name of the language
 *
 *  @return {string} message
 */
async function changeLanguage (user, lang) {
  let name, code
  Object.keys(languages).forEach(key => {
    const language = languages[key]
    if (language.regex.exec(lang) !== null) {
      name = language.name
      code = key
    }
  })

  if (DEBUG) console.log(`Language requested: ${lang}`)
  if (!name || !code) {
    const langNames = Object.entries(languages).map(langObj => langObj[1].name)
    const fuzzy = FuzzySet(langNames).get(lang, null, 0.50)
    const template = localeStrings(user.locale, 'unknown_language')
    const replace = {
      TEXT: lang,
      MEAN: fuzzy !== null ? fuzzy.map(match => match[1]).join(',') : 'English'
    }

    return replacer(template, replace)
  }

  if (code !== user.language) {
    user.language = code
    await users.setUser(user)
  }

  const template = localeStrings(user.locale, 'language_change')
  const replace = { LANG: name }
  return replacer(template, replace)
}

module.exports = { changeLanguage }
