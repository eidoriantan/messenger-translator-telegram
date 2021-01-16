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

const sql = require('mssql')
const logger = require('./utils/log.js')
const database = require('./database.js')

const types = {
  id: sql.NVarChar(16),
  name: sql.NVarChar(255),
  language: sql.NVarChar(16),
  locale: sql.NVarChar(16),
  message: sql.TinyInt
}

/**
 *  Adds a user
 *
 *  @param {object} user    Telegram User object
 *  @return {object} userData
 */
async function addUser (user) {
  await sql.connect()

  const userData = {
    id: user.id,
    name: typeof user.username !== 'undefined' ? user.username : 'No username',
    language: 'en',
    locale: typeof user.language_code !== 'undefined' ? user.language_code.split('-')[0] : 'en',
    message: 0
  }

  const query = 'INSERT INTO users ' +
    '(id, name, language, locale, message) VALUES ' +
    '(@id, @name, @language, @locale, @message)'

  try {
    await database.query(query, [
      { name: 'id', type: types.id, value: userData.id },
      { name: 'name', type: types.name, value: userData.name },
      { name: 'language', type: types.language, value: userData.language },
      { name: 'locale', type: types.locale, value: userData.locale },
      { name: 'message', type: types.message, value: userData.message }
    ])
  } catch (error) {
    logger.write(`Unable to add user to database: ${user.id}`, 1)
    logger.write(error, 1)
    logger.write('User:', 1)
    logger.write(user, 1)
    logger.write('User Data:', 1)
    logger.write(userData, 1)
  }

  return userData
}

/**
 *  Gets the user data
 *
 *  @param {string} id    User's unique ID
 *  @return {object} userData
 */
async function getUser (id) {
  await sql.connect()

  const query = 'SELECT * FROM users WHERE id=@id'
  try {
    const result = await database.query(query, [
      { name: 'id', type: types.id, value: id }
    ])

    return result.recordset.length > 0 ? result.recordset[0] : null
  } catch (error) {
    logger.write(`Unable to get user information: ${id}`, 1)
    logger.write(error, 1)
    return null
  }
}

/**
 *  Updates the user data
 *
 *  @param {object} user    User data object
 *  @return void
 */
async function setUser (user) {
  await sql.connect()

  const query = 'UPDATE users SET name=@name, language=@language, ' +
    'locale=@locale, message=@message WHERE id=@id'

  try {
    await database.query(query, [
      { name: 'id', type: types.id, value: user.id },
      { name: 'name', type: types.name, value: user.name },
      { name: 'language', type: types.language, value: user.language },
      { name: 'locale', type: types.locale, value: user.locale },
      { name: 'message', type: types.message, value: user.message }
    ])
  } catch (error) {
    logger.write(`Unable to update user information: ${user.id}`, 1)
    logger.write(error, 1)
  }
}

/**
 *  Deletes a user in the database
 *
 *  @param {string} id    User's unique ID
 *  @return void
 */
async function deleteUser (id) {
  try {
    await database.query('DELETE FROM users WHERE id=@id', [
      { name: 'id', type: types.id, value: id }
    ])
  } catch (error) {
    logger.write(`Unable to delete user from database: ${id}`, 1)
    logger.write(error, 1)
  }
}

module.exports = { types, addUser, getUser, setUser, deleteUser }
