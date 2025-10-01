import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

const { AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = process.env;
let docClient: DynamoDBDocumentClient | null = null;

export function getDocClient() {
  if (!AWS_REGION || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) return null;
  if (docClient) return docClient;
  const client = new DynamoDBClient({ region: AWS_REGION });
  docClient = DynamoDBDocumentClient.from(client, { marshallOptions: { removeUndefinedValues: true } });
  return docClient;
}

export async function putItem(tableName: string, item: Record<string, any>) {
  const dc = getDocClient();
  if (!dc) return { fallback: true };
  await dc.send(new PutCommand({ TableName: tableName, Item: item }));
  return { fallback: false };
}

export async function getByPk(tableName: string, pk: string, skValue: string) {
  const dc = getDocClient();
  if (!dc) return { fallback: true, items: [] };
  const res = await dc.send(new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: { '#pk': 'pk' },
    ExpressionAttributeValues: { ':pk': pk },
  }));
  const items = (res.Items || []).filter((i) => i.sk === skValue);
  return { fallback: false, items };
}

export async function getByPkAll(tableName: string, pk: string) {
  const dc = getDocClient();
  if (!dc) return { fallback: true, items: [] };
  const res = await dc.send(new QueryCommand({
    TableName: tableName,
    KeyConditionExpression: '#pk = :pk',
    ExpressionAttributeNames: { '#pk': 'pk' },
    ExpressionAttributeValues: { ':pk': pk },
  }));
  return { fallback: false, items: res.Items || [] };
}
