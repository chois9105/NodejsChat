assert = require 'assert'
should = require 'should'
index = require '../lib/index'

describe 'WHEN using a valid object id', ->
  it 'should return true', ->
    index.isObjectId("4f9e39ded7d9b8b43200011b").should.be.true
  it 'should return true', ->
    index.isObjectId("4f9E39DED7D9B8B43200011B").should.be.true

describe 'WHEN using an invalid object id', ->
  it 'should return false', ->
    index.isObjectId(null).should.be.false
  it 'should return false', ->
    index.isObjectId("").should.be.false

  it 'should return false', ->
    index.isObjectId("blah").should.be.false
