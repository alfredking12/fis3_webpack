var path = require('path');
var url = require('url');
var deasync = require('deasync');
var webpack = require('webpack');
var MemoryFileSystem = require('memory-fs');
var ProxyFileSystem = require('proxy-fs');
var fs = require('fs');
var _ = require('underscore');

var fis3_webpack = {};

module.exports = fis3_webpack;

//说明:
//  webpack异步编译
//输入: 
//  file: 用来处理编译依赖
//  content: 作为编译前内容
//  options: webpack参数
//  callback: 异步回调
fis3_webpack.compile = function (file, content, options, callback) {
  
  //输出文件路径
  var output_file = [options.output.path, options.output.filename].join(path.sep);
  
  var opt = {
    hash: false,
    timings: false,
    chunks: false,
    chunkModules: false,
    modules: false,
    children: true,
    version: true,
    cached: false,
    cachedAssets: false,
    reasons: false,
    source: false,
    errorDetails: false
  };
  console.log(JSON.stringify(opt));
  
  opt = _.extend(opt, options);
  console.log(JSON.stringify(opt));
  
  var compiler = webpack(opt);

  var mfs = new MemoryFileSystem({});
  mfs.mkdirpSync(path.dirname(options.entry));
  mfs.writeFileSync(options.entry, content);
  
  compiler.inputFileSystem = new ProxyFileSystem(function (filename) {
    console.log('inputFileSystem===');
    console.log('file.origin:' + path.resolve(file.origin));
    console.log('filename:' + path.resolve(filename));
    
    if (path.resolve(file.origin) === path.resolve(filename)) {
      return {
        fileSystem: mfs,
        path: options.entry
      };
    } else {
      file.cache.addDeps(filename); // 添加编译依赖
    }
  }, compiler.inputFileSystem);
  
  var outfs = compiler.outputFileSystem = new ProxyFileSystem(function (filename) {
    console.log('outputFileSystem===');
    console.log('output_file:' + path.resolve(output_file));
    console.log('filename:' + path.resolve(filename));
    
    if (path.resolve(output_file) === path.resolve(filename)) {
      return {
        fileSystem: mfs,
        path: output_file
      };
    }
  }, compiler.outputFileSystem);

  compiler.run(function (err, stats) {
    if (err) {
      callback(err);
      return;
    }
    var jsonStats = stats.toJson() || {};
    var errors = jsonStats.errors || [];
    if (err || errors.length > 0) {
      callback(err || errors.join('\n'));
    } else {
      callback(null, String(fs.readFileSync(output_file)));
    }
  });
};

//说明:
//  webpack同步编译
//输入: 
//  file: 用来处理编译依赖
//  content: 作为编译前内容
//  options: webpack参数
//返回:
//  content编译后文本内容
fis3_webpack.compileSync = function(file, content, options) {
  var compiled = false;
  var compiled_content = null;
  
  //异步编译
  fis3_webpack.compile(file, content, options, function(err, data){
    compiled = true;
    compiled_content = data;
    if (err) {
      fis.log.error('fis3_webpack failed: ' + err);
    }
  });
  
  //同步等待编译完成
  deasync.loopWhile(function(){return !compiled;});
  
  //返回结果
  if (compiled_content) {
    content = compiled_content;
  }
  
  return content;
}
