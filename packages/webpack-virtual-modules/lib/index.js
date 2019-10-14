/* eslint-disable */

// fork from https://github.com/sysgears/webpack-virtual-modules
// fix:
// timestamp issues ->
// cannot reuse cache module ->
// HMR build too much modules ->
// HMR too slow

var VirtualStats = require('./virtual-stats');
var path = require('path');
var debug = require('debug')('webpack-virtual-modules');

var inode = 45000000;

function checkActivation(instance) {
  if (!instance._compiler) {
    throw new Error("You must use this plugin only after creating webpack instance!");
  }
}

function VirtualModulesPlugin(modules) {
  this._staticModules = modules;
}

function getModulePath(filePath, compiler) {
  return path.isAbsolute(filePath) ? filePath : path.join(compiler.context, filePath);
}

VirtualModulesPlugin.prototype.writeModule = function(filePath, contents) {
  var self = this;

  checkActivation(self);

  var len = contents ? contents.length : 0;
  var date = new Date()
  var time = date.getTime();

  var stats = new VirtualStats({
    dev: 8675309,
    nlink: 0,
    uid: 1000,
    gid: 1000,
    rdev: 0,
    blksize: 4096,
    ino: inode++,
    mode: 33188,
    size: len,
    blocks: Math.floor(len / 4096),
    atime: time,
    atimeMs: time,
    mtime: time,
    mtimeMs: time,
    ctime: time,
    ctimeMs: time,
    birthtime: time,
    birthtimeMs: time,
  });
  var modulePath = getModulePath(filePath, self._compiler);

  debug(self._compiler.name, "Write module:", modulePath, contents);

  self._compiler.inputFileSystem._writeVirtualFile(modulePath, stats, contents);
  if (
    self._watcher &&
    self._watcher.watchFileSystem &&
    self._watcher.watchFileSystem.wfs &&
    self._watcher.watchFileSystem.wfs.watcher &&
    self._watcher.watchFileSystem.wfs.watcher.fileWatchers.length
  ) {
    self._watcher.watchFileSystem.wfs.watcher.fileWatchers.forEach(function(fileWatcher) {
      if (fileWatcher.path === modulePath) {
        debug(self._compiler.name, "Emit file change:", modulePath, time);
        fileWatcher.emit("change", time, null);
      }
    });
  }
};

function setData(storage, key, value) {
  if (storage.data instanceof Map) {
    storage.data.set(key, value);
  } else {
    storage.data[key] = value;
  }
}

class FixFileSystem {
  constructor(wfs, ifs) {
    this.wfs = wfs;
    this.ifs = ifs
  }

  watch(files, dirs, missing, startTime, options, callback, callbackUndelayed) {
    const watcher = this.wfs.watch(
      files,
      dirs,
      missing,
      startTime,
      options,
      (
        err,
        filesModified,
        dirsModified,
        missingModified,
        fileTimestamps,
        dirTimestamps,
        removedFiles
      ) => {
        if (err) return callback(err);

        const virtualFileTimestamps = Object.keys( this.ifs._virtualFiles )
          .map( filepath => {
            const [ error, fileStat ] = this.ifs._statStorage.data.get( filepath )
            return {
              error,
              filepath,
              mtime: fileStat.mtime,
            }
          } )

        for (const { error, filepath, mtime } of virtualFileTimestamps) {
          if ( !error ) {
            fileTimestamps.set(filepath, mtime);
          }
        }

        callback(
          err,
          filesModified,
          dirsModified,
          missingModified,
          fileTimestamps,
          dirTimestamps,
          removedFiles
        );
      },
      callbackUndelayed
    );

    return {
      close: () => watcher.close(),
      pause: () => watcher.pause(),
      getContextTimestamps: () => {
        const dirTimestamps = watcher.getContextTimestamps();
        return dirTimestamps;
      },
      getFileTimestamps: () => {
        const fileTimestamps = watcher.getFileTimestamps();

        const virtualFileTimestamps = Object.keys( this.ifs._virtualFiles )
          .map( filepath => {
            const fileStat = this.ifs._statStorage.data.get( filepath )
            return {
              filepath: filepath,
              mtime: fileStat.mtime,
            }
          } )

        for (const { filepath, mtime } of virtualFileTimestamps) {
          fileTimestamps.set(filepath, mtime);
        }
        return fileTimestamps;
      }
    };
  }
}

VirtualModulesPlugin.prototype.apply = function(compiler) {
  var self = this;

  self._compiler = compiler;

  var afterEnvironmentHook = function() {
    if (!compiler.inputFileSystem._writeVirtualFile) {
      var originalPurge = compiler.inputFileSystem.purge;

      compiler.inputFileSystem.purge = function() {
        originalPurge.call(this, arguments);
        if (this._virtualFiles) {
          Object.keys(this._virtualFiles).forEach(function(file) {
            var data = this._virtualFiles[file];
            setData(this._statStorage, file, [null, data.stats]);
            setData(this._readFileStorage, file, [null, data.contents]);
          }.bind(this));
        }
      };

      compiler.inputFileSystem._writeVirtualFile = function(file, stats, contents) {
        this._virtualFiles = this._virtualFiles || {};
        this._virtualFiles[file] = {stats: stats, contents: contents};
        setData(this._statStorage, file, [null, stats]);
        setData(this._readFileStorage, file, [null, contents]);
      };
    }

    compiler.watchFileSystem = new FixFileSystem(
      compiler.watchFileSystem,
      compiler.inputFileSystem
    );
  }

  var afterResolversHook = function() {
    if (self._staticModules) {
      Object.keys(self._staticModules).forEach(function(path) {
        self.writeModule(path, self._staticModules[path]);
      });
      delete self._staticModules;
    }
  }

  var watchRunHook = function(watcher, callback) {
    self._watcher = watcher.compiler || watcher;
    callback();
  }

  if(compiler.hooks) {
    compiler.hooks.afterEnvironment.tap('VirtualModulesPlugin', afterEnvironmentHook);
    compiler.hooks.afterResolvers.tap('VirtualModulesPlugin', afterResolversHook);
    compiler.hooks.watchRun.tapAsync('VirtualModulesPlugin', watchRunHook);
  } else {
    compiler.plugin("after-environment", afterEnvironmentHook);
    compiler.plugin("after-resolvers", afterResolversHook);
    compiler.plugin("watch-run", watchRunHook);
  }
};

module.exports = VirtualModulesPlugin;
