# Fis3 Webpack 
fis3-webpack is a Node.js addon for compiling with webpack in fis3 synchronously.


# Examples
```
var fis3_webpack = require('fis3_webpack');

fis.match('**.jsx', function(content, file, conf) {
	return fis3_webpack.compileSync(file, content, {
        entry: './index.jsx',
        output: {
            filename: './index.js',
            path: './output/'
        },
        module: {
            //加载器配置
            loaders: [
                { test: /\.jsx$/, loader: 'jsx-loader?harmony'},
                { test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'},
                { test: /\.css$/, loader: 'style!css'}
            ]
        }
    });
});
```

# Installation
```
npm install fis3_webpack
```

#### Install Webpack Loaders and Plugins if need
> You can also install loaders and plugins local if you need, such as url-loader, jsx-loader, css-loader, style-loader and so on.
> When webpack CLI run, it will find module local and global.   
```
npm install --save-dev url-loader jsx-loader style-loader css-loader
```

# Configuration (options)
[Webpack Configuration]('http://webpack.github.io/docs/configuration.html')