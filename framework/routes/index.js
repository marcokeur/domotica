module.exports = function(app, io, passport){
    require('./auth')(app, passport);
    require('./misc')(app);
    require('./dashboard')(app, io);
    require('./thing')(app);
    require('./flow')(app);
};