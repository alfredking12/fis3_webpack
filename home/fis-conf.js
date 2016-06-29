/**
 * @file FIS 配置
 * @author
 */

fis.config.set('namespace', 'home');


// chrome下可以安装插件实现livereload功能
// https://chrome.google.com/webstore/detail/livereload/jnihajbhpnppcggbcgedagnkighmdlei
fis.config.set('livereload.port', 35729);

if (fis.IS_FIS3) {
    fis.media('debug').match('*', {
        optimizer: null,
        useHash: false,
        deploy: fis.plugin('http-push', {
            receiver: 'http://127.0.0.1:8085/yog/upload',
            to: '/'
        })
    });
    fis.media('debug-prod').match('*', {
        deploy: fis.plugin('http-push', {
            receiver: 'http://127.0.0.1:8085/yog/upload',
            to: '/'
        })
    });
}
else {
    fis.config.set('deploy', {
        debug: {
            to: '/',
            // yog2 默认的部署入口，使用调试模式启动 yog2 项目后，这个入口就会生效。IP与端口请根据实际情况调整。
            receiver: 'http://127.0.0.1:8085/yog/upload'
        }
    });
}

var fs = require('fs');
var glob = require('glob');
var path = require('path');
var webpack_sync = require('webpack_sync');

function is_entry(file)
{
    return true;
    var dirs = file.subdirname.split("/");
    return dirs[dirs.length - 1] == file.filename
}

//yog2: project.files默认为**，当project.files有值时，project.exclude无效
fis.config.set('project.files', null);
fis.config.set('project.exclude', ['node_modules/**', '**/package.json', '**/webpack.config.js']);

fis.config.set('project.fileType.text', 'jsx'); //*.jsx files are text file.
fis.config.set('roadmap.ext.jsx', 'js');        //*.jsx are exactly treat as *.js

fis.match('**', {
    useSameNameRequire: false
});

fis.match('**/page/**.css', {
    release: false
});

fis.match('**/page/**.jsx', {
    parser: function(content, file, conf) {
        //console.log(file); throw 1;
        
        if (!is_entry(file)) return content;

        var entry = [__dirname, file.subpath].join(path.sep);
        var out_dir = [__dirname, 'output/cache'+file.subdirname].join(path.sep);

        var options = {
            //optimized: true,
            entry: entry,
            output: {
                filename: file.filename + '.js',
                path: out_dir
            },
            module: {
                //加载器配置
                loaders: [
                    { test: '{{jsx-loader-test}}', loader: 'jsx-loader?harmony', value: '/\\.jsx$/' },
                    { test: '{{url-loader-test}}', loader: 'url-loader?limit=8192', value: '/\\.(png|jpg)$/'},
                    { test: '{{css-loader-test}}', loader: "style!css", value: '/\\.css$/'}
                ]
            }
        };
        
        if (!webpack_sync(options))
        {
            fis.log.error("webpack失败");
        }
        else
        {
            content = fs.readFileSync(out_dir + path.sep + file.filename + '.js');
        }

        return content;
    },
    rExt: 'js'
})
