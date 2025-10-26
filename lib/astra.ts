import { AnyUser, ResourceDoc, TutorialDoc } from "@/lib/types";
import { DataAPIClient, type Collection } from "@datastax/astra-db-ts";

type FindFilter = Record<string, unknown>;

let usersCollectionPromise: Promise<Collection<AnyUser>> | null = null;
let resourcesCollectionPromise: Promise<Collection<ResourceDoc>> | null = null;
let tutorialsCollectionPromise: Promise<Collection<TutorialDoc>> | null = null;

function getToken(): string {
  const token = process.env.ASTRA_DB_APPLICATION_TOKEN;
  if (!token) throw new Error("Missing ASTRA_DB_APPLICATION_TOKEN");
  return token;
}

function getEndpoint(): string {
  const base = process.env.ASTRA_DB_API_URL;
  if (!base) throw new Error("Missing ASTRA_DB_API_URL");
  return base.replace(/\/$/, "");
}

function getKeyspace(): string {
  const ks = process.env.ASTRA_DB_KEYSPACE;
  if (!ks) throw new Error("Missing ASTRA_DB_KEYSPACE");
  return ks;
}

async function getUsersCollection(): Promise<Collection<AnyUser>> {
  if (!usersCollectionPromise) {
    usersCollectionPromise = (async () => {
      const client = new DataAPIClient(getToken());
      const db = client.db(getEndpoint(), { keyspace: getKeyspace() });
      // Ensure collection exists (ignore error if it already exists)
      try {
        await db.createCollection("users");
      } catch {}
      return db.collection<AnyUser>("users");
    })();
  }
  return usersCollectionPromise;
}

export async function usersFindOne(filter: FindFilter): Promise<AnyUser | null> {
  const coll = await getUsersCollection();
  const doc = await coll.findOne(filter as any);
  return (doc as AnyUser) ?? null;
}

export async function usersInsertOne(doc: AnyUser): Promise<{ _id: string }> {
  const coll = await getUsersCollection();
  const res = await coll.insertOne(doc as any);
  return { _id: res.insertedId as string };
}

export async function usersUpdateOne(filter: FindFilter, update: Record<string, unknown>) {
  const coll = await getUsersCollection();
  // Prefer $set to avoid replacing entire document
  const result = await coll.updateOne(filter as any, { $set: update } as any);
  return result;
}

async function getResourcesCollection(): Promise<Collection<ResourceDoc>> {
  if (!resourcesCollectionPromise) {
    resourcesCollectionPromise = (async () => {
      const client = new DataAPIClient(getToken());
      const db = client.db(getEndpoint(), { keyspace: getKeyspace() });
      try {
        await db.createCollection("resources");
      } catch {}
      return db.collection<ResourceDoc>("resources");
    })();
  }
  return resourcesCollectionPromise;
}

export async function resourcesInsertOne(doc: ResourceDoc): Promise<{ _id: string }> {
  const coll = await getResourcesCollection();
  const res = await coll.insertOne(doc as any);
  return { _id: res.insertedId as string };
}

export async function resourcesFindMany(): Promise<ResourceDoc[]> {
  const coll = await getResourcesCollection();
  const cursor = (await coll.find({} as any)) as any;
  const all = await cursor.toArray();
  return (all as ResourceDoc[]) || [];
}

async function getTutorialsCollection(): Promise<Collection<TutorialDoc>> {
  if (!tutorialsCollectionPromise) {
    tutorialsCollectionPromise = (async () => {
      const client = new DataAPIClient(getToken());
      const db = client.db(getEndpoint(), { keyspace: getKeyspace() });
      try {
        await db.createCollection("tutorials");
      } catch {}
      return db.collection<TutorialDoc>("tutorials");
    })();
  }
  return tutorialsCollectionPromise;
}

export async function tutorialsInsertOne(doc: TutorialDoc): Promise<{ _id: string }> {
  const coll = await getTutorialsCollection();
  const res = await coll.insertOne(doc as any);
  return { _id: res.insertedId as string };
}

export async function tutorialsFindMany(): Promise<TutorialDoc[]> {
  const coll = await getTutorialsCollection();
  const cursor = (await coll.find({} as any)) as any;
  const all = await cursor.toArray();
  return (all as TutorialDoc[]) || [];
}


