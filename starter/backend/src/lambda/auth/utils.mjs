import { decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('utils')

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken) {
  const decodedJwt = decode(jwtToken)
  logger.info('Decoded jwt:')
  logger.info(decodedJwt)
  return decodedJwt.sub
}

export function getUserId(event) {
  const authorization = event.headers.Authorization
  const split = authorization.split(' ')
  const jwtToken = split[1]

  return parseUserId(jwtToken)
}
