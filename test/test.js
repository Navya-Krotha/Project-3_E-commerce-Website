let chai = require('chai');
let chaiHttp = require('chai-http');
let sinon = require('sinon');
const productCollection = require('../helpers/productCollection');

chai.use(chaiHttp);
let expect = chai.expect;
let assert = chai.assert;

describe('Test E-commerce website using chai and mocha', () => {
    let deleteProductStub;

    beforeEach(() => {
        deleteProductStub = sinon.stub(productCollection, 'deleteProduct').return({ deletedCount: 0});
    });

    it('should create user by register', () => {
        try {
            chai.request('http://localhost:3000')
                .post('/auth/register')
                .set('Content-Type', 'application/json')
                .send({ username: 'user', password: 'user', email: 'user@gmail.com', userType: 'Buyer' })
                .end((err, res) => {
                    // As redirection happened as per logic, response object not coming
                    assert.equal(err, null);
                    // If response object is there
                    // assert.equal(res.status, 200);
                });
        } catch(err) {
            console.log("Error: ", err);
        }
    });

    it('should login', () => {
        try {
            chai.request('http://localhost:3000')
                .post('/auth/login')
                .set('Content-Type', 'application/json')
                .send({ password: 'user', email: 'user@gmail.com' })
                .end((err, res) => {
                    assert.equal(err, null);
                });
        } catch(err) {
            console.log("Error: ", err);
        }
    });

    it('should not login - if user or password not correct', () => {
        try {
            chai.request('http://localhost:3000')
                .post('/auth/login')
                .set('Content-Type', 'application/json')
                .send({ password: 'user1', email: 'user@gmail.com' })
                .end((err, res) => {
                    assert.equal(res.status, 401);
                });
        } catch(err) {
            console.log("Error: ", err);
        }
    });

    it('should give delete product - if not exists', async () => {
        try {
            chai.request('https://localhost:3000')
                .delete('/product/deleteProduct')
                .set('Content-Type', 'application/json')
                .send({ productId: '1' })
                .end((err, res) => {
                    assert.equal(res.status, 400);
                });
        } catch(err) {
            console.log("Error: ", err);
        }
    });   

    afterEach(() => {
        deleteProductStub.restore();
    });
});