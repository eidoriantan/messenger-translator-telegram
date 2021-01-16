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
const users = require('./users.js')

const types = {
  ...users.types,
  message: sql.NVarChar(sql.MAX)
}

/**
 *  Returns all recorded feedbacks
 *  @return {object[]}
 */
async function getFeedbacks () {
  try {
    return await database.query('SELECT * FROM feedbacks')
  } catch (error) {
    logger.write('Unable to get all feedbacks', 1)
    logger.write(error, 1)
    return null
  }
}

/**
 *  Logging feedbacks to database
 *
 *  @param {string} id         User's unique ID
 *  @param {string} name       User's FB profile name
 *  @param {string} message    Message to be logged
 *
 *  @return void
 */
async function logFeedback (id, name, message) {
  await sql.connect()

  const query = 'INSERT INTO feedbacks (id, name, message) ' +
    'VALUES (@id, @name, @message)'

  try {
    await database.query(query, [
      { name: 'id', type: types.id, value: id },
      { name: 'name', type: types.name, value: name },
      { name: 'message', type: types.message, value: message }
    ])
  } catch (error) {
    logger.write(`Unable to log feedback: ${id}: ${message}`, 1)
    logger.write(error, 1)
  }
}

/**
 *  Deleting logged feedbacks by ID
 *
 *  @param {string} id    User's unique ID
 *  @return void
 */
async function deleteFeedback (id) {
  try {
    await database.query('DELETE FROM feedbacks WHERE id=@id', [
      { name: 'id', type: types.id, value: id }
    ])
  } catch (error) {
    logger.write(`Unable to delete feedbacks with ID: ${id}`, 1)
    logger.write(error, 1)
  }
}

module.exports = { types, getFeedbacks, logFeedback, deleteFeedback }
