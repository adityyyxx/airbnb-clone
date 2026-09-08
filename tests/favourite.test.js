const mongoose = require('mongoose');
const Favourite = require('../models/favourite');
const storeController = require('../controllers/storeController');

describe('Favourites Isolation & Toggle Suite (Scenarios A - E)', () => {
  const userAId = new mongoose.Types.ObjectId();
  const userBId = new mongoose.Types.ObjectId();
  const home1Id = new mongoose.Types.ObjectId();
  const home2Id = new mongoose.Types.ObjectId();

  // Mock in-memory storage for database operations in isolated unit test
  let favouritesStore = [];

  beforeEach(() => {
    favouritesStore = [];
    jest.spyOn(Favourite, 'findOne').mockImplementation((query) => {
      const match = favouritesStore.find(item => 
        item.houseId.toString() === query.houseId.toString() && 
        item.userId.toString() === query.userId.toString()
      );
      return Promise.resolve(match || null);
    });

    jest.spyOn(Favourite, 'findOneAndDelete').mockImplementation((query) => {
      const idx = favouritesStore.findIndex(item => 
        item.houseId.toString() === query.houseId.toString() && 
        item.userId.toString() === query.userId.toString()
      );
      if (idx !== -1) {
        const deleted = favouritesStore.splice(idx, 1)[0];
        return Promise.resolve(deleted);
      }
      return Promise.resolve(null);
    });

    jest.spyOn(Favourite.prototype, 'save').mockImplementation(function() {
      // Check compound unique constraint { userId: 1, houseId: 1 }
      const duplicate = favouritesStore.find(item => 
        item.houseId.toString() === this.houseId.toString() && 
        item.userId.toString() === this.userId.toString()
      );
      if (duplicate) {
        const err = new Error('E11000 duplicate key error');
        err.code = 11000;
        return Promise.reject(err);
      }
      favouritesStore.push({
        _id: new mongoose.Types.ObjectId(),
        houseId: this.houseId,
        userId: this.userId
      });
      return Promise.resolve(this);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // Scenario A
  test('Scenario A: Logged-in User A clicks heart -> favourite created in DB and returns isFavourite: true', async () => {
    const req = {
      body: { id: home1Id.toString() },
      session: { userId: userAId, isLoggedIn: true },
      xhr: true,
      headers: { accept: 'application/json' }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await storeController.postAddToFavourite(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, isFavourite: true });
    expect(favouritesStore.length).toBe(1);
    expect(favouritesStore[0].houseId.toString()).toBe(home1Id.toString());
    expect(favouritesStore[0].userId.toString()).toBe(userAId.toString());
  });

  // Scenario B
  test('Scenario B: User A clicks heart again -> favourite is removed and returns isFavourite: false', async () => {
    // Seed initial favourite
    favouritesStore.push({
      _id: new mongoose.Types.ObjectId(),
      houseId: home1Id,
      userId: userAId
    });

    const req = {
      body: { id: home1Id.toString() },
      session: { userId: userAId, isLoggedIn: true },
      xhr: true,
      headers: { accept: 'application/json' }
    };
    const res = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await storeController.postAddToFavourite(req, res);

    expect(res.json).toHaveBeenCalledWith({ success: true, isFavourite: false });
    expect(favouritesStore.length).toBe(0);
  });

  // Scenario C
  test('Scenario C: User A favourites Home 1, User B logs in -> User B does NOT see Home 1 as favourited', async () => {
    // Seed User A's favourite
    favouritesStore.push({
      _id: new mongoose.Types.ObjectId(),
      houseId: home1Id,
      userId: userAId
    });

    // Mock Favourite.find for User B
    jest.spyOn(Favourite, 'find').mockImplementation((query) => ({
      lean: () => Promise.resolve(favouritesStore.filter(f => f.userId.toString() === query.userId.toString()))
    }));

    const userBFavourites = await Favourite.find({ userId: userBId }).lean();
    const userBFavouriteIds = userBFavourites.map(f => f.houseId.toString());

    expect(userBFavouriteIds.includes(home1Id.toString())).toBe(false);
  });

  // Scenario D
  test('Scenario D: User B favourites Home 1 -> User B gets own Favourite document, User A remains untouched', async () => {
    // Seed User A's favourite
    favouritesStore.push({
      _id: new mongoose.Types.ObjectId(),
      houseId: home1Id,
      userId: userAId
    });

    const reqB = {
      body: { id: home1Id.toString() },
      session: { userId: userBId, isLoggedIn: true },
      xhr: true,
      headers: { accept: 'application/json' }
    };
    const resB = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await storeController.postAddToFavourite(reqB, resB);

    expect(resB.json).toHaveBeenCalledWith({ success: true, isFavourite: true });
    expect(favouritesStore.length).toBe(2);

    const userAFav = favouritesStore.find(f => f.userId.toString() === userAId.toString());
    const userBFav = favouritesStore.find(f => f.userId.toString() === userBId.toString());

    expect(userAFav).toBeDefined();
    expect(userBFav).toBeDefined();
    expect(userAFav.houseId.toString()).toBe(home1Id.toString());
    expect(userBFav.houseId.toString()).toBe(home1Id.toString());
  });

  // Scenario E
  test('Scenario E: User A removes favourite -> User B favourite remains untouched', async () => {
    // Seed both favourites
    favouritesStore.push(
      { _id: new mongoose.Types.ObjectId(), houseId: home1Id, userId: userAId },
      { _id: new mongoose.Types.ObjectId(), houseId: home1Id, userId: userBId }
    );

    const reqA = {
      body: { id: home1Id.toString() },
      session: { userId: userAId, isLoggedIn: true },
      xhr: true,
      headers: { accept: 'application/json' }
    };
    const resA = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis()
    };

    await storeController.postAddToFavourite(reqA, resA);

    expect(resA.json).toHaveBeenCalledWith({ success: true, isFavourite: false });
    expect(favouritesStore.length).toBe(1);
    expect(favouritesStore[0].userId.toString()).toBe(userBId.toString());
    expect(favouritesStore[0].houseId.toString()).toBe(home1Id.toString());
  });
});
