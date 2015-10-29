var request = require('superagent')
;

module.exports = {
    /**
     * The main entry point for the Dexter module
     *
     * @param {AppStep} step Accessor for the configuration for the step using this module.  Use step.input('{key}') to retrieve input data.
     * @param {AppData} dexter Container for all data used in this workflow.
     */
    run: function(step, dexter) {
        var urls = step.input('topic')
          , username = step.input('username').first()
          , token    = step.input('token').first()
          , callback = step.input('callback').first()
        ; 

        if(!urls.length || !urls.first()) this.fail('Topic required.');
        if(!username) this.fail('Username required.');
        if(!token) this.fail('Token required.');
        if(!callback) this.fail('Callback required.');

        Array.prototype.slice.apply(urls).forEach(function(url) {
            //check for comma delimited
            url.split(',').forEach(function(url) {
                this.log('Subscribing to ' + url); 

                request.post('https://push.superfeedr.com')
                   .send({
                        "hub.mode"     : 'subscribe',
                        "hub.topic"    : url, 
                        "hub.callback" : callback,
                        "format"       : "json",
                        "retrieve"     : true
                   })
                   .accept('application/json')
                   .auth(username, token)
                   .end(function(err, res) {
                        this.log({ status: res.status, body: res.body, headers: res.headers});
                        if(err) return this.fail(err.stack);
                        this.complete(res.body);
                   }.bind(this));
           }.bind(this));
        }.bind(this));
    }
};
