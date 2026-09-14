const mongoose = require('mongoose');
const Home = require('../models/home');

describe('Home Rating & Input Validation Tests', () => {

  test('Rating 5 -> accepted', () => {
    const home = new Home({
      houseName: 'Test Villa 5',
      price: 2500,
      location: 'Goa, India',
      rating: 5
    });
    const err = home.validateSync();
    expect(err).toBeUndefined();
  });

  test('Rating 4.5 -> accepted', () => {
    const home = new Home({
      houseName: 'Test Villa 4.5',
      price: 3000,
      location: 'Manali, Himachal Pradesh',
      rating: 4.5
    });
    const err = home.validateSync();
    expect(err).toBeUndefined();
  });

  test('Local uploaded photo path (/uploads/home-123.jpg) -> accepted', () => {
    const home = new Home({
      houseName: 'Uploaded Image Villa',
      price: 4500,
      location: 'Goa, India',
      rating: 4.8,
      photoUrl: '/uploads/home-172635489.jpg'
    });
    const err = home.validateSync();
    expect(err).toBeUndefined();
    expect(home.photoUrl).toBe('/uploads/home-172635489.jpg');
  });

  test('Rating 0 -> accepted', () => {
    const home = new Home({
      houseName: 'Test Villa 0',
      price: 1500,
      location: 'Delhi, NCR',
      rating: 0
    });
    const err = home.validateSync();
    expect(err).toBeUndefined();
  });

  test('Rating 5.1 -> rejected', () => {
    const home = new Home({
      houseName: 'Test Villa 5.1',
      price: 4000,
      location: 'Mumbai, Maharashtra',
      rating: 5.1
    });
    const err = home.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.rating).toBeDefined();
  });

  test('Rating 6 -> rejected', () => {
    const home = new Home({
      houseName: 'Test Villa 6',
      price: 5000,
      location: 'Jaipur, Rajasthan',
      rating: 6
    });
    const err = home.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.rating).toBeDefined();
  });

  test('Rating 10 -> rejected', () => {
    const home = new Home({
      houseName: 'Test Villa 10',
      price: 7000,
      location: 'Udaipur, Rajasthan',
      rating: 10
    });
    const err = home.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.rating).toBeDefined();
  });

  test('Rating -1 -> rejected', () => {
    const home = new Home({
      houseName: 'Test Villa -1',
      price: 2000,
      location: 'Kerala, India',
      rating: -1
    });
    const err = home.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.rating).toBeDefined();
  });

  test('Rating "abc" -> rejected', () => {
    const home = new Home({
      houseName: 'Test Villa ABC',
      price: 2000,
      location: 'Bangalore, Karnataka',
      rating: 'abc'
    });
    const err = home.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.rating).toBeDefined();
  });

  test('Negative price -> rejected', () => {
    const home = new Home({
      houseName: 'Negative Price Home',
      price: -500,
      location: 'Shimla, Himachal Pradesh',
      rating: 4.2
    });
    const err = home.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.price).toBeDefined();
  });

  test('Missing houseName -> rejected', () => {
    const home = new Home({
      price: 2000,
      location: 'Kolkata, West Bengal',
      rating: 4.0
    });
    const err = home.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.houseName).toBeDefined();
  });

  test('Missing location -> rejected', () => {
    const home = new Home({
      houseName: 'No Location Home',
      price: 2000,
      rating: 4.0
    });
    const err = home.validateSync();
    expect(err).toBeDefined();
    expect(err.errors.location).toBeDefined();
  });

});
