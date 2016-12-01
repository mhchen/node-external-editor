// Generated by CoffeeScript 1.11.1

/*
  ExternalEditor
  Kevin Gravier <kevin@mrkmg.com>
  MIT
 */

(function() {
  var CreateFileError, ExternalEditor, FS, LaunchEditorError, ReadFileError, RemoveFileError, Spawn, SpawnSync, Temp,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  FS = require('fs');

  Temp = require('tmp');

  SpawnSync = require('child_process').spawnSync;

  Spawn = require('child_process').spawn;

  CreateFileError = require('./errors/CreateFileError');

  ReadFileError = require('./errors/ReadFileError');

  RemoveFileError = require('./errors/RemoveFileError');

  LaunchEditorError = require('./errors/LaunchEditorError');

  ExternalEditor = (function() {
    ExternalEditor.edit = function(text) {
      var editor;
      if (text == null) {
        text = '';
      }
      editor = new ExternalEditor(text);
      editor.run();
      editor.cleanup();
      return editor.text;
    };

    ExternalEditor.editAsync = function(text, callback) {
      var editor;
      if (text == null) {
        text = '';
      }
      editor = new ExternalEditor(text);
      return editor.runAsync(function(error_run, response) {
        var error_cleanup;
        if (!error_run) {
          try {
            editor.cleanup();
          } catch (error) {
            error_cleanup = error;
            if (typeof callback === 'function') {
              callback(error_cleanup);
            }
          }
          return callback(null, response);
        } else {
          return callback(error_run) in typeof callback === 'function';
        }
      });
    };

    ExternalEditor.CreateFileError = CreateFileError;

    ExternalEditor.ReadFileError = ReadFileError;

    ExternalEditor.RemoveFileError = RemoveFileError;

    ExternalEditor.LaunchEditorError = LaunchEditorError;

    ExternalEditor.prototype.text = '';

    ExternalEditor.prototype.temp_file = void 0;

    ExternalEditor.prototype.editor = {
      bin: void 0,
      args: []
    };

    function ExternalEditor(text1) {
      this.text = text1 != null ? text1 : '';
      this.launchEditorAsync = bind(this.launchEditorAsync, this);
      this.launchEditor = bind(this.launchEditor, this);
      this.removeTemporaryFile = bind(this.removeTemporaryFile, this);
      this.readTemporaryFile = bind(this.readTemporaryFile, this);
      this.createTemporaryFile = bind(this.createTemporaryFile, this);
      this.determineEditor = bind(this.determineEditor, this);
      this.cleanup = bind(this.cleanup, this);
      this.runAsync = bind(this.runAsync, this);
      this.run = bind(this.run, this);
      this.determineEditor();
      this.createTemporaryFile();
    }

    ExternalEditor.prototype.run = function() {
      this.launchEditor();
      return this.readTemporaryFile();
    };

    ExternalEditor.prototype.runAsync = function(callback) {
      var error_launch;
      try {
        return this.launchEditorAsync((function(_this) {
          return function() {
            var error_read;
            try {
              _this.readTemporaryFile();
              if (typeof callback === 'function') {
                return callback(null, _this.text);
              }
            } catch (error) {
              error_read = error;
              if (typeof callback === 'function') {
                return callback(error_read);
              }
            }
          };
        })(this));
      } catch (error) {
        error_launch = error;
        if (typeof callback === 'function') {
          return callback(error_launch);
        }
      }
    };

    ExternalEditor.prototype.cleanup = function() {
      return this.removeTemporaryFile();
    };

    ExternalEditor.prototype.determineEditor = function() {
      var args, ed, editor;
      ed = /^win/.test(process.platform) ? 'notepad' : 'vim';
      editor = process.env.VISUAL || process.env.EDITOR || ed;
      args = editor.split(/\s+/);
      this.bin = args.shift();
      return this.args = args;
    };

    ExternalEditor.prototype.createTemporaryFile = function() {
      var e;
      try {
        this.temp_file = Temp.tmpNameSync({});
        return FS.writeFileSync(this.temp_file, this.text);
      } catch (error) {
        e = error;
        throw new CreateFileError(e);
      }
    };

    ExternalEditor.prototype.readTemporaryFile = function() {
      var e;
      try {
        return this.text = FS.readFileSync(this.temp_file).toString();
      } catch (error) {
        e = error;
        throw new ReadFileError(e);
      }
    };

    ExternalEditor.prototype.removeTemporaryFile = function() {
      var e;
      try {
        return FS.unlinkSync(this.temp_file);
      } catch (error) {
        e = error;
        throw new RemoveFileError(e);
      }
    };

    ExternalEditor.prototype.launchEditor = function() {
      var e;
      try {
        return SpawnSync(this.bin, this.args.concat([this.temp_file]), {
          stdio: 'inherit'
        });
      } catch (error) {
        e = error;
        throw new LaunchEditorError(e);
      }
    };

    ExternalEditor.prototype.launchEditorAsync = function(callback) {
      var child_process, e;
      try {
        child_process = Spawn(this.bin, this.args.concat([this.temp_file]), {
          stdio: 'inherit'
        });
        return child_process.on('exit', function() {
          if (typeof callback === 'function') {
            return callback();
          }
        });
      } catch (error) {
        e = error;
        throw new LaunchEditorError(e);
      }
    };

    return ExternalEditor;

  })();

  module.exports = ExternalEditor;

}).call(this);
