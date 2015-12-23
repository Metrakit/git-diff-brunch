var exec     = require('child_process').exec;
var path     = require('path');
var fs       = require('fs');
var mkdirp   = require('mkdirp');
var readline = require('readline');

function GitDiff(config) {
  if (config == null) config = {};
  var plugins = config.plugins
  if (plugins == null) plugins = {};
  this.options = plugins.gitdiff;
}

GitDiff.prototype.brunchPlugin = true;
GitDiff.prototype.compile = function(params, callback) {
  console.log(params);
  var full_path = path.join(__dirname, '../../' + params.deploy_path + '/');

  var file_path = full_path + 'commits.txt';

  mkdirp(full_path);

  var cmd = 'git diff --name-only --diff-filter=ACMR ' + params.commits.from + ' ' + params.commits.to + ' > ' + file_path;

  exec(cmd, function(error, stdout, stderr) {
     var rd = readline.createInterface({
        input: fs.createReadStream(file_path),
        output: process.stdout,
        terminal: false
    });

    rd.on('line', function(line) {
      var onlyPath = require('path').dirname(line);
      fs.exists(line, function(exists) {
        if (exists) {
          mkdirp(full_path + onlyPath, function() {
            fs.createReadStream(line).pipe(fs.createWriteStream(full_path + line));
          });
        }
      });

    });
  });
  return callback(null, params);
};

module.exports = GitDiff;
