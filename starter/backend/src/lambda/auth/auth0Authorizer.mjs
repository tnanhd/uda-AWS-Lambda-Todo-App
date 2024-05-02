import Axios from 'axios'
import jsonwebtoken from 'jsonwebtoken'
import { createLogger } from '../../utils/logger.mjs'

const logger = createLogger('auth')

const jwksUrl = 'https://test-endpoint.auth0.com/.well-known/jwks.json'
const certificate = `-----BEGIN CERTIFICATE-----
MIIDHTCCAgWgAwIBAgIJGZ+JC+NMW2BbMA0GCSqGSIb3DQEBCwUAMCwxKjAoBgNV
BAMTIWRldi1zeWZra3dpZ3duOGR1ZXd3LnVzLmF1dGgwLmNvbTAeFw0yNDA0MDMx
MTE2NTJaFw0zNzEyMTExMTE2NTJaMCwxKjAoBgNVBAMTIWRldi1zeWZra3dpZ3du
OGR1ZXd3LnVzLmF1dGgwLmNvbTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoC
ggEBAJHZeh/3mjnZXbC/BYQhI+NRjIjdYxaPvR5HtgC5BzvFKwxm8hQ5SivchJAf
pK1JoFAbZIg5cxzsT49tx4mjr4KsuI/QswsrJtBPO8wHNRozNhc/JP4JGPE5HeII
C7lJZs/5DGaWSJ6zHkFCNQAjJYLBetAMuWT6Wgws3KsonbjQ/hwIK+s6dhluvjus
DPI4l47B/CILC1xW1G8rp8+A6AA//6mkRmIzXBit7AEOY4+hsV37eO5VjL8sDH+O
3eaGCSe2wTz5HxW078+b8akqlzAOVDnGigRenBi/+F0/i6oEu8aDFeKuarAYdSOd
kKzm13Qj5Imtuz9tQu6dMJDHRI8CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAd
BgNVHQ4EFgQUVov10TCgIc9svXxU0Mwwa3ncUS0wDgYDVR0PAQH/BAQDAgKEMA0G
CSqGSIb3DQEBCwUAA4IBAQBPLeaCtn+dOA8bAP1IplWSF3HXdwqHK3Q8PtyT/1xW
MhTJDlG4mTCrwp2kGkKswxwAeg2e70tpBpS1sGZiKO5EQUETFk2WjV/Zyd1ZE1qw
LlrWcfNPZ2wYI3AjNNPtuux4M/bjlqv6VcShjw44v5vet2fVMf9lAyAwBuYlEPj/
tiGgubSeW2jNvpye+pf3uVGPaHEfCVLRW7s1KtbWEPVkV1x1Ni7wycyQ/2j/btD4
3bV6iC/W76pkbKPfKBSclp/2nYDyF8z+BGmcr95FlOEVkOh9SlRMmuH0eakzO/po
RHvcTQf3Sv2Xtl//cHGBYEapJfs0mnc5wqwY8Z82Cwob
-----END CERTIFICATE-----`

export async function handler(event) {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authozired', { userId: jwtToken.sub })

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader) {
  const token = getToken(authHeader)
  return jsonwebtoken.verify(token, certificate, { algorithms: ['RS256'] })
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
