
const mongoose = require('mongoose');

const uri = 'mongodb+srv://knethmini:kokila123@cluster0.greirx1.mongodb.net/bookshopsDb?retryWrites=true&w=majority&appName=Cluster0';

const connect = async () => {
    try{
        await mongoose.connect(uri);
        console.log('connect to MongoDB');
    }
    catch(error) {
        console.log('MongoDB Error:',error);
    }
};

module.exports = connect;