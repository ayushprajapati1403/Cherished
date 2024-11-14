const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const Product = require('../models/product')

mongoose.connect('mongodb://127.0.0.1:27017/furniture_rental')
    .then(() => {
        console.log("Connection Open !!!");
    }).catch((e) => {
        console.log("Error!!!", e);
    });

