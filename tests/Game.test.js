//
// Listing games
// Starting a game
//    If autoaccept
// Declining:
// Drawing a game
// Aborting a game
// Taking back moves
// Regular moves
// Misc:
//    Can't add odd stuff to the database without altering the schema
//

const { MongoClient } = require("mongodb");

describe("Games", () => {
  let connection;
  let db;

  beforeAll(async () => {
    connection = await MongoClient.connect(global.__MONGO_URI__, {
      useNewUrlParser: true
    });
    db = await connection.db(global.__MONGO_DB_NAME__);
  });

  afterAll(async () => {
    await connection.close();
    await db.close();
  });

  async function addUser(userName) {
    const users = db.collection("users");

    const mockUser = { _id: "some-user-id", name: "John" };
    await users.insertOne(mockUser);

    const insertedUser = await users.findOne({ _id: "some-user-id" });
    expect(insertedUser).toEqual(mockUser);
  }

  async function deleteUser(userName) {
    const users = db.collection("users");
    await users.remove({ username: userName });
  }

  it("should insert a doc into collection", async () => {
    const users = db.collection("users");

    const mockUser = { _id: "some-user-id", name: "John" };
    await users.insertOne(mockUser);

    const insertedUser = await users.findOne({ _id: "some-user-id" });
    expect(insertedUser).toEqual(mockUser);
  });

  it("", done => {
    done.fail("Write me");
  });
});
