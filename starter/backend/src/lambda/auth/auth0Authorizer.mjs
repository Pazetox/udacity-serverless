import jsonwebtoken from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';
import { createLogger } from '../../utils/logger.mjs';

const logger = createLogger('auth');

const jwksUrl = 'https://pazetox.auth0.com/.well-known/jwks.json';

const jwks = jwksClient({
  jwksUri: jwksUrl
});

export async function handler(event) {
  try {
    logger.info(`Handling Auth method ${JSON.stringify(event, null, 2)}`);

    const jwtToken = await verifyToken(event.authorizationToken);

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
    };
  } catch (e) {
    logger.error('User not authorized', { error: e.message });

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
    };
  }
}

async function verifyToken(authHeader) {
  try {
    const token = getToken(authHeader);
    const jwt = jsonwebtoken.decode(token, { complete: true });

    logger.info('Decoded JWT header', jwt.header);

    const key = await jwks.getSigningKey(jwt.header.kid);
    const signingKey = key.getPublicKey();

    const decoded = jsonwebtoken.verify(token, signingKey, { algorithms: ['RS256'] });
    return decoded;
  }
  catch (e) {
    logger.error(`Handling Auth method ERROR ${JSON.stringify(e, null, 2)}`);
    throw e;
  }
}

function getToken(authHeader) {
  if (!authHeader) throw new Error('No authentication header');

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header');

  const split = authHeader.split(' ');
  const token = split[1];

  return token;
}
